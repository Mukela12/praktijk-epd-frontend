import React, { useState, useEffect } from 'react';
import {
  CurrencyEuroIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { realApiService } from '@/services/realApi';
import { formatCurrency } from '@/utils/dateFormatters';

interface SessionBillingFormProps {
  appointmentId: string;
  clientId: string;
  clientName: string;
  sessionDate: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

interface TreatmentCode {
  id: string;
  code: string;
  description: string;
  price: number;
  duration_minutes: number;
  valid_from: string;
  valid_until?: string;
}

interface BillingFormData {
  duration_minutes: number;
  treatment_code_id: string;
  notes?: string;
  deductible_applied: boolean;
  deductible_amount?: number;
  create_invoice: boolean;
  send_invoice: boolean;
}

const SessionBillingForm: React.FC<SessionBillingFormProps> = ({
  appointmentId,
  clientId,
  clientName,
  sessionDate,
  onComplete,
  onCancel
}) => {
  const { success, error, info } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [treatmentCodes, setTreatmentCodes] = useState<TreatmentCode[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  
  const [formData, setFormData] = useState<BillingFormData>({
    duration_minutes: 50,
    treatment_code_id: '',
    notes: '',
    deductible_applied: false,
    deductible_amount: 0,
    create_invoice: true,
    send_invoice: true
  });

  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  useEffect(() => {
    fetchTreatmentCodes();
  }, []);

  useEffect(() => {
    // Calculate price based on selected treatment code and duration
    if (formData.treatment_code_id) {
      const selectedCode = treatmentCodes.find(code => code.id === formData.treatment_code_id);
      if (selectedCode) {
        // Calculate price based on duration
        const pricePerMinute = selectedCode.price / selectedCode.duration_minutes;
        const totalPrice = pricePerMinute * formData.duration_minutes;
        const priceAfterDeductible = formData.deductible_applied 
          ? Math.max(0, totalPrice - (formData.deductible_amount || 0))
          : totalPrice;
        setCalculatedPrice(priceAfterDeductible);
      }
    }
  }, [formData.treatment_code_id, formData.duration_minutes, formData.deductible_applied, formData.deductible_amount, treatmentCodes]);

  const fetchTreatmentCodes = async () => {
    try {
      setIsLoadingCodes(true);
      const response = await realApiService.billing.getTreatmentCodes();
      if (response.success && response.data) {
        setTreatmentCodes(response.data);
        // Set default treatment code if available
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, treatment_code_id: response.data[0].id }));
        }
      }
    } catch (err) {
      error('Failed to load treatment codes');
    } finally {
      setIsLoadingCodes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.treatment_code_id) {
      error('Please select a treatment code');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create billing for the session
      const response = await realApiService.billing.createSessionBilling({
        appointment_id: appointmentId,
        client_id: clientId,
        duration_minutes: formData.duration_minutes,
        treatment_code_id: formData.treatment_code_id,
        notes: formData.notes,
        deductible_applied: formData.deductible_applied,
        deductible_amount: formData.deductible_applied ? formData.deductible_amount : undefined,
        create_invoice: formData.create_invoice,
        send_invoice: formData.send_invoice
      });

      if (response.success) {
        success('Session billed successfully');
        if (onComplete) {
          onComplete();
        }
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to bill session');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCodes) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card-premium">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="heading-section flex items-center mb-2">
              <CurrencyEuroIcon className="w-6 h-6 mr-2 text-indigo-600" />
              Bill Session
            </h2>
            <p className="text-body-sm text-gray-600">
              Complete billing for {clientName}'s session on {new Date(sessionDate).toLocaleDateString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Duration */}
            <div>
              <label className="block text-body-sm font-medium text-gray-700 mb-2">
                Session Duration
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    min="15"
                    max="180"
                    step="5"
                    className="input-premium w-24"
                    required
                  />
                  <span className="text-body-sm text-gray-600">minutes</span>
                </div>
                <div className="flex space-x-2">
                  {[30, 45, 50, 60, 90].map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setFormData({ ...formData, duration_minutes: duration })}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        formData.duration_minutes === duration
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Treatment Code */}
            <div>
              <label className="block text-body-sm font-medium text-gray-700 mb-2">
                Treatment Code
              </label>
              <select
                value={formData.treatment_code_id}
                onChange={(e) => setFormData({ ...formData, treatment_code_id: e.target.value })}
                className="select-premium"
                required
              >
                <option value="">Select a treatment code</option>
                {treatmentCodes.map((code) => (
                  <option key={code.id} value={code.id}>
                    {code.code} - {code.description} ({formatCurrency(code.price)}/{code.duration_minutes}min)
                  </option>
                ))}
              </select>
            </div>

            {/* Deductible */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.deductible_applied}
                    onChange={(e) => setFormData({ ...formData, deductible_applied: e.target.checked })}
                    className="checkbox-premium mr-2"
                  />
                  <span className="text-body-sm font-medium text-gray-700">Apply deductible (eigen risico)</span>
                </label>
              </div>
              {formData.deductible_applied && (
                <div className="ml-6">
                  <label className="block text-body-sm text-gray-600 mb-1">
                    Deductible amount
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">€</span>
                    <input
                      type="number"
                      value={formData.deductible_amount}
                      onChange={(e) => setFormData({ ...formData, deductible_amount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="input-premium w-32"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Price Calculation */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-start">
                <CalculatorIcon className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-indigo-900 mb-2">Price Calculation</h4>
                  {formData.treatment_code_id && (
                    <div className="space-y-1 text-body-sm">
                      <div className="flex justify-between">
                        <span className="text-indigo-700">Session price:</span>
                        <span className="font-medium text-indigo-900">
                          {formatCurrency(calculatedPrice + (formData.deductible_amount || 0))}
                        </span>
                      </div>
                      {formData.deductible_applied && (
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Deductible:</span>
                          <span className="font-medium text-indigo-900">
                            - {formatCurrency(formData.deductible_amount || 0)}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-indigo-200 pt-1 flex justify-between">
                        <span className="font-medium text-indigo-700">Total to invoice:</span>
                        <span className="font-bold text-indigo-900 text-lg">
                          {formatCurrency(calculatedPrice)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-body-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any additional notes about the session or billing..."
                className="textarea-premium"
              />
            </div>

            {/* Invoice Options */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.create_invoice}
                  onChange={(e) => setFormData({ ...formData, create_invoice: e.target.checked })}
                  className="checkbox-premium mr-2"
                />
                <span className="text-body-sm font-medium text-gray-700">Create invoice automatically</span>
              </label>
              
              {formData.create_invoice && (
                <label className="flex items-center ml-6">
                  <input
                    type="checkbox"
                    checked={formData.send_invoice}
                    onChange={(e) => setFormData({ ...formData, send_invoice: e.target.checked })}
                    className="checkbox-premium mr-2"
                  />
                  <span className="text-body-sm font-medium text-gray-700">Send invoice to client immediately</span>
                </label>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-body-sm text-blue-800">
                  <p className="mb-2">
                    This will mark the appointment as completed and create a billing record.
                  </p>
                  {formData.create_invoice && (
                    <p>
                      An invoice will be generated {formData.send_invoice ? 'and sent to the client' : 'but saved as draft'}.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn-premium-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.treatment_code_id}
                className="btn-premium-primary flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Complete Billing</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionBillingForm;