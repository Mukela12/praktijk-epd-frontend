import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  ArrowRightIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@/utils/dateFormatters';
import { PremiumCard } from '@/components/layout/PremiumLayout';
import { useNavigate } from 'react-router-dom';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date?: string;
  total_amount: number;
  status: string;
  therapist_name?: string;
}

interface UnpaidInvoiceAlertProps {
  className?: string;
}

const UnpaidInvoiceAlert: React.FC<UnpaidInvoiceAlertProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    loadUnpaidInvoices();
  }, []);

  const loadUnpaidInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.client.getInvoices({ status: 'UNPAID' });
      
      if (response.success && response.data) {
        const data = response.data as any;
        const invoices = data.invoices || data || [];
        const unpaid = invoices.filter((inv: any) => 
          inv.status === 'sent' || inv.status === 'overdue'
        );
        
        setUnpaidInvoices(unpaid);
        
        // Calculate totals
        let total = 0;
        let overdue = 0;
        const now = new Date();
        
        unpaid.forEach((invoice: any) => {
          total += Number(invoice.total_amount);
          
          // Calculate if overdue (30 days)
          const dueDate = new Date(invoice.issue_date);
          dueDate.setDate(dueDate.getDate() + 30);
          
          if (dueDate < now) {
            overdue++;
          }
        });
        
        setTotalAmount(total);
        setOverdueCount(overdue);
        setShowAlert(unpaid.length > 0);
      }
    } catch (error) {
      console.error('Failed to load unpaid invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !showAlert) {
    return null;
  }

  const urgencyLevel = overdueCount > 0 ? 'error' : totalAmount > 300 ? 'warning' : 'info';
  const bgColor = {
    error: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200',
    warning: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200',
    info: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
  }[urgencyLevel];

  const iconColor = {
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }[urgencyLevel];

  const textColor = {
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  }[urgencyLevel];

  return (
    <PremiumCard className={`${bgColor} border-2 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-full bg-white shadow-sm ${iconColor}`}>
          <ExclamationTriangleIcon className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${textColor} mb-1`}>
            {overdueCount > 0 
              ? `${overdueCount} Overdue Invoice${overdueCount > 1 ? 's' : ''}`
              : `${unpaidInvoices.length} Unpaid Invoice${unpaidInvoices.length > 1 ? 's' : ''}`
            }
          </h3>
          
          <p className={`${textColor} opacity-90 mb-4`}>
            Total outstanding: {formatCurrency(totalAmount)}
            {totalAmount > 300 && (
              <span className="block text-sm mt-1 font-semibold">
                ⚠️ New appointments are restricted until payment is made
              </span>
            )}
          </p>

          {/* Invoice Preview */}
          {unpaidInvoices.length > 0 && (
            <div className="space-y-2 mb-4">
              {unpaidInvoices.slice(0, 3).map((invoice) => {
                const dueDate = new Date(invoice.issue_date);
                dueDate.setDate(dueDate.getDate() + 30);
                const isOverdue = dueDate < new Date();
                
                return (
                  <div 
                    key={invoice.id}
                    className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => navigate(`/client/invoices?id=${invoice.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Invoice #{invoice.invoice_number}
                          </p>
                          <p className="text-sm text-gray-600">
                            Due: {formatDate(dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(invoice.total_amount)}
                        </p>
                        {isOverdue && (
                          <span className="text-xs text-red-600 font-medium">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {unpaidInvoices.length > 3 && (
                <p className="text-sm text-gray-600 text-center">
                  +{unpaidInvoices.length - 3} more invoice{unpaidInvoices.length - 3 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/client/invoices?filter=unpaid')}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
            >
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              View All Invoices
            </button>
            
            <button
              onClick={() => navigate('/client/payment-center')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm font-medium"
            >
              <BanknotesIcon className="w-4 h-4 mr-2" />
              Make Payment
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
};

export default UnpaidInvoiceAlert;