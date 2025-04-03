'use client';

import { useState } from 'react';
import { FiGrid, FiList, FiSearch, FiSettings } from 'react-icons/fi';

interface DriveHeaderProps {
    onViewChange: (view: 'grid' | 'list') => void;
}

export default function DriveHeader({ onViewChange }: DriveHeaderProps) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="h-16 border-b flex items-center px-6 justify-between">
            <div className="flex items-center flex-1">
                <div className="text-2xl font-semibold mr-8">Drive</div>
                <div className="max-w-xl flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="text-gray-900 w-full px-4 py-2 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2"
                        />
                        <FiSearch className="absolute left-3 top-3 text-gray-500" />
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {/*<button*/}
                {/*    onClick={() => onViewChange('grid')}*/}
                {/*    className="p-2 hover:bg-gray-100 rounded-full"*/}
                {/*>*/}
                {/*    <FiGrid size={20} />*/}
                {/*</button>*/}
                {/*<button*/}
                {/*    onClick={() => onViewChange('list')}*/}
                {/*    className="p-2 hover:bg-gray-100 rounded-full"*/}
                {/*>*/}
                {/*    <FiList size={20} />*/}
                {/*</button>*/}
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <FiSettings size={20} />
                </button>
            </div>
        </header>
    );
} 