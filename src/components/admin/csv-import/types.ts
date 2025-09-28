// CSV Import Types - Following existing entity patterns
export interface CSVImportProgress {
  importId: string;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  status: 'processing' | 'completed' | 'failed';
  errors: Array<{
    row: number;
    field?: string;
    error: string;
  }>;
}

export interface CSVImportResponse {
  success: boolean;
  importId: string;
  message: string;
}

export type ImportStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
export type ImportType = 'clients' | 'therapists';

export interface CSVColumn {
  header: string;
  mappedTo: string | null;
  autoDetected: boolean;
  suggestedMapping?: string;
}

export interface ColumnMapping {
  [csvHeader: string]: string;
}

export interface CSVPreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

// Dutch field mappings for automatic detection
export const DUTCH_FIELD_MAPPINGS: Record<string, string> = {
  // User table fields
  "Voornaam": "first_name",
  "Achternaam": "last_name", 
  "Geslacht": "gender",
  "Telefoonnummer": "phone",
  "E-mailadres": "email",
  
  // Client profile fields
  "BSN": "bsn",
  "Voorletters": "initials",
  "Tussenvoegsel": "name_prefix", 
  "Aanhef": "salutation",
  "Geboortedatum": "date_of_birth",
  "Mobiel nummer": "mobile_phone",
  "Straat": "street_name",
  "Huisnummer": "house_number", 
  "Postcode": "postal_code",
  "Plaats": "city",
  "Land": "country",
  "Postadres straat": "mailing_street",
  "Postadres huisnummer": "mailing_house_number", 
  "Postadres postcode": "mailing_postal_code",
  "Postadres plaats": "mailing_city",
  "Extra e-mailadressen": "additional_emails",
  "Polisnummer": "insurance_number",
  "Zorgverzekeraar": "insurance_company",
  "Huisarts": "general_practitioner_name",
  "IBAN": "bank_account_iban",
  "Clientnr/mandaatnr": "client_number",
  "BSN jeugdigen": "youth_bsn", 
  "Naam gezagdrager": "guardian_name"
};

// Alternative Dutch column names
export const DUTCH_FIELD_ALTERNATIVES: Record<string, string[]> = {
  "date_of_birth": ["Geboortedatum", "Geboorte datum", "Birth Date", "Date of Birth"],
  "first_name": ["Voornaam", "First Name", "Firstname", "Given Name"],
  "last_name": ["Achternaam", "Last Name", "Lastname", "Surname", "Family Name"],
  "email": ["E-mailadres", "Email", "E-mail", "Email Address"],
  "phone": ["Telefoonnummer", "Phone", "Telephone", "Tel"],
  "mobile_phone": ["Mobiel nummer", "Mobile", "Cell Phone", "Cellular"],
  "postal_code": ["Postcode", "Postal Code", "ZIP Code", "ZIP"],
  "city": ["Plaats", "City", "Town"],
  "street_name": ["Straat", "Street", "Address", "Street Name"],
  "house_number": ["Huisnummer", "House Number", "Number"],
  "gender": ["Geslacht", "Gender", "Sex"],
  "bsn": ["BSN", "BSN-nummer", "Burgerservicenummer"],
  "insurance_company": ["Zorgverzekeraar", "Insurance", "Insurer"],
  "insurance_number": ["Polisnummer", "Policy Number", "Insurance Number"]
};