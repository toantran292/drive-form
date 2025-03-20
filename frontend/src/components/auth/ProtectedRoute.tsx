'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const publicRoutes = ['/login', '/register'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Kiểm tra xem có phải là trang share không
    const isSharePage = pathname?.startsWith('/share/');
    const isFormViewPage = pathname?.startsWith('/forms/') && pathname?.endsWith('/view');

    useEffect(() => {
        if (!loading) {
            // Bỏ qua kiểm tra cho trang share
            if (isSharePage || isFormViewPage) {
                return;
            }

            // Nếu đang ở route public và đã đăng nhập -> chuyển về trang chủ
            if (publicRoutes.includes(pathname) && user) {
                router.replace('/');
                return;
            }

            // Nếu đang ở route protected và chưa đăng nhập -> chuyển về login
            if (!publicRoutes.includes(pathname) && !user) {
                const searchParams = new URLSearchParams({
                    callbackUrl: pathname,
                });
                router.replace(`/login?${searchParams.toString()}`);
                return;
            }
        }
    }, [user, loading, pathname, router, isSharePage, isFormViewPage]);

    // Hiển thị loading state
    if (loading && !isSharePage && !isFormViewPage) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Cho phép truy cập nếu là trang share
    if (isSharePage || isFormViewPage) {
        return <>{children}</>;
    }

    // Nếu đang ở route public hoặc đã đăng nhập -> hiển thị content
    if (publicRoutes.includes(pathname) || user) {
        return <>{children}</>;
    }

    // Trường hợp còn lại -> hiển thị loading (trong khi redirect)
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    );
} 