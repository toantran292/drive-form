"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/Modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const PROJECT_API_URL = "/projects";
const CATEGORY_API_URL = "/projects/category";

export default function ProjectTable() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentFolderId = searchParams.get("formId") || undefined;

    const [data, setData] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<any | null>(null);
    const [newProject, setNewProject] = useState({ projectCode: "", name: "", category: "" });
    const [categoryOptions, setCategoryOptions] = useState<any[]>([]);

    useEffect(() => {
        fetchCategories();
        fetchProjects();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get(CATEGORY_API_URL);
            const categories = response.data.map((cat: any) => ({ id: cat.id, name: cat.name }));
            setCategoryOptions(categories);
        } catch {
            toast.error("Không thể lấy danh sách category!");
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await axiosInstance.get(PROJECT_API_URL);
            setData(Array.isArray(response.data) ? response.data : []);
        } catch {
            toast.error("Không thể lấy danh sách project!");
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        const updatedValue = name === "projectCode" ? value.toUpperCase() : value;
        setNewProject({ ...newProject, [name]: updatedValue });
    };

    const handleSubmitProject = async () => {
        if (!newProject.projectCode || !newProject.name || !newProject.category) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        try {
            if (editingProject) {
                await axiosInstance.patch(`${PROJECT_API_URL}/${editingProject.id}`, {
                    ...newProject,
                });
                toast.success("Cập nhật dự án thành công!");
            } else {
                await axiosInstance.post(PROJECT_API_URL, {
                    ...newProject,
                    category: { id: newProject.category },
                    creator: user,
                });
                toast.success("Dự án đã được thêm thành công!");
            }

            fetchProjects();
            setNewProject({ projectCode: "", name: "", category: "" });
            closeModal();
        } catch {
            toast.error(editingProject ? "Không thể cập nhật dự án." : "Không thể thêm dự án.");
        }
    };

    return (
        <div className="m-2 w-full h-full">
            <div className="rounded-lg border">
                <header className="border-b px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h1 className="text-xl font-semibold">Dự án</h1>
                    <Button className="cursor-pointer" onClick={openModal}>
                        Dự án mới
                    </Button>
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
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                                    Chưa có dự án nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((project: any) => (
                                <TableRow key={project.id} onClick={() => router.push(`/project/${project.id}/phase`)} className="cursor-pointer">
                                    <TableCell className="font-medium">{project.projectCode}</TableCell>
                                    <TableCell>{project.name}</TableCell>
                                    <TableCell>{project.creator.email}</TableCell>
                                    <TableCell>{project.category.name}</TableCell>
                                    <TableCell>{format(new Date(project.createdAt), "HH:mm - dd/MM/yyyy", { locale: vi })}</TableCell>
                                    <TableCell>{format(new Date(project.updatedAt), "HH:mm - dd/MM/yyyy", { locale: vi })}</TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-gray-200">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditingProject(project);
                                                        setNewProject({
                                                            projectCode: project.projectCode,
                                                            name: project.name,
                                                            category: project.category?.id || "",
                                                        });
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/project/${project.id}/users`)}>
                                                    Quản lý người dùng
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
                <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProject ? "Chỉnh sửa dự án" : "Tạo Dự Án Mới"}>
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại dự án" />
                                </SelectTrigger>
                                <SelectContent>
                                    <>
                                    {categoryOptions.map((category) => (
                                        <SelectItem className={"cursor-pointer"} key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                    </>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" className={"cursor-pointer"} onClick={closeModal}>Hủy</Button>
                            <Button className="cursor-pointer " onClick={handleSubmitProject}>
                                {editingProject ? "Cập nhật" : "Lưu"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
