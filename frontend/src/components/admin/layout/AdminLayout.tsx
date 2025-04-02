'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DisplayLayout from "@/components/Layout";
import AdminPage from "@/components/admin/AdminPage";

export default function AdminLayout() {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const searchParams = useSearchParams();
    const currentFolderId = searchParams.get('folderId') || undefined;

    return (
        <DisplayLayout >
            <AdminPage/>
        </DisplayLayout>
    );
}