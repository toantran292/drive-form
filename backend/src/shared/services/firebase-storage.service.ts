import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class FirebaseStorageService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private _getFile(path: string) {
    if (!this.firebaseService.bucket) {
      throw new Error('Firebase Storage not initialized');
    }

    return this.firebaseService.bucket.file(path);
  }

  private async _getSignedUrl(
    path: string,
    options: {
      action?: 'read' | 'write';
      expires?: number;
      contentType?: string;
      responseDisposition?: string;
    } = {},
  ) {
    try {
      const file = this._getFile(path);

      if (options.action !== 'write') {
        const [exists] = await file.exists();
        if (!exists) {
          throw new Error('File not found');
        }
      }

      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: options.action || 'read',
        contentType: options.contentType,
        expires: Date.now() + (options.expires || 3600) * 1000,
        ...(options.responseDisposition && {
          responseDisposition: options.responseDisposition,
        }),
      });

      return url;
    } catch (error) {
      throw new Error(`Failed to get signed URL: ${error.message}`);
    }
  }

  async readSignedUrl(
    path: string,
    options: {
      expires?: number;
      responseDisposition?: string;
    } = {},
  ) {
    return this._getSignedUrl(path, { ...options, action: 'read' });
  }

  async writeSignedUrl(
    path: string,
    options: {
      expires?: number;
      responseDisposition?: string;
    } = {},
  ) {
    return this._getSignedUrl(path, { ...options, action: 'write' });
  }

  async makePublic(path: string) {
    const file = this._getFile(path);
    await file.makePublic();
  }

  async makePrivate(path: string) {
    const file = this._getFile(path);
    await file.makePrivate();
  }

  // async uploadFile(
  //     file: MulterFile,
  //     path: string
  // ): Promise<string> {
  //     if (!this.firebaseService.bucket) {
  //         throw new Error('Firebase Storage not initialized');
  //     }

  //     const fileBuffer = file.buffer;
  //     const fileName = `${path}`;

  //     const fileUpload = this.getFile(fileName);

  //     const stream = fileUpload.createWriteStream({
  //         metadata: {
  //             contentType: file.mimetype,
  //         },
  //         resumable: false
  //     });

  //     return new Promise((resolve, reject) => {
  //         stream.on('error', (error) => {
  //             reject(error);
  //         });

  //         stream.on('finish', async () => {
  //             await fileUpload.makePublic();
  //             const publicUrl = `https://storage.googleapis.com/${this.firebaseService.bucket.name}/${fileName}`;
  //             resolve(publicUrl);
  //         });

  //         stream.end(fileBuffer);
  //     });
  // }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this._getFile(filePath).delete();
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // async getFileStream(filePath: string): Promise<Readable> {
  //     try {
  //         const file = this._getFile(filePath);
  //         const [exists] = await file.exists();

  //         if (!exists) {
  //             throw new Error('File not found');
  //         }

  //         return file.createReadStream();
  //     } catch (error) {
  //         throw new Error(`Failed to get file stream: ${error.message}`);
  //     }
  // }

  // async generateSignedUrl(path: string, options: {
  //     expires?: number;
  //     responseDisposition?: string;
  //     public?: boolean;
  // } = {}) {
  //     try {
  //         const file = this._getFile(path);
  //         const [exists] = await file.exists();

  //         if (!exists[0]) {
  //             throw new Error('File not found in storage');
  //         }

  //         if (options.public) {
  //             await file.makePublic();
  //             return file.publicUrl();
  //         }

  //         const [url] = await file.getSignedUrl({
  //             version: 'v4',
  //             action: 'read',
  //             expires: Date.now() + (options.expires || 3600) * 1000,
  //             ...(options.responseDisposition && {
  //                 responseDisposition: options.responseDisposition
  //             })
  //         });

  //         return url;
  //     } catch (error) {
  //         console.error('Error generating signed URL:', error);
  //         throw error;
  //     }
  // }
}
