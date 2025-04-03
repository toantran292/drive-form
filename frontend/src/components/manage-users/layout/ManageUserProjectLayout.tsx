'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DisplayLayout from "@/components/Layout";
import ManageUsersProjectTable from "@/components/manage-users/ManageUsersProjectTable";

export default function ManageUserProjectLayout() {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const searchParams = useSearchParams();
    const currentFolderId = searchParams.get('folderId') || undefined;

    return (
        <DisplayLayout >
            <ManageUsersProjectTable/>
        </DisplayLayout>
    );
}