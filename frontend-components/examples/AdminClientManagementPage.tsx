// Complete admin client management page example
// Shows how to integrate CSV import with existing client management

import React, { useState, useEffect } from 'react';
import { CSVImportSection } from '../components/CSVImportSection';
import { ProfileEditingSection } from '../components/ProfileEditingSection';
import { useProfileData, ProfileData } from '../hooks/useProfileData';

interface AdminClientManagementPageProps {
  // Add any existing props from your admin layout
}

export const AdminClientManagementPage: React.FC<AdminClientManagementPageProps> = () => {
  const [clients, setClients] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'import' | 'edit'>('list');

  const { loadProfile, saveProfile } = useProfileData();

  // Load clients list
  const loadClients = async () => {
    try {
      setIsLoading(true);
      
      // This would integrate with your existing client loading logic
      const response = await fetch('/api/admin/clients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setClients(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVImportComplete = () => {
    // Refresh the client list after successful import
    loadClients();
    setCurrentView('list');
  };

  const handleEditClient = (clientId: string) => {
    setEditingClient(clientId);
    setCurrentView('edit');
  };

  const handleEditComplete = () => {
    setEditingClient(null);
    setCurrentView('list');
    loadClients(); // Refresh the list
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Loading state
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Management</h1>
          <p className="text-gray-600">
            Manage client accounts, import new clients, and edit client information.
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
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              👥 Client List ({clients.length})
            </button>
            <button
              onClick={() => setCurrentView('import')}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${currentView === 'import' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              📁 CSV Import
            </button>
            {editingClient && (
              <button
                onClick={() => setCurrentView('edit')}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${currentView === 'edit' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                ✏️ Edit Client
              </button>
            )}
          </div>
        </div>

        {/* CSV Import View */}
        {currentView === 'import' && (
          <CSVImportSection
            type="clients"
            onImportComplete={handleCSVImportComplete}
            className="mb-8"
          />
        )}

        {/* Edit Client View */}
        {currentView === 'edit' && editingClient && (
          <ProfileEditingSection
            userId={editingClient}
            userType="client"
            isAdmin={true}
            onSaveComplete={handleEditComplete}
            onCancel={() => setCurrentView('list')}
          />
        )}

        {/* Client List View */}
        {currentView === 'list' && (
          <>
            {/* Quick Actions */}
            <div className="mb-6 flex gap-3">
              <button
                onClick={() => setCurrentView('import')}
                className="btn-premium-primary flex items-center gap-2"
              >
                📁 Import Clients from CSV
              </button>
              
              <button
                onClick={loadClients}
                className="btn-secondary flex items-center gap-2"
              >
                🔄 Refresh List
              </button>
            </div>

            {/* Clients Table */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Registered Clients
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {clients.length} total clients
                </p>
              </div>
              
              {clients.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                  <p className="text-gray-500 mb-4">
                    Get started by importing clients from a CSV file.
                  </p>
                  <button
                    onClick={() => setCurrentView('import')}
                    className="btn-premium-primary"
                  >
                    📁 Import Clients
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Intake Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {client.firstName?.charAt(0)}{client.lastName?.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {client.firstName} {client.namePrefix} {client.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Client #{client.clientNumber || client.id?.slice(-6)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{client.email}</div>
                            <div className="text-sm text-gray-500">{client.phone || client.mobilePhone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`
                              inline-flex px-2 py-1 text-xs font-semibold rounded-full
                              ${client.clientProfile?.hasCompletedIntake 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                              }
                            `}>
                              {client.clientProfile?.hasCompletedIntake ? '✅ Complete' : '⏳ Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(client.createdAt || '').toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditClient(client.id!)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit client"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900 ml-3"
                              title="View appointments"
                            >
                              📅 Appointments
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminClientManagementPage;