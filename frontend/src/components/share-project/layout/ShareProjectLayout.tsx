'use client';

import { useSearchParams } from 'next/navigation';
import DriveHeader from '../../drive/layout/DriveHeader';
import DriveSidebar from '../../drive/layout/DriveSidebar';
import { DriveProvider } from '@/contexts/DriveContext';
import ProjectTable from "@/components/project/ProjectTable";
import {useState} from "react";
import DisplayLayout from "@/components/Layout";
import ShareProjectTable from "@/components/share-project/ShareProjectTable";

export default function ShareProjectLayout() {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const searchParams = useSearchParams();
    const currentFolderId = searchParams.get('folderId') || undefined;

    return (
        <DisplayLayout >
            <ShareProjectTable/>
        </DisplayLayout>
    );
}