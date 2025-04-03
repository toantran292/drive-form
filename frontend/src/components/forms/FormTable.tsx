"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { CreateFormDialog } from "@/components/drive/dialog/CreateFormDialog";
import { CustomTable, Column } from "@/components/CustomTable";
import axiosInstance from "@/lib/axios";

export default function FormTable() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        fetchForms();
    }, [params.phaseId]);

    const fetchForms = async () => {
        try {
            const res = await axiosInstance.get(`/phases/${params.phaseId}/forms`);
            setData(res.data.forms);
        } catch (error) {
            console.error("Lỗi khi lấy biểu mẫu:", error);
            toast.error("Không thể tải danh sách biểu mẫu!");
        }
    };

    const columns: Column<any>[] = [
        {
            header: "Tiêu đề",
            render: (form) => form.title,
        },
        {
            header: "Mô tả",
            render: (form) => form.description || "Không có mô tả",
        },
        {
            header: "Ngày tạo",
            render: (form) => format(new Date(form.createdAt), "dd/MM/yyyy - HH:mm", { locale: vi }),
        },
        {
            header: "Cập nhật",
            render: (form) => format(new Date(form.modifiedAt), "dd/MM/yyyy - HH:mm", { locale: vi }),
        },
        {
            header: "Hành động",
            render: (form) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-gray-200">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {Array.isArray(form.questions) && form.questions.length > 0 ? (
                            <DropdownMenuItem asChild className="cursor-pointer" onClick={e => e.stopPropagation()}>
                                <Link href={`/forms/${form.id}/view`}><span>Điền biểu mẫu</span></Link>
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem disabled className="pointer-events-none opacity-50">
                                Chưa có câu hỏi
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild className="cursor-pointer" onClick={e => e.stopPropagation()}>
                            <Link href={`/forms/${form.id}`}><span>Chỉnh sửa</span></Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <div className="m-2 space-y-4 w-full h-full">
            <div className="rounded-lg border">
                <header className="border-b px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="text-sm text-muted-foreground px-0 hover:bg-transparent cursor-pointer"
                    >
                        ← Quay lại
                    </Button>
                    <h1 className="text-xl font-semibold">Biểu mẫu</h1>
                    <Button
                        className="cursor-pointer"
                        size="sm"
                        onClick={() => setShowCreateForm(true)}
                    >
                        + Tạo biểu mẫu
                    </Button>
                </header>

                <CustomTable
                    data={data}
                    columns={columns}
                    emptyMessage="Chưa có biểu mẫu nào"
                    onRowClick={(form) => router.push(`responses/${form.id}`)}
                />
            </div>

            <CreateFormDialog
                phaseId={params.phaseId}
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
            />
        </div>
    );
}
export const getFormByPhase = async (formId: string): Promise<Form> => {
    const response = await axios.get(`phases/forms/${formId}`)
    return response.data
}
