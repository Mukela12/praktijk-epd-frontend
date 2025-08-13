# PraktijkEPD Frontend Implementation Plan
## Complete Guide for Frontend Developers

---

## 📋 **Table of Contents**
1. [Project Overview](#project-overview)
2. [Current State Analysis](#current-state-analysis)
3. [Natalie's Vision & UI Specifications](#natalies-vision--ui-specifications)
4. [Implementation Phases](#implementation-phases)
5. [Detailed Feature Specifications](#detailed-feature-specifications)
6. [UI/UX Design Guidelines](#uiux-design-guidelines)
7. [Technical Implementation Details](#technical-implementation-details)
8. [File Structure & Architecture](#file-structure--architecture)
9. [Testing Requirements](#testing-requirements)
10. [Deployment Considerations](#deployment-considerations)

---

## 🎯 **Project Overview**

PraktijkEPD is a comprehensive Electronic Patient Dossier (EPD) system for Dutch healthcare practices, specifically designed for psychological therapy practices. The system serves multiple user roles with distinct interfaces and workflows.

### **Key Stakeholders:**
- **Clients**: Patients seeking therapy services
- **Therapists**: Licensed practitioners providing therapy
- **Assistants**: Administrative staff handling scheduling and client support
- **Bookkeepers**: Financial staff managing invoicing and payments
- **Administrators**: System administrators with full access
- **Substitutes**: Temporary therapists with limited access

### **Core Business Goals:**
- Streamline patient management and therapy workflows
- Ensure GDPR compliance for Dutch healthcare
- Optimize therapist-client matching and scheduling
- Provide comprehensive financial management
- Enable efficient communication between all stakeholders

---

## 📊 **Current State Analysis**

### **What's Already Working:**
✅ **Authentication System**: Complete with 2FA, role-based access
✅ **Basic Dashboards**: All roles have functional dashboards
✅ **Appointment Management**: Booking, rescheduling, viewing
✅ **Client Management**: Basic CRUD operations
✅ **Message System**: Internal messaging between users
✅ **Financial Overview**: Basic invoice and payment tracking
✅ **Responsive Design**: Mobile-friendly layouts
✅ **Real API Integration**: No mock data dependencies

### **Current Tech Stack:**
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: Zustand for authentication
- **Routing**: React Router v6
- **Icons**: Heroicons v2
- **HTTP Client**: Fetch API with custom service layer
- **Build Tool**: Vite
- **Package Manager**: npm

### **Current File Structure:**
```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components (DashboardLayout, etc.)
│   └── ui/                # Reusable UI components
├── contexts/
│   └── LanguageContext.tsx   # i18n context
├── hooks/
│   └── useApi.ts          # API hooks for data fetching
├── pages/
│   ├── auth/              # Login, register pages
│   └── roles/             # Role-based page sections
│       ├── admin/         # Admin dashboard and management
│       ├── client/        # Client portal
│       ├── therapist/     # Therapist workspace
│       ├── assistant/     # Assistant tools
│       └── bookkeeper/    # Financial management
├── services/
│   ├── api.ts             # Legacy API service
│   └── realApi.ts         # Current API service
├── store/
│   └── authStore.tsx      # Zustand authentication store
└── types/                 # TypeScript type definitions
```

---

## 🎨 **Natalie's Vision & UI Specifications**

### **Design Philosophy:**
Natalie envisions a **modern, intuitive, and efficient** interface that prioritizes:
1. **Visual Clarity**: Clear information hierarchy with consistent color coding
2. **Workflow Optimization**: Minimal clicks to complete common tasks
3. **Smart Automation**: Intelligent suggestions and auto-pairing algorithms
4. **Professional Aesthetics**: Clean, healthcare-appropriate design
5. **Accessibility**: WCAG 2.1 AA compliance for inclusive design

### **Key Visual Elements:**

#### **Color Coding System (Critical Requirement):**
```css
/* Client Status Colors */
.client-new { @apply bg-yellow-100 text-yellow-800 border-yellow-200; }
.client-viewed { @apply bg-blue-100 text-blue-800 border-blue-200; }
.client-scheduled { @apply bg-purple-100 text-purple-800 border-purple-200; }
.client-starting { @apply bg-orange-100 text-orange-800 border-orange-200; }
.client-active { @apply bg-green-100 text-green-800 border-green-200; }
.client-discontinued { @apply bg-red-100 text-red-800 border-red-200; }
.client-completed { @apply bg-gray-100 text-gray-800 border-gray-200; }
.client-archived { @apply bg-slate-100 text-slate-800 border-slate-200; }

/* Appointment Status Colors */
.appointment-scheduled { @apply bg-sky-100 text-sky-800 border-sky-200; }
.appointment-confirmed { @apply bg-emerald-100 text-emerald-800 border-emerald-200; }
.appointment-completed { @apply bg-violet-100 text-violet-800 border-violet-200; }
.appointment-cancelled { @apply bg-rose-100 text-rose-800 border-rose-200; }
.appointment-no-show { @apply bg-amber-100 text-amber-800 border-amber-200; }
.appointment-rescheduled { @apply bg-orange-100 text-orange-800 border-orange-200; }

/* Priority/Urgency Colors */
.priority-low { @apply bg-gray-100 text-gray-800 border-gray-200; }
.priority-normal { @apply bg-blue-100 text-blue-800 border-blue-200; }
.priority-high { @apply bg-orange-100 text-orange-800 border-orange-200; }
.priority-urgent { @apply bg-red-100 text-red-800 border-red-200; }
.priority-critical { @apply bg-red-200 text-red-900 border-red-300; }

/* Financial Status Colors */
.invoice-draft { @apply bg-gray-100 text-gray-800 border-gray-200; }
.invoice-sent { @apply bg-blue-100 text-blue-800 border-blue-200; }
.invoice-paid { @apply bg-green-100 text-green-800 border-green-200; }
.invoice-overdue { @apply bg-red-100 text-red-800 border-red-200; }
.invoice-cancelled { @apply bg-gray-200 text-gray-600 border-gray-300; }
```

#### **Typography Hierarchy:**
```css
/* Headings */
.heading-primary { @apply text-3xl font-bold text-gray-900 tracking-tight; }
.heading-secondary { @apply text-2xl font-semibold text-gray-800; }
.heading-tertiary { @apply text-xl font-medium text-gray-800; }
.heading-section { @apply text-lg font-semibold text-gray-900; }

/* Body Text */
.text-body { @apply text-base text-gray-700 leading-relaxed; }
.text-small { @apply text-sm text-gray-600; }
.text-caption { @apply text-xs text-gray-500; }

/* Emphasis */
.text-emphasis { @apply font-medium text-gray-900; }
.text-muted { @apply text-gray-500; }
.text-success { @apply text-green-600 font-medium; }
.text-warning { @apply text-orange-600 font-medium; }
.text-error { @apply text-red-600 font-medium; }
```

#### **Spacing & Layout Standards:**
```css
/* Card Components */
.card-standard { @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6; }
.card-elevated { @apply bg-white rounded-xl shadow-lg border border-gray-100 p-6; }
.card-interactive { @apply hover:shadow-md hover:-translate-y-0.5 transition-all duration-200; }

/* Grid Systems */
.grid-dashboard { @apply grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3; }
.grid-metrics { @apply grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4; }
.grid-actions { @apply grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4; }

/* Buttons */
.btn-primary { @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors; }
.btn-secondary { @apply bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors; }
.btn-success { @apply bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors; }
.btn-warning { @apply bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors; }
.btn-danger { @apply bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors; }
```

---

## 🗓️ **Implementation Phases**

### **Phase 1: Foundation & Color System (Week 1-2)**
**Priority: CRITICAL**

**Objectives:**
- Implement comprehensive color-coding system
- Create reusable status indicator components
- Update all existing components to use new color standards
- Establish design system documentation

**Deliverables:**
- `ColorSystem.tsx` component library
- `StatusIndicator.tsx` with all status types
- Updated Tailwind configuration
- Design system documentation

### **Phase 2: Enhanced Search & Filtering (Week 3-4)**
**Priority: HIGH**

**Objectives:**
- Global search functionality across all data types
- Advanced filtering with multiple criteria
- Search result highlighting and categorization
- Saved search presets

**Deliverables:**
- `GlobalSearch.tsx` component
- `AdvancedFilter.tsx` with multiple filter types
- Search result components with highlighting
- Filter preset management

### **Phase 3: Dashboard Modularity (Week 5-6)**
**Priority: HIGH**

**Objectives:**
- Drag-and-drop dashboard customization
- Modular widget system
- User preference storage for layouts
- Dashboard templates for different roles

**Deliverables:**
- `DashboardBuilder.tsx` with drag-and-drop
- Widget library (`MetricWidget.tsx`, `ChartWidget.tsx`, etc.)
- Layout persistence system
- Role-based dashboard templates

### **Phase 4: Calendar Enhancement (Week 7-8)**
**Priority: MEDIUM**

**Objectives:**
- Multiple calendar views (day, week, month)
- Drag-and-drop appointment rescheduling
- Calendar integration capabilities
- Recurring appointment support

**Deliverables:**
- `CalendarView.tsx` with multiple views
- Drag-and-drop appointment management
- Calendar export/import functionality
- Recurring appointment interface

### **Phase 5: Notification Center (Week 9-10)**
**Priority: MEDIUM**

**Objectives:**
- Real-time notification system
- Notification preferences and categories
- Action buttons within notifications
- Notification history and management

**Deliverables:**
- `NotificationCenter.tsx` component
- Real-time notification handling
- Notification preference management
- Action button integration

### **Phase 6: Task Management Interface (Week 11-12)**
**Priority: MEDIUM**

**Objectives:**
- Task assignment and tracking interface
- Progress visualization
- Deadline management with alerts
- Task categorization and filtering

**Deliverables:**
- `TaskManager.tsx` complete interface
- Task progress tracking components
- Deadline alert system
- Task filtering and organization

---

## 🔧 **Detailed Feature Specifications**

### **1. Color-Coding System Implementation**

#### **Component: `ColorSystem.tsx`**
```typescript
// Location: src/components/ui/ColorSystem.tsx

interface StatusConfig {
  client: Record<ClientStatus, string>;
  appointment: Record<AppointmentStatus, string>;
  priority: Record<PriorityLevel, string>;
  financial: Record<InvoiceStatus, string>;
}

export const statusColors: StatusConfig = {
  client: {
    new: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    viewed: 'bg-blue-100 text-blue-800 border-blue-200',
    scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
    starting: 'bg-orange-100 text-orange-800 border-orange-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    discontinued: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    archived: 'bg-slate-100 text-slate-800 border-slate-200'
  },
  // ... other status mappings
};

interface StatusIndicatorProps {
  type: 'client' | 'appointment' | 'priority' | 'financial';
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type,
  status,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const colorClass = statusColors[type][status as keyof typeof statusColors[typeof type]];
  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${colorClass} ${sizeClass} ${className}`}>
      {showIcon && <StatusIcon type={type} status={status} />}
      <span className="capitalize">{status.replace('_', ' ')}</span>
    </span>
  );
};
```

#### **Usage Examples:**
```typescript
// In client list component
<StatusIndicator type="client" status={client.status} />

// In appointment calendar
<StatusIndicator type="appointment" status={appointment.status} size="sm" />

// In waiting list with priority
<StatusIndicator type="priority" status={application.urgency} />
```

### **2. Enhanced Search & Filtering System**

#### **Component: `GlobalSearch.tsx`**
```typescript
// Location: src/components/search/GlobalSearch.tsx

interface SearchResult {
  id: string;
  type: 'client' | 'appointment' | 'therapist' | 'invoice';
  title: string;
  subtitle: string;
  url: string;
  relevanceScore: number;
  highlightedText?: string;
}

interface GlobalSearchProps {
  placeholder?: string;
  categories?: SearchCategory[];
  onResultSelect?: (result: SearchResult) => void;
  showRecentSearches?: boolean;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  placeholder = "Search clients, appointments, invoices...",
  categories = ['all'],
  onResultSelect,
  showRecentSearches = true
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Debounced search implementation
  const { apiCall } = useApi();
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) return;
      
      setIsLoading(true);
      const searchResults = await apiCall(() => 
        realApiService.search.globalSearch({
          query: searchQuery,
          category: selectedCategory,
          limit: 10
        })
      );
      
      if (searchResults) {
        setResults(searchResults);
      }
      setIsLoading(false);
    }, 300),
    [selectedCategory]
  );

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            debouncedSearch(e.target.value);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex space-x-2 mt-3">
        {['all', 'clients', 'appointments', 'therapists', 'invoices'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Search Results */}
      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((result) => (
                <SearchResultItem
                  key={result.id}
                  result={result}
                  query={query}
                  onClick={() => onResultSelect?.(result)}
                />
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
```

#### **Component: `AdvancedFilter.tsx`**
```typescript
// Location: src/components/search/AdvancedFilter.tsx

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface AdvancedFilterProps {
  filters: FilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
  savedPresets?: FilterPreset[];
  onSavePreset?: (name: string, filters: Record<string, any>) => void;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  filters,
  onFilterChange,
  savedPresets = [],
  onSavePreset
}) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [presetName, setPresetName] = useState('');

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    }
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFilterChange({});
  };

  const applyPreset = (preset: FilterPreset) => {
    setActiveFilters(preset.filters);
    onFilterChange(preset.filters);
  };

  return (
    <div className="space-y-4">
      {/* Filter Toggle & Summary */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Filters</span>
          {Object.keys(activeFilters).length > 0 && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {Object.keys(activeFilters).length}
            </span>
          )}
        </button>

        {Object.keys(activeFilters).length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Saved Presets */}
          {savedPresets.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saved Filters
              </label>
              <div className="flex flex-wrap gap-2">
                {savedPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <FilterControl
                key={filter.key}
                config={filter}
                value={activeFilters[filter.key]}
                onChange={(value) => updateFilter(filter.key, value)}
              />
            ))}
          </div>

          {/* Save Preset */}
          {onSavePreset && Object.keys(activeFilters).length > 0 && (
            <div className="flex items-center space-x-2 pt-4 border-t">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Save current filters as..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={() => {
                  onSavePreset(presetName, activeFilters);
                  setPresetName('');
                }}
                disabled={!presetName}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Filter Tags */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {filters.find(f => f.key === key)?.label}: {String(value)}
              <XMarkIcon
                className="ml-2 h-4 w-4 cursor-pointer hover:text-blue-600"
                onClick={() => updateFilter(key, null)}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
```

### **3. Dashboard Modularity System**

#### **Component: `DashboardBuilder.tsx`**
```typescript
// Location: src/components/dashboard/DashboardBuilder.tsx

import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'calendar' | 'activity';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  config: Record<string, any>;
  position: { x: number; y: number };
  visible: boolean;
}

interface DashboardLayout {
  id: string;
  name: string;
  role: UserRole;
  widgets: DashboardWidget[];
  isDefault: boolean;
}

export const DashboardBuilder: React.FC<{
  role: UserRole;
  onLayoutSave: (layout: DashboardLayout) => void;
}> = ({ role, onLayoutSave }) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [availableWidgets, setAvailableWidgets] = useState<WidgetTemplate[]>([]);

  // Widget catalog based on user role
  const getAvailableWidgets = useCallback((userRole: UserRole): WidgetTemplate[] => {
    const baseWidgets = [
      {
        type: 'metric',
        title: 'Active Clients',
        description: 'Number of active clients',
        sizes: ['small', 'medium'],
        roles: ['admin', 'therapist', 'assistant']
      },
      {
        type: 'chart',
        title: 'Appointment Trends',
        description: 'Weekly appointment statistics',
        sizes: ['medium', 'large'],
        roles: ['admin', 'therapist', 'bookkeeper']
      },
      {
        type: 'list',
        title: 'Recent Activity',
        description: 'Latest system activities',
        sizes: ['medium', 'large'],
        roles: ['admin', 'assistant']
      },
      {
        type: 'calendar',
        title: 'Appointment Calendar',
        description: 'Calendar view of appointments',
        sizes: ['large', 'full'],
        roles: ['admin', 'therapist', 'assistant']
      }
      // ... more widget templates
    ];

    return baseWidgets.filter(widget => widget.roles.includes(userRole));
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setWidgets((prevWidgets) => {
        const oldIndex = prevWidgets.findIndex((widget) => widget.id === active.id);
        const newIndex = prevWidgets.findIndex((widget) => widget.id === over.id);
        
        return arrayMove(prevWidgets, oldIndex, newIndex);
      });
    }
  };

  const addWidget = (template: WidgetTemplate) => {
    const newWidget: DashboardWidget = {
      id: generateId(),
      type: template.type,
      title: template.title,
      size: template.sizes[0] as any,
      config: template.defaultConfig || {},
      position: { x: 0, y: 0 },
      visible: true
    };
    
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const updateWidget = (widgetId: string, updates: Partial<DashboardWidget>) => {
    setWidgets(widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <h2 className="text-lg font-semibold">Dashboard Builder</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              editMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {editMode ? 'Exit Edit' : 'Edit Layout'}
          </button>
          {editMode && (
            <button
              onClick={() => onLayoutSave({
                id: generateId(),
                name: `${role} Dashboard`,
                role,
                widgets,
                isDefault: false
              })}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Save Layout
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Widget Sidebar (Edit Mode) */}
        {editMode && (
          <div className="w-80 bg-gray-50 border-r p-4 overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-4">Available Widgets</h3>
            <div className="space-y-3">
              {availableWidgets.map((template) => (
                <div
                  key={template.type}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => addWidget(template)}
                >
                  <div className="flex items-center space-x-3">
                    <WidgetIcon type={template.type} />
                    <div>
                      <h4 className="font-medium text-gray-900">{template.title}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Canvas */}
        <div className="flex-1 p-6 overflow-auto">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={widgets} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-12 gap-6 min-h-full">
                {widgets.map((widget) => (
                  <DashboardWidget
                    key={widget.id}
                    widget={widget}
                    editMode={editMode}
                    onUpdate={(updates) => updateWidget(widget.id, updates)}
                    onRemove={() => removeWidget(widget.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};
```

### **4. Calendar Enhancement System**

#### **Component: `CalendarView.tsx`**
```typescript
// Location: src/components/calendar/CalendarView.tsx

type CalendarViewType = 'day' | 'week' | 'month' | 'agenda';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'appointment' | 'break' | 'unavailable' | 'personal';
  client?: {
    id: string;
    name: string;
    phone?: string;
  };
  therapist?: {
    id: string;
    name: string;
  };
  status: AppointmentStatus;
  location?: string;
  notes?: string;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
}

export const CalendarView: React.FC<{
  events: CalendarEvent[];
  viewType: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onEventUpdate: (event: CalendarEvent) => void;
  onEventCreate: (event: Partial<CalendarEvent>) => void;
  canEdit?: boolean;
  showTimeSlots?: boolean;
}> = ({
  events,
  viewType,
  onViewChange,
  onEventUpdate,
  onEventCreate,
  canEdit = false,
  showTimeSlots = true
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  // Calendar navigation
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setSelectedDate(newDate);
  };

  // Drag and drop handlers
  const handleEventDrop = (event: CalendarEvent, newStart: Date, newEnd: Date) => {
    if (!canEdit) return;
    
    const updatedEvent = {
      ...event,
      start: newStart,
      end: newEnd
    };
    
    onEventUpdate(updatedEvent);
  };

  const handleTimeSlotClick = (date: Date) => {
    if (!canEdit) return;
    
    const newEvent: Partial<CalendarEvent> = {
      start: date,
      end: new Date(date.getTime() + 50 * 60 * 1000), // 50 minutes default
      type: 'appointment',
      status: 'scheduled'
    };
    
    onEventCreate(newEvent);
  };

  // Get events for current view
  const getEventsForView = (): CalendarEvent[] => {
    const start = getViewStart(selectedDate, viewType);
    const end = getViewEnd(selectedDate, viewType);
    
    return events.filter(event => 
      event.start >= start && event.start <= end
    );
  };

  const renderViewContent = () => {
    switch (viewType) {
      case 'day':
        return (
          <DayView
            date={selectedDate}
            events={getEventsForView()}
            onEventClick={setSelectedEvent}
            onEventDrop={handleEventDrop}
            onTimeSlotClick={handleTimeSlotClick}
            showTimeSlots={showTimeSlots}
            canEdit={canEdit}
          />
        );
      case 'week':
        return (
          <WeekView
            startDate={getWeekStart(selectedDate)}
            events={getEventsForView()}
            onEventClick={setSelectedEvent}
            onEventDrop={handleEventDrop}
            onTimeSlotClick={handleTimeSlotClick}
            showTimeSlots={showTimeSlots}
            canEdit={canEdit}
          />
        );
      case 'month':
        return (
          <MonthView
            date={selectedDate}
            events={getEventsForView()}
            onEventClick={setSelectedEvent}
            onDateClick={(date) => {
              setSelectedDate(date);
              onViewChange('day');
            }}
            canEdit={canEdit}
          />
        );
      case 'agenda':
        return (
          <AgendaView
            events={getEventsForView()}
            onEventClick={setSelectedEvent}
            canEdit={canEdit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateCalendar('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateCalendar('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {formatCalendarTitle(selectedDate, viewType)}
          </h2>
        </div>

        {/* View Selector */}
        <div className="flex items-center space-x-2">
          {(['day', 'week', 'month', 'agenda'] as CalendarViewType[]).map((view) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewType === view
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {canEdit && (
            <button
              onClick={() => setShowEventModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Appointment</span>
            </button>
          )}
          
          <CalendarActions
            selectedDate={selectedDate}
            events={getEventsForView()}
            onExport={() => {/* Export functionality */}}
            onPrint={() => {/* Print functionality */}}
          />
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        {renderViewContent()}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          onSave={(event) => {
            if (selectedEvent) {
              onEventUpdate(event);
            } else {
              onEventCreate(event);
            }
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onCancel={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          canEdit={canEdit}
        />
      )}
    </div>
  );
};
```

### **5. Notification Center System**

#### **Component: `NotificationCenter.tsx`**
```typescript
// Location: src/components/notifications/NotificationCenter.tsx

interface Notification {
  id: string;
  type: 'appointment' | 'payment' | 'system' | 'message' | 'task' | 'security';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: Date;
  readAt?: Date;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
}

export const NotificationCenter: React.FC<{
  onNotificationAction?: (notification: Notification, action: string) => void;
}> = ({ onNotificationAction }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('unread');
  const [isLoading, setIsLoading] = useState(false);

  // Real-time notification updates
  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/stream');
    
    eventSource.onmessage = (event) => {
      const newNotification: Notification = JSON.parse(event.data);
      setNotifications(prev => [newNotification, ...prev]);
      
      // Show browser notification for high priority
      if (newNotification.priority === 'urgent' || newNotification.priority === 'high') {
        showBrowserNotification(newNotification);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await realApiService.notifications.getNotifications({
        filter,
        limit: 50
      });
      
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      await realApiService.notifications.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await realApiService.notifications.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Dismiss notification
  const dismissNotification = async (notificationId: string) => {
    try {
      await realApiService.notifications.dismiss(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isDismissed: true } : n)
      );
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (notification.isDismissed) return false;
    
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'important':
        return notification.priority === 'high' || notification.priority === 'urgent';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead && !n.isDismissed).length;

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1">
              {[
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'important', label: 'Important', count: notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      filter === tab.key ? 'bg-blue-200' : 'bg-gray-200'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 mt-2"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-80">
            {isLoading ? (
              <div className="p-4 text-center">
                <LoadingSpinner size="medium" />
              </div>
            ) : filteredNotifications.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => markAsRead(notification.id)}
                    onDismiss={() => dismissNotification(notification.id)}
                    onAction={(action) => onNotificationAction?.(notification, action)}
                  />
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Notification Item Component
const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: () => void;
  onDismiss: () => void;
  onAction: (action: string) => void;
}> = ({ notification, onMarkAsRead, onDismiss, onAction }) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return <CalendarIcon className="h-5 w-5 text-blue-500" />;
      case 'payment':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
      case 'message':
        return <ChatBubbleLeftIcon className="h-5 w-5 text-purple-500" />;
      case 'task':
        return <CheckCircleIcon className="h-5 w-5 text-orange-500" />;
      case 'security':
        return <ShieldExclamationIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-l-red-500';
      case 'high':
        return 'bg-orange-50 border-l-orange-500';
      case 'normal':
        return 'bg-blue-50 border-l-blue-500';
      default:
        return 'bg-gray-50 border-l-gray-500';
    }
  };

  return (
    <li
      className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
      onClick={() => !notification.isRead && onMarkAsRead()}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
              {notification.title}
            </p>
            <div className="flex items-center space-x-2">
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatRelativeTime(notification.createdAt)}
            </span>
            
            {notification.actionLabel && notification.actionUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('navigate');
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {notification.actionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};
```

### **6. Task Management Interface**

#### **Component: `TaskManager.tsx`**
```typescript
// Location: src/components/tasks/TaskManager.tsx

interface Task {
  id: string;
  title: string;
  description?: string;
  taskType: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'waiting' | 'completed' | 'cancelled';
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  dueDate?: Date;
  completedAt?: Date;
  estimatedMinutes?: number;
  actualMinutes?: number;
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  createdAt: Date;
  updatedAt: Date;
}

export const TaskManager: React.FC<{
  userRole: UserRole;
  userId: string;
}> = ({ userRole, userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'created'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created' | 'updated'>('dueDate');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Load tasks
  const loadTasks = useCallback(async () => {
    try {
      const response = await realApiService.tasks.getTasks({
        assignedTo: filterStatus === 'assigned' ? userId : undefined,
        createdBy: filterStatus === 'created' ? userId : undefined,
        sortBy,
        include: ['assignedTo', 'createdBy', 'comments']
      });
      
      if (response.success) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, [userId, filterStatus, sortBy]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Create task
  const createTask = async (taskData: Partial<Task>) => {
    try {
      const response = await realApiService.tasks.createTask(taskData);
      if (response.success) {
        setTasks([response.data, ...tasks]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // Update task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await realApiService.tasks.updateTask(taskId, updates);
      if (response.success) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    switch (filterStatus) {
      case 'assigned':
        return task.assignedTo?.id === userId;
      case 'created':
        return task.createdBy.id === userId;
      default:
        return true;
    }
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'created':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'updated':
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      default:
        return 0;
    }
  });

  // Task statistics
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'completed').length
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard
            label="Total Tasks"
            value={taskStats.total}
            color="blue"
            icon={ClipboardDocumentListIcon}
          />
          <StatCard
            label="Pending"
            value={taskStats.pending}
            color="yellow"
            icon={ClockIcon}
          />
          <StatCard
            label="In Progress"
            value={taskStats.inProgress}
            color="purple"
            icon={PlayIcon}
          />
          <StatCard
            label="Completed"
            value={taskStats.completed}
            color="green"
            icon={CheckCircleIcon}
          />
          <StatCard
            label="Overdue"
            value={taskStats.overdue}
            color="red"
            icon={ExclamationTriangleIcon}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* View Mode */}
          <div className="flex items-center space-x-2">
            {[
              { mode: 'list', icon: ListBulletIcon, label: 'List' },
              { mode: 'board', icon: Squares2X2Icon, label: 'Board' },
              { mode: 'calendar', icon: CalendarIcon, label: 'Calendar' }
            ].map((view) => (
              <button
                key={view.mode}
                onClick={() => setViewMode(view.mode as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === view.mode
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <view.icon className="h-4 w-4" />
                <span>{view.label}</span>
              </button>
            ))}
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Tasks</option>
              <option value="assigned">Assigned to Me</option>
              <option value="created">Created by Me</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="created">Created Date</option>
              <option value="updated">Last Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' && (
          <TaskListView
            tasks={sortedTasks}
            onTaskClick={setSelectedTask}
            onTaskUpdate={updateTask}
            canEdit={userRole !== 'client'}
          />
        )}
        
        {viewMode === 'board' && (
          <TaskBoardView
            tasks={sortedTasks}
            onTaskClick={setSelectedTask}
            onTaskUpdate={updateTask}
            canEdit={userRole !== 'client'}
          />
        )}
        
        {viewMode === 'calendar' && (
          <TaskCalendarView
            tasks={sortedTasks}
            onTaskClick={setSelectedTask}
            onTaskUpdate={updateTask}
            canEdit={userRole !== 'client'}
          />
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <TaskCreateModal
          onSave={createTask}
          onCancel={() => setShowCreateModal(false)}
          currentUser={{ id: userId, role: userRole }}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onUpdate={(updates) => updateTask(selectedTask.id, updates)}
          onClose={() => setSelectedTask(null)}
          canEdit={userRole !== 'client'}
        />
      )}
    </div>
  );
};
```

---

## 🎨 **UI/UX Design Guidelines**

### **Design Principles:**
1. **Consistency**: Use standardized components, colors, and spacing
2. **Accessibility**: WCAG 2.1 AA compliance with proper contrast and keyboard navigation
3. **Performance**: Optimize for quick loading and smooth interactions
4. **Mobile-First**: Responsive design that works on all device sizes
5. **User-Centric**: Minimize cognitive load and optimize common workflows

### **Component Library Structure:**
```
src/components/
├── ui/                     # Base UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   ├── Form/
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── DatePicker.tsx
│   │   └── FileUpload.tsx
│   └── StatusIndicator.tsx
├── layout/                 # Layout components
│   ├── DashboardLayout.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── Breadcrumb.tsx
├── features/               # Feature-specific components
│   ├── appointments/
│   ├── clients/
│   ├── notifications/
│   ├── search/
│   └── tasks/
└── charts/                 # Data visualization components
    ├── LineChart.tsx
    ├── BarChart.tsx
    └── PieChart.tsx
```

### **Responsive Breakpoints:**
```css
/* Tailwind CSS breakpoints used */
sm: 640px     /* Small devices */
md: 768px     /* Medium devices */
lg: 1024px    /* Large devices */
xl: 1280px    /* Extra large devices */
2xl: 1536px   /* 2X Large devices */
```

### **Animation Guidelines:**
```css
/* Standard transitions */
.transition-standard { @apply transition-all duration-200 ease-in-out; }
.transition-slow { @apply transition-all duration-300 ease-in-out; }
.transition-fast { @apply transition-all duration-150 ease-in-out; }

/* Hover effects */
.hover-lift { @apply hover:-translate-y-0.5 hover:shadow-md transition-all duration-200; }
.hover-scale { @apply hover:scale-105 transition-transform duration-200; }

/* Loading states */
.pulse { @apply animate-pulse; }
.spin { @apply animate-spin; }
```

---

## ⚙️ **Technical Implementation Details**

### **State Management Strategy:**
1. **Authentication**: Zustand store for user session and auth state
2. **API Data**: React Query for server state management and caching
3. **UI State**: React useState and useReducer for component-level state
4. **Form State**: React Hook Form for complex forms
5. **Global State**: Context API for theme, language, and app-wide settings

### **API Integration Pattern:**
```typescript
// Example API service structure
export const realApiService = {
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/auth/refresh'),
    // ... other auth methods
  },
  clients: {
    getClients: (params?) => api.get('/clients', { params }),
    getClient: (id) => api.get(`/clients/${id}`),
    createClient: (data) => api.post('/clients', data),
    updateClient: (id, data) => api.put(`/clients/${id}`, data),
    // ... other client methods
  },
  appointments: {
    getAppointments: (params?) => api.get('/appointments', { params }),
    createAppointment: (data) => api.post('/appointments', data),
    updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
    // ... other appointment methods
  },
  // ... other service modules
};
```

### **Performance Optimization:**
1. **Code Splitting**: Lazy load route components and large feature modules
2. **Memoization**: Use React.memo, useMemo, and useCallback for expensive operations
3. **Virtual Scrolling**: Implement for large lists (1000+ items)
4. **Image Optimization**: Lazy loading and WebP format support
5. **Bundle Analysis**: Regular analysis to prevent bundle bloat

### **Error Handling Strategy:**
```typescript
// Global error boundary
export const AppErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log to monitoring service
        console.error('Application error:', error, errorInfo);
      }}
      onReset={() => {
        // Clear error state and reload
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// API error handling
const handleApiError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Show access denied message
    showToast('Access denied', 'error');
  } else {
    // Generic error handling
    showToast('Something went wrong', 'error');
  }
};
```

---

## 📁 **File Structure & Architecture**

### **Recommended Project Structure:**
```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── index.ts        # Export barrel
│   ├── layout/             # Layout components
│   ├── features/           # Feature-specific components
│   │   ├── appointments/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── clients/
│   │   └── notifications/
│   └── charts/             # Data visualization
├── hooks/
│   ├── useApi.ts
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
├── services/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   └── index.ts
│   ├── storage.ts
│   └── notifications.ts
├── store/
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── index.ts
├── pages/
│   ├── auth/
│   ├── dashboard/
│   └── roles/
├── types/
│   ├── api.ts
│   ├── auth.ts
│   ├── common.ts
│   └── index.ts
├── utils/
│   ├── format.ts
│   ├── validation.ts
│   ├── constants.ts
│   └── helpers.ts
├── styles/
│   ├── globals.css
│   ├── components.css
│   └── utilities.css
└── lib/
    ├── config.ts
    ├── constants.ts
    └── env.ts
```

### **Component Organization Pattern:**
```typescript
// Example: Button component structure
src/components/ui/Button/
├── Button.tsx              # Main component
├── Button.test.tsx         # Unit tests
├── Button.stories.tsx      # Storybook stories
├── Button.module.css       # Component-specific styles (if needed)
├── types.ts                # Component-specific types
└── index.ts                # Export barrel

// Button.tsx
export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ ... }) => {
  // Component implementation
};

// index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

---

## 🧪 **Testing Requirements**

### **Testing Strategy:**
1. **Unit Tests**: Jest + React Testing Library for component testing
2. **Integration Tests**: Test component interactions and API integration
3. **E2E Tests**: Playwright for critical user workflows
4. **Visual Regression**: Chromatic for UI consistency
5. **Performance Tests**: Lighthouse CI for performance metrics

### **Test Coverage Requirements:**
- **Components**: 80% minimum coverage
- **Utilities**: 90% minimum coverage
- **API Services**: 85% minimum coverage
- **Critical Workflows**: 100% E2E test coverage

### **Example Test Structure:**
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button variant="primary" size="md">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const mockClick = jest.fn();
    render(
      <Button variant="primary" size="md" onClick={mockClick}>
        Click me
      </Button>
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    render(
      <Button variant="primary" size="md" loading>
        Click me
      </Button>
    );
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 🚀 **Deployment Considerations**

### **Build Optimization:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
});
```

### **Environment Configuration:**
```typescript
// src/lib/config.ts
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 10000
  },
  auth: {
    tokenKey: 'praktijk_epd_token',
    refreshTokenKey: 'praktijk_epd_refresh_token'
  },
  features: {
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  }
};
```

### **PWA Configuration:**
```typescript
// vite.config.ts - PWA plugin
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'PraktijkEPD',
        short_name: 'PraktijkEPD',
        description: 'Electronic Patient Dossier for Healthcare',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

---

This comprehensive frontend implementation plan provides the foundation for developers to understand Natalie's vision and implement the required features. Each section builds upon the current codebase while introducing the necessary enhancements to create a world-class healthcare management system.

The plan prioritizes visual consistency, user experience optimization, and technical excellence while maintaining the robust foundation already established in the current implementation.