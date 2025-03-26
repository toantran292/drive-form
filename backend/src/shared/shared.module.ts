import { Module } from '@nestjs/common';
import { FirebaseService } from './services/firebase.service';
import { FirebaseStorageService } from './services/firebase-storage.service';
import { FirebaseAdminService } from './services/firebase-admin.service';

@Module({
  providers: [FirebaseService, FirebaseAdminService, FirebaseStorageService],
  exports: [FirebaseService, FirebaseAdminService, FirebaseStorageService],
})
export class SharedModule {}
