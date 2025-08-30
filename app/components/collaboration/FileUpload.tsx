'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  Paperclip
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';

interface FileUploadProps {
  taskId?: string;
  projectId?: string;
  existingAttachments?: string[];
  onUploadComplete?: (fileUrl: string) => void;
}

interface UploadedFile {
  url: string;
  original_filename: string;
  size: number;
  format: string;
  resource_type: string;
}

export default function FileUpload({ 
  taskId, 
  projectId, 
  existingAttachments = [],
  onUploadComplete 
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', taskId ? 'tasks' : 'projects');
      if (taskId) formData.append('taskId', taskId);
      if (projectId) formData.append('projectId', projectId);

      // Simulate progress (since we don't have real progress from fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      try {
        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        return response.json();
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: (data) => {
      setUploading(false);
      setUploadProgress(0);
      toast.success('File uploaded successfully!');
      onUploadComplete?.(data.file.url);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['attachments', taskId || projectId] 
      });
    },
    onError: (error: Error) => {
      setUploading(false);
      setUploadProgress(0);
      toast.error(error.message);
    }
  });

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadMutation.mutate(acceptedFiles[0]);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    }
  });

  // Get file icon based on type
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <Image className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Extract filename from URL
  const getFilenameFromUrl = (url: string) => {
    const segments = url.split('/');
    return segments[segments.length - 1].split('?')[0];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          Attachments ({existingAttachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          
          {uploading ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Uploading...</p>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
            </div>
          ) : isDragActive ? (
            <p className="text-sm text-blue-600">Drop the file here...</p>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Drag & drop a file here, or click to select
              </p>
              <p className="text-xs text-gray-500">
                Max file size: 10MB. Supported: Images, PDF, DOC, XLS, TXT, CSV
              </p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {uploadMutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to upload file. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Existing Attachments */}
        {existingAttachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploaded Files</h4>
            <div className="space-y-2">
              {existingAttachments.map((url, index) => {
                const filename = getFilenameFromUrl(url);
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(filename)}
                      <div>
                        <p className="text-sm font-medium truncate max-w-48">
                          {filename}
                        </p>
                        <div className="flex gap-2">
                          {isImage && (
                            <Badge variant="secondary" className="text-xs">
                              Image
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {isImage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(url, '_blank')}
                          className="h-8 w-8 p-0"
                          title="Preview"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(url, '_blank')}
                        className="h-8 w-8 p-0"
                        title="Download"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      {/* TODO: Add delete functionality */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {existingAttachments.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No attachments yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
