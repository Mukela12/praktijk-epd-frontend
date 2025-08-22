import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCardIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { clientApi } from '@/services/endpoints';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/store/authStore';

interface BankAccount {
  iban: string;
  accountHolder: string;
  bankName?: string;
  isDefault: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface PaymentMethod {
  id: string;
  type: 'sepa' | 'ideal' | 'creditcard';
  details: BankAccount | any;
  status: 'active' | 'pending' | 'expired';
  mandateId?: string;
  mandateDate?: string;
}

const BankInformation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error, warning, info } = useAlert();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<string | null>(null);
  const [showMandateModal, setShowMandateModal] = useState(false);

  const [formData, setFormData] = useState({
    iban: '',
    accountHolder: '',
    bankName: '',
    acceptMandate: false
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await clientApi.getPaymentMethods();
      
      if (response.success && response.data) {
        setPaymentMethods(response.data.paymentMethods || []);
      }
    } catch (err) {
      error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const validateIBAN = (iban: string): boolean => {
    // Basic IBAN validation for Netherlands
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
    const ibanRegex = /^NL\d{2}[A-Z]{4}\d{10}$/;
    return ibanRegex.test(cleanIBAN);
  };

  const formatIBAN = (iban: string): string => {
    const clean = iban.replace(/\s/g, '').toUpperCase();
    return clean.match(/.{1,4}/g)?.join(' ') || clean;
  };

  const maskIBAN = (iban: string): string => {
    if (!iban || iban.length < 8) return iban;
    const clean = iban.replace(/\s/g, '');
    return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'iban') {
      const formatted = formatIBAN(value);
      setFormData(prev => ({ ...prev, iban: formatted }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.iban || !formData.accountHolder) {
      warning('Please fill in all required fields');
      return;
    }

    if (!validateIBAN(formData.iban)) {
      error('Please enter a valid Dutch IBAN');
      return;
    }

    if (!formData.acceptMandate) {
      warning('Please accept the SEPA Direct Debit mandate to continue');
      return;
    }

    try {
      setIsSaving(true);
      const cleanIBAN = formData.iban.replace(/\s/g, '');
      
      // Double-check IBAN format before sending
      if (!cleanIBAN.startsWith('NL') || cleanIBAN.length !== 18) {
        throw new Error('Invalid IBAN format');
      }
      
      const response = await clientApi.addPaymentMethod({
        type: 'sepa',
        iban: cleanIBAN,
        accountHolder: formData.accountHolder,
        bankName: formData.bankName,
        mandateText: 'I authorize the automatic collection of therapy session fees according to the agreed terms.'
      });
      
      if (response.success) {
        success('Payment method added successfully');
        setShowAddForm(false);
        setFormData({
          iban: '',
          accountHolder: '',
          bankName: '',
          acceptMandate: false
        });
        loadPaymentMethods();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to add payment method');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMethod = async (methodId: string) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) return;

    try {
      await clientApi.removePaymentMethod(methodId);
      success('Payment method removed successfully');
      loadPaymentMethods();
    } catch (err) {
      error('Failed to remove payment method');
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      await clientApi.setDefaultPaymentMethod(methodId);
      success('Default payment method updated');
      loadPaymentMethods();
    } catch (err) {
      error('Failed to update default payment method');
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'sepa':
        return BanknotesIcon;
      case 'creditcard':
        return CreditCardIcon;
      default:
        return CreditCardIcon;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-client-active';
      case 'pending':
        return 'status-priority-normal';
      case 'expired':
        return 'status-client-discontinued';
      default:
        return '';
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
    <div className="container-standard animate-fadeInUp">
      {/* Header */}
      <div className="card-premium gradient-healthcare text-white rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-primary text-white flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <CreditCardIcon className="w-8 h-8" />
              </div>
              Payment Methods
            </h1>
            <p className="text-body text-blue-50 mt-2">
              Manage your payment methods for therapy sessions
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <ShieldCheckIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Secure & Encrypted</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="card-premium bg-blue-50 border-blue-200 p-6 mb-8">
        <div className="flex items-start">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Your Payment Security</h3>
            <ul className="text-body-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>All payment information is encrypted and stored securely</li>
              <li>We use SEPA Direct Debit for automatic payment collection</li>
              <li>You can cancel or modify payment methods at any time</li>
              <li>Payments are only processed for confirmed therapy sessions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      {paymentMethods.length === 0 && !showAddForm ? (
        <div className="card-premium p-8 text-center">
          <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="heading-section text-gray-900 mb-2">No payment methods added</h3>
          <p className="text-body-sm text-gray-600 mb-6">
            Add a payment method to enable automatic payment for your therapy sessions
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-premium-primary mx-auto"
          >
            Add Payment Method
          </button>
        </div>
      ) : (
        <>
          {!showAddForm && (
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-premium-primary flex items-center space-x-2"
              >
                <CreditCardIcon className="w-5 h-5" />
                <span>Add Payment Method</span>
              </button>
            </div>
          )}

          <div className="space-y-4">
            {paymentMethods.map((method) => {
              const Icon = getPaymentMethodIcon(method.type);
              
              return (
                <div key={method.id} className="card-premium hover:shadow-premium-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-gray-100 rounded-xl">
                          <Icon className="w-6 h-6 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="heading-section">
                              {method.type === 'sepa' ? 'SEPA Direct Debit' : method.type}
                            </h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(method.status)}`}>
                              {method.status}
                            </span>
                            {method.details.isDefault && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-body-sm">
                            <div className="flex items-center space-x-2">
                              <LockClosedIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">IBAN: {maskIBAN(method.details.iban)}</span>
                            </div>
                            <p className="text-gray-700">Account Holder: {method.details.accountHolder}</p>
                            {method.details.bankName && (
                              <p className="text-gray-700">Bank: {method.details.bankName}</p>
                            )}
                            {method.mandateId && (
                              <p className="text-gray-500">Mandate ID: {method.mandateId}</p>
                            )}
                            {method.mandateDate && (
                              <p className="text-gray-500">
                                Authorized on: {new Date(method.mandateDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!method.details.isDefault && method.status === 'active' && (
                          <button
                            onClick={() => handleSetDefault(method.id)}
                            className="btn-premium-ghost text-sm"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMethod(method.id)}
                          className="btn-premium-danger text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Payment Method Form */}
      {showAddForm && (
        <div className="card-premium mt-6">
          <div className="p-6">
            <h2 className="heading-section mb-6">Add SEPA Direct Debit</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="accountHolder" className="label-premium label-premium-required">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  id="accountHolder"
                  name="accountHolder"
                  value={formData.accountHolder}
                  onChange={handleInputChange}
                  className="input-premium"
                  placeholder="As it appears on your bank account"
                />
                <p className="form-help">Full legal name as registered with your bank</p>
              </div>

              <div>
                <label htmlFor="iban" className="label-premium label-premium-required">
                  IBAN
                </label>
                <input
                  type="text"
                  id="iban"
                  name="iban"
                  value={formData.iban}
                  onChange={handleInputChange}
                  className="input-premium font-mono"
                  placeholder="NL00 BANK 0000 0000 00"
                  maxLength={22}
                />
                <p className="form-help">Dutch IBAN starting with NL</p>
              </div>

              <div>
                <label htmlFor="bankName" className="label-premium">
                  Bank Name (Optional)
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="input-premium"
                  placeholder="e.g., ING, ABN AMRO, Rabobank"
                />
              </div>

              {/* SEPA Mandate */}
              <div className="card-premium bg-gray-50 border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">SEPA Direct Debit Mandate</h3>
                <div className="text-body-sm text-gray-700 space-y-2 mb-4">
                  <p>
                    By providing your IBAN and confirming this mandate, you authorize PraktijkEPD and
                    Stripe, our payment service provider, to send instructions to your bank to debit
                    your account for therapy session fees.
                  </p>
                  <p>
                    You are entitled to a refund from your bank under the terms and conditions of your
                    agreement with your bank. A refund must be claimed within 8 weeks starting from the
                    date on which your account was debited.
                  </p>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="acceptMandate"
                    name="acceptMandate"
                    checked={formData.acceptMandate}
                    onChange={handleInputChange}
                    className="checkbox-premium mt-1"
                  />
                  <label htmlFor="acceptMandate" className="ml-3 text-body-sm text-gray-700">
                    I authorize the automatic collection of therapy session fees from my bank account
                    according to the agreed terms and conditions.
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      iban: '',
                      accountHolder: '',
                      bankName: '',
                      acceptMandate: false
                    });
                  }}
                  className="btn-premium-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !formData.acceptMandate}
                  className="btn-premium-primary flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="small" color="white" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Add Payment Method</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-premium p-6">
          <h3 className="heading-section mb-3">How automatic payments work</h3>
          <ul className="text-body-sm text-gray-700 space-y-2 list-disc list-inside">
            <li>Payments are collected after each therapy session</li>
            <li>You'll receive an invoice before each payment</li>
            <li>Failed payments will be retried once</li>
            <li>You can view all transactions in your invoice history</li>
          </ul>
        </div>

        <div className="card-premium p-6">
          <h3 className="heading-section mb-3">Need help?</h3>
          <p className="text-body-sm text-gray-700 mb-4">
            If you have questions about payments or need assistance setting up your payment method,
            please contact our support team.
          </p>
          <button
            onClick={() => navigate('/client/messages/new')}
            className="btn-premium-secondary text-sm"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankInformation;