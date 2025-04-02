import { useRouter } from 'next/navigation'
import { FiFileText, FiFolder, FiFile, FiImage } from 'react-icons/fi'
import { cn, formatFileSize } from '@/lib/utils'

interface FileItemProps {
    file: {
        id: string
        name: string
        type: string
        formId?: string
        mimeType?: string
        size?: number
        createdAt: string
        modifiedAt: string
        isFolder?: boolean
        thumbnail?: string
    }
    onFileClick: (file: any) => void
}

export function FileList({ files, onFileClick }: { files: FileItemProps['file'][], onFileClick: FileItemProps['onFileClick'] }) {
    const router = useRouter()

    const getFileIcon = (file: FileItemProps['file']) => {
        if (file.type === 'form') {
            return <FiFileText className="h-5 w-5 text-blue-500" />
        }
        if (file.isFolder) {
            return <FiFolder className="h-5 w-5 text-yellow-500" />
        }
        if (file.mimeType?.startsWith('image/')) {
            return <FiImage className="h-5 w-5 text-green-500" />
        }
        return <FiFile className="h-5 w-5 text-gray-500" />
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const handleFileClick = (file: FileItemProps['file']) => {
        if (file.type === 'form') {
            router.push(`/forms/${file.formId}`)
            return
        }
        onFileClick?.(file)
    }

    return (
        <div className="w-full">
            <div className="min-w-full divide-y divide-gray-200">
                <div className="grid grid-cols-12 gap-3 px-4 py-3 text-sm font-medium text-gray-500">
                    <div className="col-span-6">Name</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-4">Modified</div>
                </div>

                <div className="divide-y divide-gray-200">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            onClick={() => handleFileClick(file)}
                            className={cn(
                                'grid grid-cols-12 gap-3 px-4 py-3 text-sm',
                                'hover:bg-gray-50 cursor-pointer transition-colors'
                            )}
                        >
                            <div className="col-span-6 flex items-center gap-3 truncate">
                                {file.thumbnail ? (
                                    <img
                                        src={file.thumbnail}
                                        alt={file.name}
                                        className="h-5 w-5 object-cover rounded"
                                    />
                                ) : (
                                    getFileIcon(file)
                                )}
                                <span className="truncate">{file.name}</span>
                            </div>

                            <div className="col-span-2 flex items-center text-gray-500">
                                {formatFileSize(file.size)}
                            </div>

                            <div className="col-span-4 flex items-center text-gray-500">
                                {formatDate(file.modifiedAt)}
                            </div>
                        </div>
                    ))}

                    {files.length === 0 && (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                            Hiện không có file
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 