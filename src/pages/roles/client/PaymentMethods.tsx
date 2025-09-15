import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCardIcon,
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  BuildingLibraryIcon,
  InformationCircleIcon,
  LockClosedIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/store/authStore';
import { formatDate } from '@/utils/dateFormatters';

interface PaymentMethod {
  id: string;
  type: string;
  iban?: string;
  last4?: string;
  bank_name?: string;
  mandate_id?: string;
  mandate_date?: string;
  mandate_status?: string;
  is_default: boolean;
  created_at: string;
}

interface ValidationErrors {
  accountHolder?: string;
  iban?: string;
}

const PaymentMethods: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error, info, warning } = useAlert();
  const { user } = useAuth();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingMethod, setAddingMethod] = useState(false);
  const [removingMethodId, setRemovingMethodId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    accountHolder: '',
    iban: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.billing.getPaymentMethods(user?.id || '');
      if (response.success && response.data) {
        setMethods(response.data.payment_methods || response.data || []);
      }
    } catch (err) {
      // If endpoint doesn't exist yet, show empty state
      console.error('Error fetching payment methods:', err);
      setMethods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.accountHolder.trim()) {
      errors.accountHolder = 'Naam rekeninghouder is verplicht';
    }
    
    const iban = formData.iban.replace(/\s/g, '');
    if (!iban) {
      errors.iban = 'IBAN is verplicht';
    } else if (!/^NL\d{2}[A-Z]{4}\d{10}$/.test(iban)) {
      errors.iban = 'Voer een geldig Nederlands IBAN in';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddMethod = async () => {
    if (!validateForm()) return;

    try {
      setAddingMethod(true);
      const response = await realApiService.billing.setupSepa(user?.id || '', {
        iban: formData.iban.replace(/\s/g, ''),
        account_holder: formData.accountHolder,
        mandate_text: 'Ik machtig PraktijkEPD om betalingen af te schrijven voor therapiesessies.'
      });

      if (response.success) {
        success('SEPA-machtiging toegevoegd');
        setShowAddModal(false);
        setFormData({ accountHolder: '', iban: '' });
        setValidationErrors({});
        fetchPaymentMethods();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Fout bij toevoegen betaalmethode');
    } finally {
      setAddingMethod(false);
    }
  };

  const handleRemoveMethod = async (methodId: string) => {
    try {
      setRemovingMethodId(methodId);
      await realApiService.billing.deletePaymentMethod(user?.id || '', methodId);
      success('SEPA-machtiging verwijderd');
      fetchPaymentMethods();
    } catch (err) {
      error('Fout bij verwijderen betaalmethode');
    } finally {
      setRemovingMethodId(null);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      await realApiService.billing.setDefaultPaymentMethod(user?.id || '', methodId);
      success('Standaard betaalmethode ingesteld');
      fetchPaymentMethods();
    } catch (err) {
      error('Fout bij instellen standaard betaalmethode');
    }
  };

  const formatIBAN = (value: string) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const maskIBAN = (iban?: string) => {
    if (!iban) return '****';
    return iban.slice(0, 4) + ' **** **** ' + (iban.slice(-4) || '****');
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
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              Betaalmethoden
            </h1>
            <p className="text-body text-blue-50 mt-2">
              Beheer uw betaalmethoden voor automatische betalingen
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-premium-white flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>SEPA toevoegen</span>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="card-premium bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 p-6 mb-8">
        <div className="flex items-start">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">SEPA Automatische Incasso</h3>
            <p className="text-body-sm text-blue-800 mb-3">
              Met SEPA automatische incasso worden uw facturen automatisch van uw rekening afgeschreven op de vervaldatum. 
              Dit zorgt ervoor dat u nooit een betaling mist en altijd op tijd betaalt.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900">Gemak</p>
                  <p className="text-body-sm text-blue-700">Geen handmatige betalingen meer</p>
                </div>
              </div>
              <div className="flex items-start">
                <LockClosedIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900">Veilig</p>
                  <p className="text-body-sm text-blue-700">Beveiligd volgens EU-standaarden</p>
                </div>
              </div>
              <div className="flex items-start">
                <DocumentCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900">Controle</p>
                  <p className="text-body-sm text-blue-700">U kunt altijd stoppen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      {methods.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <BuildingLibraryIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="heading-section text-gray-900 mb-2">Geen betaalmethoden ingesteld</h3>
          <p className="text-body-sm text-gray-600 mb-6 max-w-md mx-auto">
            Stel een SEPA-machtiging in om uw facturen automatisch te laten betalen. 
            Dit bespaart u tijd en zorgt ervoor dat u nooit een betaling vergeet.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-premium-primary mx-auto flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>SEPA-machtiging toevoegen</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {methods.map((method) => (
            <div key={method.id} className="card-premium hover:shadow-premium-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                      <BuildingLibraryIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="heading-section">SEPA Automatische Incasso</h3>
                        {method.is_default && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Standaard
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-caption mb-1">IBAN</p>
                          <p className="text-body-sm font-medium">{maskIBAN(method.iban)}</p>
                        </div>
                        <div>
                          <p className="text-caption mb-1">Bank</p>
                          <p className="text-body-sm">{method.bank_name || 'Nederlandse bank'}</p>
                        </div>
                        <div>
                          <p className="text-caption mb-1">Machtigingsnummer</p>
                          <p className="text-body-sm">{method.mandate_id || 'SEPA-' + method.id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-body-sm text-gray-500">
                        <span>Toegevoegd op {new Date(method.created_at).toLocaleDateString('nl-NL')}</span>
                        {method.mandate_status === 'active' && (
                          <span className="flex items-center text-green-600">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Actief
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!method.is_default && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="btn-premium-ghost text-sm"
                      >
                        Als standaard
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Weet u zeker dat u deze SEPA-machtiging wilt verwijderen?')) {
                          handleRemoveMethod(method.id);
                        }
                      }}
                      disabled={removingMethodId === method.id}
                      className="btn-premium-ghost text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {removingMethodId === method.id ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        <>
                          <TrashIcon className="w-4 h-4" />
                          <span className="ml-1">Verwijderen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add SEPA Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-premium max-w-lg w-full animate-scaleIn">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="heading-section">SEPA-machtiging toevoegen</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ accountHolder: '', iban: '' });
                    setValidationErrors({});
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Sluiten</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="accountHolder" className="block text-body-sm font-medium text-gray-700 mb-1">
                    Naam rekeninghouder
                  </label>
                  <input
                    type="text"
                    id="accountHolder"
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                    placeholder="Zoals vermeld op uw bankrekening"
                    className={`input-premium ${validationErrors.accountHolder ? 'border-red-300' : ''}`}
                  />
                  {validationErrors.accountHolder && (
                    <p className="text-caption text-red-600 mt-1">{validationErrors.accountHolder}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="iban" className="block text-body-sm font-medium text-gray-700 mb-1">
                    IBAN
                  </label>
                  <input
                    type="text"
                    id="iban"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: formatIBAN(e.target.value) })}
                    placeholder="NL00 BANK 0000 0000 00"
                    maxLength={22}
                    className={`input-premium ${validationErrors.iban ? 'border-red-300' : ''}`}
                  />
                  {validationErrors.iban && (
                    <p className="text-caption text-red-600 mt-1">{validationErrors.iban}</p>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-900 mb-2">SEPA-machtiging</h3>
                  <p className="text-body-sm text-amber-800 mb-3">
                    Door deze machtiging te ondertekenen geeft u toestemming aan PraktijkEPD om doorlopende incasso-opdrachten 
                    naar uw bank te sturen om een bedrag van uw rekening af te schrijven voor therapiesessies.
                  </p>
                  <ul className="text-body-sm text-amber-700 space-y-1">
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      <span>U wordt 3 dagen van tevoren geïnformeerd over de afschrijving</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      <span>U kunt de machtiging op elk moment intrekken</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      <span>U heeft 8 weken om een afschrijving te laten terugboeken</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({ accountHolder: '', iban: '' });
                      setValidationErrors({});
                    }}
                    className="btn-premium-secondary"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleAddMethod}
                    disabled={addingMethod}
                    className="btn-premium-primary flex items-center space-x-2"
                  >
                    {addingMethod ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span>Toevoegen...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Machtiging verlenen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;