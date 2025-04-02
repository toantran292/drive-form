"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/drive/Breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/Modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {MoreHorizontal} from "lucide-react";
import { useRouter } from "next/navigation";

const CATEGORY_API_URL = "/projects/category";
const PROJECT_API_URL = "/projects";

export default function ProjectTable() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const currentFolderId = searchParams.get("formId") || undefined;
    const router = useRouter();


    const [data, setData] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ projectCode: "", name: "", category: "" });
    const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [emailToShare, setEmailToShare] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
        fetchProjects();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get(CATEGORY_API_URL);
            const categories = response.data.map((cat: any) => cat.name);
            setCategoryOptions(categories);
        } catch {
            toast.error("Không thể lấy danh sách category!");
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await axiosInstance.get(PROJECT_API_URL);
            if (Array.isArray(response.data)) setData(response.data);
            else setData([]);
        } catch {
            toast.error("Không thể lấy danh sách project!");
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const openShareModal = (projectId: string) => {
        setSelectedProjectId(projectId);
        setShareModalOpen(true);
    };

    const closeShareModal = () => {
        setSelectedProjectId(null);
        setEmailToShare("");
        setShareModalOpen(false);
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        const updatedValue = name === "projectCode" ? value.toUpperCase() : value;
        setNewProject({ ...newProject, [name]: updatedValue });
    };

    const addProject = async () => {
        if (!newProject.projectCode || !newProject.name || !newProject.category) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        try {
            const res = await axiosInstance.post(PROJECT_API_URL, {
                ...newProject,
                creator: user,
            });

            if (res.status === 201) {
                toast.success("Dự án đã được thêm thành công!");
                fetchProjects();
                setNewProject({ projectCode: "", name: "", category: "" });
                closeModal();
            }
        } catch {
            toast.error("Không thể thêm dự án. Vui lòng thử lại!");
        }
    };

    const handleShareProject = async () => {
        if (!emailToShare || !selectedProjectId) {
            toast.error("Vui lòng nhập email!");
            return;
        }

        try {
            await axiosInstance.post(`projects/${selectedProjectId}/add`, { email: emailToShare });
            toast.success("Chia sẻ thành công!");
            closeShareModal();
        } catch {
            toast.error("Không thể chia sẻ dự án.");
        }
    };

    return (
        <div className="m-2 w-full h-full">
            <div className="rounded-lg border">
                <header className="border-b px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold">Project</h1>
                    </div>
                    <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={openModal}>Dự án mới</Button>
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
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <>
                        {data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                                    Chưa có dự án nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((project: any) => (
                                <TableRow key={project.id} onClick={() => router.push(`/project/${project.id}/phase`)}>
                                    <TableCell className="font-medium">{project.projectCode}</TableCell>
                                    <TableCell>{project.name}</TableCell>
                                    <TableCell>{project.creator.email}</TableCell>
                                    <TableCell>{project.category.name}</TableCell>
                                    <TableCell>{format(new Date(project.createdAt), "dd/MM/yyyy - HH:mm", { locale: vi })}</TableCell>
                                    <TableCell>{format(new Date(project.updatedAt), "dd/MM/yyyy - HH:mm", { locale: vi })}</TableCell>

                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push("/")}>
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openShareModal(project.id)}>
                                                    Thêm người
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

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={closeModal} title="Tạo Dự Án Mới">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="projectCode">Mã dự án</Label>
                            <Input id="projectCode" name="projectCode" value={newProject.projectCode} onChange={handleChange} placeholder="Nhập mã dự án" />
                        </div>
                        <div>
                            <Label htmlFor="name">Tên dự án</Label>
                            <Input id="name" name="name" value={newProject.name} onChange={handleChange} placeholder="Nhập tên dự án" />
                        </div>
                        <div>
                            <Label htmlFor="category">Loại dự án</Label>
                            <Select value={newProject.category} onValueChange={(value) => setNewProject({ ...newProject, category: value })}>
                                <SelectTrigger><SelectValue placeholder="Chọn loại dự án" /></SelectTrigger>
                                <SelectContent>
                                    {categoryOptions.map((category, index) => (
                                        <SelectItem key={index} value={category}>{category}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={closeModal}>Hủy</Button>
                            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={addProject}>Lưu</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {shareModalOpen && (
                <Modal isOpen={shareModalOpen} onClose={closeShareModal} title="Chia sẻ dự án">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="shareEmail">Email người dùng</Label>
                            <Input id="shareEmail" type="email" placeholder="example@gmail.com" value={emailToShare} onChange={(e) => setEmailToShare(e.target.value)} />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={closeShareModal}>Hủy</Button>
                            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleShareProject}>Chia sẻ</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
