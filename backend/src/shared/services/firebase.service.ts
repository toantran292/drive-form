import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import * as admin from 'firebase-admin';
import { Bucket } from '@google-cloud/storage';
import * as fs from 'fs';
import path from "path";


@Injectable()
export class FirebaseService implements OnModuleInit {
    private logger = new Logger(FirebaseService.name);

    private _auth: admin.auth.Auth;
    private _bucket: Bucket;

    constructor(private readonly configService: ConfigService) {
    }

    async onModuleInit() {
        const serviceAccountPath = path.resolve(__dirname, '../../config/firebase_cert.json');

        if (!fs.existsSync(serviceAccountPath)) {
            throw new Error('Firebase service account file not found');
        }

        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));


        const firebaseConfig = this.configService.get('firebase');

        if (!firebaseConfig.projectId) {
            throw new Error('Firebase project ID is not configured');
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: firebaseConfig.storageBucket
            });
        }
        this._auth = admin.auth();
        this._bucket = admin.storage().bucket(firebaseConfig.storageBucket);

        this.logger.log('Firebase initialized successfully');
    }

    get auth() {
        return this._auth;
    }

    get bucket() {
        return this._bucket;
    }
}