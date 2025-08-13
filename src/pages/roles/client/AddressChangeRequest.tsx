import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { clientApi } from '@/services/endpoints';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/store/authStore';
import type { Address, CreateAddressChangeRequest } from '@/types/addressChange';
import type { Client } from '@/types/entities';

const AddressChangeRequest: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error, warning } = useAlert();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientProfile, setClientProfile] = useState<Client | null>(null);
  const [formData, setFormData] = useState<CreateAddressChangeRequest>({
    newAddress: {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: 'Netherlands'
    },
    reason: ''
  });

  useEffect(() => {
    loadClientProfile();
  }, []);

  const loadClientProfile = async () => {
    try {
      setIsLoading(true);
      const response = await clientApi.getProfile();
      if (response.success && response.data) {
        setClientProfile(response.data);
      }
    } catch (err) {
      error('Failed to load profile information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        newAddress: {
          ...prev.newAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.newAddress.street || !formData.newAddress.houseNumber || 
        !formData.newAddress.postalCode || !formData.newAddress.city) {
      warning('Please fill in all address fields');
      return;
    }

    if (!formData.reason || formData.reason.length < 10) {
      warning('Please provide a detailed reason for the address change (minimum 10 characters)');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await clientApi.requestAddressChange(formData);
      
      if (response.success) {
        success('Address change request submitted successfully. You will be notified once it has been reviewed.');
        navigate('/dashboard');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to submit address change request');
    } finally {
      setIsSubmitting(false);
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
                <HomeIcon className="w-8 h-8" />
              </div>
              Request Address Change
            </h1>
            <p className="text-body text-blue-50 mt-2">
              Submit a request to update your registered address
            </p>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="card-premium bg-amber-50 border-amber-200 p-6 mb-8">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="heading-section text-amber-900 mb-2">Important Information</h3>
            <ul className="text-body-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>Address changes require administrative approval</li>
              <li>Processing typically takes 1-3 business days</li>
              <li>You will be notified via email once your request has been reviewed</li>
              <li>Ensure all information is accurate to avoid delays</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Address */}
        <div className="card-premium">
          <div className="p-6">
            <h2 className="heading-section mb-4">Current Address</h2>
            {clientProfile?.address ? (
              <div className="space-y-2 text-body">
                <p>{clientProfile.address.street} {clientProfile.address.house_number}</p>
                <p>{clientProfile.address.postal_code} {clientProfile.address.city}</p>
                <p>{clientProfile.address.country}</p>
              </div>
            ) : (
              <p className="text-body-sm text-gray-500">No address on file</p>
            )}
          </div>
        </div>

        {/* New Address Form */}
        <div className="card-premium">
          <div className="p-6">
            <h2 className="heading-section mb-4">New Address</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="street" className="label-premium label-premium-required">
                    Street Name
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="address.street"
                    value={formData.newAddress.street}
                    onChange={handleInputChange}
                    className="input-premium"
                    placeholder="Keizersgracht"
                  />
                </div>
                <div>
                  <label htmlFor="houseNumber" className="label-premium label-premium-required">
                    House Number
                  </label>
                  <input
                    type="text"
                    id="houseNumber"
                    name="address.houseNumber"
                    value={formData.newAddress.houseNumber}
                    onChange={handleInputChange}
                    className="input-premium"
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className="label-premium label-premium-required">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="address.postalCode"
                    value={formData.newAddress.postalCode}
                    onChange={handleInputChange}
                    className="input-premium"
                    placeholder="1015 CJ"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="label-premium label-premium-required">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="address.city"
                    value={formData.newAddress.city}
                    onChange={handleInputChange}
                    className="input-premium"
                    placeholder="Amsterdam"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="country" className="label-premium">
                  Country
                </label>
                <select
                  id="country"
                  name="address.country"
                  value={formData.newAddress.country}
                  onChange={(e) => handleInputChange(e as any)}
                  className="select-premium"
                >
                  <option value="Netherlands">Netherlands</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>

              <div>
                <label htmlFor="reason" className="label-premium label-premium-required">
                  Reason for Address Change
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-premium"
                  placeholder="Please explain why you need to change your address (e.g., moved to a new residence, correction of incorrect information, etc.)"
                />
                <p className="form-help">Minimum 10 characters required</p>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-premium-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-premium-primary flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="small" color="white" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <DocumentTextIcon className="w-5 h-5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressChangeRequest;