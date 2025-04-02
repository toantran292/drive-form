"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import axiosInstance from "@/lib/axios";

const PROJECT_SHARED_API_URL = "/projects/shared";

export default function ShareProjectTable() {
    const router = useRouter();
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

    return (
        <div className="m-2 w-full h-full">
            <div className="rounded-lg border">
                <header className="border-b px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h1 className="text-xl font-semibold">Dự án được chia sẻ</h1>
                </header>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã</TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead>Chủ sở hữu</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Cập nhật</TableHead>
                            <TableHead className="text-right">Xem</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                                    Không có dự án nào được chia sẻ
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">{project.projectCode}</TableCell>
                                    <TableCell>{project.name}</TableCell>
                                    <TableCell>{project.creator?.email || "?"}</TableCell>
                                    <TableCell>{project.category?.name || "?"}</TableCell>
                                    <TableCell>{format(new Date(project.createdAt), "HH:mm - dd/MM/yyyy", { locale: vi })}</TableCell>
                                    <TableCell>{format(new Date(project.updatedAt), "HH:mm - dd/MM/yyyy", { locale: vi })}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push(`/project/${project.id}/phase`)}
                                        >
                                            Xem
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
