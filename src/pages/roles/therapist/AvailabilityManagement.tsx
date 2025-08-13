import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  BellAlertIcon,
  PauseIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { therapistApi } from '@/services/endpoints';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/store/authStore';

interface TimeSlot {
  start: string;
  end: string;
  isBreak?: boolean;
}

interface DayAvailability {
  day: string;
  isAvailable: boolean;
  slots: TimeSlot[];
}

interface AvailabilitySettings {
  regularHours: DayAvailability[];
  sessionDuration: number;
  bufferTime: number;
  maxDailyAppointments: number;
  autoConfirmAppointments: boolean;
  blockEmergencySlots: boolean;
  vacationMode: boolean;
  vacationStart?: string;
  vacationEnd?: string;
  vacationMessage?: string;
  exceptions: {
    date: string;
    reason: string;
    slots?: TimeSlot[];
  }[];
}

const AvailabilityManagement: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error, warning, info } = useAlert();
  const { user } = useAuth();

  const [availability, setAvailability] = useState<AvailabilitySettings>({
    regularHours: [
      { day: 'Monday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
      { day: 'Tuesday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
      { day: 'Wednesday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
      { day: 'Thursday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
      { day: 'Friday', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
      { day: 'Saturday', isAvailable: false, slots: [] },
      { day: 'Sunday', isAvailable: false, slots: [] }
    ],
    sessionDuration: 60,
    bufferTime: 15,
    maxDailyAppointments: 8,
    autoConfirmAppointments: true,
    blockEmergencySlots: false,
    vacationMode: false,
    exceptions: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  const [exceptionForm, setExceptionForm] = useState({
    date: '',
    reason: '',
    isUnavailable: true,
    customSlots: [] as TimeSlot[]
  });

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setIsLoading(true);
      const response = await therapistApi.getAvailability();
      
      if (response.success && response.data) {
        // Merge with default structure
        setAvailability(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (err) {
      error('Failed to load availability settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate time slots
      for (const day of availability.regularHours) {
        if (day.isAvailable && day.slots.length === 0) {
          warning(`Please add time slots for ${day.day}`);
          return;
        }
        
        // Check for overlapping slots
        for (let i = 0; i < day.slots.length - 1; i++) {
          const currentEnd = day.slots[i].end;
          const nextStart = day.slots[i + 1].start;
          if (currentEnd > nextStart) {
            warning(`Time slots overlap on ${day.day}`);
            return;
          }
        }
      }

      const response = await therapistApi.setAvailability(availability);
      
      if (response.success) {
        success('Availability settings updated successfully');
      }
    } catch (err) {
      error('Failed to update availability settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDayAvailability = (dayIndex: number) => {
    setAvailability(prev => {
      const newHours = [...prev.regularHours];
      newHours[dayIndex].isAvailable = !newHours[dayIndex].isAvailable;
      if (newHours[dayIndex].isAvailable && newHours[dayIndex].slots.length === 0) {
        newHours[dayIndex].slots = [{ start: '09:00', end: '17:00' }];
      }
      return { ...prev, regularHours: newHours };
    });
  };

  const addTimeSlot = (dayIndex: number) => {
    setAvailability(prev => {
      const newHours = [...prev.regularHours];
      const lastSlot = newHours[dayIndex].slots[newHours[dayIndex].slots.length - 1];
      const newStart = lastSlot ? lastSlot.end : '09:00';
      const newEnd = newStart < '16:00' ? '17:00' : '18:00';
      
      newHours[dayIndex].slots.push({ start: newStart, end: newEnd });
      return { ...prev, regularHours: newHours };
    });
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    setAvailability(prev => {
      const newHours = [...prev.regularHours];
      newHours[dayIndex].slots.splice(slotIndex, 1);
      return { ...prev, regularHours: newHours };
    });
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    setAvailability(prev => {
      const newHours = [...prev.regularHours];
      newHours[dayIndex].slots[slotIndex][field] = value;
      return { ...prev, regularHours: newHours };
    });
  };

  const addBreak = (dayIndex: number) => {
    setAvailability(prev => {
      const newHours = [...prev.regularHours];
      newHours[dayIndex].slots.push({ start: '12:00', end: '13:00', isBreak: true });
      // Sort slots by start time
      newHours[dayIndex].slots.sort((a, b) => a.start.localeCompare(b.start));
      return { ...prev, regularHours: newHours };
    });
  };

  const handleAddException = () => {
    if (!exceptionForm.date || !exceptionForm.reason) {
      warning('Please fill in all required fields');
      return;
    }

    setAvailability(prev => ({
      ...prev,
      exceptions: [
        ...prev.exceptions,
        {
          date: exceptionForm.date,
          reason: exceptionForm.reason,
          slots: exceptionForm.isUnavailable ? [] : exceptionForm.customSlots
        }
      ]
    }));

    setShowExceptionModal(false);
    setExceptionForm({
      date: '',
      reason: '',
      isUnavailable: true,
      customSlots: []
    });
    
    success('Exception added successfully');
  };

  const removeException = (index: number) => {
    setAvailability(prev => ({
      ...prev,
      exceptions: prev.exceptions.filter((_, i) => i !== index)
    }));
  };

  const copyToAllWeekdays = (dayIndex: number) => {
    const sourceDay = availability.regularHours[dayIndex];
    
    setAvailability(prev => {
      const newHours = [...prev.regularHours];
      for (let i = 0; i < 5; i++) { // Monday to Friday
        if (i !== dayIndex) {
          newHours[i].isAvailable = sourceDay.isAvailable;
          newHours[i].slots = [...sourceDay.slots];
        }
      }
      return { ...prev, regularHours: newHours };
    });
    
    info('Schedule copied to all weekdays');
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
      <div className="card-premium gradient-therapy text-white rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-primary text-white flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <CalendarDaysIcon className="w-8 h-8" />
              </div>
              Availability Management
            </h1>
            <p className="text-body text-purple-50 mt-2">
              Configure your working hours and availability settings
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-premium-primary bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="small" color="primary" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Vacation Mode Alert */}
      {availability.vacationMode && (
        <div className="card-premium bg-amber-50 border-amber-200 p-6 mb-6">
          <div className="flex items-start">
            <BellAlertIcon className="w-6 h-6 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">Vacation Mode Active</h3>
              <p className="text-body-sm text-amber-800">
                Your calendar is blocked from {availability.vacationStart ? new Date(availability.vacationStart).toLocaleDateString() : 'now'} 
                {availability.vacationEnd && ` until ${new Date(availability.vacationEnd).toLocaleDateString()}`}
              </p>
              {availability.vacationMessage && (
                <p className="text-body-sm text-amber-700 mt-1 italic">"{availability.vacationMessage}"</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Session Settings */}
        <div className="card-premium">
          <div className="p-6">
            <h2 className="heading-section mb-4">Session Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="sessionDuration" className="label-premium">
                  Session Duration (minutes)
                </label>
                <input
                  type="number"
                  id="sessionDuration"
                  value={availability.sessionDuration}
                  onChange={(e) => setAvailability(prev => ({ ...prev, sessionDuration: parseInt(e.target.value) || 60 }))}
                  min="15"
                  max="180"
                  step="15"
                  className="input-premium"
                />
              </div>

              <div>
                <label htmlFor="bufferTime" className="label-premium">
                  Buffer Time Between Sessions (minutes)
                </label>
                <input
                  type="number"
                  id="bufferTime"
                  value={availability.bufferTime}
                  onChange={(e) => setAvailability(prev => ({ ...prev, bufferTime: parseInt(e.target.value) || 0 }))}
                  min="0"
                  max="60"
                  step="5"
                  className="input-premium"
                />
              </div>

              <div>
                <label htmlFor="maxAppointments" className="label-premium">
                  Max Daily Appointments
                </label>
                <input
                  type="number"
                  id="maxAppointments"
                  value={availability.maxDailyAppointments}
                  onChange={(e) => setAvailability(prev => ({ ...prev, maxDailyAppointments: parseInt(e.target.value) || 8 }))}
                  min="1"
                  max="20"
                  className="input-premium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Booking Settings */}
        <div className="card-premium">
          <div className="p-6">
            <h2 className="heading-section mb-4">Booking Settings</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-body-sm font-medium text-gray-700">Auto-confirm appointments</span>
                <input
                  type="checkbox"
                  checked={availability.autoConfirmAppointments}
                  onChange={(e) => setAvailability(prev => ({ ...prev, autoConfirmAppointments: e.target.checked }))}
                  className="toggle-switch"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-body-sm font-medium text-gray-700">Block emergency slots</span>
                <input
                  type="checkbox"
                  checked={availability.blockEmergencySlots}
                  onChange={(e) => setAvailability(prev => ({ ...prev, blockEmergencySlots: e.target.checked }))}
                  className="toggle-switch"
                />
              </label>

              <div className="pt-4 border-t border-gray-200">
                <label className="flex items-center justify-between mb-3">
                  <span className="text-body-sm font-medium text-gray-700">Vacation Mode</span>
                  <input
                    type="checkbox"
                    checked={availability.vacationMode}
                    onChange={(e) => setAvailability(prev => ({ ...prev, vacationMode: e.target.checked }))}
                    className="toggle-switch"
                  />
                </label>

                {availability.vacationMode && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="vacationStart" className="label-premium text-xs">Start Date</label>
                      <input
                        type="date"
                        id="vacationStart"
                        value={availability.vacationStart || ''}
                        onChange={(e) => setAvailability(prev => ({ ...prev, vacationStart: e.target.value }))}
                        className="input-premium text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="vacationEnd" className="label-premium text-xs">End Date</label>
                      <input
                        type="date"
                        id="vacationEnd"
                        value={availability.vacationEnd || ''}
                        onChange={(e) => setAvailability(prev => ({ ...prev, vacationEnd: e.target.value }))}
                        className="input-premium text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Exceptions */}
        <div className="card-premium">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-section">Exceptions</h2>
              <button
                onClick={() => setShowExceptionModal(true)}
                className="btn-premium-ghost text-sm flex items-center space-x-1"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Exception</span>
              </button>
            </div>
            
            {availability.exceptions.length === 0 ? (
              <p className="text-body-sm text-gray-500 text-center py-8">
                No exceptions added yet
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availability.exceptions.map((exception, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-body-sm font-medium">
                        {new Date(exception.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-600">{exception.reason}</p>
                    </div>
                    <button
                      onClick={() => removeException(index)}
                      className="text-red-600 hover:text-red-700 ml-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="card-premium">
        <div className="p-6">
          <h2 className="heading-section mb-6">Weekly Schedule</h2>
          
          <div className="space-y-4">
            {availability.regularHours.map((day, dayIndex) => (
              <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={day.isAvailable}
                        onChange={() => toggleDayAvailability(dayIndex)}
                        className="form-checkbox"
                      />
                      <span className="ml-2 font-medium text-gray-900">{day.day}</span>
                    </label>
                    {day.isAvailable && (
                      <button
                        onClick={() => copyToAllWeekdays(dayIndex)}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                        title="Copy to all weekdays"
                      >
                        <ArrowPathIcon className="w-3 h-3" />
                        <span>Copy to weekdays</span>
                      </button>
                    )}
                  </div>
                  
                  {day.isAvailable && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => addBreak(dayIndex)}
                        className="text-sm text-gray-600 hover:text-gray-700 flex items-center space-x-1"
                      >
                        <PauseIcon className="w-4 h-4" />
                        <span>Add Break</span>
                      </button>
                      <button
                        onClick={() => addTimeSlot(dayIndex)}
                        className="btn-premium-ghost text-xs flex items-center space-x-1"
                      >
                        <PlusIcon className="w-3 h-3" />
                        <span>Add Slot</span>
                      </button>
                    </div>
                  )}
                </div>

                {day.isAvailable && (
                  <div className="space-y-2">
                    {day.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center space-x-2">
                        {slot.isBreak && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Break</span>
                        )}
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'start', e.target.value)}
                          className="input-premium text-sm w-24"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'end', e.target.value)}
                          className="input-premium text-sm w-24"
                        />
                        <button
                          onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {day.slots.length === 0 && (
                      <p className="text-xs text-gray-500 italic">No time slots added</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exception Modal */}
      {showExceptionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-premium max-w-lg w-full animate-scaleIn">
            <div className="p-6">
              <h3 className="heading-section mb-4">Add Exception Date</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="exceptionDate" className="label-premium">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="exceptionDate"
                    value={exceptionForm.date}
                    onChange={(e) => setExceptionForm(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-premium"
                  />
                </div>

                <div>
                  <label htmlFor="exceptionReason" className="label-premium">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="exceptionReason"
                    value={exceptionForm.reason}
                    onChange={(e) => setExceptionForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="input-premium"
                    placeholder="e.g., Conference, Personal day, Holiday"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exceptionForm.isUnavailable}
                      onChange={(e) => setExceptionForm(prev => ({ ...prev, isUnavailable: e.target.checked }))}
                      className="form-checkbox"
                    />
                    <span className="ml-2 text-body-sm">Unavailable all day</span>
                  </label>
                </div>

                {!exceptionForm.isUnavailable && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-body-sm text-gray-600 mb-2">
                      Custom availability for this date can be configured after saving.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowExceptionModal(false);
                    setExceptionForm({
                      date: '',
                      reason: '',
                      isUnavailable: true,
                      customSlots: []
                    });
                  }}
                  className="btn-premium-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddException}
                  className="btn-premium-primary"
                >
                  Add Exception
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Notice */}
      <div className="mt-8 card-premium bg-blue-50 border-blue-200 p-6">
        <div className="flex items-start">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Availability Tips</h3>
            <ul className="text-body-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Your availability will be used for online booking and scheduling</li>
              <li>Buffer time helps prevent back-to-back appointments</li>
              <li>Exception dates override your regular schedule</li>
              <li>Vacation mode blocks all new appointments during the specified period</li>
              <li>Existing appointments will not be affected by availability changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManagement;