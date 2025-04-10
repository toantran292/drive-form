'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProjectTable from "@/components/project/ProjectTable";
import DisplayLayout from "@/components/Layout";
import ResponseTable from "@/components/responses/ResponseTable";

export default function ResponseLayout() {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const searchParams = useSearchParams();
    const currentFolderId = searchParams.get('folderId') || undefined;

    return (
        <DisplayLayout >
            <ResponseTable/>
        </DisplayLayout>
    );
}