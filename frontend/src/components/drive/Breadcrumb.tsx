import { useEffect, useState, useCallback } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import * as driveApi from '@/app/api/drive';

interface BreadcrumbProps {
    currentFolderId?: string;
}

interface BreadcrumbItem {
    id: string;
    name: string;
}

export function Breadcrumb({ currentFolderId }: BreadcrumbProps) {
    const router = useRouter();
    const [path, setPath] = useState<BreadcrumbItem[]>([]);

    const loadPath = useCallback(async () => {
        try {
            const response = await driveApi.getFolderPath(currentFolderId!);
            setPath(response.path);
        } catch (error) {
            console.error('Failed to load path:', error);
        }
    }, [currentFolderId]);

    useEffect(() => {
        if (currentFolderId) {
            loadPath();
        } else {
            setPath([]);
        }
    }, [currentFolderId, loadPath]);

    return (
        <div className="flex items-center gap-1 text-sm">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className={!currentFolderId ? 'bg-gray-100' : ''}
            >
                My Drive
            </Button>
            {path.map((item, index) => (
                <div key={item.id} className="flex items-center">
                    <FiChevronRight className="h-4 w-4 text-gray-400" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/?folderId=${item.id}`)}
                        className={index === path.length - 1 ? 'bg-gray-100' : ''}
                    >
                        {item.name}
                    </Button>
                </div>
            ))}
        </div>
    );
} 