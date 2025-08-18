import React, { useEffect, useState } from 'react';
import { therapistApi, clientApi } from '@/services/endpoints';
import { useAuth } from '@/store/authStore';

const AppointmentDebugger: React.FC = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const testTherapistAPI = async () => {
    setIsLoading(true);
    try {
      const response = await therapistApi.getAppointments();
      setDebugInfo((prev: any) => ({
        ...prev,
        therapist: {
          success: true,
          data: response
        }
      }));
    } catch (error: any) {
      console.error('Therapist API Error:', error);
      setDebugInfo((prev: any) => ({
        ...prev,
        therapist: {
          success: false,
          error: {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
          }
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const testClientAPI = async () => {
    setIsLoading(true);
    try {
      const response = await clientApi.getAppointments();
      setDebugInfo((prev: any) => ({
        ...prev,
        client: {
          success: true,
          data: response
        }
      }));
    } catch (error: any) {
      console.error('Client API Error:', error);
      setDebugInfo((prev: any) => ({
        ...prev,
        client: {
          success: false,
          error: {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
          }
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only run tests once
    const runTests = async () => {
      if (user?.role === 'therapist') {
        await testTherapistAPI();
      } else if (user?.role === 'client') {
        await testClientAPI();
      }
    };

    const timer = setTimeout(runTests, 1000);
    return () => clearTimeout(timer);
  }, [user?.role]);

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">Appointment API Debug</h3>
      <div className="text-xs space-y-1">
        <div>User: {user?.email} ({user?.role})</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div className="mt-2">
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        <div className="mt-2 space-x-2">
          <button
            onClick={() => user?.role === 'therapist' ? testTherapistAPI() : testClientAPI()}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
            disabled={isLoading}
          >
            Retry
          </button>
          <button
            onClick={() => setDebugInfo({})}
            className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDebugger;