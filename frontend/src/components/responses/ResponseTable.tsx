import { useState, useEffect, JSX } from "react";
import axiosInstance from "@/lib/axios";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {toast} from "sonner";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";

export default function ResponseTable(): JSX.Element {
    const [responses, setResponses] = useState<any[]>([]);
    const params = useParams();
    const router = useRouter();

    const fetchResponses = async () => {
        try {
            const response = await axiosInstance.get(`phases/${params.formId}/responses`);
            if (response) setResponses(response.data);
            else setResponses([]);
        } catch (error) {
            toast.error("Không thể lấy danh sách responses!");
        }
    };

    useEffect(() => {
        fetchResponses();
    }, []);

    const handleViewDetails = (res:any) => {
        if (!res?.id) return toast.error("Không tìm thấy response!");
        router.push(`/forms/${params.formId}/response/${res.id}`);
    };

    return (
        <div className="space-y-4 w-full h-full">
            <div className="rounded-lg border">
                <header className="border-b px-6 py-3 bg-white sticky top-0 z-10">
                    <div className="grid grid-cols-3 items-center">
                        {/* Cột trái: Quay lại */}
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


                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Email người nộp</TableHead>
                            <TableHead>Ngày nộp</TableHead>
                            <TableHead>Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {responses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                                    Không có câu trả lời nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            responses.map((record, index) => (
                                <TableRow key={record.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{record.user?.email || "Không rõ"}</TableCell>
                                    <TableCell>{new Date(record.submittedAt).toLocaleString("vi-VN")}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" className={"cursor-pointer hover:bg-gray-200"} onClick={() => {
                                            handleViewDetails(record)
                                        }}>
                                            Xem Chi Tiết
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
