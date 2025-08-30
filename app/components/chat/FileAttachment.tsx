'use client';

import { useState, useRef } from 'react';
import { 
  PaperClipIcon, 
  DocumentIcon, 
  PhotoIcon, 
  XMarkIcon,
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
}

interface FileAttachmentProps {
  attachments?: Attachment[];
  onAttachmentAdd?: (files: File[]) => void;
  onAttachmentRemove?: (attachmentId: string) => void;
  isEditing?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export default function FileAttachment({
  attachments = [],
  onAttachmentAdd,
  onAttachmentRemove,
  isEditing = false,
  maxFiles = 5,
  maxFileSize = 10
}: FileAttachmentProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="w-5 h-5 text-blue-500" />;
    }
    return <DocumentIcon className="w-5 h-5 text-gray-500" />;
  };

  const handleFileSelect = (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Filter valid files
    const validFiles = fileArray.filter(file => {
      const isValidSize = file.size <= maxFileSize * 1024 * 1024;
      const isValidType = file.type.length > 0; // Basic check
      return isValidSize && isValidType;
    });

    if (validFiles.length > 0 && onAttachmentAdd) {
      onAttachmentAdd(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && onAttachmentAdd) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      {/* File Input */}
      {isEditing && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv"
        />
      )}

      {/* Attachments Display */}
      {attachments.length > 0 && (
        <div className="space-y-2 mb-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getFileIcon(attachment.fileType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDownload(attachment)}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
                </button>
                
                {isEditing && onAttachmentRemove && (
                  <button
                    onClick={() => onAttachmentRemove(attachment.id)}
                    className="p-1 rounded hover:bg-red-100 transition-colors"
                    title="Remove"
                  >
                    <XMarkIcon className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area (when editing) */}
      {isEditing && attachments.length < maxFiles && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
            ${dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={triggerFileInput}
        >
          <PaperClipIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Drop files here or click to select
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max {maxFileSize}MB per file, up to {maxFiles} files
          </p>
        </div>
      )}

      {/* Attach Button (compact version) */}
      {isEditing && !dragActive && (
        <button
          onClick={triggerFileInput}
          className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          title="Attach files"
        >
          <PaperClipIcon className="w-4 h-4" />
          <span>Attach</span>
        </button>
      )}
    </div>
  );
}
