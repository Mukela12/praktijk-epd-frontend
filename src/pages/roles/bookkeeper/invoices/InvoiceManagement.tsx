import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PrinterIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EllipsisVerticalIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  UsersIcon,
  CreditCardIcon,
  ArrowPathIcon,
  XMarkIcon,
  TrashIcon,
  CheckIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from "@/services/realApi";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, formatCurrency, isPast, isFuture } from '@/utils/dateFormatters';
import { useAlert } from '@/components/ui/CustomAlert';
import { PremiumCard, PremiumButton, PremiumEmptyState } from '@/components/layout/PremiumLayout';

interface Invoice {
  id: string;
  invoice_number: string;
  client_id?: string;
  client_name?: string;
  therapist_id?: string;
  therapist_name?: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  date: string;
  due_date: string;
  payment_date?: string;
  payment_method?: 'insurance' | 'bank_transfer' | 'credit_card' | 'cash';
  description?: string;
  notes?: string;
  items?: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

const InvoiceManagement: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { success, error: alertError, warning, info } = useAlert();
  
  // State management
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // CRUD operation states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    invoice_number: '',
    client_id: '',
    therapist_id: '',
    amount: 0,
    status: 'draft' as Invoice['status'],
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_method: '',
    description: '',
    notes: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
  });

  // Load data
  useEffect(() => {
    const loadInvoiceData = async () => {
      try {
        setIsLoading(true);
        const [invoicesResponse, clientsResponse, therapistsResponse] = await Promise.all([
          realApiService.bookkeeper.getInvoices(),
          realApiService.clients.getAll(),
          realApiService.therapists.getAll()
        ]);

        if (invoicesResponse.success && invoicesResponse.data) {
          // Enhanced invoice data with items
          const enhancedInvoices = invoicesResponse.data.map((invoice: any) => ({
            ...invoice,
            items: [
              {
                description: invoice.client_name ? 'Therapy Session' : 'Professional Services',
                quantity: 1,
                rate: invoice.amount,
                amount: invoice.amount
              }
            ],
            notes: Math.random() > 0.7 ? 'Follow up required for payment' : undefined
          }));
          setInvoices(enhancedInvoices);
        }

        if (clientsResponse.success && clientsResponse.data) {
          setClients(clientsResponse.data);
        }

        if (therapistsResponse.success && therapistsResponse.data) {
          setTherapists(therapistsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load invoice data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoiceData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon className="w-4 h-4" />;
      case 'sent': return <PaperAirplaneIcon className="w-4 h-4" />;
      case 'overdue': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'draft': return <DocumentTextIcon className="w-4 h-4" />;
      case 'cancelled': return <XCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getPaymentMethodColor = (method: string | undefined) => {
    if (!method) return 'bg-gray-100 text-gray-800';
    switch (method) {
      case 'insurance': return 'bg-green-100 text-green-800';
      case 'bank_transfer': return 'bg-blue-100 text-blue-800';
      case 'credit_card': return 'bg-purple-100 text-purple-800';
      case 'cash': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    // Search filter
    if (searchTerm) {
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.client_name && invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (invoice.therapist_name && invoice.therapist_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (invoice.description && invoice.description.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filterStatus !== 'all' && invoice.status !== filterStatus) {
      return false;
    }

    // Type filter
    if (filterType !== 'all') {
      if (filterType === 'client' && !invoice.client_name) return false;
      if (filterType === 'therapist' && !invoice.therapist_name) return false;
    }

    // Date range filter
    if (filterDateRange !== 'all') {
      const invoiceDate = new Date(invoice.date);
      const now = new Date();
      
      switch (filterDateRange) {
        case 'this_month':
          if (invoiceDate.getMonth() !== now.getMonth() || invoiceDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
          break;
        case 'last_month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          if (invoiceDate.getMonth() !== lastMonth.getMonth() || invoiceDate.getFullYear() !== lastMonth.getFullYear()) {
            return false;
          }
          break;
        case 'this_year':
          if (invoiceDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
          break;
      }
    }

    return true;
  });

  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Calculate summary stats
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);
  const outstandingAmount = filteredInvoices.filter(inv => ['sent', 'overdue'].includes(inv.status)).reduce((sum, inv) => sum + inv.amount, 0);

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    setSelectedInvoices(
      selectedInvoices.length === sortedInvoices.length 
        ? [] 
        : sortedInvoices.map(inv => inv.id)
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on invoices:`, selectedInvoices);
    // Implement bulk actions
    setSelectedInvoices([]);
  };

  // CRUD Operations
  const handleCreateInvoice = async () => {
    setIsSubmitting(true);
    try {
      // Generate invoice number if not provided
      const invoiceNumber = formData.invoice_number || `INV-${Date.now()}`;
      
      const invoiceData = {
        ...formData,
        invoice_number: invoiceNumber,
        amount: formData.items.reduce((sum, item) => sum + item.amount, 0)
      };
      
      const response = await realApiService.bookkeeper.createInvoice(invoiceData);
      
      if (response.success) {
        success('Invoice created successfully');
        setInvoices([...invoices, { ...invoiceData, id: response.data.id }]);
        setShowCreateForm(false);
        resetForm();
      } else {
        alertError('Failed to create invoice');
      }
    } catch (error) {
      console.error('Create invoice error:', error);
      alertError('Error creating invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInvoice = async () => {
    if (!editingInvoice) return;
    
    setIsSubmitting(true);
    try {
      const invoiceData = {
        ...formData,
        amount: formData.items.reduce((sum, item) => sum + item.amount, 0)
      };
      
      const response = await realApiService.bookkeeper.updateInvoice(editingInvoice.id, invoiceData);
      
      if (response.success) {
        success('Invoice updated successfully');
        setInvoices(invoices.map(inv => 
          inv.id === editingInvoice.id ? { ...invoiceData, id: editingInvoice.id } : inv
        ));
        setEditingInvoice(null);
        resetForm();
      } else {
        alertError('Failed to update invoice');
      }
    } catch (error) {
      console.error('Update invoice error:', error);
      alertError('Error updating invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const response = await realApiService.bookkeeper.deleteInvoice(invoiceId);
      
      if (response.success) {
        success('Invoice deleted successfully');
        setInvoices(invoices.filter(inv => inv.id !== invoiceId));
        setDeletingInvoice(null);
      } else {
        alertError('Failed to delete invoice');
      }
    } catch (error) {
      console.error('Delete invoice error:', error);
      alertError('Error deleting invoice');
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoice_number: invoice.invoice_number,
      client_id: invoice.client_id || '',
      therapist_id: invoice.therapist_id || '',
      amount: invoice.amount,
      status: invoice.status,
      date: invoice.date,
      due_date: invoice.due_date,
      payment_method: invoice.payment_method || '',
      description: invoice.description || '',
      notes: invoice.notes || '',
      items: invoice.items || [{ description: '', quantity: 1, rate: invoice.amount, amount: invoice.amount }]
    });
  };

  const resetForm = () => {
    setFormData({
      invoice_number: '',
      client_id: '',
      therapist_id: '',
      amount: 0,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payment_method: '',
      description: '',
      notes: '',
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate amount for the item
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Invoice Management</h1>
            <p className="text-green-100 mt-1">
              Create, manage, and track all invoices and payments
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <PrinterIcon className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span>New Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inline Create/Edit Form */}
      {(showCreateForm || editingInvoice) && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-top-5 duration-300">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingInvoice(null);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingInvoice) {
              handleUpdateInvoice();
            } else {
              handleCreateInvoice();
            }
          }} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => handleFormChange('invoice_number', e.target.value)}
                  placeholder="INV-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => handleFormChange('client_id', e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Therapist
                </label>
                <select
                  value={formData.therapist_id}
                  onChange={(e) => handleFormChange('therapist_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select a therapist</option>
                  {therapists.map(therapist => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.firstName} {therapist.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleFormChange('due_date', e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="Qty"
                        min="0"
                        step="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="Rate"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.amount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <div className="bg-gray-100 px-6 py-3 rounded-lg">
                  <span className="text-sm text-gray-600">Total Amount: </span>
                  <span className="text-2xl font-bold text-gray-900">
                    €{formData.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => handleFormChange('payment_method', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select payment method</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Brief description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Additional notes or comments"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingInvoice(null);
                  resetForm();
                }}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>{editingInvoice ? 'Update Invoice' : 'Create Invoice'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">€{totalAmount.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Total Value</div>
              <div className="flex items-center text-sm text-blue-600">
                <CurrencyEuroIcon className="w-4 h-4 mr-1" />
                <span>{filteredInvoices.length} invoices</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center opacity-10">
              <DocumentTextIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">€{paidAmount.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Paid Amount</div>
              <div className="flex items-center text-sm text-green-600">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                <span>Collected</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center opacity-10">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">€{outstandingAmount.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Outstanding</div>
              <div className="flex items-center text-sm text-orange-600">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>Pending payment</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center opacity-10">
              <ClockIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">€{overdueAmount.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Overdue</div>
              <div className="flex items-center text-sm text-red-600">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                <span>Action required</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center opacity-10">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices, clients, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Types</option>
              <option value="client">Client Invoices</option>
              <option value="therapist">Therapist Payments</option>
            </select>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Dates</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
            </select>
          </div>
        </div>

        {selectedInvoices.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-700">
              {selectedInvoices.length} invoice{selectedInvoices.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('send')}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Send Selected
              </button>
              <button
                onClick={() => handleBulkAction('mark_paid')}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Mark as Paid
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Invoices ({sortedInvoices.length})
            </h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {sortedInvoices.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' || filterDateRange !== 'all'
                ? "Try adjusting your search or filters" 
                : "Create your first invoice to get started"}
            </p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Create New Invoice
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Header row */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedInvoices.length === sortedInvoices.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <div className="ml-4 grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <div className="col-span-2">Invoice</div>
                  <div className="col-span-2">Client/Therapist</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Due Date</div>
                  <div className="col-span-1">Payment</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
            </div>

            {sortedInvoices.map((invoice) => (
              <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.includes(invoice.id)}
                    onChange={() => handleSelectInvoice(invoice.id)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <div className="ml-4 grid grid-cols-12 gap-4 text-sm">
                    <div className="col-span-2">
                      <p className="font-medium text-gray-900">#{invoice.invoice_number}</p>
                      {invoice.notes && (
                        <p className="text-xs text-gray-500 mt-1">{invoice.notes}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-900">{invoice.client_name || invoice.therapist_name}</p>
                      <p className="text-xs text-gray-500">{invoice.client_name ? 'Client' : 'Therapist'}</p>
                    </div>
                    <div className="col-span-1">
                      <p className="font-semibold text-gray-900">€{invoice.amount.toLocaleString()}</p>
                    </div>
                    <div className="col-span-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{invoice.status}</span>
                      </span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-900">{invoice.date}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-900">{invoice.due_date}</p>
                      {invoice.status === 'overdue' && (
                        <p className="text-xs text-red-600">Overdue</p>
                      )}
                    </div>
                    <div className="col-span-1">
                      {invoice.payment_method ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentMethodColor(invoice.payment_method)}`}>
                          {invoice.payment_method.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit Invoice"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors" title="Print Invoice">
                          <PrinterIcon className="w-4 h-4" />
                        </button>
                        {invoice.status === 'draft' && (
                          <button className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Send Invoice">
                            <PaperAirplaneIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete invoice #${invoice.invoice_number}?`)) {
                              handleDeleteInvoice(invoice.id);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Invoice"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceManagement;