import axios from '@/lib/axios';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    // ... other config
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface AuthResponse {
    user: {
        uid: string;
        email: string;
        emailVerified: boolean;
        displayName?: string;
        photoURL?: string;
    };
    token: string;
}

interface TokenResponse {
    decodedToken: {
        uid: string;
        email: string;
        name?: string;
        picture?: string;
        exp: number;
    };
}

export async function register(email: string, password: string): Promise<AuthResponse> {
    try {
        // Đăng ký với Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Lấy ID token
        const idToken = await userCredential.user.getIdToken();

        // Lưu token
        localStorage.setItem('auth-token', idToken);

        // Gọi API backend để tạo user trong database
        const response = await axios.post('/auth/register', {
            email,
            password
        });

        return {
            user: response.data.user,
            token: idToken
        };
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    try {
        // Đăng nhập với Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Lấy ID token
        const idToken = await userCredential.user.getIdToken();

        // Lưu token
        localStorage.setItem('auth-token', idToken);

        // Gọi API backend để lấy thông tin user
        const response = await axios.post('/auth/login', {
            email,
            password
        });

        return {
            user: response.data.user,
            token: idToken
        };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

export async function logout(): Promise<{ message: string }> {
    try {
        // Đăng xuất khỏi Firebase
        await auth.signOut();

        // Xóa token
        localStorage.removeItem('auth-token');

        // Gọi API logout
        const response = await axios.post('/auth/logout');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function verifyToken(): Promise<TokenResponse> {
    try {
        const response = await axios.post('/auth/verify-token');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function refreshToken(): Promise<{ token: string }> {
    try {
        const response = await axios.post('/auth/refresh-token');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function getProfile() {
    try {
        const response = await axios.get('/auth/me');
        return response.data;
    } catch (error: any) {
        console.error('Get profile error:', error);
        throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
} 