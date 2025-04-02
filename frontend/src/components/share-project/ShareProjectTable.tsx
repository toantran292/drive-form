"use client"

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Breadcrumb} from "@/components/drive/Breadcrumb";
import {FiGrid, FiList} from "react-icons/fi";
import {useSearchParams} from "next/navigation";

const data =[
    {
        id:1,
        name:"<UNK>",
    },
]
export default function ShareProjectTable() {
    const searchParams = useSearchParams();
    const currentFolderId = searchParams.get('folderId') || undefined;
    return (
        <div className="mx-4 space-y-4 w-full h-full">
            <div className="rounded-lg border">
                <header className="border-b px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold">Drive</h1>
                        <Breadcrumb currentFolderId={currentFolderId} />
                    </div>
                </header>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã</TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead>Chủ sở hữu</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                                    Chưa có pages nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.map((page: any) => (
                                <TableRow key={page.id}>
                                    <TableCell className="font-medium">{page.name}</TableCell>
                                    <TableCell>
                                        {page.name}
                                    </TableCell>
                                    <TableCell>
                                        {page.name}
                                    </TableCell>
                                    <TableCell>
                                        {/*<StatusBadge status={page.status as PageStatus} />*/}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href='/'>
                                            <Button variant="outline" size="sm" className="cursor-pointer">
                                                Truy cập
                                            </Button>
                                        </Link>
                                        <Link href='/'>
                                            <Button variant="outline" size="sm" className="cursor-pointer">
                                                Chỉnh sửa
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
