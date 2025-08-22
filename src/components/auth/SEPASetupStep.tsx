import React, { useState } from 'react';
import { 
  CreditCardIcon, 
  ShieldCheckIcon, 
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { AccessibleInput, AccessibleButton } from '@/components/ui/AccessibleForm';

interface SEPASetupStepProps {
  onComplete: (sepaData: SEPAData) => void;
  onSkip?: () => void;
  isOptional?: boolean;
}

interface SEPAData {
  iban: string;
  accountHolder: string;
  acceptMandate: boolean;
}

const SEPASetupStep: React.FC<SEPASetupStepProps> = ({ 
  onComplete, 
  onSkip,
  isOptional = true 
}) => {
  const { t } = useTranslation();
  const [iban, setIban] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [acceptMandate, setAcceptMandate] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatIBAN = (value: string): string => {
    const clean = value.replace(/\s/g, '').toUpperCase();
    return clean.match(/.{1,4}/g)?.join(' ') || clean;
  };

  const validateIBAN = (iban: string): boolean => {
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
    const ibanRegex = /^NL\d{2}[A-Z]{4}\d{10}$/;
    
    if (!ibanRegex.test(cleanIBAN)) {
      return false;
    }
    
    // Validate checksum
    const rearranged = cleanIBAN.substring(4) + cleanIBAN.substring(0, 4);
    const numericString = rearranged.replace(/[A-Z]/g, (match) => 
      (match.charCodeAt(0) - 55).toString()
    );
    
    const remainder = numericString.split('').reduce((acc, digit) => {
      return ((Number(acc) * 10 + Number(digit)) % 97).toString();
    }, '0');
    
    return Number(remainder) === 1;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate IBAN
    if (!iban) {
      newErrors.iban = 'IBAN is required';
    } else if (!validateIBAN(iban)) {
      newErrors.iban = 'Please enter a valid Dutch IBAN';
    }

    // Validate account holder
    if (!accountHolder) {
      newErrors.accountHolder = 'Account holder name is required';
    } else if (accountHolder.length < 2) {
      newErrors.accountHolder = 'Account holder name must be at least 2 characters';
    }

    // Validate mandate acceptance
    if (!acceptMandate) {
      newErrors.mandate = 'You must accept the SEPA Direct Debit mandate';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onComplete({
      iban: iban.replace(/\s/g, ''),
      accountHolder,
      acceptMandate
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
          <CreditCardIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Set Up Payment Method
        </h2>
        <p className="text-gray-600">
          Add your bank account for automatic payment processing
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Why do we need this?</p>
            <p>
              Setting up SEPA Direct Debit allows for seamless payment of your therapy sessions. 
              You can always update or remove this payment method later in your account settings.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AccessibleInput
          label="IBAN"
          type="text"
          value={iban}
          onChange={(e) => {
            const formatted = formatIBAN(e.target.value);
            if (formatted.length <= 29) {
              setIban(formatted);
              setErrors({ ...errors, iban: '' });
            }
          }}
          placeholder="NL12 ABCD 1234 5678 90"
          error={errors.iban}
          required
          aria-label="Dutch IBAN number"
        />

        <AccessibleInput
          label="Account Holder Name"
          type="text"
          value={accountHolder}
          onChange={(e) => {
            setAccountHolder(e.target.value);
            setErrors({ ...errors, accountHolder: '' });
          }}
          placeholder="John Doe"
          error={errors.accountHolder}
          required
          aria-label="Name of the bank account holder"
        />

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-600" />
            SEPA Direct Debit Mandate
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            By providing your IBAN and confirming this payment, you authorize this practice to 
            send instructions to your bank to debit your account for therapy session fees. 
            You are entitled to a refund from your bank under the terms and conditions of your 
            agreement with your bank.
          </p>
          
          <div className="flex items-start">
            <input
              type="checkbox"
              id="accept-mandate"
              checked={acceptMandate}
              onChange={(e) => {
                setAcceptMandate(e.target.checked);
                setErrors({ ...errors, mandate: '' });
              }}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              aria-describedby="mandate-description"
            />
            <label htmlFor="accept-mandate" className="ml-2 text-sm text-gray-700">
              I authorize the automatic collection of therapy session fees via SEPA Direct Debit
            </label>
          </div>
          {errors.mandate && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.mandate}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <AccessibleButton
            type="submit"
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
            icon={CheckCircleIcon}
          >
            Complete Setup
          </AccessibleButton>
          
          {isOptional && onSkip && (
            <AccessibleButton
              type="button"
              onClick={onSkip}
              className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500"
            >
              Skip for Now
            </AccessibleButton>
          )}
        </div>
      </form>

      <p className="text-xs text-center text-gray-500">
        Your payment information is encrypted and stored securely. 
        We comply with PCI DSS standards and GDPR regulations.
      </p>
    </div>
  );
};

export default SEPASetupStep;