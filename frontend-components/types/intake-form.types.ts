// TypeScript interfaces for comprehensive intake form functionality
// Based on verified backend API with 66 fields across 7 sections

export interface IntakeFormField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'boolean' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
  conditional?: {
    dependsOn: string;
    value: any;
  };
}

export interface IntakeFormSection {
  id: string;
  title: string;
  description?: string;
  fields: IntakeFormField[];
}

export interface IntakeFormStructure {
  sections: IntakeFormSection[];
  totalFields: number;
  requiredFields: number;
}

export interface IntakeFormData {
  // Personal Information
  educationLevel?: string;
  profession?: string;
  hobbiesSports?: string;
  relationshipStatus?: string;
  childrenCount?: number;
  childrenFromMultipleRelations?: boolean;
  familyBackground?: string;
  
  // Referral Information
  referralSource?: string;
  referralDetails?: string;
  
  // Health History
  smokingStatus?: boolean;
  smokingAmount?: string;
  alcoholUse?: boolean;
  alcoholAmount?: string;
  drugUse?: boolean;
  drugDetails?: string;
  currentMedications?: string;
  painkillersUse?: boolean;
  painkillersDetails?: string;
  
  // Therapy History
  previousTherapy?: boolean;
  previousTherapyDetails?: string;
  previousComplaints?: string;
  therapyDuration?: string;
  
  // Current Situation
  currentComplaints?: string;
  complaintSeverity?: 'light' | 'mild' | 'serious' | 'very_serious';
  complaintDuration?: string;
  complaintCause?: string;
  significantEvents?: boolean;
  significantEventsDetails?: string;
  traumaticEvents?: string;
  complaintsOnset?: string;
  
  // Therapy Goals
  therapyGoals?: string;
  stepsTaken?: string;
  expectedChanges?: string;
  observableChanges?: string;
  expectedObstacles?: string;
  mainFocus?: string;
  currentCoping?: string;
  selfHelpAttempts?: string;
  environmentReaction?: string;
  
  // Additional Information
  additionalInfo?: string;
  questionsRemarks?: string;
  therapistExpectations?: string;
  consultationPreference?: 'in_person' | 'online' | 'both';
  onlineTherapyInterest?: string;
  insuranceAcknowledgment?: boolean;
  
  // Meta fields
  isComplete?: boolean;
  completedAt?: string;
  lastSaved?: string;
}

export interface IntakeFormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  missingRequired: string[];
}

export interface IntakeFormProgress {
  currentSection: number;
  totalSections: number;
  filledFields: number;
  totalFields: number;
  requiredFieldsFilled: number;
  totalRequiredFields: number;
  percentageComplete: number;
  canProceed: boolean;
}

export interface IntakeFormResponse {
  success: boolean;
  message: string;
  data?: IntakeFormData;
  completed?: boolean;
  completionPercentage?: number;
}

export interface IntakeStatusResponse {
  success: boolean;
  canBookAppointments: boolean;
  completionPercentage: number;
  hasCompletedIntake: boolean;
}

// Default form structure matching backend implementation
export const DEFAULT_INTAKE_FORM_STRUCTURE: IntakeFormStructure = {
  totalFields: 66,
  requiredFields: 11,
  sections: [
    {
      id: 'personal_info',
      title: 'Personal Information',
      description: 'Tell us about yourself, your background and current life situation.',
      fields: [
        {
          name: 'educationLevel',
          type: 'select',
          label: 'Education Level',
          required: true,
          options: [
            'primary_education',
            'secondary_education', 
            'vocational_training',
            'higher_education',
            'university',
            'postgraduate'
          ]
        },
        {
          name: 'profession',
          type: 'text',
          label: 'Current Profession',
          placeholder: 'What is your current job or occupation?',
          required: true
        },
        {
          name: 'hobbiesSports',
          type: 'textarea',
          label: 'Hobbies and Sports',
          placeholder: 'What activities do you enjoy in your free time?',
          required: false
        },
        {
          name: 'relationshipStatus',
          type: 'select',
          label: 'Relationship Status',
          required: true,
          options: [
            'single',
            'in_relationship',
            'married',
            'divorced',
            'widowed',
            'separated'
          ]
        },
        {
          name: 'childrenCount',
          type: 'number',
          label: 'Number of Children',
          placeholder: '0',
          required: false
        },
        {
          name: 'childrenFromMultipleRelations',
          type: 'boolean',
          label: 'Do you have children from multiple relationships?',
          required: false,
          conditional: {
            dependsOn: 'childrenCount',
            value: (value: number) => value > 0
          }
        },
        {
          name: 'familyBackground',
          type: 'textarea',
          label: 'Family Background',
          placeholder: 'Tell us about your family situation, living arrangement, etc.',
          required: false
        }
      ]
    },
    {
      id: 'referral_info',
      title: 'Referral Information',
      description: 'How did you find us and what brought you here?',
      fields: [
        {
          name: 'referralSource',
          type: 'text',
          label: 'How did you hear about us?',
          placeholder: 'GP, internet, friend, etc.',
          required: false
        },
        {
          name: 'referralDetails',
          type: 'textarea',
          label: 'Referral Details',
          placeholder: 'Any additional details about how you were referred to us?',
          required: false
        }
      ]
    },
    {
      id: 'health_history',
      title: 'Health History',
      description: 'Information about your physical health and substance use.',
      fields: [
        {
          name: 'smokingStatus',
          type: 'boolean',
          label: 'Do you currently smoke?',
          required: false
        },
        {
          name: 'smokingAmount',
          type: 'text',
          label: 'How much do you smoke?',
          placeholder: 'e.g., 10 cigarettes per day',
          required: false,
          conditional: {
            dependsOn: 'smokingStatus',
            value: true
          }
        },
        {
          name: 'alcoholUse',
          type: 'boolean',
          label: 'Do you drink alcohol?',
          required: false
        },
        {
          name: 'alcoholAmount',
          type: 'text',
          label: 'How much alcohol do you consume?',
          placeholder: 'e.g., 2 glasses of wine per week',
          required: false,
          conditional: {
            dependsOn: 'alcoholUse',
            value: true
          }
        },
        {
          name: 'drugUse',
          type: 'boolean',
          label: 'Do you use recreational drugs?',
          required: false
        },
        {
          name: 'drugDetails',
          type: 'textarea',
          label: 'Please specify which drugs and how often',
          required: false,
          conditional: {
            dependsOn: 'drugUse',
            value: true
          }
        },
        {
          name: 'currentMedications',
          type: 'textarea',
          label: 'Current Medications',
          placeholder: 'List any medications you are currently taking',
          required: false
        },
        {
          name: 'painkillersUse',
          type: 'boolean',
          label: 'Do you regularly use painkillers?',
          required: false
        },
        {
          name: 'painkillersDetails',
          type: 'textarea',
          label: 'Painkiller Details',
          placeholder: 'Which painkillers and how often?',
          required: false,
          conditional: {
            dependsOn: 'painkillersUse',
            value: true
          }
        }
      ]
    },
    {
      id: 'therapy_history',
      title: 'Previous Therapy Experience',
      description: 'Your experience with therapy or counseling in the past.',
      fields: [
        {
          name: 'previousTherapy',
          type: 'boolean',
          label: 'Have you received therapy or counseling before?',
          required: false
        },
        {
          name: 'previousTherapyDetails',
          type: 'textarea',
          label: 'Previous Therapy Details',
          placeholder: 'What type of therapy? When? How long?',
          required: false,
          conditional: {
            dependsOn: 'previousTherapy',
            value: true
          }
        },
        {
          name: 'previousComplaints',
          type: 'textarea',
          label: 'What complaints were addressed in previous therapy?',
          required: false,
          conditional: {
            dependsOn: 'previousTherapy',
            value: true
          }
        },
        {
          name: 'therapyDuration',
          type: 'text',
          label: 'How long did the therapy last?',
          placeholder: 'e.g., 6 months, 2 years',
          required: false,
          conditional: {
            dependsOn: 'previousTherapy',
            value: true
          }
        }
      ]
    },
    {
      id: 'current_situation',
      title: 'Current Situation',
      description: 'Tell us about your current complaints and what brings you to therapy now.',
      fields: [
        {
          name: 'currentComplaints',
          type: 'textarea',
          label: 'What are your current complaints or concerns?',
          placeholder: 'Describe what you are struggling with right now...',
          required: true
        },
        {
          name: 'complaintSeverity',
          type: 'select',
          label: 'How severe would you rate your current complaints?',
          required: true,
          options: ['light', 'mild', 'serious', 'very_serious']
        },
        {
          name: 'complaintDuration',
          type: 'text',
          label: 'How long have you been experiencing these complaints?',
          placeholder: 'e.g., 3 months, 2 years',
          required: true
        },
        {
          name: 'complaintCause',
          type: 'textarea',
          label: 'What do you think caused these complaints?',
          placeholder: 'Any specific events, situations, or triggers?',
          required: false
        },
        {
          name: 'significantEvents',
          type: 'boolean',
          label: 'Have there been significant events in your life recently?',
          required: false
        },
        {
          name: 'significantEventsDetails',
          type: 'textarea',
          label: 'Please describe these significant events',
          required: false,
          conditional: {
            dependsOn: 'significantEvents',
            value: true
          }
        },
        {
          name: 'traumaticEvents',
          type: 'textarea',
          label: 'Have you experienced any traumatic events?',
          placeholder: 'If you feel comfortable sharing...',
          required: false
        },
        {
          name: 'complaintsOnset',
          type: 'text',
          label: 'When did your complaints first start?',
          placeholder: 'Approximate date or time period',
          required: false
        }
      ]
    },
    {
      id: 'therapy_goals',
      title: 'Therapy Goals & Expectations',
      description: 'What do you hope to achieve through therapy?',
      fields: [
        {
          name: 'therapyGoals',
          type: 'textarea',
          label: 'What are your goals for therapy?',
          placeholder: 'What would you like to achieve or change?',
          required: true
        },
        {
          name: 'stepsTaken',
          type: 'textarea',
          label: 'What steps have you already taken to address your concerns?',
          required: false
        },
        {
          name: 'expectedChanges',
          type: 'textarea',
          label: 'What changes do you expect from therapy?',
          required: false
        },
        {
          name: 'observableChanges',
          type: 'textarea',
          label: 'How will you know that therapy is working?',
          placeholder: 'What changes would you notice?',
          required: false
        },
        {
          name: 'expectedObstacles',
          type: 'textarea',
          label: 'What obstacles do you expect in therapy?',
          placeholder: 'What might make it difficult to reach your goals?',
          required: false
        },
        {
          name: 'mainFocus',
          type: 'text',
          label: 'What should be the main focus of our therapy sessions?',
          required: true
        },
        {
          name: 'currentCoping',
          type: 'textarea',
          label: 'How are you currently coping with your problems?',
          required: false
        },
        {
          name: 'selfHelpAttempts',
          type: 'textarea',
          label: 'What have you tried on your own to improve the situation?',
          required: false
        },
        {
          name: 'environmentReaction',
          type: 'textarea',
          label: 'How does your environment (family, friends, colleagues) react to your situation?',
          required: false
        }
      ]
    },
    {
      id: 'additional_info',
      title: 'Additional Information',
      description: 'Any other information that might be helpful.',
      fields: [
        {
          name: 'additionalInfo',
          type: 'textarea',
          label: 'Is there anything else you would like us to know?',
          required: false
        },
        {
          name: 'questionsRemarks',
          type: 'textarea',
          label: 'Do you have any questions or remarks?',
          required: false
        },
        {
          name: 'therapistExpectations',
          type: 'textarea',
          label: 'What do you expect from your therapist?',
          required: false
        },
        {
          name: 'consultationPreference',
          type: 'select',
          label: 'Do you prefer in-person or online consultations?',
          required: true,
          options: ['in_person', 'online', 'both']
        },
        {
          name: 'onlineTherapyInterest',
          type: 'textarea',
          label: 'What interests you about online therapy? (if applicable)',
          required: false,
          conditional: {
            dependsOn: 'consultationPreference',
            value: (value: string) => value === 'online' || value === 'both'
          }
        },
        {
          name: 'insuranceAcknowledgment',
          type: 'boolean',
          label: 'I understand that therapy costs may be covered by my insurance',
          required: true
        }
      ]
    }
  ]
};