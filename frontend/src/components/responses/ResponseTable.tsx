"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CustomTable, Column } from "@/components/CustomTable";
import axiosInstance from "@/lib/axios";

export default function ResponseTable() {
    const [responses, setResponses] = useState<any[]>([]);
    const params = useParams();
    const router = useRouter();

    const fetchResponses = async () => {
        try {
            const response = await axiosInstance.get(`phases/${params.formId}/responses`);
            if (response) setResponses(response.data);
            else setResponses([]);
        } catch {
            toast.error("Không thể lấy danh sách responses!");
        }
    };

    useEffect(() => {
        fetchResponses();
    }, []);

    const handleViewDetails = (res: any) => {
        if (!res?.id) return toast.error("Không tìm thấy response!");
        router.push(`/forms/${params.formId}/response/${res.id}`);
    };

    const columns: Column<any>[] = [
        {
            header: "#",
            render: (_res, index) => index + 1,
        },
        {
            header: "Email người nộp",
            render: (res) => res.user?.email || "Không rõ",
        },
        {
            header: "Ngày nộp",
            render: (res) => new Date(res.submittedAt).toLocaleString("vi-VN"),
        },
        {
            header: "Hành động",
            render: (res) => (
                <Button
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => handleViewDetails(res)}
                >
                    Xem Chi Tiết
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-4 w-full h-full">
            <div className="rounded-lg border">
                <header className="border-b px-6 py-3 bg-white sticky top-0 z-10">
                    <div className="grid grid-cols-3 items-center">
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="text-sm text-muted-foreground px-0 hover:bg-transparent cursor-pointer"
                            >
                                ← Quay lại
                            </Button>
                        </div>
                        <h1 className="text-xl font-semibold text-center">Responses</h1>
                        <div />
                    </div>
                </header>

                <CustomTable
                    data={responses}
                    columns={columns}
                    emptyMessage="Không có câu trả lời nào"
                />
            </div>
        </div>
    );
}
