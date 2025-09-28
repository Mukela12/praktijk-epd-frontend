// Complete admin therapist management page example
// Shows how to integrate CSV import with existing therapist management

import React, { useState, useEffect } from 'react';
import { CSVImportSection } from '../components/CSVImportSection';
import { ProfileEditingSection } from '../components/ProfileEditingSection';
import { useProfileData, ProfileData } from '../hooks/useProfileData';

export const AdminTherapistManagementPage: React.FC = () => {
  const [therapists, setTherapists] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTherapist, setEditingTherapist] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'import' | 'edit'>('list');

  const { loadProfile, saveProfile } = useProfileData();

  // Load therapists list
  const loadTherapists = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/therapists', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setTherapists(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load therapists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVImportComplete = () => {
    loadTherapists();
    setCurrentView('list');
  };

  const handleEditTherapist = (therapistId: string) => {
    setEditingTherapist(therapistId);
    setCurrentView('edit');
  };

  const handleEditComplete = () => {
    setEditingTherapist(null);
    setCurrentView('list');
    loadTherapists();
  };

  const toggleTherapistStatus = async (therapistId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        loadTherapists(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update therapist status:', error);
    }
  };

  useEffect(() => {
    loadTherapists();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Therapist Management</h1>
          <p className="text-gray-600">
            Manage therapist accounts, import new therapists, and edit professional information.
          </p>
        </div>

        {/* View Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white rounded-lg border p-1">
            <button
              onClick={() => setCurrentView('list')}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${currentView === 'list' 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              👨‍⚕️ Therapist List ({therapists.length})
            </button>
            <button
              onClick={() => setCurrentView('import')}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${currentView === 'import' 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              📁 CSV Import
            </button>
            {editingTherapist && (
              <button
                onClick={() => setCurrentView('edit')}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${currentView === 'edit' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                ✏️ Edit Therapist
              </button>
            )}
          </div>
        </div>

        {/* CSV Import View */}
        {currentView === 'import' && (
          <CSVImportSection
            type="therapists"
            onImportComplete={handleCSVImportComplete}
            className="mb-8"
          />
        )}

        {/* Edit Therapist View */}
        {currentView === 'edit' && editingTherapist && (
          <ProfileEditingSection
            userId={editingTherapist}
            userType="therapist"
            isAdmin={true}
            onSaveComplete={handleEditComplete}
            onCancel={() => setCurrentView('list')}
          />
        )}

        {/* Therapist List View */}
        {currentView === 'list' && (
          <>
            {/* Quick Actions */}
            <div className="mb-6 flex gap-3">
              <button
                onClick={() => setCurrentView('import')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                📁 Import Therapists from CSV
              </button>
              
              <button
                onClick={loadTherapists}
                className="btn-secondary flex items-center gap-2"
              >
                🔄 Refresh List
              </button>
            </div>

            {/* Therapists Grid */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Registered Therapists
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {therapists.length} total therapists • {therapists.filter(t => t.isActive).length} active
                </p>
              </div>
              
              {therapists.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="text-6xl mb-4">👨‍⚕️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No therapists found</h3>
                  <p className="text-gray-500 mb-4">
                    Get started by importing therapists from a CSV file.
                  </p>
                  <button
                    onClick={() => setCurrentView('import')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    📁 Import Therapists
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {therapists.map((therapist) => (
                    <div 
                      key={therapist.id} 
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow duration-200 bg-white"
                    >
                      {/* Therapist Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-green-600">
                              {therapist.firstName?.charAt(0)}{therapist.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <h4 className="font-semibold text-gray-900">
                              Dr. {therapist.firstName} {therapist.lastName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {therapist.therapistProfile?.licenseNumber ? 
                                `License: ${therapist.therapistProfile.licenseNumber}` : 
                                'License pending'
                              }
                            </p>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <span className={`
                          inline-flex px-2 py-1 text-xs font-semibold rounded-full
                          ${therapist.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        `}>
                          {therapist.isActive ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="mb-4 space-y-1">
                        <p className="text-sm text-gray-600 flex items-center">
                          <span className="mr-2">📧</span>
                          {therapist.email}
                        </p>
                        {therapist.phone && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <span className="mr-2">📞</span>
                            {therapist.phone}
                          </p>
                        )}
                      </div>

                      {/* Specializations */}
                      {therapist.therapistProfile?.specializations && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 mb-2">SPECIALIZATIONS</p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {therapist.therapistProfile.specializations}
                          </p>
                        </div>
                      )}

                      {/* Professional Info */}
                      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                        {therapist.therapistProfile?.yearsOfExperience && (
                          <div>
                            <p className="text-gray-500">Experience</p>
                            <p className="font-medium">{therapist.therapistProfile.yearsOfExperience} years</p>
                          </div>
                        )}
                        {therapist.therapistProfile?.hourlyRate && (
                          <div>
                            <p className="text-gray-500">Rate</p>
                            <p className="font-medium">€{therapist.therapistProfile.hourlyRate}/hr</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <button
                          onClick={() => handleEditTherapist(therapist.id!)}
                          className="flex-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-md transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => toggleTherapistStatus(therapist.id!, therapist.isActive)}
                          className={`
                            flex-1 text-sm px-3 py-2 rounded-md transition-colors
                            ${therapist.isActive 
                              ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }
                          `}
                        >
                          {therapist.isActive ? '❌ Deactivate' : '✅ Activate'}
                        </button>
                        <button className="text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
                          📅 Schedule
                        </button>
                      </div>

                      {/* Join Date */}
                      <div className="mt-3 pt-3 border-t text-xs text-gray-500 text-center">
                        Joined {new Date(therapist.createdAt || '').toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border shadow-sm text-center">
                <div className="text-2xl font-bold text-green-600">{therapists.length}</div>
                <div className="text-sm text-gray-600">Total Therapists</div>
              </div>
              <div className="bg-white p-6 rounded-lg border shadow-sm text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {therapists.filter(t => t.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Active Therapists</div>
              </div>
              <div className="bg-white p-6 rounded-lg border shadow-sm text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {therapists.filter(t => t.therapistProfile?.specializations).length}
                </div>
                <div className="text-sm text-gray-600">With Specializations</div>
              </div>
              <div className="bg-white p-6 rounded-lg border shadow-sm text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {therapists.filter(t => new Date(t.createdAt || '').getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length}
                </div>
                <div className="text-sm text-gray-600">New (30 days)</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminTherapistManagementPage;