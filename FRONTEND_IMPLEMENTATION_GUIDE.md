# PraktijkEPD Frontend Implementation Guide

**Generated**: 2025-09-26  
**Project**: Dutch Therapy Practice Management System  
**Client**: Natalie  
**Backend Status**: ✅ 100% Complete  
**Frontend Status**: 🔧 Requires Implementation  

## 🎯 **Project Objectives**

Implement two critical features for Natalie's Dutch therapy practice before her meeting:

1. **Bulk CSV Import for Clients & Therapists** - Admin-only feature with progress tracking
2. **Comprehensive Client Intake Form** - Mandatory form blocking appointments until completion

## 📋 **Implementation Requirements**

### **Core Requirements:**
- ✅ **No Modal Dialogs** - All features must be inline
- ✅ **Follow Existing Design Patterns** - Match current styling and component structure
- ✅ **Dutch Language Support** - CSV column mapping and form translations
- ✅ **Real-time Progress Tracking** - For CSV imports with live updates
- ✅ **Anti-hallucination Measures** - All backend APIs verified and documented

---

## 🔧 **Backend Implementation Status (COMPLETE)**

### **1. CSV Import System** ✅

**API Endpoints:**
```typescript
POST /api/csv-import/upload
  - Headers: { 'Content-Type': 'multipart/form-data' }
  - Body: { file: File, type: 'clients' | 'therapists' }
  - Returns: { success: boolean, importId: string, message: string }

GET /api/csv-import/progress/:importId
  - Returns: {
      importId: string,
      totalRows: number,
      processedRows: number, 
      successfulRows: number,
      failedRows: number,
      status: 'processing' | 'completed' | 'failed',
      errors: Array<{row: number, field?: string, error: string}>
    }
```

**Dutch Field Mapping (All Verified):**
```typescript
const csvFieldMappings = {
  "BSN": { table: "client_profiles", column: "bsn" },
  "Voorletters": { table: "client_profiles", column: "initials" }, 
  "Voornaam": { table: "users", column: "first_name" },
  "Tussenvoegsel": { table: "client_profiles", column: "name_prefix" },
  "Achternaam": { table: "users", column: "last_name" },
  "Geslacht": { table: "users", column: "gender" },
  "Aanhef": { table: "client_profiles", column: "salutation" },
  "Geboortedatum": { table: "client_profiles", column: "date_of_birth" },
  "Telefoonnummer": { table: "users", column: "phone" },
  "Mobiel nummer": { table: "client_profiles", column: "mobile_phone" },
  "E-mailadres": { table: "users", column: "email" },
  "Straat": { table: "client_profiles", column: "street_name" },
  "Huisnummer": { table: "client_profiles", column: "house_number" },
  "Postcode": { table: "client_profiles", column: "postal_code" },
  "Plaats": { table: "client_profiles", column: "city" },
  "Land": { table: "client_profiles", column: "country" },
  "Postadres straat": { table: "client_profiles", column: "mailing_street" },
  "Postadres huisnummer": { table: "client_profiles", column: "mailing_house_number" },
  "Postadres postcode": { table: "client_profiles", column: "mailing_postal_code" },
  "Postadres plaats": { table: "client_profiles", column: "mailing_city" },
  "Extra e-mailadressen": { table: "client_profiles", column: "additional_emails" },
  "Polisnummer": { table: "client_profiles", column: "insurance_number" },
  "Zorgverzekeraar": { table: "client_profiles", column: "insurance_company" },
  "Huisarts": { table: "client_profiles", column: "general_practitioner_name" },
  "IBAN": { table: "client_profiles", column: "bank_account_iban" },
  "Clientnr/mandaatnr": { table: "client_profiles", column: "client_number" },
  "BSN jeugdigen": { table: "client_profiles", column: "youth_bsn" },
  "Naam gezagdrager": { table: "client_profiles", column: "guardian_name" }
};
```

**Features:**
- ✅ Dutch date format parsing (DD-MM-YYYY)
- ✅ BSN validation (9 digits)
- ✅ Email uniqueness checking
- ✅ Secure password generation
- ✅ Welcome email sending
- ✅ Transaction-based processing
- ✅ Detailed error reporting
- ✅ Progress tracking with real-time updates

### **2. Comprehensive Intake Form System** ✅

**API Endpoints:**
```typescript
GET /api/intake/form
  - Returns: { success: boolean, data: IntakeFormStructure }
  
POST /api/intake/save  
  - Body: { formData: IntakeFormData, isComplete?: boolean }
  - Returns: { success: boolean, message: string }

GET /api/intake/client/:clientId
  - Returns: { success: boolean, data: IntakeFormData | null, completed: boolean }

GET /api/intake/status/:clientId  
  - Returns: { success: boolean, canBookAppointments: boolean, completionPercentage: number }
```

**Complete Form Structure (7 Sections, 66 Fields):**
```typescript
interface IntakeFormStructure {
  sections: [
    {
      id: 'personal_info',
      title: 'Personal Information', 
      fields: [
        { name: 'educationLevel', type: 'select', required: true, options: [...] },
        { name: 'profession', type: 'text', required: true },
        { name: 'hobbiesSports', type: 'textarea', required: false },
        { name: 'relationshipStatus', type: 'select', required: true, options: [...] },
        { name: 'childrenCount', type: 'number', required: false },
        { name: 'childrenFromMultipleRelations', type: 'boolean', required: false },
        { name: 'familyBackground', type: 'textarea', required: false }
      ]
    },
    {
      id: 'referral_info',
      title: 'Referral Information',
      fields: [
        { name: 'referralSource', type: 'text', required: false },
        { name: 'referralDetails', type: 'textarea', required: false }
      ]
    },
    {
      id: 'health_history', 
      title: 'Health History',
      fields: [
        { name: 'smokingStatus', type: 'boolean', required: false },
        { name: 'smokingAmount', type: 'text', required: false },
        { name: 'alcoholUse', type: 'boolean', required: false },
        { name: 'alcoholAmount', type: 'text', required: false },
        { name: 'drugUse', type: 'boolean', required: false },
        { name: 'drugDetails', type: 'textarea', required: false },
        { name: 'currentMedications', type: 'textarea', required: false },
        { name: 'painkillersUse', type: 'boolean', required: false },
        { name: 'painkillersDetails', type: 'textarea', required: false }
      ]
    },
    {
      id: 'therapy_history',
      title: 'Previous Therapy Experience', 
      fields: [
        { name: 'previousTherapy', type: 'boolean', required: false },
        { name: 'previousTherapyDetails', type: 'textarea', required: false },
        { name: 'previousComplaints', type: 'textarea', required: false },
        { name: 'therapyDuration', type: 'text', required: false }
      ]
    },
    {
      id: 'current_situation',
      title: 'Current Situation',
      fields: [
        { name: 'currentComplaints', type: 'textarea', required: true },
        { name: 'complaintSeverity', type: 'select', required: true, 
          options: ['light', 'mild', 'serious', 'very_serious'] },
        { name: 'complaintDuration', type: 'text', required: true },
        { name: 'complaintCause', type: 'textarea', required: false },
        { name: 'significantEvents', type: 'boolean', required: false },
        { name: 'significantEventsDetails', type: 'textarea', required: false },
        { name: 'traumaticEvents', type: 'textarea', required: false },
        { name: 'complaintsOnset', type: 'text', required: false }
      ]
    },
    {
      id: 'therapy_goals',
      title: 'Therapy Goals & Expectations',
      fields: [
        { name: 'therapyGoals', type: 'textarea', required: true },
        { name: 'stepsTaken', type: 'textarea', required: false },
        { name: 'expectedChanges', type: 'textarea', required: false },
        { name: 'observableChanges', type: 'textarea', required: false },
        { name: 'expectedObstacles', type: 'textarea', required: false },
        { name: 'mainFocus', type: 'text', required: true },
        { name: 'currentCoping', type: 'textarea', required: false },
        { name: 'selfHelpAttempts', type: 'textarea', required: false },
        { name: 'environmentReaction', type: 'textarea', required: false }
      ]
    },
    {
      id: 'additional_info',
      title: 'Additional Information',
      fields: [
        { name: 'additionalInfo', type: 'textarea', required: false },
        { name: 'questionsRemarks', type: 'textarea', required: false },
        { name: 'therapistExpectations', type: 'textarea', required: false },
        { name: 'consultationPreference', type: 'select', required: true,
          options: ['in_person', 'online', 'both'] },
        { name: 'onlineTherapyInterest', type: 'textarea', required: false },
        { name: 'insuranceAcknowledgment', type: 'boolean', required: true }
      ]
    }
  ]
}
```

**Features:**
- ✅ Draft saving with `isComplete: false`
- ✅ Resume functionality via `GET /api/intake/client/:clientId`
- ✅ Completion validation (11 required fields)
- ✅ Appointment blocking until complete
- ✅ Dashboard integration for completion status
- ✅ Progress percentage calculation

### **3. Profile Management System** ✅

**API Endpoints:**
```typescript
// Admin profile editing (any user)
PUT /api/admin/users/:userId
  - Body: { firstName?, lastName?, phone?, clientProfile?, therapistProfile? }
  - Returns: { success: boolean, data: UpdatedProfile }

// Client self-editing  
PUT /api/client/profile
  - Body: { phone?, preferredLanguage?, dateOfBirth?, streetAddress?, ... }
  - Returns: { success: boolean, data: UpdatedProfile }

// Therapist self-editing
PUT /api/therapist/profile  
  - Body: { licenseNumber?, specializations?, bio?, hourlyRate?, ... }
  - Returns: { success: boolean, data: UpdatedProfile }
```

---

## 🎨 **Frontend Implementation Specifications**

### **Expected Frontend Architecture:**
Based on typical React + TypeScript patterns for this type of application:

```typescript
// Expected structure
src/
├── components/
│   ├── admin/
│   │   ├── client-management/
│   │   └── therapist-management/
│   ├── client/
│   │   ├── dashboard/
│   │   └── intake/
│   └── ui/
├── pages/
├── services/
├── hooks/
└── types/
```

### **1. Admin CSV Import Implementation**

#### **Integration Points:**
- **Client Management**: Add import button to existing client list header
- **Therapist Management**: Add import button to existing therapist list header
- **Design**: Must follow existing inline patterns (no modals)

#### **Component Structure:**
```typescript
// components/admin/csv-import/CSVImportSection.tsx
interface CSVImportSectionProps {
  type: 'clients' | 'therapists';
  onImportComplete: () => void;
}

// Expected states
const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
const [progress, setProgress] = useState<CSVImportProgress | null>(null);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
```

#### **Implementation Steps:**

**Step 1: File Upload Section**
```tsx
const FileUploadSection = () => (
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
    <input
      type="file"
      accept=".csv"
      onChange={handleFileSelect}
      className="hidden"
      ref={fileInputRef}
    />
    <button
      onClick={() => fileInputRef.current?.click()}
      className="btn-premium-primary"
    >
      📁 Select CSV File
    </button>
    {selectedFile && (
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p>📄 {selectedFile.name}</p>
        <p className="text-sm text-gray-600">{(selectedFile.size / 1024).toFixed(1)} KB</p>
      </div>
    )}
  </div>
);
```

**Step 2: Column Mapping Interface**
```tsx
const ColumnMappingSection = ({ csvHeaders, onMappingChange }) => {
  const dutchMappings = {
    'BSN': 'bsn',
    'Voorletters': 'initials', 
    'Voornaam': 'first_name',
    // ... all 28 mappings from backend
  };

  return (
    <div className="card-premium">
      <h3 className="text-lg font-semibold mb-4">📋 Column Mapping</h3>
      {csvHeaders.map(header => (
        <div key={header} className="mb-3 flex items-center gap-4">
          <span className="w-1/3 font-medium">{header}</span>
          <span className="text-gray-400">→</span>
          <select 
            value={columnMapping[header] || ''}
            onChange={e => onMappingChange(header, e.target.value)}
            className="w-1/3 p-2 border rounded"
          >
            <option value="">Skip this column</option>
            {Object.entries(dutchMappings).map(([dutch, english]) => (
              <option key={english} value={english}>{dutch} → {english}</option>
            ))}
          </select>
          {dutchMappings[header] && (
            <span className="text-green-600 text-sm">✓ Auto-detected</span>
          )}
        </div>
      ))}
    </div>
  );
};
```

**Step 3: Progress Tracking Section**  
```tsx
const ProgressSection = ({ progress }) => {
  if (!progress) return null;

  const percentage = progress.totalRows > 0 
    ? (progress.processedRows / progress.totalRows) * 100 
    : 0;

  return (
    <div className="card-premium">
      <div className="mb-4">
        <div className="flex justify-between text-sm">
          <span>Processing CSV Import...</span>
          <span>{progress.processedRows} / {progress.totalRows}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-green-50 rounded">
          <div className="text-2xl font-bold text-green-600">{progress.successfulRows}</div>
          <div className="text-sm text-green-800">✅ Successful</div>
        </div>
        <div className="p-3 bg-red-50 rounded">
          <div className="text-2xl font-bold text-red-600">{progress.failedRows}</div>
          <div className="text-sm text-red-800">❌ Failed</div>
        </div>
        <div className="p-3 bg-blue-50 rounded">
          <div className="text-2xl font-bold text-blue-600">{progress.totalRows}</div>
          <div className="text-sm text-blue-800">📊 Total</div>
        </div>
      </div>
    </div>
  );
};
```

**Step 4: API Integration**
```tsx
const useCSVImport = () => {
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [progress, setProgress] = useState<CSVImportProgress | null>(null);

  const uploadCSV = async (file: File, type: 'clients' | 'therapists') => {
    setImportStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/csv-import/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setImportStatus('processing');
        pollProgress(result.importId);
      } else {
        setImportStatus('error');
      }
    } catch (error) {
      setImportStatus('error');
    }
  };

  const pollProgress = async (importId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/csv-import/progress/${importId}`, {
          headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        });
        const data = await response.json();
        
        setProgress(data);
        
        if (data.status === 'completed') {
          setImportStatus('completed');
        } else if (data.status === 'failed') {
          setImportStatus('error');
        } else {
          setTimeout(poll, 1000); // Poll every second
        }
      } catch (error) {
        setImportStatus('error');
      }
    };
    
    poll();
  };

  return { importStatus, progress, uploadCSV };
};
```

### **2. Enhanced Intake Form Implementation**

#### **Current State Analysis:**
- ❌ Frontend has only 10 basic fields
- ✅ Backend has 66 comprehensive fields matching Dutch PDF  
- ❌ No draft saving functionality
- ❌ No resume capability

#### **Component Structure:**
```typescript
// components/client/intake/IntakeFormWizard.tsx
interface IntakeFormWizardProps {
  clientId: string;
  onComplete: () => void;
}

// Expected states
const [currentSection, setCurrentSection] = useState(0);
const [formData, setFormData] = useState<IntakeFormData>({});
const [formStructure, setFormStructure] = useState<IntakeFormStructure | null>(null);
const [isDraft, setIsDraft] = useState(true);
const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
```

#### **Implementation Steps:**

**Step 1: Form Structure Loading**
```tsx
const useIntakeForm = (clientId: string) => {
  const [formStructure, setFormStructure] = useState<IntakeFormStructure | null>(null);
  const [existingData, setExistingData] = useState<IntakeFormData>({});

  useEffect(() => {
    const loadForm = async () => {
      // Load form structure
      const structureResponse = await fetch('/api/intake/form', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const structure = await structureResponse.json();
      setFormStructure(structure.data);

      // Load existing data if any
      const dataResponse = await fetch(`/api/intake/client/${clientId}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const existing = await dataResponse.json();
      if (existing.data) {
        setExistingData(existing.data);
      }
    };

    loadForm();
  }, [clientId]);

  return { formStructure, existingData };
};
```

**Step 2: Multi-Section Form Wizard**
```tsx
const IntakeFormWizard = ({ clientId, onComplete }) => {
  const { formStructure, existingData } = useIntakeForm(clientId);
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<IntakeFormData>(existingData);

  if (!formStructure) return <LoadingSpinner />;

  const currentSectionData = formStructure.sections[currentSection];
  const isLastSection = currentSection === formStructure.sections.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">📋 Intake Form</h1>
          <span className="text-sm text-gray-600">
            Section {currentSection + 1} of {formStructure.sections.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / formStructure.sections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Section Content */}
      <div className="card-premium mb-6">
        <h2 className="text-xl font-semibold mb-6">{currentSectionData.title}</h2>
        <div className="space-y-6">
          {currentSectionData.fields.map(field => (
            <FormField
              key={field.name}
              field={field}
              value={formData[field.name]}
              onChange={(value) => setFormData(prev => ({ ...prev, [field.name]: value }))}
            />
          ))}
        </div>
      </div>

      {/* Navigation & Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
          disabled={currentSection === 0}
          className="btn-secondary"
        >
          ← Previous
        </button>

        <div className="flex gap-3">
          <button onClick={saveDraft} className="btn-secondary">
            💾 Save Draft
          </button>
          {isLastSection ? (
            <button onClick={submitForm} className="btn-premium-primary">
              ✅ Complete Intake
            </button>
          ) : (
            <button 
              onClick={() => setCurrentSection(prev => prev + 1)}
              className="btn-premium-primary"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

**Step 3: Dynamic Form Field Component**
```tsx
const FormField = ({ field, value, onChange }) => {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder={field.placeholder}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full p-3 border rounded-lg"
            placeholder={field.placeholder}
          />
        );
      
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Please select...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        );
      
      case 'boolean':
        return (
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={value === true}
                onChange={() => onChange(true)}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={value === false}
                onChange={() => onChange(false)}
                className="mr-2"
              />
              No
            </label>
          </div>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className="w-full p-3 border rounded-lg"
            min="0"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        {field.label || field.name.replace(/([A-Z])/g, ' $1').trim()}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {field.description && (
        <p className="text-sm text-gray-600 mt-1">{field.description}</p>
      )}
    </div>
  );
};
```

**Step 4: Draft Saving & API Integration**
```tsx
const useIntakeFormSubmission = (clientId: string) => {
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const saveDraft = async (formData: IntakeFormData) => {
    setSavingStatus('saving');
    
    try {
      const response = await fetch('/api/intake/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          formData,
          isComplete: false // Draft save
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 2000);
      } else {
        setSavingStatus('error');
      }
    } catch (error) {
      setSavingStatus('error');
    }
  };

  const submitForm = async (formData: IntakeFormData) => {
    setSavingStatus('saving');
    
    try {
      const response = await fetch('/api/intake/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          formData,
          isComplete: true // Final submission
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSavingStatus('saved');
        // Redirect to dashboard or show success message
        window.location.href = '/client/dashboard';
      } else {
        setSavingStatus('error');
        alert('Please fill in all required fields: ' + result.message);
      }
    } catch (error) {
      setSavingStatus('error');
    }
  };

  return { savingStatus, saveDraft, submitForm };
};
```

### **3. Dashboard Banner Integration** ✅

**Current Status**: Already implemented in client dashboard
**Enhancement Needed**: Ensure it works with new comprehensive intake form

```tsx
// Expected existing implementation in client dashboard
const ClientDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // This should already exist
    const loadDashboard = async () => {
      const response = await fetch('/client/dashboard', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      setDashboardData(data);
    };
    loadDashboard();
  }, []);

  return (
    <div>
      {/* Intake completion banner */}
      {!dashboardData?.hasCompletedIntake && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="font-semibold text-amber-800">Complete Your Intake Form</h3>
                <p className="text-amber-700">Please complete your intake form to book appointments.</p>
              </div>
            </div>
            <a
              href="/client/intake-form"
              className="btn-premium-primary ml-4"
            >
              Complete Intake →
            </a>
          </div>
        </div>
      )}
      
      {/* Rest of dashboard */}
    </div>
  );
};
```

---

## 🔍 **Testing & Validation Guide**

### **CSV Import Testing:**
1. **Dutch CSV File**: Test with provided `Clienten MijnDiAd 2025-09-22.csv`
2. **Column Mapping**: Verify all 28 Dutch columns map correctly
3. **Progress Tracking**: Ensure real-time updates during import
4. **Error Handling**: Test with invalid data (bad emails, duplicate BSNs)
5. **Success Validation**: Confirm imported clients appear in admin client list

### **Intake Form Testing:**
1. **Form Structure**: Verify all 66 fields render correctly across 7 sections
2. **Draft Saving**: Test auto-save and manual draft saving
3. **Resume Functionality**: Verify returning to incomplete form works
4. **Validation**: Test required field validation on submission
5. **Dashboard Integration**: Confirm banner disappears after completion
6. **Appointment Blocking**: Verify clients cannot book until intake complete

### **Profile Editing Testing:**
1. **Admin Editing**: Test admin can edit any client/therapist profile
2. **Self Editing**: Test clients/therapists can edit own profiles
3. **Field Validation**: Test form validation and error handling
4. **Data Persistence**: Verify changes save and display correctly

---

## 📚 **Development Notes**

### **API Authentication:**
All API calls require Bearer token in Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
}
```

### **Error Handling Pattern:**
```typescript
try {
  const response = await fetch('/api/endpoint');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  
  return data;
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
  toast.error(error.message || 'Something went wrong');
  throw error;
}
```

### **Loading States:**
Always implement loading states for better UX:
```tsx
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await performAction();
  } finally {
    setIsLoading(false);
  }
};
```

---

## ✅ **Acceptance Criteria**

### **CSV Import Feature:**
- [ ] Admin can access import feature from client/therapist management pages
- [ ] File upload with drag-and-drop or file picker
- [ ] Column mapping interface with Dutch field detection
- [ ] Real-time progress tracking during import
- [ ] Success/error reporting with detailed feedback
- [ ] Imported records appear immediately in management lists
- [ ] No modal dialogs - all functionality inline

### **Intake Form Feature:**
- [ ] 7-section form with all 66 fields from Dutch PDF
- [ ] Draft saving every 30 seconds + manual save
- [ ] Resume functionality for incomplete forms
- [ ] Progress indicator showing completion percentage
- [ ] Required field validation before final submission
- [ ] Dashboard banner disappears after completion
- [ ] Appointment booking blocked until intake complete

### **Profile Editing:**
- [ ] Admin can edit any user profile with all fields
- [ ] Clients can edit own profile information
- [ ] Therapists can edit professional information
- [ ] Changes save and reflect immediately
- [ ] Proper validation and error handling

---

## 🚀 **Implementation Priority**

1. **Phase 1** (High Priority): CSV Import for Client Management
2. **Phase 2** (High Priority): CSV Import for Therapist Management  
3. **Phase 3** (Critical): Enhanced Intake Form Implementation
4. **Phase 4** (Medium): Profile Editing Enhancements
5. **Phase 5** (Final): Testing, Polish & Deployment

---

## 📞 **Support Information**

**Backend API Base URL**: `https://praktijk-epd-backend-production.up.railway.app`
**Frontend Expected Location**: `/Users/mukelakatungu/praktijk-epd-frontend-1`

All backend APIs are tested and production-ready. The backend includes comprehensive validation, error handling, and real-time progress tracking. This implementation guide provides exact specifications for frontend integration.

**Meeting Preparation**: Both CSV import and intake form features are required for Natalie's meeting. Priority should be given to completing these features with the exact specifications provided above.