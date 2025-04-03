'use client';

import { FiHardDrive, FiStar, FiShare2 } from 'react-icons/fi';
import { RiAdminLine } from 'react-icons/ri';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";

export default function DriveSidebar() {
    const { user } = useAuth();
    const isAdmin = user?.isAdmin;
    const pathname = usePathname();

    const menuItems = [
        { icon: <FiHardDrive />, label: 'Drive của tôi', url: '/' },
        { icon: <FiStar />, label: 'Dự án', url: '/project' },
        { icon: <FiShare2 />, label: 'Dự án chia sẻ', url: '/share-project' },
        isAdmin ? { icon: <RiAdminLine />, label: 'Admin', url: '/admin' } : null
    ].filter(Boolean); // Loại bỏ null nếu không phải admin

    return (
        <div className="w-64 p-4 border-r">
            {/*<button className="w-full mb-6 px-6 py-3 rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-colors">*/}
            {/*    New*/}
            {/*</button>*/}

            <nav>
                {menuItems.map((item) => {
                    const isActive = pathname === item?.url; // So sánh url hiện tại để xác định active

                    return (
                        <Link
                            key={item?.label}
                            href={item?.url}
                            className={`flex items-center space-x-3 px-4 py-2 rounded-lg mb-1 transition-colors ${
                                isActive
                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <span className={`${isActive ? 'text-blue-700' : 'text-gray-400'}`}>
                                {item?.icon}
                            </span>
                            <span>{item?.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
