"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import axiosInstance from "@/lib/axios";
import { CustomTable, Column } from "@/components/CustomTable";

const PROJECT_SHARED_API_URL = "/projects/shared";

export default function ShareProjectTable() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        fetchSharedProjects();
    }, []);

    const fetchSharedProjects = async () => {
        try {
            const response = await axiosInstance.get(PROJECT_SHARED_API_URL);
            setData(Array.isArray(response.data) ? response.data : []);
        } catch {
            toast.error("Không thể tải danh sách dự án được chia sẻ!");
        }
    };

    const columns: Column<any>[] = [
        {
            header: "Mã",
            render: (project) => project.projectCode,
        },
        {
            header: "Tên",
            render: (project) => project.name,
        },
        {
            header: "Chủ sở hữu",
            render: (project) => project.creator?.email || "?",
        },
        {
            header: "Loại",
            render: (project) => project.category?.name || "?",
        },
        {
            header: "Ngày tạo",
            render: (project) =>
                format(new Date(project.createdAt), "HH:mm - dd/MM/yyyy", { locale: vi }),
        },
        {
            header: "Cập nhật",
            render: (project) =>
                format(new Date(project.updatedAt), "HH:mm - dd/MM/yyyy", { locale: vi }),
        },
        // {
        //     header: "Xem",
        //     render: (project) => (
        //         <div className="text-right">
        //             <Button
        //                 variant="outline"
        //                 className="cursor-pointer"
        //                 onClick={() => router.push(`/project/${project.id}/phase`)}
        //             >
        //                 Xem
        //             </Button>
        //         </div>
        //     ),
        // },
    ];

    return (
        <div className="m-2 w-full h-full">
            <div className="rounded-lg border">
                <header className="border-b px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h1 className="text-xl font-semibold">Dự án được chia sẻ</h1>
                </header>

                <CustomTable
                    data={data}
                    columns={columns}
                    emptyMessage="Không có dự án nào được chia sẻ"
                />
            </div>
        </div>
    );
}
