'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DriveHeader from './DriveHeader';
import DriveSidebar from './DriveSidebar';
import DriveContent from '../DriveContent';
import { DriveProvider } from '@/contexts/DriveContext';

export default function DriveLayout() {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const searchParams = useSearchParams();
    const currentFolderId = searchParams.get('folderId') || undefined;

    return (
        <DriveProvider folderId={currentFolderId}>
            <div className="h-screen flex flex-col">
                <DriveHeader onViewChange={setView} />
                <div className="flex-1 flex w-full">
                    <DriveSidebar />
                    <DriveContent view={view} />
                </div>
            </div>
        </DriveProvider>
    );
}