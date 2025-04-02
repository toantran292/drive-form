"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/Modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import axiosInstance from "@/lib/axios";

const PROJECT_API_URL = "/projects";

export default function ManageUsersProjectTable() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id;

    const [project, setProject] = useState<any | null>(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [emailToShare, setEmailToShare] = useState("");

    useEffect(() => {
        fetchProject();
    }, []);

    const fetchProject = async () => {
        try {
            const res = await axiosInstance.get(`${PROJECT_API_URL}/${projectId}`);
            setProject(res.data);
        } catch {
            toast.error("Không thể tải thông tin dự án");
        }
    };

    const handleRemoveUser = async (userId: string) => {
        try {
            await axiosInstance.delete(`${PROJECT_API_URL}/${projectId}/remove`, {
                data: { userId },
            });
            toast.success("Đã xoá người dùng khỏi dự án!");
            fetchProject();
        } catch {
            toast.error("Không thể xoá người dùng!");
        }
    };

    const handleShareProject = async () => {
        if (!emailToShare) {
            toast.error("Vui lòng nhập email!");
            return;
        }

        try {
            await axiosInstance.post(`${PROJECT_API_URL}/${projectId}/add`, {
                email: emailToShare,
            });

            toast.success("Chia sẻ thành công!");
            setEmailToShare("");
            setShareModalOpen(false);
            fetchProject();
        } catch {
            toast.error("Không thể chia sẻ dự án.");
        }
    };

    return (
        <div className="m-2 w-full h-full">
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
                    <div className="px-6 py-2 justify-between flex flex-col items-center">
                        <h1 className="text-xl font-semibold">Quản lý người dùng</h1>
                        <div className="text-sm text-muted-foreground">
                            {project?.name ? `${project.name} (${project.projectCode})` : ""}
                        </div>
                    </div>
                    <Button className="cursor-pointer" onClick={() => setShareModalOpen(true)}>
                        Thêm người mới
                    </Button>
                </header>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {project?.sharedWithUsers?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-32 text-muted-foreground">
                                    Chưa có người dùng chia sẻ
                                </TableCell>
                            </TableRow>
                        ) : (
                            project?.sharedWithUsers.map((user: any) => (
                                <TableRow key={user.uid} className={"cursor-pointer"}>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.displayName || "User"}</TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className={"cursor-pointer hover:bg-gray-200"}>
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className={"cursor-pointer"} onClick={() => handleRemoveUser(user.uid)}>
                                                    Xóa khỏi dự án
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {shareModalOpen && (
                <Modal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} title="Chia sẻ dự án">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="shareEmail">Email người dùng</Label>
                            <Input
                                id="shareEmail"
                                type="email"
                                placeholder="example@gmail.com"
                                value={emailToShare}
                                onChange={(e) => setEmailToShare(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" className={"cursor-pointer"} onClick={() => setShareModalOpen(false)}>Hủy</Button>
                            <Button className={"cursor-pointer"} onClick={handleShareProject}>Chia sẻ</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
