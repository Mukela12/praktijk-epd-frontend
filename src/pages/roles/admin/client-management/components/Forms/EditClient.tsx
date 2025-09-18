import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  HeartIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useClientContext } from '../shared/ClientContext';
import { PremiumButton, PremiumCard } from '@/components/layout/PremiumLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAlert } from '@/components/ui/CustomAlert';

interface FormData {
  // Personal info
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  
  // Address
  street_address: string;
  city: string;
  postal_code: string;
  country: string;
  
  // Insurance
  insurance_company: string;
  insurance_number: string;
  
  // Emergency contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  
  // Therapy details
  therapy_type: string;
  reason_for_therapy: string;
  therapy_goals: string;
  referred_by: string;
  preferred_language: string;
  
  // Assignment
  assigned_therapist_id: string;
  
  // Behaviors
  psychological_behaviors: string[];
  
  // Notes
  notes: string;
  
  // Status
  user_status: string;
}

const EditClient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadClientDetails, updateClient, deleteClient, clientDetails, therapists, loading: contextLoading } = useClientContext();
  const { success, error, confirm } = useAlert();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    street_address: '',
    city: '',
    postal_code: '',
    country: 'Netherlands',
    insurance_company: '',
    insurance_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    therapy_type: 'individual',
    reason_for_therapy: '',
    therapy_goals: '',
    referred_by: '',
    preferred_language: 'nl',
    assigned_therapist_id: '',
    psychological_behaviors: [],
    notes: '',
    user_status: 'active'
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (id) {
      loadClientDetails(id);
    }
  }, [id, loadClientDetails]);

  useEffect(() => {
    if (clientDetails && clientDetails.client) {
      const { client, behaviors } = clientDetails;
      
      // Format date for input field
      const formattedDate = client.date_of_birth ? 
        new Date(client.date_of_birth).toISOString().split('T')[0] : '';
      
      setFormData({
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        date_of_birth: formattedDate,
        gender: client.gender || '',
        phone: client.phone || '',
        email: client.email || '',
        street_address: client.street_address || '',
        city: client.city || '',
        postal_code: client.postal_code || '',
        country: client.country || 'Netherlands',
        insurance_company: client.insurance_company || '',
        insurance_number: client.insurance_number || '',
        emergency_contact_name: client.emergency_contact_name || '',
        emergency_contact_phone: client.emergency_contact_phone || '',
        therapy_type: client.therapy_type || 'individual',
        reason_for_therapy: client.reason_for_therapy || '',
        therapy_goals: client.therapy_goals || '',
        referred_by: client.referred_by || '',
        preferred_language: client.preferred_language || 'nl',
        assigned_therapist_id: client.assigned_therapist_id || '',
        psychological_behaviors: behaviors?.map((b: any) => b.behavior_name) || [],
        notes: client.notes || '',
        user_status: client.user_status || 'active'
      });
    }
  }, [clientDetails]);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Required fields
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email format';
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    // Phone validation
    if (formData.phone && !/^\+?[\d\s()-]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validate()) {
      error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        psychological_behaviors: formData.psychological_behaviors.length > 0 
          ? formData.psychological_behaviors 
          : undefined
      };

      const result = await updateClient(id!, submitData);
      
      if (result) {
        success('Client updated successfully');
        navigate(`/admin/clients/${id}`);
      }
    } catch (err: any) {
      error(err.message || 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm(
      'Are you sure you want to delete this client? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setLoading(true);
    
    try {
      const result = await deleteClient(id!);
      
      if (result) {
        success('Client deleted successfully');
        navigate('/admin/clients');
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete client');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const toggleBehavior = (behavior: string) => {
    setFormData(prev => ({
      ...prev,
      psychological_behaviors: prev.psychological_behaviors.includes(behavior)
        ? prev.psychological_behaviors.filter(b => b !== behavior)
        : [...prev.psychological_behaviors, behavior]
    }));
  };

  const availableBehaviors = [
    'Anxiety',
    'Depression',
    'PTSD',
    'OCD',
    'ADHD',
    'Bipolar Disorder',
    'Eating Disorders',
    'Substance Abuse',
    'Sleep Disorders',
    'Anger Management',
    'Grief and Loss',
    'Relationship Issues'
  ];

  if (contextLoading || !clientDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const fullName = `${formData.first_name} ${formData.last_name}`.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <PremiumButton
            variant="outline"
            icon={ArrowLeftIcon}
            onClick={() => navigate(`/admin/clients/${id}`)}
          >
            Back to Profile
          </PremiumButton>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Client</h1>
            <p className="text-sm text-gray-500">Update {fullName}'s information</p>
          </div>
        </div>
        <PremiumButton
          variant="outline"
          icon={TrashIcon}
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700"
        >
          Delete Client
        </PremiumButton>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <PremiumCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.first_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.last_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`pl-10 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`pl-10 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+31 6 12345678"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  className={`pl-10 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.date_of_birth ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.date_of_birth && (
                <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.gender ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Language
              </label>
              <select
                value={formData.preferred_language}
                onChange={(e) => handleChange('preferred_language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="nl">Dutch</option>
                <option value="en">English</option>
                <option value="de">German</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.user_status}
                onChange={(e) => handleChange('user_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </PremiumCard>

        {/* Address Information */}
        <PremiumCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-green-500" />
            Address Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.street_address}
                onChange={(e) => handleChange('street_address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Amsterdam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="1234 AB"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </PremiumCard>

        {/* Insurance Information */}
        <PremiumCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-purple-500" />
            Insurance Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Company
              </label>
              <input
                type="text"
                value={formData.insurance_company}
                onChange={(e) => handleChange('insurance_company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Zilveren Kruis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Number
              </label>
              <input
                type="text"
                value={formData.insurance_number}
                onChange={(e) => handleChange('insurance_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Policy number"
              />
            </div>
          </div>
        </PremiumCard>

        {/* Emergency Contact */}
        <PremiumCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-500" />
            Emergency Contact
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.emergency_contact_name}
                onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Emergency contact name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.emergency_contact_phone}
                onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="+31 6 12345678"
              />
            </div>
          </div>
        </PremiumCard>

        {/* Therapy Information */}
        <PremiumCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HeartIcon className="h-5 w-5 mr-2 text-pink-500" />
            Therapy Information
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Therapy Type
                </label>
                <select
                  value={formData.therapy_type}
                  onChange={(e) => handleChange('therapy_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="individual">Individual</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  <option value="group">Group</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referred By
                </label>
                <input
                  type="text"
                  value={formData.referred_by}
                  onChange={(e) => handleChange('referred_by', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Dr. Smith, Self-referred"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Therapy
              </label>
              <textarea
                value={formData.reason_for_therapy}
                onChange={(e) => handleChange('reason_for_therapy', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Brief description of why the client is seeking therapy..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Therapy Goals
              </label>
              <textarea
                value={formData.therapy_goals}
                onChange={(e) => handleChange('therapy_goals', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="What the client hopes to achieve through therapy..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Psychological Behaviors
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableBehaviors.map((behavior) => (
                  <label key={behavior} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.psychological_behaviors.includes(behavior)}
                      onChange={() => toggleBehavior(behavior)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{behavior}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Therapist Assignment */}
        <PremiumCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-500" />
            Therapist Assignment
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Therapist
            </label>
            <select
              value={formData.assigned_therapist_id}
              onChange={(e) => handleChange('assigned_therapist_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">No therapist assigned</option>
              {therapists.map(therapist => (
                <option key={therapist.id} value={therapist.id}>
                  Dr. {therapist.first_name} {therapist.last_name} 
                  ({therapist.current_clients || 0} clients)
                </option>
              ))}
            </select>
          </div>
        </PremiumCard>

        {/* Additional Notes */}
        <PremiumCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-orange-500" />
            Additional Notes
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Any additional information about the client..."
            />
          </div>
        </PremiumCard>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <PremiumButton
            variant="outline"
            onClick={() => navigate(`/admin/clients/${id}`)}
          >
            Cancel
          </PremiumButton>
          <PremiumButton
            variant="danger"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </PremiumButton>
        </div>
      </div>
    </div>
  );
};

export default EditClient;