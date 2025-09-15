import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CogIcon,
  CreditCardIcon,
  CalendarIcon,
  BellIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/store/authStore';

interface PaymentPreferences {
  auto_payment_enabled: boolean;
  payment_timing: 'immediate' | 'due_date' | 'custom_days';
  days_before_due: number;
  payment_reminder_enabled: boolean;
  reminder_days_before: number;
  preferred_payment_method_id?: string;
  invoice_delivery_method: 'email' | 'portal' | 'both';
  combine_invoices: boolean;
  invoice_language: 'nl' | 'en';
  send_payment_confirmations: boolean;
  deductible_handling: 'auto_apply' | 'manual' | 'never';
}

const PaymentPreferences: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error, info } = useAlert();
  const { user } = useAuth();

  const [preferences, setPreferences] = useState<PaymentPreferences>({
    auto_payment_enabled: false,
    payment_timing: 'due_date',
    days_before_due: 0,
    payment_reminder_enabled: true,
    reminder_days_before: 3,
    invoice_delivery_method: 'email',
    combine_invoices: false,
    invoice_language: 'nl',
    send_payment_confirmations: true,
    deductible_handling: 'auto_apply'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    loadPreferences();
    loadPaymentMethods();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.billing.getPaymentPreferences(user?.id || '');
      if (response.success && response.data) {
        setPreferences(response.data);
      }
    } catch (err) {
      // If preferences don't exist yet, use defaults
      console.error('Error loading payment preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await realApiService.billing.getPaymentMethods(user?.id || '');
      if (response.success && response.data) {
        setPaymentMethods(response.data.payment_methods || response.data || []);
      }
    } catch (err) {
      console.error('Error loading payment methods:', err);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      const response = await realApiService.billing.updatePaymentPreferences(user?.id || '', preferences);
      if (response.success) {
        success('Betaalvoorkeuren opgeslagen');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Fout bij opslaan voorkeuren');
    } finally {
      setIsSaving(false);
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
                <CogIcon className="w-8 h-8" />
              </div>
              Betaalvoorkeuren
            </h1>
            <p className="text-body text-blue-50 mt-2">
              Stel uw voorkeuren in voor automatische betalingen en factuurafhandeling
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Automatic Payments */}
        <div className="card-premium">
          <div className="p-6">
            <h2 className="heading-section flex items-center mb-4">
              <CreditCardIcon className="w-6 h-6 mr-2 text-indigo-600" />
              Automatische Betalingen
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Automatische incasso inschakelen</h3>
                  <p className="text-body-sm text-gray-600 mt-1">
                    Facturen worden automatisch betaald via uw standaard betaalmethode
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.auto_payment_enabled}
                    onChange={(e) => setPreferences({ ...preferences, auto_payment_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {preferences.auto_payment_enabled && (
                <>
                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 mb-2">
                      Wanneer betalen?
                    </label>
                    <select
                      value={preferences.payment_timing}
                      onChange={(e) => setPreferences({ ...preferences, payment_timing: e.target.value as any })}
                      className="select-premium"
                    >
                      <option value="immediate">Direct na ontvangst factuur</option>
                      <option value="due_date">Op de vervaldatum</option>
                      <option value="custom_days">Aantal dagen voor vervaldatum</option>
                    </select>
                  </div>

                  {preferences.payment_timing === 'custom_days' && (
                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-2">
                        Dagen voor vervaldatum
                      </label>
                      <input
                        type="number"
                        value={preferences.days_before_due}
                        onChange={(e) => setPreferences({ ...preferences, days_before_due: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="30"
                        className="input-premium w-24"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 mb-2">
                      Standaard betaalmethode
                    </label>
                    {paymentMethods.length > 0 ? (
                      <select
                        value={preferences.preferred_payment_method_id || ''}
                        onChange={(e) => setPreferences({ ...preferences, preferred_payment_method_id: e.target.value })}
                        className="select-premium"
                      >
                        <option value="">Selecteer betaalmethode</option>
                        {paymentMethods.map((method) => (
                          <option key={method.id} value={method.id}>
                            SEPA - {method.iban?.slice(0, 4)} **** **** {method.iban?.slice(-4)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-body-sm text-amber-800">
                          U heeft nog geen betaalmethode ingesteld.{' '}
                          <a
                            href="/client/payment-methods"
                            className="font-medium text-amber-900 underline hover:no-underline"
                          >
                            Voeg een betaalmethode toe
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payment Reminders */}
        <div className="card-premium">
          <div className="p-6">
            <h2 className="heading-section flex items-center mb-4">
              <BellIcon className="w-6 h-6 mr-2 text-indigo-600" />
              Betaalherinneringen
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Herinneringen ontvangen</h3>
                  <p className="text-body-sm text-gray-600 mt-1">
                    Ontvang een herinnering voordat betalingen worden afgeschreven
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.payment_reminder_enabled}
                    onChange={(e) => setPreferences({ ...preferences, payment_reminder_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {preferences.payment_reminder_enabled && (
                <div>
                  <label className="block text-body-sm font-medium text-gray-700 mb-2">
                    Dagen van tevoren herinneren
                  </label>
                  <select
                    value={preferences.reminder_days_before}
                    onChange={(e) => setPreferences({ ...preferences, reminder_days_before: parseInt(e.target.value) })}
                    className="select-premium w-32"
                  >
                    <option value={1}>1 dag</option>
                    <option value={2}>2 dagen</option>
                    <option value={3}>3 dagen</option>
                    <option value={5}>5 dagen</option>
                    <option value={7}>7 dagen</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="card-premium">
          <div className="p-6">
            <h2 className="heading-section flex items-center mb-4">
              <DocumentTextIcon className="w-6 h-6 mr-2 text-indigo-600" />
              Factuurinstellingen
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-gray-700 mb-2">
                  Bezorgmethode facturen
                </label>
                <select
                  value={preferences.invoice_delivery_method}
                  onChange={(e) => setPreferences({ ...preferences, invoice_delivery_method: e.target.value as any })}
                  className="select-premium"
                >
                  <option value="email">Via e-mail</option>
                  <option value="portal">Alleen in portaal</option>
                  <option value="both">E-mail en portaal</option>
                </select>
              </div>

              <div>
                <label className="block text-body-sm font-medium text-gray-700 mb-2">
                  Factuurtaal
                </label>
                <select
                  value={preferences.invoice_language}
                  onChange={(e) => setPreferences({ ...preferences, invoice_language: e.target.value as any })}
                  className="select-premium"
                >
                  <option value="nl">Nederlands</option>
                  <option value="en">Engels</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="combine_invoices"
                  checked={preferences.combine_invoices}
                  onChange={(e) => setPreferences({ ...preferences, combine_invoices: e.target.checked })}
                  className="checkbox-premium mr-2"
                />
                <label htmlFor="combine_invoices" className="text-body-sm text-gray-700">
                  Combineer meerdere sessies op één factuur (maandelijks)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="send_confirmations"
                  checked={preferences.send_payment_confirmations}
                  onChange={(e) => setPreferences({ ...preferences, send_payment_confirmations: e.target.checked })}
                  className="checkbox-premium mr-2"
                />
                <label htmlFor="send_confirmations" className="text-body-sm text-gray-700">
                  Stuur betalingsbevestigingen
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Deductible Settings */}
        <div className="card-premium">
          <div className="p-6">
            <h2 className="heading-section flex items-center mb-4">
              <ShieldCheckIcon className="w-6 h-6 mr-2 text-indigo-600" />
              Eigen Risico
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-gray-700 mb-2">
                  Eigen risico afhandeling
                </label>
                <select
                  value={preferences.deductible_handling}
                  onChange={(e) => setPreferences({ ...preferences, deductible_handling: e.target.value as any })}
                  className="select-premium"
                >
                  <option value="auto_apply">Automatisch toepassen wanneer van toepassing</option>
                  <option value="manual">Handmatig (therapeut bepaalt)</option>
                  <option value="never">Nooit eigen risico toepassen</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-body-sm text-blue-800">
                    Het eigen risico wordt toegepast volgens de regels van uw zorgverzekeraar. 
                    Bij automatische toepassing wordt dit berekend op basis van uw verzekeringsinformatie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => navigate('/client/settings')}
            className="btn-premium-secondary"
          >
            Annuleren
          </button>
          <button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="btn-premium-primary flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="small" />
                <span>Opslaan...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                <span>Voorkeuren opslaan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPreferences;