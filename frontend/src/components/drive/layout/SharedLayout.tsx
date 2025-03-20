'use client';

import { useState, ReactNode } from 'react';
import DriveHeader from './layout/DriveHeader';
import DriveSidebar from './layout/DriveSidebar';

interface SharedLayoutProps {
    children: ReactNode | (({ view }: { view: 'grid' | 'list' }) => ReactNode);
}

export default function SharedLayout({ children }: SharedLayoutProps) {
    const [view, setView] = useState<'grid' | 'list'>('grid');

    return (
        <div className="h-screen flex flex-col">
            <DriveHeader onViewChange={setView} />
            <div className="flex-1 flex">
                <DriveSidebar />
                <div className="flex-1">
                    {typeof children === 'function' ? children({ view }) : children}
                </div>
            </div>
        </div>
    );
} 