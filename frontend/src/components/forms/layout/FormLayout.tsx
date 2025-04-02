'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DisplayLayout from "@/components/Layout";
import FormTable from "@/components/forms/FormTable";

export default function FormLayout() {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const searchParams = useSearchParams();
    const currentFolderId = searchParams.get('folderId') || undefined;

    return (
        <DisplayLayout >
            <FormTable/>
        </DisplayLayout>
    );
}