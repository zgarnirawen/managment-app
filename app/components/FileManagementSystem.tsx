'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  File, 
  Folder, 
  Download, 
  Trash2, 
  Eye, 
  Share, 
  Search,
  Filter,
  Grid,
  List,
  Plus,
  X,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  MoreVertical
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  uploadedBy: string;
  uploadedAt: string;
  modifiedAt: string;
  path: string;
  parentId?: string;
  isShared: boolean;
  sharedWith?: string[];
  downloadCount: number;
  thumbnailUrl?: string;
  publicUrl?: string;
  tags?: string[];
  description?: string;
}

interface FileManagementProps {
  userRole: string;
  userId: string;
  userName: string;
}

const FileManagementSystem: React.FC<FileManagementProps> = ({ userRole, userId, userName }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<Array<{id: string, name: string}>>([
    {id: 'root', name: 'Home'}
  ]);

  // Mock data - replace with actual API calls
  const mockFiles: FileItem[] = [
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      uploadedBy: userId,
      uploadedAt: '2024-12-01T10:00:00Z',
      modifiedAt: '2024-12-15T14:30:00Z',
      path: '/Documents',
      isShared: false,
      downloadCount: 0
    },
    {
      id: '2',
      name: 'Project Proposal.pdf',
      type: 'file',
      size: 2048576, // 2MB
      mimeType: 'application/pdf',
      uploadedBy: userId,
      uploadedAt: '2024-12-10T09:15:00Z',
      modifiedAt: '2024-12-10T09:15:00Z',
      path: '/Project Proposal.pdf',
      isShared: true,
      sharedWith: ['team1', 'manager1'],
      downloadCount: 15,
      tags: ['project', 'proposal', 'important'],
      description: 'Q1 2025 project proposal document'
    },
    {
      id: '3',
      name: 'Team Photo.jpg',
      type: 'file',
      size: 5242880, // 5MB
      mimeType: 'image/jpeg',
      uploadedBy: 'hr1',
      uploadedAt: '2024-12-05T16:20:00Z',
      modifiedAt: '2024-12-05T16:20:00Z',
      path: '/Team Photo.jpg',
      isShared: true,
      downloadCount: 8,
      thumbnailUrl: '/api/thumbnails/team-photo.jpg',
      tags: ['team', 'photo', 'event']
    },
    {
      id: '4',
      name: 'Budget Spreadsheet.xlsx',
      type: 'file',
      size: 1024000, // 1MB
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedBy: 'finance1',
      uploadedAt: '2024-12-12T11:45:00Z',
      modifiedAt: '2024-12-12T11:45:00Z',
      path: '/Budget Spreadsheet.xlsx',
      isShared: false,
      downloadCount: 3,
      tags: ['budget', 'finance', 'confidential']
    }
  ];

  useEffect(() => {
    setFiles(mockFiles);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-6 h-6 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-6 h-6 text-red-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-6 h-6 text-purple-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-6 h-6 text-red-600" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="w-6 h-6 text-yellow-600" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'folders' && file.type === 'folder') ||
      (filterType === 'images' && file.mimeType?.startsWith('image/')) ||
      (filterType === 'documents' && (file.mimeType?.includes('pdf') || file.mimeType?.includes('doc') || file.mimeType?.includes('sheet'))) ||
      (filterType === 'shared' && file.isShared);
    
    return matchesSearch && matchesFilter && 
      (currentFolder === 'root' ? !file.parentId : file.parentId === currentFolder);
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Handle file upload
    acceptedFiles.forEach(file => {
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        type: 'file',
        size: file.size,
        mimeType: file.type,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        path: `/${file.name}`,
        parentId: currentFolder === 'root' ? undefined : currentFolder,
        isShared: false,
        downloadCount: 0
      };
      
      setFiles(prev => [...prev, newFile]);
    });
    setIsUploadModalOpen(false);
  }, [currentFolder, userId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const createFolder = (folderName: string) => {
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: folderName,
      type: 'folder',
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      path: `/${folderName}`,
      parentId: currentFolder === 'root' ? undefined : currentFolder,
      isShared: false,
      downloadCount: 0
    };
    
    setFiles(prev => [...prev, newFolder]);
    setIsFolderModalOpen(false);
  };

  const deleteFiles = (fileIds: string[]) => {
    setFiles(prev => prev.filter(file => !fileIds.includes(file.id)));
    setSelectedFiles([]);
  };

  const shareFile = (fileId: string, users: string[]) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, isShared: true, sharedWith: users }
        : file
    ));
    setIsShareModalOpen(false);
  };

  const downloadFile = (file: FileItem) => {
    // Mock download - in real implementation, this would trigger actual download
    setFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { ...f, downloadCount: f.downloadCount + 1 }
        : f
    ));
    console.log(`Downloading ${file.name}`);
  };

  const UploadModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upload Files</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the files here...</p>
          ) : (
            <>
              <p className="text-gray-600 mb-2">Drag & drop files here, or click to select</p>
              <p className="text-sm text-gray-400">Support for multiple files</p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const FolderModal = ({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) => {
    const [folderName, setFolderName] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (folderName.trim()) {
        onCreate(folderName.trim());
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create Folder</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Folder Name</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter folder name"
                autoFocus
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ShareModal = ({ file, onClose, onShare }: { file: FileItem; onClose: () => void; onShare: (users: string[]) => void }) => {
    const [selectedUsers, setSelectedUsers] = useState<string[]>(file.sharedWith || []);
    const [shareLink, setShareLink] = useState('');

    useEffect(() => {
      // Generate share link
      setShareLink(`https://yourapp.com/shared/${file.id}`);
    }, [file.id]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onShare(selectedUsers);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Share File</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{file.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Share Link</label>
              <div className="flex">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 bg-gray-50"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Share with Users</label>
              <textarea
                placeholder="Enter email addresses separated by commas"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => onShare(selectedUsers)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Folder className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">File Management</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Folder
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1">
          {breadcrumb.map((item, index) => (
            <li key={item.id}>
              <div className="flex items-center">
                {index > 0 && <span className="text-gray-400 mx-2">/</span>}
                <button
                  onClick={() => setCurrentFolder(item.id)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {item.name}
                </button>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Files</option>
            <option value="folders">Folders</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
            <option value="shared">Shared</option>
          </select>
          
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Files Actions */}
      {selectedFiles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <span className="text-blue-800 font-medium">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => deleteFiles(selectedFiles)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedFiles([])}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`border rounded-lg p-4 hover:shadow-md cursor-pointer transition-all ${
                selectedFiles.includes(file.id) ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
              }`}
              onClick={() => {
                if (file.type === 'folder') {
                  setCurrentFolder(file.id);
                  setBreadcrumb([...breadcrumb, { id: file.id, name: file.name }]);
                } else {
                  setSelectedFiles(prev => 
                    prev.includes(file.id) 
                      ? prev.filter(id => id !== file.id)
                      : [...prev, file.id]
                  );
                }
              }}
            >
              <div className="flex flex-col items-center text-center">
                {file.type === 'folder' ? (
                  <Folder className="w-12 h-12 text-blue-500 mb-2" />
                ) : (
                  <div className="mb-2">
                    {file.thumbnailUrl ? (
                      <img src={file.thumbnailUrl} alt={file.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      getFileIcon(file.mimeType || '')
                    )}
                  </div>
                )}
                <p className="text-sm font-medium text-gray-900 truncate w-full" title={file.name}>
                  {file.name}
                </p>
                {file.type === 'file' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(file.size || 0)}
                  </p>
                )}
                {file.isShared && (
                  <div className="flex items-center mt-1">
                    <Share className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 ml-1">Shared</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center mt-2 space-x-1">
                {file.type === 'file' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(file);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Download"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(file);
                        setIsShareModalOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-green-600"
                      title="Share"
                    >
                      <Share className="w-3 h-3" />
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFiles([file.id]);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(filteredFiles.map(f => f.id));
                      } else {
                        setSelectedFiles([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shared</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles([...selectedFiles, file.id]);
                        } else {
                          setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {file.type === 'folder' ? (
                        <Folder className="w-5 h-5 text-blue-500 mr-3" />
                      ) : (
                        <div className="mr-3">
                          {getFileIcon(file.mimeType || '')}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{file.name}</div>
                        {file.description && (
                          <div className="text-sm text-gray-500">{file.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {file.type === 'file' ? formatFileSize(file.size || 0) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(file.modifiedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {file.isShared ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Share className="w-3 h-3 mr-1" />
                        Shared
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {file.type === 'file' && (
                        <button
                          onClick={() => downloadFile(file)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedFile(file);
                          setIsShareModalOpen(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Share"
                      >
                        <Share className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFiles([file.id])}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-500 mb-4">Get started by uploading your first file or creating a folder.</p>
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Upload Files
            </button>
            <button
              onClick={() => setIsFolderModalOpen(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Create Folder
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {isUploadModalOpen && (
        <UploadModal onClose={() => setIsUploadModalOpen(false)} />
      )}

      {isFolderModalOpen && (
        <FolderModal
          onClose={() => setIsFolderModalOpen(false)}
          onCreate={createFolder}
        />
      )}

      {isShareModalOpen && selectedFile && (
        <ShareModal
          file={selectedFile}
          onClose={() => setIsShareModalOpen(false)}
          onShare={(users) => shareFile(selectedFile.id, users)}
        />
      )}
    </div>
  );
};

export default FileManagementSystem;
