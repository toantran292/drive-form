'use client';

import { FiHardDrive, FiStar, FiTrash2, FiShare2, FiClock } from 'react-icons/fi';

export default function DriveSidebar() {
    const menuItems = [
        { icon: <FiHardDrive />, label: 'My Drive', active: true },
        { icon: <FiShare2 />, label: 'Shared with me' },
        { icon: <FiStar />, label: 'Starred' },
        { icon: <FiClock />, label: 'Recent' },
        { icon: <FiTrash2 />, label: 'Trash' },
    ];

    return (
        <div className="w-64 p-4 border-r">
            <button className="w-full mb-6 px-6 py-3 rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-colors">
                New
            </button>

            <nav>
                {menuItems.map((item) => (
                    <a
                        key={item.label}
                        href="#"
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg mb-1 transition-colors ${item.active
                                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                    >
                        <span className={`${item.active ? 'text-blue-700' : 'text-gray-400'}`}>
                            {item.icon}
                        </span>
                        <span>{item.label}</span>
                    </a>
                ))}
            </nav>
        </div>
    );
} 