"use client";

import { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/drive/Breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/Modal";
import { toast } from "sonner";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const PHASE_API_URL = "/phases";

export default function PhaseTable() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentFolderId = searchParams.get("folderId") || undefined;

    const [data, setData] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [newPhase, setNewPhase] = useState({ name: "", projectId: params.id, phaseCode: "" });
    const [emailToShare, setEmailToShare] = useState("");
    const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);

    useEffect(() => { fetchPhases(); }, []);

    const fetchPhases = async () => {
        try {
            const response = await axiosInstance.get(`projects/${params.id}/phases`);
            setData(response.data?.phases || []);
        } catch {
            toast.error("Không thể lấy danh sách phase!");
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const openShareModal = (phaseId: string) => {
        setSelectedPhaseId(phaseId);
        setShareModalOpen(true);
    };

    const closeShareModal = () => {
        setSelectedPhaseId(null);
        setEmailToShare("");
        setShareModalOpen(false);
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setNewPhase({ ...newPhase, [name]: value });
    };

    const addPhase = async () => {
        if (!newPhase.name || !newPhase.phaseCode) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        try {
            const res = await axiosInstance.post(PHASE_API_URL, newPhase);
            if (res.status === 201) {
                toast.success("Phase đã được thêm thành công!");
                fetchPhases();
                setNewPhase({ name: "", phaseCode: "" });
                closeModal();
            }
        } catch {
            toast.error("Không thể thêm phase. Vui lòng thử lại!");
        }
    };

    const handleSharePhase = async () => {
        if (!emailToShare || !selectedPhaseId) {
            toast.error("Vui lòng nhập email!");
            return;
        }

        try {
            await axiosInstance.post(`/phases/${selectedPhaseId}/add`, { email: emailToShare });
            toast.success("Chia sẻ thành công!");
            closeShareModal();
        } catch {
            toast.error("Không thể chia sẻ phase.");
        }
    };

    return (
        <div className="m-2 w-full h-full">
            <div className="rounded-lg border">
                <header className="flex border-b px-6 py-3 items-center justify-between bg-white sticky top-0 z-10">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="text-sm text-muted-foreground px-0 hover:bg-transparent cursor-pointer"
                            >
                                ← Quay lại
                            </Button>
                            <h1 className="text-xl font-semibold mt-1">Phase</h1>

                        <Button className="cursor-pointer" onClick={openModal}>
                            Phase mới
                        </Button>
                </header>


                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã</TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Cập nhật</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                                    Chưa có phase nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((phase: any) => (
                                <TableRow key={phase.id} onClick={() => router.push(`phase/${phase.id}/forms`)} className={"cursor-pointer"}>
                                    <TableCell className="font-medium">{phase.phaseCode}</TableCell>
                                    <TableCell>{phase.name}</TableCell>
                                    <TableCell>{format(new Date(phase.createdAt), "HH:mm - dd/MM/yyyy", { locale: vi })}</TableCell>
                                    <TableCell>{format(new Date(phase.updatedAt), "HH:mm - dd/MM/yyyy", { locale: vi })}</TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className={"cursor-pointer hover:bg-gray-200"}>
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className={"cursor-pointer"} onClick={() => openShareModal(phase.id)}>Thêm người</DropdownMenuItem>
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

            {/* Modal tạo mới */}
            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={closeModal} title="Tạo Phase Mới">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Tên Phase</Label>
                            <Input id="name" name="name" value={newPhase.name} onChange={handleChange} placeholder="Nhập tên phase" />
                        </div>
                        <div>
                            <Label htmlFor="phaseCode">Phase Code</Label>
                            <Input id="phaseCode" name="phaseCode" value={newPhase.phaseCode} onChange={handleChange} placeholder="Nhập Phase Code" />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={closeModal} className={"cursor-pointer"}>Hủy</Button>
                            <Button className={"cursor-pointer"} onClick={addPhase}>Lưu</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal chia sẻ */}
            {shareModalOpen && (
                <Modal isOpen={shareModalOpen} onClose={closeShareModal} title="Chia sẻ phase">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="shareEmail">Email người dùng</Label>
                            <Input id="shareEmail" type="email" placeholder="example@gmail.com" value={emailToShare} onChange={(e) => setEmailToShare(e.target.value)} />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={closeShareModal} className={"cursor-pointer"}>Hủy</Button>
                            <Button className={"cursor-pointer"} onClick={handleSharePhase}>Chia sẻ</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
