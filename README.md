# Fish Catalog Backend

NestJS + Sequelize (PostgreSQL) API for a fish catalog. Customers browse products and submit leads (WhatsApp order requests). Admins log in to manage products and view leads. Product images are uploaded from the browser straight to Cloudinary using a signature from this API.

- [Setup](#setup)
- [Authentication](#authentication)
- [Errors](#errors)
- [Endpoints](#endpoints): [Health](#health) · [Admin auth](#admin-auth) · [Uploads](#uploads-cloudinary) · [Fish products](#fish-products) · [Leads](#leads)
- [Image upload flow](#image-upload-flow)
- [Quick test](#quick-test-curl)

## Setup

```bash
npm install
npm run start:dev
```

Tables are created automatically on startup (`autoLoadModels` + `synchronize`). This only creates **missing** tables; it does not alter existing ones. Use migrations before going to production.

### Environment variables (`.env`)

| Variable | Default | Required | Description |
|---|---|---|---|
| `PORT` | `7001` | no | HTTP port |
| `DB_HOST` | `localhost` | no | Postgres host |
| `DB_PORT` | `5433` | no | Postgres port |
| `DB_USER` | `postgres` | no | Postgres user |
| `DB_PASSWORD` | `root` | no | Postgres password |
| `DB_NAME` | `fish_catalog` | no | Database name |
| `ADMIN_API_KEY` | – | **yes** | Server-side master key. Only used to create admins (`/admin/register`); also accepted on admin routes. |
| `ADMIN_TOKEN_SECRET` | falls back to `ADMIN_API_KEY` | recommended | Secret used to sign admin JWTs. Use a separate long random value. |
| `CLOUDINARY_CLOUD_NAME` | – | for uploads | From the Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | – | for uploads | From the Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | – | for uploads | Never sent to the frontend |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Base URL (local): `http://localhost:7001` (or whatever `PORT` is).

## Authentication

Endpoints marked **Admin** accept **either**:

| Method | Header | Used by |
|---|---|---|
| JWT (from `POST /admin/login`, valid 12 h) | `Authorization: Bearer <token>` | Frontend / logged-in admins |
| Server key | `x-admin-key: <ADMIN_API_KEY>` | Backend-only tooling (curl, scripts) |

Exceptions:
- `POST /admin/register` accepts **only** `x-admin-key` (a login token cannot create admins).
- `GET /admin/me` accepts **only** a Bearer token.

The JWT is HS256 and carries `{ "sub": "<adminId>", "iat": ..., "exp": ... }`.

## Errors

All errors use Nest's standard shape:

```json
{ "message": "…", "error": "Unauthorized", "statusCode": 401 }
```

| Status | When |
|---|---|
| `400` | Validation failed. `message` is an **array** of problems. Unknown body fields are stripped. |
| `401` | Missing/invalid/expired admin credentials, or wrong login. |
| `404` | Resource not found. |
| `409` | Admin email already registered. |
| `503` | Cloudinary env vars not configured. |

Example `400`:

```json
{
  "message": ["price must not be less than 0", "name must be a string"],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Endpoints

### Health

#### `GET /` · `GET /hello`

Public. Plain-text response, handy for checking the server is up.

```
200 OK
Hello World!
```

---

### Admin auth

Admins are created **from the backend only** (no register UI in the frontend). The frontend only logs in.

#### `POST /admin/register` — key only

Header: `x-admin-key: <ADMIN_API_KEY>`

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | string | yes | valid email, stored lowercase |
| `password` | string | yes | min 8 characters |

```json
{
  "email": "admin@example.com",
  "password": "MyStrongPass123"
}
```

```json
// 201 Created
{ "id": 1, "email": "admin@example.com" }
```

```json
// 409 Conflict
{ "message": "Admin already exists", "error": "Conflict", "statusCode": 409 }
```

#### `POST /admin/login` — public

| Field | Type | Required |
|---|---|---|
| `email` | string | yes |
| `password` | string | yes |

```json
{
  "email": "admin@example.com",
  "password": "MyStrongPass123"
}
```

```json
// 200 OK
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.…" }
```

```json
// 401 Unauthorized (unknown email or wrong password)
{ "message": "Invalid email or password", "error": "Unauthorized", "statusCode": 401 }
```

#### `GET /admin/me` — Bearer token only

Session check: used by the frontend to decide between the admin panel and the login form.

Header: `Authorization: Bearer <token>`

```json
// 200 OK
{ "id": 1, "email": "admin@example.com" }
```

`401` if the token is missing, invalid, expired, or the admin no longer exists.

---

### Uploads (Cloudinary)

#### `GET /uploads/signature` — Admin

Returns a short-lived signature so the browser can upload an image **directly to Cloudinary**. The API secret never leaves the server.

```json
// 200 OK
{
  "cloudName": "my-cloud",
  "apiKey": "123456789012345",
  "timestamp": 1790598134,
  "signature": "207de872f2b24e1e521582fa57a143ed24608d7a",
  "folder": "fish-catalog",
  "allowedFormats": "webp"
}
```

`503` (`Cloudinary is not configured`) if the three `CLOUDINARY_*` variables are missing.

See [Image upload flow](#image-upload-flow) for how to use it.

---

### Fish products

Product object:

```json
{
  "id": 1,
  "name": "Rohu",
  "image": "https://res.cloudinary.com/my-cloud/image/upload/v1/fish-catalog/rohu.webp",
  "price": "250.00",
  "discountPrice": "220.00",
  "createdAt": "2026-09-28T10:00:00.000Z",
  "updatedAt": "2026-09-28T10:00:00.000Z"
}
```

> `price` and `discountPrice` are `DECIMAL` columns, so **GET** responses return them as **strings** (`"250.00"`). `image` and `discountPrice` are `null` when not set.

#### `GET /fish-products` — public

All products, newest first.

```json
// 200 OK
[
  { "id": 2, "name": "Pomfret", "image": null, "price": "600.00", "discountPrice": null, "createdAt": "…", "updatedAt": "…" },
  { "id": 1, "name": "Rohu", "image": "https://res.cloudinary.com/…", "price": "250.00", "discountPrice": "220.00", "createdAt": "…", "updatedAt": "…" }
]
```

#### `GET /fish-products/:id` — public

```json
// 200 OK — a product object (see above)
```

```json
// 404 Not Found
{ "message": "Fish product 99 not found", "error": "Not Found", "statusCode": 404 }
```

A non-numeric `:id` returns `400` (`Validation failed (numeric string is expected)`).

#### `POST /fish-products` — Admin

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | yes | |
| `price` | number | yes | `>= 0` |
| `image` | string | no | Image URL, e.g. the `secure_url` from a Cloudinary upload |
| `discountPrice` | number | no | `>= 0` |

```json
{
  "name": "Rohu",
  "image": "https://res.cloudinary.com/my-cloud/image/upload/v1/fish-catalog/rohu.webp",
  "price": 250,
  "discountPrice": 220
}
```

```json
// 201 Created (numbers are echoed as sent)
{
  "id": 1,
  "name": "Rohu",
  "image": "https://res.cloudinary.com/my-cloud/image/upload/v1/fish-catalog/rohu.webp",
  "price": 250,
  "discountPrice": 220,
  "updatedAt": "2026-09-28T10:00:00.000Z",
  "createdAt": "2026-09-28T10:00:00.000Z"
}
```

#### `PATCH /fish-products/:id` — Admin

Partial update; same fields as create, all optional.

```json
{ "price": 260 }
```

```json
// 200 OK — the updated product
```

`404` if the product does not exist.

#### `DELETE /fish-products/:id` — Admin

```json
// 200 OK
{ "deleted": true }
```

`404` if the product does not exist. (The image stays in Cloudinary.)

---

### Leads

Lead object:

```json
{
  "id": 1,
  "mobileNumber": "+919876543210",
  "productId": 1,
  "deliveryTime": "2026-10-01T03:30:00.000Z",
  "address": "12 Beach Road, Chennai",
  "createdAt": "2026-09-28T10:00:00.000Z",
  "updatedAt": "2026-09-28T10:00:00.000Z"
}
```

#### `POST /leads` — public

A customer submits an order request.

| Field | Type | Required | Rules |
|---|---|---|---|
| `mobileNumber` | string | yes | 10–15 digits, optional leading `+` |
| `productId` | integer | yes | must be an existing product |
| `deliveryTime` | string | yes | ISO 8601 date-time |
| `address` | string | yes | |

```json
{
  "mobileNumber": "+919876543210",
  "productId": 1,
  "deliveryTime": "2026-10-01T09:00:00+05:30",
  "address": "12 Beach Road, Chennai"
}
```

```json
// 201 Created
{
  "id": 1,
  "mobileNumber": "+919876543210",
  "productId": 1,
  "deliveryTime": "2026-10-01T03:30:00.000Z",
  "address": "12 Beach Road, Chennai",
  "updatedAt": "2026-09-28T10:00:00.000Z",
  "createdAt": "2026-09-28T10:00:00.000Z"
}
```

```json
// 404 Not Found — unknown productId
{ "message": "Fish product 99 not found", "error": "Not Found", "statusCode": 404 }
```

```json
// 400 Bad Request — invalid mobile number
{ "message": ["mobileNumber must be 10-15 digits"], "error": "Bad Request", "statusCode": 400 }
```

#### `GET /leads` — Admin

All leads, newest first, each with its product embedded.

```json
// 200 OK
[
  {
    "id": 1,
    "mobileNumber": "+919876543210",
    "productId": 1,
    "deliveryTime": "2026-10-01T03:30:00.000Z",
    "address": "12 Beach Road, Chennai",
    "createdAt": "…",
    "updatedAt": "…",
    "product": { "id": 1, "name": "Rohu", "image": "https://res.cloudinary.com/…", "price": "250.00", "discountPrice": "220.00", "createdAt": "…", "updatedAt": "…" }
  }
]
```

---

## Image upload flow

The backend never receives the image file. It only signs the upload and later stores the URL.

```
Browser                         Backend                       Cloudinary
   │  GET /uploads/signature ──────▶│  (Admin)                      │
   │◀── { cloudName, apiKey, timestamp, signature, folder, allowedFormats }
   │                                                                │
   │  POST https://api.cloudinary.com/v1_1/<cloudName>/image/upload │
   │  multipart: file, api_key, timestamp, signature, folder, allowed_formats
   │───────────────────────────────────────────────────────────────▶│
   │◀────────────────────────── { secure_url, public_id, … } ───────│
   │                                                                │
   │  POST /fish-products { name, price, image: secure_url } ──────▶│ backend
```

Rules:
- Send **exactly** the signed params (`timestamp`, `folder`, `allowed_formats`) with the values returned, or Cloudinary rejects the upload.
- Signatures are short-lived (Cloudinary rejects timestamps older than ~1 hour), so request a fresh one per upload.
- Only `webp` is accepted (`allowed_formats` is signed, so it can't be changed client-side).
- Size limits are not part of the signature. The frontend enforces **50 KB** before uploading, and the `addFish` server action re-checks the uploaded file's type and size. For a hard server-side cap, also set a maximum file size in the Cloudinary upload preset.

Upload from the terminal:

```bash
SIG=$(curl -s http://localhost:7001/uploads/signature -H "x-admin-key: $ADMIN_API_KEY")
# then POST the file to Cloudinary with the values from $SIG (see the flow above)
```

---

## Quick test (curl)

```bash
# health
curl http://localhost:7001/hello

# create an admin (backend only)
curl -X POST http://localhost:7001/admin/register \
  -H "Content-Type: application/json" -H "x-admin-key: $ADMIN_API_KEY" \
  -d '{"email":"admin@example.com","password":"MyStrongPass123"}'

# log in, copy the token
curl -X POST http://localhost:7001/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"MyStrongPass123"}'

# add a product
curl -X POST http://localhost:7001/fish-products \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Rohu","price":250,"discountPrice":220,"image":"https://res.cloudinary.com/my-cloud/image/upload/v1/fish-catalog/rohu.webp"}'

# list products (public)
curl http://localhost:7001/fish-products
```
