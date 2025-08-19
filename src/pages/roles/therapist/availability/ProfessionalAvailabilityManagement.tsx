import React, { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BellAlertIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import realApiService from '@/services/realApi';

// Time slot interface
interface TimeSlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  maxClients?: number;
  location?: 'office' | 'online' | 'phone';
}

interface BlockedDate {
  id?: string;
  date: string;
  reason?: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
}

// Day names
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Time slot component
const TimeSlotCard: React.FC<{
  slot: TimeSlot,
  onEdit: () => void,
  onDelete: () => void
}> = ({ slot, onEdit, onDelete }) => {
  const locationIcons = {
    office: '🏢',
    online: '💻',
    phone: '📞'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{dayNames[slot.dayOfWeek]}</h4>
        <span className="text-2xl">{locationIcons[slot.location || 'office']}</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
        <ClockIcon className="w-4 h-4" />
        <span>{slot.startTime} - {slot.endTime}</span>
      </div>
      {slot.maxClients && (
        <p className="text-sm text-gray-500 mb-3">Max {slot.maxClients} clients</p>
      )}
      <div className="flex space-x-2">
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-1 text-sm text-green-600 hover:bg-green-600/10 rounded transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// Calendar view for blocked dates
const BlockedDatesCalendar: React.FC<{
  blockedDates: BlockedDate[],
  onSelectDate: (date: Date) => void
}> = ({ blockedDates, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };
  
  const isBlocked = (date: Date | null) => {
    if (!date) return false;
    return blockedDates.some(blocked => {
      const blockedDate = new Date(blocked.date);
      return blockedDate.toDateString() === date.toDateString();
    });
  };
  
  const days = getDaysInMonth(currentMonth);
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentMonth(newDate);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 text-sm text-green-600 hover:bg-green-600/10 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentMonth(newDate);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
            {day}
          </div>
        ))}
        
        {days.map((date, index) => (
          <div
            key={index}
            className={`
              min-h-[40px] p-2 rounded-lg border cursor-pointer transition-all
              ${!date ? 'invisible' : ''}
              ${isBlocked(date) ? 'bg-red-50 border-red-200 text-red-700' : 'border-gray-100 hover:bg-gray-50'}
              ${date?.toDateString() === new Date().toDateString() ? 'ring-2 ring-green-600' : ''}
            `}
            onClick={() => date && onSelectDate(date)}
          >
            {date && (
              <div className="text-sm text-center">
                {date.getDate()}
                {isBlocked(date) && (
                  <div className="w-1 h-1 bg-red-500 rounded-full mx-auto mt-1" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfessionalAvailabilityManagement: React.FC = () => {
  const { t } = useTranslation();
  
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showAddBlocked, setShowAddBlocked] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  
  // Form states
  const [newSlot, setNewSlot] = useState<TimeSlot>({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true,
    location: 'office'
  });
  
  const [newBlocked, setNewBlocked] = useState<BlockedDate>({
    date: new Date().toISOString().split('T')[0],
    reason: '',
    allDay: true
  });

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data - replace with actual API calls
      const mockSlots: TimeSlot[] = [
        { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isRecurring: true, location: 'office', maxClients: 6 },
        { id: '2', dayOfWeek: 2, startTime: '10:00', endTime: '18:00', isRecurring: true, location: 'office', maxClients: 6 },
        { id: '3', dayOfWeek: 3, startTime: '09:00', endTime: '15:00', isRecurring: true, location: 'online', maxClients: 4 },
        { id: '4', dayOfWeek: 4, startTime: '11:00', endTime: '19:00', isRecurring: true, location: 'office', maxClients: 6 },
        { id: '5', dayOfWeek: 5, startTime: '09:00', endTime: '16:00', isRecurring: true, location: 'office', maxClients: 5 }
      ];
      
      const mockBlocked: BlockedDate[] = [
        { id: '1', date: '2025-01-25', reason: 'Personal day', allDay: true },
        { id: '2', date: '2025-02-01', reason: 'Conference', allDay: true },
        { id: '3', date: '2025-02-14', reason: 'Holiday', allDay: true }
      ];
      
      setTimeSlots(mockSlots);
      setBlockedDates(mockBlocked);
    } catch (error) {
      console.error('Error loading availability:', error);
      setError('Failed to load availability. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlot = () => {
    const id = Date.now().toString();
    setTimeSlots([...timeSlots, { ...newSlot, id }]);
    setShowAddSlot(false);
    setNewSlot({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: true,
      location: 'office'
    });
  };

  const handleDeleteSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const handleAddBlocked = () => {
    const id = Date.now().toString();
    setBlockedDates([...blockedDates, { ...newBlocked, id }]);
    setShowAddBlocked(false);
    setNewBlocked({
      date: new Date().toISOString().split('T')[0],
      reason: '',
      allDay: true
    });
  };

  const handleDeleteBlocked = (id: string) => {
    setBlockedDates(blockedDates.filter(date => date.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading availability..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Availability</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadAvailability}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Group time slots by day
  const slotsByDay = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = [];
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<number, TimeSlot[]>);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Availability Management</h1>
            <p className="text-gray-600 mt-1">Configure your working hours and blocked dates</p>
          </div>
          <button
            onClick={loadAvailability}
            className="p-2 text-gray-600 hover:text-green-600 transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Working Hours</h2>
            <button
              onClick={() => setShowAddSlot(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Time Slot
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(slotsByDay).map(([day, slots]) => (
              <div key={day}>
                {slots.map(slot => (
                  <TimeSlotCard
                    key={slot.id}
                    slot={slot}
                    onEdit={() => {
                      setEditingSlot(slot);
                      setShowAddSlot(true);
                    }}
                    onDelete={() => handleDeleteSlot(slot.id!)}
                  />
                ))}
              </div>
            ))}
          </div>

          {timeSlots.length === 0 && (
            <div className="text-center py-8">
              <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No working hours configured</p>
            </div>
          )}
        </div>

        {/* Blocked Dates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BlockedDatesCalendar 
            blockedDates={blockedDates}
            onSelectDate={(date) => {
              setNewBlocked({
                ...newBlocked,
                date: date.toISOString().split('T')[0]
              });
              setShowAddBlocked(true);
            }}
          />
          
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Blocked Dates</h3>
              <button
                onClick={() => setShowAddBlocked(true)}
                className="flex items-center px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Block Date
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {blockedDates.map(blocked => (
                <div key={blocked.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(blocked.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    {blocked.reason && (
                      <p className="text-sm text-gray-600">{blocked.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteBlocked(blocked.id!)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              {blockedDates.length === 0 && (
                <p className="text-center text-gray-500 py-4">No blocked dates</p>
              )}
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div className="flex items-center">
                <BellAlertIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Appointment Reminders</p>
                  <p className="text-sm text-gray-600">Send reminders 24 hours before appointments</p>
                </div>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </label>
            
            <label className="flex items-center justify-between">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Schedule Changes</p>
                  <p className="text-sm text-gray-600">Notify clients of schedule changes</p>
                </div>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </label>
          </div>
        </div>

        {/* Add Time Slot Modal */}
        {showAddSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">
                {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={newSlot.dayOfWeek}
                    onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    {dayNames.map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={newSlot.location}
                    onChange={(e) => setNewSlot({ ...newSlot, location: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="office">Office</option>
                    <option value="online">Online</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Clients
                  </label>
                  <input
                    type="number"
                    value={newSlot.maxClients || ''}
                    onChange={(e) => setNewSlot({ ...newSlot, maxClients: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="No limit"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddSlot(false);
                    setEditingSlot(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSlot}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  {editingSlot ? 'Update' : 'Add'} Time Slot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Blocked Date Modal */}
        {showAddBlocked && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Block Date</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newBlocked.date}
                    onChange={(e) => setNewBlocked({ ...newBlocked, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason (optional)
                  </label>
                  <input
                    type="text"
                    value={newBlocked.reason}
                    onChange={(e) => setNewBlocked({ ...newBlocked, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="e.g., Holiday, Conference, Personal day"
                  />
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newBlocked.allDay}
                    onChange={(e) => setNewBlocked({ ...newBlocked, allDay: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">All day</span>
                </label>
                
                {!newBlocked.allDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newBlocked.startTime || ''}
                        onChange={(e) => setNewBlocked({ ...newBlocked, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newBlocked.endTime || ''}
                        onChange={(e) => setNewBlocked({ ...newBlocked, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddBlocked(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBlocked}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Block Date
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ProfessionalAvailabilityManagement;