import {
    FiFile,
    FiFolder,
    FiImage,
    FiFileText,
    FiClipboard
} from 'react-icons/fi';
import {
    AiFillFilePdf,
    AiFillFileWord,
    AiFillFileExcel,
    AiFillFilePpt,
    AiFillFolder,
} from 'react-icons/ai';
import { TbForms } from 'react-icons/tb';

interface FileIconProps {
    type: 'file' | 'folder' | 'form';
    mimeType?: string;
    size?: number;
}

export function FileIcon({ type, mimeType, size = 40 }: FileIconProps) {
    // Handle folder type
    if (type === 'folder') {
        return <AiFillFolder size={size} className="text-blue-500" />;
    }

    // Handle form type
    if (type === 'form') {
        return <TbForms size={size} className="text-blue-600" />;
    }

    // Handle file types
    if (!mimeType) return <FiFile size={size} className="text-gray-500" />;

    if (mimeType.startsWith('image/')) {
        return <FiImage size={size} className="text-green-500" />;
    }

    switch (mimeType) {
        case 'application/pdf':
            return <AiFillFilePdf size={size} className="text-red-500" />;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return <AiFillFileWord size={size} className="text-blue-600" />;
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return <AiFillFileExcel size={size} className="text-green-600" />;
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            return <AiFillFilePpt size={size} className="text-orange-500" />;
        default:
            return <FiFile size={size} className="text-gray-500" />;
    }
} 