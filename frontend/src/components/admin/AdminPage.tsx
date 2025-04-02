"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/Modal";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";

// API URL cho category
const API_URL = "/admin/projects/category";

export default function AdminPage() {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [newCategory, setNewCategory] = useState({
        project_code: "",
        name: "",
    });

    // Lấy danh sách category khi load trang
    useEffect(() => {
        fetchCategories();
    }, []);

    // Lấy danh sách category từ API
    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get(API_URL);
            setCategories(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách category:", error);
            toast.error("Không thể lấy danh sách category.");
        }
    };

    // Mở modal
    const openModal = () => {
        setIsEdit(false);
        setNewCategory({ project_code: "", name: "" });
        setIsModalOpen(true);
    };

    // Đóng modal
    const closeModal = () => setIsModalOpen(false);

    // Xử lý thay đổi form
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        const updatedValue = name === "project_code" ? value.toUpperCase() : value;
        setNewCategory({ ...newCategory, [name]: updatedValue });
    };

    // Thêm hoặc cập nhật category
    const saveCategory = async () => {
        if (!newCategory.project_code || !newCategory.name) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        try {
            if (isEdit) {
                // Gọi API cập nhật category
                await axiosInstance.patch(`/projects/${editCategoryId}`, {
                    project_code: newCategory.project_code,
                    name: newCategory.name,
                });
                toast.success("Cập nhật category thành công!");
            } else {
                // Gọi API thêm category
                await axiosInstance.post(API_URL, {
                    category: newCategory.name,
                    project_code: newCategory.project_code,
                    isAdmin: user?.isAdmin,
                });
                toast.success("Category đã được thêm thành công!");
            }
            fetchCategories(); // Làm mới danh sách
            closeModal();
        } catch (error) {
            console.error("Lỗi khi lưu category:", error);
            toast.error("Không thể thêm hoặc cập nhật category.");
        }
    };

    // Mở modal để chỉnh sửa
    const openEditModal = (category: any) => {
        setIsEdit(true);
        setEditCategoryId(category.id);
        setNewCategory({
            project_code: category.project_code,
            name: category.name,
        });
        setIsModalOpen(true);
    };

    // Xóa category
    const deleteCategory = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa category này?")) {
            try {
                await axiosInstance.delete(`/projects/${id}`);
                toast.success("Category đã được xóa thành công!");
                fetchCategories();
            } catch (error) {
                console.error("Lỗi khi xóa category:", error);
                toast.error("Không thể xóa category.");
            }
        }
    };

    return (
        <div className="mx-4 space-y-4 w-full h-full">
            <div className="rounded-lg border">
                <header className="border-b px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h1 className="text-xl font-semibold">Quản lý Category</h1>
                    <Button onClick={openModal}>Thêm Category Mới</Button>
                </header>

                {/* Hiển thị bảng Category */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã Dự Án</TableHead>
                            <TableHead>Tên Category</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories?.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="text-center h-32 text-muted-foreground"
                                >
                                    Chưa có category nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories?.map((category: any) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">
                                        {category.project_code}
                                    </TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditModal(category)}
                                        >
                                            Chỉnh sửa
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deleteCategory(category.id)}
                                        >
                                            Xóa
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modal thêm hoặc chỉnh sửa Category */}
            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={isEdit ? "Chỉnh Sửa Category" : "Tạo Category Mới"}
                >
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="project_code">Mã Dự Án</Label>
                            <Input
                                id="project_code"
                                name="project_code"
                                value={newCategory.project_code}
                                onChange={handleChange}
                                placeholder="Nhập mã dự án"
                            />
                        </div>
                        <div>
                            <Label htmlFor="name">Tên Category</Label>
                            <Input
                                id="name"
                                name="name"
                                value={newCategory.name}
                                onChange={handleChange}
                                placeholder="Nhập tên category"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={closeModal}>
                                Hủy
                            </Button>
                            <Button onClick={saveCategory}>
                                {isEdit ? "Cập Nhật" : "Lưu"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
