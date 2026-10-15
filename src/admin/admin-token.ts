import jwt from 'jsonwebtoken';

const TOKEN_TTL = '12h';

function secret(): string {
  const s = process.env.ADMIN_TOKEN_SECRET ?? process.env.ADMIN_API_KEY;
  if (!s) throw new Error('ADMIN_TOKEN_SECRET (or ADMIN_API_KEY) is not set');
  return s;
}

export function createAdminToken(adminId: number): string {
  return jwt.sign({ sub: String(adminId) }, secret(), {
    algorithm: 'HS256',
    expiresIn: TOKEN_TTL,
  });
}

/** Returns the admin id if the JWT is valid and unexpired, otherwise null. */
export function verifyAdminToken(token: string): number | null {
  try {
    const payload = jwt.verify(token, secret(), { algorithms: ['HS256'] });
    if (typeof payload === 'string' || !payload.sub) return null;
    const id = Number(payload.sub);
    return Number.isInteger(id) ? id : null;
  } catch {
    return null;
  }
}
