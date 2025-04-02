'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '@/app/api/auth';
import axios from '@/lib/axios';
import Cookies from 'js-cookie';
import {  usePathname } from 'next/navigation';
import {toast} from "sonner";

// Định nghĩa kiểu User cho backend
interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    isAdmin: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AUTH_TOKEN_KEY = 'auth-token';
const COOKIE_OPTIONS = {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as 'lax' | 'strict' | 'none', // Thay đổi từ 'lax' sang 'lax' để cho phép redirect
    path: '/' // Đảm bảo cookie có sẵn trên tất cả các routes
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    // Kiểm tra xem có phải là trang share không
    const isSharePage = pathname?.startsWith('/share/');

    // Hàm helper để lưu token
    const saveToken = (token: string) => {
        // Lưu vào localStorage
        localStorage.setItem(AUTH_TOKEN_KEY, token);

        // Lưu vào cookie với options cụ thể
        Cookies.set(AUTH_TOKEN_KEY, token, COOKIE_OPTIONS);
    };

    // Hàm helper để lấy token
    const getToken = () => {
        // Ưu tiên lấy từ cookie trước
        const cookieToken = Cookies.get(AUTH_TOKEN_KEY);
        if (cookieToken) {
            // Đồng bộ với localStorage nếu cần
            localStorage.setItem(AUTH_TOKEN_KEY, cookieToken);
            return cookieToken;
        }

        // Nếu không có trong cookie, thử lấy từ localStorage
        const localToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (localToken) {
            // Đồng bộ ngược lại với cookie
            Cookies.set(AUTH_TOKEN_KEY, localToken, COOKIE_OPTIONS);
            return localToken;
        }

        return null;
    };

    // Hàm helper để xóa token
    const removeToken = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        Cookies.remove(AUTH_TOKEN_KEY, { path: '/' }); // Chỉ định path khi xóa
    };

    useEffect(() => {
        const checkAuth = async () => {
            // Nếu là trang share, không cần kiểm tra auth
            if (isSharePage) {
                setLoading(false);
                return;
            }

            try {
                const token = getToken();
                if (!token) {
                    setLoading(false);
                    return;
                }

                const { decodedToken } = await authApi.verifyToken();
                if (decodedToken) {
                    setUser({
                        uid: decodedToken.uid,
                        email: decodedToken.email || '',
                        displayName: decodedToken.name,
                        photoURL: decodedToken.picture,
                        isAdmin: decodedToken.is_admin||false
                    });
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                removeToken();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [isSharePage]);

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (config.url?.includes('/share/')) {
                    return config;
                }

                const token = getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const { user: userData, token } = await authApi.login(email, password);

            saveToken(token);

            setUser(userData);
        } catch (error) {
            throw error;
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            const { user: userData, token } = await authApi.register(email, password);
            saveToken(token);
            setUser(userData);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            const token = getToken();
            if (token) {
                await authApi.logout();
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            removeToken();
            setUser(null);
            window.location.href = '/login';
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {(!loading || isSharePage) && children}
        </AuthContext.Provider>
    );
} 