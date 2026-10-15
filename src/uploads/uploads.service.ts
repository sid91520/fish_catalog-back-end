import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

const FOLDER = 'fish-catalog';
const ALLOWED_FORMATS = 'webp';

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {}

  /**
   * Signs a direct browser -> Cloudinary upload. Every signed param (timestamp,
   * folder, allowed_formats) must be sent unchanged in the upload request.
   * The API secret never leaves the server.
   */
  createSignature() {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException('Cloudinary is not configured');
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: FOLDER, allowed_formats: ALLOWED_FORMATS },
      apiSecret,
    );

    return {
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder: FOLDER,
      allowedFormats: ALLOWED_FORMATS,
    };
  }
}
