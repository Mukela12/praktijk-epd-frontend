import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  FolderIcon,
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  DocumentChartBarIcon,
  PaperClipIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { clientApi, commonApi } from '@/services/endpoints';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/store/authStore';
import type { Document } from '@/types/entities';

interface ExtendedDocument extends Document {
  uploadedByName?: string;
  sharedWithNames?: string[];
}

const ClientDocuments: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error, warning, info } = useAlert();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<ExtendedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ExtendedDocument | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'intake' | 'treatment' | 'insurance' | 'legal' | 'other'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [shareWithEmails, setShareWithEmails] = useState('');

  // File upload state
  const [uploadForm, setUploadForm] = useState({
    category: 'medical',
    description: '',
    tags: [] as string[],
    tagInput: ''
  });

  // Stats
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalSize: 0,
    categoryCounts: {} as Record<string, number>
  });

  useEffect(() => {
    loadDocuments();
  }, [filter]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await clientApi.getDocuments();
      
      if (response.success && response.data) {
        const docs = response.data.documents || [];
        // Process documents to add display names
        const processedDocs = docs.map((doc: any) => ({
          ...doc,
          uploadedByName: doc.uploaded_by === user?.id ? 'You' : 'Your Therapist',
          sharedWithNames: doc.shared_with?.map((userId: string) => 'Therapist') || []
        }));
        setDocuments(processedDocs);
        calculateStats(processedDocs);
      }
    } catch (err) {
      error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (docs: ExtendedDocument[]) => {
    const stats = docs.reduce((acc, doc) => {
      acc.totalDocuments++;
      acc.totalSize += doc.size || 0;
      acc.categoryCounts[doc.category] = (acc.categoryCounts[doc.category] || 0) + 1;
      return acc;
    }, {
      totalDocuments: 0,
      totalSize: 0,
      categoryCounts: {} as Record<string, number>
    });
    
    setStats(stats);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      warning('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      warning('Please upload PDF, Image, Word, or Text files only');
      return;
    }

    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      formData.append('originalName', file.name);
      formData.append('fileType', file.type);
      formData.append('fileSize', file.size.toString());
      formData.append('mimeType', file.type);
      formData.append('category', uploadForm.category);
      formData.append('description', uploadForm.description);
      formData.append('tags', JSON.stringify(uploadForm.tags));

      const response = await clientApi.uploadDocument(formData);
      
      if (response.success) {
        success('Document uploaded successfully');
        loadDocuments();
        // Reset form
        setUploadForm({
          category: 'intake' as const,
          description: '',
          tags: [],
          tagInput: ''
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (doc: ExtendedDocument) => {
    try {
      const response = await commonApi.downloadDocument(doc.id);
      
      // Create blob and download
      const blob = new Blob([response], { type: doc.mime_type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.original_name || doc.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      success('Document downloaded successfully');
    } catch (err) {
      error('Failed to download document');
    }
  };

  const handleDelete = async (doc: ExtendedDocument) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await commonApi.deleteDocument(doc.id);
      success('Document deleted successfully');
      loadDocuments();
    } catch (err) {
      error('Failed to delete document');
    }
  };

  const handleShare = async () => {
    if (!selectedDocument) return;

    const emails = shareWithEmails.split(',').map(e => e.trim()).filter(e => e);
    if (emails.length === 0) {
      warning('Please enter at least one email address');
      return;
    }

    try {
      await commonApi.shareDocument(selectedDocument.id, {
        shareWith: emails,
        permissions: ['read', 'download']
      });
      success('Document shared successfully');
      setShowShareModal(false);
      setShareWithEmails('');
      loadDocuments();
    } catch (err) {
      error('Failed to share document');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return PhotoIcon;
    if (mimeType.startsWith('video/')) return FilmIcon;
    if (mimeType.includes('pdf')) return DocumentTextIcon;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return DocumentChartBarIcon;
    return DocumentIcon;
  };

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, string> = {
      medical: 'status-emergency-high',
      clinical: 'status-priority-medium',
      administrative: 'status-priority-normal',
      other: 'status-concept'
    };
    return badges[category] || 'status-concept';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter !== 'all' && doc.category !== filter) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        doc.original_name.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const handleAddTag = () => {
    if (uploadForm.tagInput.trim() && uploadForm.tags.length < 5) {
      setUploadForm(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const handleRemoveTag = (index: number) => {
    setUploadForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container-standard animate-fadeInUp">
      {/* Header */}
      <div className="card-premium gradient-medical text-white rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-primary text-white flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <FolderIcon className="w-8 h-8" />
              </div>
              Document Management
            </h1>
            <p className="text-body text-indigo-50 mt-2">
              Securely store and manage your medical documents
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <DocumentTextIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{stats.totalDocuments} Documents</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
            </div>
            <CloudArrowUpIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Medical Docs</p>
              <p className="text-2xl font-bold text-red-600">{stats.categoryCounts.medical || 0}</p>
            </div>
            <DocumentIcon className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Clinical Docs</p>
              <p className="text-2xl font-bold text-green-600">{stats.categoryCounts.clinical || 0}</p>
            </div>
            <DocumentChartBarIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card-premium mb-6">
        <div className="p-6">
          <h2 className="heading-section mb-4">Upload New Document</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-body-sm text-gray-600 mb-3">
                  Drag and drop your file here, or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="btn-premium-primary text-sm"
                >
                  {isUploading ? (
                    <>
                      <LoadingSpinner size="small" color="white" />
                      <span className="ml-2">Uploading...</span>
                    </>
                  ) : (
                    'Choose File'
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Max file size: 10MB. Supported formats: PDF, Images, Word, Text
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="label-premium">Category</label>
                <select
                  id="category"
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                  className="select-premium"
                >
                  <option value="medical">Medical Reports</option>
                  <option value="clinical">Clinical Documents</option>
                  <option value="administrative">Administrative</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="label-premium">Description (Optional)</label>
                <textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="input-premium"
                  placeholder="Add a description for this document..."
                />
              </div>

              <div>
                <label className="label-premium">Tags (Optional)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadForm.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(index)}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        <XCircleIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={uploadForm.tagInput}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, tagInput: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="input-premium flex-1"
                    placeholder="Add a tag..."
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={!uploadForm.tagInput.trim() || uploadForm.tags.length >= 5}
                    className="btn-premium-secondary text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-premium mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-premium pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="select-premium"
              >
                <option value="all">All Categories</option>
                <option value="medical">Medical Reports</option>
                <option value="clinical">Clinical Documents</option>
                <option value="administrative">Administrative</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="heading-section text-gray-900 mb-2">No documents found</h3>
          <p className="text-body-sm text-gray-600">
            {filter === 'all' ? 'Upload your first document to get started' : `No ${filter} documents found`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const FileIcon = getFileIcon(doc.mime_type);
            
            return (
              <div key={doc.id} className="card-premium hover:shadow-premium-lg transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gray-100 rounded-xl">
                      <FileIcon className="w-8 h-8 text-gray-600" />
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadge(doc.category)}`}>
                      {doc.category}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 truncate">{doc.original_name}</h3>
                  
                  {doc.description && (
                    <p className="text-body-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                  )}

                  <div className="space-y-2 text-body-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <CloudArrowUpIcon className="w-4 h-4 mr-1" />
                      Size: {formatFileSize(doc.size)}
                    </div>
                    {doc.uploadedByName && (
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                        By: {doc.uploadedByName}
                      </div>
                    )}
                  </div>

                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {doc.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          <TagIcon className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDocument(doc);
                          setShowDetailsModal(true);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDocument(doc);
                          setShowShareModal(true);
                        }}
                        className="text-gray-400 hover:text-green-600 transition-colors"
                        title="Share"
                      >
                        <ShareIcon className="w-5 h-5" />
                      </button>
                    </div>
                    {doc.uploaded_by === user?.id && (
                      <button
                        onClick={() => handleDelete(doc)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Details Modal */}
      {showDetailsModal && selectedDocument && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="heading-section">Document Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-caption mb-1">File Name</p>
                  <p className="text-body">{selectedDocument.original_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-caption mb-1">Category</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadge(selectedDocument.category)}`}>
                      {selectedDocument.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-caption mb-1">File Size</p>
                    <p className="text-body">{formatFileSize(selectedDocument.size)}</p>
                  </div>
                </div>

                {selectedDocument.description && (
                  <div>
                    <p className="text-caption mb-1">Description</p>
                    <p className="text-body">{selectedDocument.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-caption mb-1">Uploaded By</p>
                    <p className="text-body">{selectedDocument.uploadedByName}</p>
                  </div>
                  <div>
                    <p className="text-caption mb-1">Upload Date</p>
                    <p className="text-body">{new Date(selectedDocument.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                  <div>
                    <p className="text-caption mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          <TagIcon className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDocument.sharedWithNames && selectedDocument.sharedWithNames.length > 0 && (
                  <div>
                    <p className="text-caption mb-2">Shared With</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.sharedWithNames.map((name, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-premium-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownload(selectedDocument)}
                  className="btn-premium-primary flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedDocument && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-premium max-w-lg w-full animate-scaleIn">
            <div className="p-6">
              <h3 className="heading-section mb-4">Share Document</h3>
              
              <div className="mb-4">
                <p className="text-body-sm text-gray-600 mb-2">
                  Share "{selectedDocument.original_name}" with:
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="shareEmails" className="label-premium">
                  Email Addresses
                </label>
                <textarea
                  id="shareEmails"
                  value={shareWithEmails}
                  onChange={(e) => setShareWithEmails(e.target.value)}
                  rows={3}
                  className="input-premium"
                  placeholder="Enter email addresses separated by commas..."
                />
                <p className="form-help">
                  Recipients will be able to view and download this document
                </p>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setShareWithEmails('');
                  }}
                  className="btn-premium-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShare}
                  className="btn-premium-primary flex items-center space-x-2"
                >
                  <ShareIcon className="w-5 h-5" />
                  <span>Share Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Notice */}
      <div className="mt-8 card-premium bg-blue-50 border-blue-200 p-6">
        <div className="flex items-start">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Document Security</h3>
            <ul className="text-body-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>All documents are encrypted and stored securely</li>
              <li>Only you and authorized healthcare providers can access your documents</li>
              <li>Documents are automatically backed up for safety</li>
              <li>You can delete your documents at any time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDocuments;