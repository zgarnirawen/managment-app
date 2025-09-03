'use client';

import { useState, useRef } from 'react';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  createdAt: string;
  uploadedBy: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      imageUrl?: string;
    };
  };
}

interface FileUploadProps {
  entityType: 'TASK' | 'PROJECT';
  entityId: string;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  canUpload?: boolean;
  canDelete?: boolean;
}

export default function FileUpload({ 
  entityType, 
  entityId, 
  attachments, 
  onAttachmentsChange,
  canUpload = true,
  canDelete = false
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    uploadFile(file);
  };

  const uploadFile = async (file: File, description?: string) => {
    if (!canUpload) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    if (description) {
      formData.append('description', description);
    }

    try {
      const response = await fetch('/api/attachments', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        onAttachmentsChange([data.attachment, ...attachments]);
        setUploadSuccess(`${file.name} uploaded successfully`);
        setTimeout(() => setUploadSuccess(null), 3000);
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Network error occurred');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteAttachment = async (attachmentId: string) => {
    if (!canDelete) return;

    try {
      const response = await fetch(`/api/attachments?id=${attachmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onAttachmentsChange(attachments.filter(att => att.id !== attachmentId));
      } else {
        const data = await response.json();
        setUploadError(data.error || 'Delete failed');
      }
    } catch (error) {
      setUploadError('Network error occurred');
    }
  };

  const downloadAttachment = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.filePath;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-green-500" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return <FileText className="w-5 h-5 text-green-600" />;
    } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
      return <FileText className="w-5 h-5 text-orange-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canUpload) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (canUpload && e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUpload && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          />
          
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {uploading ? 'Uploading...' : 'Upload Files'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            Drag and drop files here, or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium"
              disabled={uploading}
            >
              browse to upload
            </button>
          </p>
          
          <p className="text-sm text-gray-500">
            Supports: Images, PDF, Word, Excel, PowerPoint, Text files (max 10MB)
          </p>

          {uploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{uploadError}</span>
          <button 
            onClick={() => setUploadError(null)}
            className="ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">{uploadSuccess}</span>
          <button 
            onClick={() => setUploadSuccess(null)}
            className="ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Attachments ({attachments.length})
          </h4>
          
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
              >
                {/* File Icon */}
                {getFileIcon(attachment.mimeType)}

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-medium text-gray-900 truncate">
                      {attachment.originalName}
                    </h5>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(attachment.fileSize)}
                    </span>
                  </div>
                  
                  {attachment.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {attachment.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      Uploaded by {attachment.uploadedBy.user.firstName} {attachment.uploadedBy.user.lastName}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {new Date(attachment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => downloadAttachment(attachment)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  {canDelete && (
                    <button
                      onClick={() => deleteAttachment(attachment.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
