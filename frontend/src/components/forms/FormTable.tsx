"use client";

import { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { CreateFormDialog } from "@/components/drive/dialog/CreateFormDialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {MoreHorizontal} from "lucide-react";
import axios from "@/lib/axios";
import {Form} from "@/types/form";

export default function FormTable() {
    const params = useParams();
    const [data, setData] = useState<any[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const router = useRouter();
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

    return (
        <div className="m-2 space-y-4 w-full h-full">
            <div className="rounded-lg border">
                <header className="border-b px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="text-sm text-muted-foreground px-0 hover:bg-transparent"
                    >
                        ← Quay lại
                    </Button>
                    <h1 className="text-xl font-semibold">Biểu mẫu</h1>
                    <Button
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        size="sm"
                        onClick={() => setShowCreateForm(true)}
                    >
                        + Tạo biểu mẫu
                    </Button>
                </header>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Cập nhật</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <>
                        {data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                                    Chưa có biểu mẫu nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((form: any) => (
                                <TableRow key={form.id} onClick={()=>router.push(`responses/${form.id}`)}>
                                    <TableCell className="font-medium">{form.title}</TableCell>
                                    <TableCell>{form.description || "Không có mô tả"}</TableCell>
                                    <TableCell>
                                        {format(new Date(form.createdAt), "dd/MM/yyyy - HH:mm", { locale: vi })}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(form.modifiedAt), "dd/MM/yyyy - HH:mm", { locale: vi })}
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`responses/${form.id}`}>
                                                        <span>Truy cập kết quả</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <>
                                                {Array.isArray(form.questions) && form.questions.length > 0 ? (
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/forms/${form.id}/view`}>
                                                            <span>Điền biểu mẫu</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem disabled>Chưa có câu hỏi</DropdownMenuItem>
                                                )}
                                                </>

                                                <DropdownMenuItem asChild>
                                                    <Link href={`/forms/${form.id}`}>
                                                        <span>Chỉnh sửa</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                        </>
                    </TableBody>
                </Table>
            </div>

            {/* Dialog tạo form */}
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
