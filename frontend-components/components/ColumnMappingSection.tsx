// Column mapping component for CSV import
// Maps CSV headers to database fields with Dutch language support

import React from 'react';
import { 
  CSVPreviewData, 
  ColumnMapping, 
  ImportType, 
  DUTCH_FIELD_MAPPINGS,
  DUTCH_FIELD_ALTERNATIVES 
} from '../types/csv-import.types';

interface ColumnMappingSectionProps {
  csvPreview: CSVPreviewData;
  columnMapping: ColumnMapping;
  onMappingChange: (csvColumn: string, dbField: string | null) => void;
  type: ImportType;
}

// Available database fields for clients
const CLIENT_FIELDS = [
  { value: 'first_name', label: 'First Name', required: true },
  { value: 'last_name', label: 'Last Name', required: true },
  { value: 'email', label: 'Email Address', required: true },
  { value: 'phone', label: 'Phone Number', required: false },
  { value: 'gender', label: 'Gender', required: false },
  { value: 'date_of_birth', label: 'Date of Birth', required: false },
  { value: 'bsn', label: 'BSN (Social Security)', required: false },
  { value: 'initials', label: 'Initials', required: false },
  { value: 'name_prefix', label: 'Name Prefix', required: false },
  { value: 'salutation', label: 'Salutation', required: false },
  { value: 'mobile_phone', label: 'Mobile Phone', required: false },
  { value: 'street_name', label: 'Street Name', required: false },
  { value: 'house_number', label: 'House Number', required: false },
  { value: 'postal_code', label: 'Postal Code', required: false },
  { value: 'city', label: 'City', required: false },
  { value: 'country', label: 'Country', required: false },
  { value: 'mailing_street', label: 'Mailing Street', required: false },
  { value: 'mailing_house_number', label: 'Mailing House Number', required: false },
  { value: 'mailing_postal_code', label: 'Mailing Postal Code', required: false },
  { value: 'mailing_city', label: 'Mailing City', required: false },
  { value: 'additional_emails', label: 'Additional Emails', required: false },
  { value: 'insurance_number', label: 'Insurance Number', required: false },
  { value: 'insurance_company', label: 'Insurance Company', required: false },
  { value: 'general_practitioner_name', label: 'General Practitioner', required: false },
  { value: 'bank_account_iban', label: 'Bank Account IBAN', required: false },
  { value: 'client_number', label: 'Client Number', required: false },
  { value: 'youth_bsn', label: 'Youth BSN', required: false },
  { value: 'guardian_name', label: 'Guardian Name', required: false }
];

// Available database fields for therapists  
const THERAPIST_FIELDS = [
  { value: 'first_name', label: 'First Name', required: true },
  { value: 'last_name', label: 'Last Name', required: true },
  { value: 'email', label: 'Email Address', required: true },
  { value: 'phone', label: 'Phone Number', required: false },
  { value: 'license_number', label: 'License Number', required: false },
  { value: 'specializations', label: 'Specializations', required: false },
  { value: 'bio', label: 'Biography', required: false },
  { value: 'hourly_rate', label: 'Hourly Rate', required: false },
  { value: 'years_of_experience', label: 'Years of Experience', required: false },
  { value: 'education', label: 'Education', required: false },
  { value: 'certifications', label: 'Certifications', required: false }
];

export const ColumnMappingSection: React.FC<ColumnMappingSectionProps> = ({
  csvPreview,
  columnMapping,
  onMappingChange,
  type
}) => {
  const availableFields = type === 'clients' ? CLIENT_FIELDS : THERAPIST_FIELDS;
  const requiredFields = availableFields.filter(field => field.required);
  const mappedFields = Object.values(columnMapping);
  const missingRequiredFields = requiredFields.filter(
    field => !mappedFields.includes(field.value)
  );

  const getFieldInfo = (dbField: string) => {
    return availableFields.find(f => f.value === dbField);
  };

  const isAutoDetected = (csvHeader: string): boolean => {
    const directMatch = DUTCH_FIELD_MAPPINGS[csvHeader];
    if (directMatch) return true;

    // Check alternatives
    for (const [dbField, alternatives] of Object.entries(DUTCH_FIELD_ALTERNATIVES)) {
      if (alternatives.some(alt => 
        alt.toLowerCase() === csvHeader.toLowerCase() ||
        csvHeader.toLowerCase().includes(alt.toLowerCase())
      )) {
        return true;
      }
    }
    return false;
  };

  const getSuggestedMapping = (csvHeader: string): string | null => {
    // Direct mapping
    if (DUTCH_FIELD_MAPPINGS[csvHeader]) {
      return DUTCH_FIELD_MAPPINGS[csvHeader];
    }

    // Alternative names
    for (const [dbField, alternatives] of Object.entries(DUTCH_FIELD_ALTERNATIVES)) {
      if (alternatives.some(alt => 
        alt.toLowerCase() === csvHeader.toLowerCase() ||
        csvHeader.toLowerCase().includes(alt.toLowerCase())
      )) {
        return dbField;
      }
    }

    return null;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold">🔗 Column Mapping</h4>
        <div className="text-sm text-gray-600">
          {Object.keys(columnMapping).length} of {csvPreview.headers.length} columns mapped
        </div>
      </div>

      {/* Required Fields Status */}
      {missingRequiredFields.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-amber-500 text-lg mr-2">⚠️</span>
            <div>
              <p className="font-medium text-amber-800">Missing Required Fields</p>
              <p className="text-amber-700 text-sm">
                Please map these required fields: {missingRequiredFields.map(f => f.label).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CSV Preview */}
      <div className="mb-6 overflow-x-auto">
        <h5 className="font-medium text-gray-700 mb-3">📊 CSV Preview (first 5 rows)</h5>
        <table className="w-full text-sm border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {csvPreview.headers.map((header, index) => (
                <th key={index} className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-200">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvPreview.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 text-gray-600 border-r border-gray-200 truncate max-w-32">
                    {cell || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Column Mapping Interface */}
      <div className="space-y-3">
        <h5 className="font-medium text-gray-700">🎯 Map CSV Columns to Database Fields</h5>
        
        {csvPreview.headers.map((header, index) => {
          const isDetected = isAutoDetected(header);
          const suggested = getSuggestedMapping(header);
          const currentMapping = columnMapping[header];
          const fieldInfo = currentMapping ? getFieldInfo(currentMapping) : null;

          return (
            <div 
              key={index}
              className={`
                p-4 border rounded-lg transition-all duration-200
                ${currentMapping 
                  ? (fieldInfo?.required ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50')
                  : 'border-gray-200 bg-white'
                }
              `}
            >
              <div className="flex items-center justify-between gap-4">
                {/* CSV Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{header}</span>
                    {isDetected && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        ✓ Auto-detected
                      </span>
                    )}
                  </div>
                  {csvPreview.rows.length > 0 && csvPreview.rows[0][index] && (
                    <p className="text-xs text-gray-500 truncate">
                      Example: {csvPreview.rows[0][index]}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <span className="text-gray-400 text-lg">→</span>

                {/* Database Field Selector */}
                <div className="flex-1 min-w-0">
                  <select
                    value={currentMapping || ''}
                    onChange={(e) => onMappingChange(header, e.target.value || null)}
                    className={`
                      w-full p-2 border rounded text-sm
                      ${currentMapping 
                        ? (fieldInfo?.required ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50')
                        : 'border-gray-300 bg-white'
                      }
                    `}
                  >
                    <option value="">Skip this column</option>
                    {availableFields.map(field => (
                      <option 
                        key={field.value} 
                        value={field.value}
                        disabled={mappedFields.includes(field.value) && currentMapping !== field.value}
                      >
                        {field.label} {field.required ? '*' : ''} 
                        {mappedFields.includes(field.value) && currentMapping !== field.value ? ' (already mapped)' : ''}
                      </option>
                    ))}
                  </select>
                  
                  {/* Mapping Status */}
                  <div className="mt-1 text-xs">
                    {currentMapping ? (
                      <span className={fieldInfo?.required ? 'text-green-700' : 'text-blue-700'}>
                        ✓ Mapped to {fieldInfo?.label} {fieldInfo?.required ? '(Required)' : ''}
                      </span>
                    ) : suggested ? (
                      <button
                        onClick={() => onMappingChange(header, suggested)}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        💡 Suggested: {getFieldInfo(suggested)?.label}
                      </button>
                    ) : (
                      <span className="text-gray-500">No mapping selected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mapping Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-700 mb-3">📈 Mapping Summary</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-100 rounded">
            <div className="text-2xl font-bold text-blue-600">{Object.keys(columnMapping).length}</div>
            <div className="text-blue-800">Mapped Columns</div>
          </div>
          <div className="text-center p-3 bg-green-100 rounded">
            <div className="text-2xl font-bold text-green-600">
              {requiredFields.filter(f => mappedFields.includes(f.value)).length}
            </div>
            <div className="text-green-800">Required Fields</div>
          </div>
          <div className="text-center p-3 bg-gray-100 rounded">
            <div className="text-2xl font-bold text-gray-600">{csvPreview.totalRows}</div>
            <div className="text-gray-800">Rows to Import</div>
          </div>
        </div>
      </div>
    </div>
  );
};