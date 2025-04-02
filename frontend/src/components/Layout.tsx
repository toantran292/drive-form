'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DriveProvider } from '@/contexts/DriveContext';
import DriveHeader from "@/components/drive/layout/DriveHeader";
import DriveSidebar from "@/components/drive/layout/DriveSidebar";

interface DriveLayoutProps {
    children: React.ReactNode; // Truyền nội dung động từ component cha
}

export default function DisplayLayout({ children }: DriveLayoutProps) {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const searchParams = useSearchParams();
    const currentFolderId = searchParams.get('folderId') || undefined;

    return (
        <DriveProvider folderId={currentFolderId}>
            <div className="h-screen flex flex-col">
                <DriveHeader onViewChange={setView} />
                <div className="flex-1 flex w-full">
                    <DriveSidebar />
                    <div className="flex-1 overflow-auto">
                        {children}
                    </div>
                </div>
            </div>
        </DriveProvider>
    );
}
