import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

export interface Column<T> {
    header: string;
    render: (item: T,index: number) => React.ReactNode;
}

export interface CustomTableProps<T> {
    data: T[];
    columns: Column<T>[];
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
}

export function CustomTable<T>({ data, columns, emptyMessage = "Không có dữ liệu", onRowClick}: CustomTableProps<T>) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <>
                        {columns.map((col, idx) => (
                            <TableHead key={idx}>{col.header}</TableHead>
                        ))}
                    </>
                </TableRow>
            </TableHeader>
            <TableBody><>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="text-center h-32 text-muted-foreground">
                            {emptyMessage}
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((item, rowIndex) => (
                        <TableRow key={rowIndex} className={"cursor-pointer"} onClick={() => onRowClick?.(item)} >
                            <>
                            {columns.map((col, colIndex) => (
                                <TableCell key={colIndex}>{col.render(item,rowIndex)}</TableCell>
                            ))}
                            </>
                        </TableRow>
                    ))
                )}
            </>
            </TableBody>
        </Table>
    );
}
