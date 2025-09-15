import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BasicInfoForm from './BasicInfoForm';
import ProfessionalInfoForm from './ProfessionalInfoForm';
import ServiceSettingsForm from './ServiceSettingsForm';
import { Therapist, TherapistStatus } from '../shared/therapistTypes';
import { transformBackendToTherapist } from '../shared/dataTransformers';

const EditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useAlert();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'basic' | 'professional' | 'service'>('basic');

  useEffect(() => {
    if (id) {
      loadTherapist();
    }
  }, [id]);

  const loadTherapist = async () => {
    try {
      setLoading(true);
      const response = await realApiService.admin.getTherapistById(id!);
      if (response.success && response.data) {
        const therapistData = transformBackendToTherapist(response.data);
        setTherapist(therapistData);
      } else {
        throw new Error('Failed to load therapist');
      }
    } catch (err: any) {
      console.error('Failed to load therapist:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load therapist details';
      error(errorMessage);
      // Only navigate away if it's a 404
      if (err.response?.status === 404) {
        navigate('/admin/therapists');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoSubmit = async (data: any) => {
    if (!therapist) return;
    
    console.log('🔄 [EditForm] Submitting basic info update:', {
      therapistId: therapist.id,
      data: data
    });
    
    try {
      setSaving(true);
      
      // Update user basic info
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        status: data.status
      };
      
      console.log('📤 [EditForm] Sending updateUser payload:', payload);
      
      const response = await realApiService.admin.updateUser(therapist.id, payload);
      
      console.log('📥 [EditForm] UpdateUser response:', response);

      if (response.success) {
        setTherapist({ ...therapist, ...data });
        success('Basic information updated successfully');
      } else {
        console.error('❌ [EditForm] Update failed, response not successful:', response);
        error('Failed to update basic information');
      }
    } catch (err: any) {
      console.error('❌ [EditForm] Failed to update basic info:', err);
      console.error('❌ [EditForm] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = err.response?.data?.message || 'Failed to update basic information';
      error(errorMessage);
      // Handle specific error cases
      if (err.response?.status === 409) {
        error('Email already exists. Please use a different email.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleProfessionalInfoSubmit = async (data: any) => {
    if (!therapist) return;
    
    console.log('🔄 [EditForm] Submitting professional info update:', {
      therapistId: therapist.id,
      data: data
    });
    
    try {
      setSaving(true);
      
      const payload = {
        licenseNumber: data.license_number,
        specializations: data.specializations,
        therapyTypes: data.therapy_types, // Fixed: was using data.specializations
        languages: data.languages,
        bio: data.bio,
        qualifications: data.qualifications
      };
      
      console.log('📤 [EditForm] Sending updateTherapistProfile payload:', payload);
      
      const response = await realApiService.admin.updateTherapistProfile(therapist.id, payload);
      
      console.log('📥 [EditForm] UpdateTherapistProfile response:', response);

      if (response.success) {
        setTherapist({ ...therapist, ...data });
        success('Professional information updated successfully');
      } else {
        console.error('❌ [EditForm] Professional update failed:', response);
        error('Failed to update professional information');
      }
    } catch (err: any) {
      console.error('❌ [EditForm] Failed to update professional info:', err);
      console.error('❌ [EditForm] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      error(err.response?.data?.message || 'Failed to update professional information');
    } finally {
      setSaving(false);
    }
  };

  const handleServiceSettingsSubmit = async (data: any) => {
    if (!therapist) return;
    
    try {
      setSaving(true);
      
      const response = await realApiService.admin.updateTherapistProfile(therapist.id, {
        hourlyRate: data.hourly_rate,
        maxClientsPerDay: data.max_clients,
        sessionDuration: data.session_duration,
        breakBetweenSessions: data.break_between_sessions,
        maxClients: data.max_clients
      });

      if (response.success) {
        setTherapist({ ...therapist, ...data });
        success('Service settings updated successfully');
      }
    } catch (err: any) {
      console.error('Failed to update service settings:', err);
      error(err.response?.data?.message || 'Failed to update service settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Therapist Not Found</h2>
          <p className="text-gray-600 mb-4">The therapist you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/therapists')}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Therapists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/admin/therapists/${therapist.id}`)}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Therapist - {therapist.first_name} {therapist.last_name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveSection('basic')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeSection === 'basic'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Basic Information
            </button>
            <button
              onClick={() => setActiveSection('professional')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeSection === 'professional'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Professional Info
            </button>
            <button
              onClick={() => setActiveSection('service')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeSection === 'service'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Service Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {activeSection === 'basic' && (
            <BasicInfoForm
              therapist={therapist}
              onSubmit={handleBasicInfoSubmit}
              isSaving={saving}
            />
          )}
          {activeSection === 'professional' && (
            <ProfessionalInfoForm
              therapist={therapist}
              onSubmit={handleProfessionalInfoSubmit}
              isSaving={saving}
            />
          )}
          {activeSection === 'service' && (
            <ServiceSettingsForm
              therapist={therapist}
              onSubmit={handleServiceSettingsSubmit}
              isSaving={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditForm;