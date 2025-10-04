import React, { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/LanguageContext';

interface HulpvraagOption {
  nl: string;
  en: string;
}

const HULPVRAGEN: HulpvraagOption[] = [
  { nl: "(Chronische) hoofdpijn", en: "(Chronic) headache" },
  { nl: "AD(H)D", en: "AD(H)D" },
  { nl: "Ademhalingsproblemen", en: "Breathing problems" },
  { nl: "Afhankelijkheidsproblemen", en: "Dependency issues" },
  { nl: "Aggressieproblemen", en: "Aggression problems" },
  { nl: "Alcoholverslaving", en: "Alcohol addiction" },
  { nl: "Angst na/met kanker", en: "Fear after/with cancer" },
  { nl: "Angst voor afwijzing", en: "Fear of rejection" },
  { nl: "Angstklachten", en: "Anxiety complaints" },
  { nl: "Angststoornissen", en: "Anxiety disorders" },
  { nl: "Apathie", en: "Apathy" },
  { nl: "Assertiviteitsproblemen", en: "Assertiveness problems" },
  { nl: "Autismespectrumstoornis (ASS)", en: "Autism spectrum disorder (ASD)" },
  { nl: "Auto-immuunziekten", en: "Auto-immune diseases" },
  { nl: "Balans", en: "Balance" },
  { nl: "Bindingsangst", en: "Fear of commitment" },
  { nl: "Bipolaire stoornis", en: "Bipolar disorder" },
  { nl: "Bloeddruk- en cholesterolklachten", en: "Blood pressure and cholesterol complaints" },
  { nl: "Bore out", en: "Bore out" },
  { nl: "Burn-out", en: "Burn-out" },
  { nl: "Chronische pijn", en: "Chronic pain" },
  { nl: "Chronische stress", en: "Chronic stress" },
  { nl: "Chronische vermoeidheid", en: "Chronic fatigue" },
  { nl: "Co-ouderproblemen", en: "Co-parenting problems" },
  { nl: "Communicatieproblemen", en: "Communication problems" },
  { nl: "Concentratieproblemen", en: "Concentration problems" },
  { nl: "Conflictvermijding", en: "Conflict avoidance" },
  { nl: "Controleproblemen", en: "Control issues" },
  { nl: "CPTSS verwerking", en: "CPTSD processing" },
  { nl: "Darm- en spijsverteringsklachten", en: "Digestive complaints" },
  { nl: "Depersonalisatie", en: "Depersonalization" },
  { nl: "Depressie", en: "Depression" },
  { nl: "Diabetes type 2", en: "Diabetes type 2" },
  { nl: "Dissociatieve stoornissen", en: "Dissociative disorders" },
  { nl: "Dwangstoornis (OCD)", en: "Obsessive-compulsive disorder (OCD)" },
  { nl: "Echtscheidingsconflicten", en: "Divorce conflicts" },
  { nl: "Eenzaamheid", en: "Loneliness" },
  { nl: "Eetstoornissen (anorexia, boulimia)", en: "Eating disorders (anorexia, bulimia)" },
  { nl: "Emotieregulatie", en: "Emotion regulation" },
  { nl: "Emotionele instabiliteit", en: "Emotional instability" },
  { nl: "Emotionele uitputting", en: "Emotional exhaustion" },
  { nl: "Emotionele verwaarlozing", en: "Emotional neglect" },
  { nl: "Faalangst", en: "Fear of failure" },
  { nl: "Fobieën", en: "Phobias" },
  { nl: "Gaslighting", en: "Gaslighting" },
  { nl: "Gebrek aan motivatie", en: "Lack of motivation" },
  { nl: "Gedragsproblemen", en: "Behavioral problems" },
  { nl: "Gejaagd gevoel", en: "Rushed feeling" },
  { nl: "Gewrichtsklachten", en: "Joint complaints" },
  { nl: "Gezondheidsangst (hypochondrie)", en: "Health anxiety (hypochondria)" },
  { nl: "Grenzen stellen en bewaken", en: "Setting and maintaining boundaries" },
  { nl: "Hechtingsproblemen", en: "Attachment problems" },
  { nl: "Hersenletsel (NAH)", en: "Brain injury (ABI)" },
  { nl: "Hoogbegaafdheid", en: "Giftedness" },
  { nl: "Hoogsensitiviteit (HSP)", en: "High sensitivity (HSP)" },
  { nl: "Hormonale klachten", en: "Hormonal complaints" },
  { nl: "Huid- en haarklachten", en: "Skin and hair complaints" },
  { nl: "Hyperventilatie", en: "Hyperventilation" },
  { nl: "Identiteitsproblemen", en: "Identity problems" },
  { nl: "Imposter syndrome", en: "Imposter syndrome" },
  { nl: "Impulsief gedrag", en: "Impulsive behavior" },
  { nl: "Jaloezieproblemen", en: "Jealousy problems" },
  { nl: "Jeugdtrauma", en: "Youth trauma" },
  { nl: "Keuzestress", en: "Decision stress" },
  { nl: "Kindertrauma", en: "Childhood trauma" },
  { nl: "Klaaggedrag", en: "Complaining behavior" },
  { nl: "KOPP-kinderen", en: "Children of psychiatric patients" },
  { nl: "KOV-kinderen", en: "Children of addicted parents" },
  { nl: "Levensfaseproblematiek", en: "Life phase issues" },
  { nl: "Lichamelijk trauma", en: "Physical trauma" },
  { nl: "Lichamelijke klachten zonder medische oorzaak (SOLK)", en: "Physical complaints without medical cause (MUPS)" },
  { nl: "Loslaten van controle", en: "Letting go of control" },
  { nl: "Loyaliteitsconflicten", en: "Loyalty conflicts" },
  { nl: "Middelenmisbruik (drugs, alcohol)", en: "Substance abuse (drugs, alcohol)" },
  { nl: "Midlife crisis", en: "Midlife crisis" },
  { nl: "Migraine", en: "Migraine" },
  { nl: "Minderwaardigheidsgevoelens", en: "Feelings of inferiority" },
  { nl: "Narcisme (verwerking na omgang met)", en: "Narcissism (processing after dealing with)" },
  { nl: "Narcistische persoonlijkheidsstoornis", en: "Narcissistic personality disorder" },
  { nl: "Negatief zelfbeeld", en: "Negative self-image" },
  { nl: "Obsessieve gedachten", en: "Obsessive thoughts" },
  { nl: "Onrustig gevoel", en: "Restless feeling" },
  { nl: "Onvervulde kinderwens", en: "Unfulfilled desire for children" },
  { nl: "Onverwerkte emoties", en: "Unprocessed emotions" },
  { nl: "Onvruchtbaar", en: "Infertility" },
  { nl: "Onzekerheid", en: "Insecurity" },
  { nl: "Opvoedproblemen", en: "Parenting problems" },
  { nl: "Osteoporose", en: "Osteoporosis" },
  { nl: "Over- en ondergewicht", en: "Over- and underweight" },
  { nl: "Overgangsklachten", en: "Menopausal complaints" },
  { nl: "Overspannenheid", en: "Stress/burnout" },
  { nl: "Paniekaanvallen", en: "Panic attacks" },
  { nl: "Parentificatie (verantwoordelijkheid van ouders overnemen als kind)", en: "Parentification (taking on parental responsibility as a child)" },
  { nl: "Perfectionisme", en: "Perfectionism" },
  { nl: "Persoonlijke ontwikkeling", en: "Personal development" },
  { nl: "Persoonlijkheidsstoornissen (bijv. borderline)", en: "Personality disorders (e.g. borderline)" },
  { nl: "Pesten", en: "Bullying" },
  { nl: "Piekeren", en: "Worrying" },
  { nl: "Posttraumatische stressstoornis (PTSS)", en: "Post-traumatic stress disorder (PTSD)" },
  { nl: "Prestatiegerichtheid (problematisch)", en: "Achievement orientation (problematic)" },
  { nl: "Psychosomatische klachten", en: "Psychosomatic complaints" },
  { nl: "Relatieproblemen", en: "Relationship problems" },
  { nl: "Rouw- en verliesverwerking", en: "Grief and loss processing" },
  { nl: "Schaamte", en: "Shame" },
  { nl: "Schildklierproblematiek", en: "Thyroid problems" },
  { nl: "Schuldgevoelens", en: "Guilt" },
  { nl: "Seksuele problemen", en: "Sexual problems" },
  { nl: "Seksverslaving", en: "Sex addiction" },
  { nl: "Slaapproblemathiek", en: "Sleep problems" },
  { nl: "Sociale angst", en: "Social anxiety" },
  { nl: "Somatische klachten", en: "Somatic complaints" },
  { nl: "Somberheidsklachten", en: "Depression complaints" },
  { nl: "Spanningsklachten", en: "Tension complaints" },
  { nl: "Stemmingsstoornissen", en: "Mood disorders" },
  { nl: "Stotteren (stressgerelateerd)", en: "Stuttering (stress-related)" },
  { nl: "Stress", en: "Stress" },
  { nl: "Studiestress", en: "Study stress" },
  { nl: "Suïcidale gedachten", en: "Suicidal thoughts" },
  { nl: "Tics", en: "Tics" },
  { nl: "Uitstelgedrag", en: "Procrastination" }
];

interface SimpleHulpvragenSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxSelection?: number;
  required?: boolean;
  className?: string;
}

const SimpleHulpvragenSelector: React.FC<SimpleHulpvragenSelectorProps> = ({
  value = [],
  onChange,
  maxSelection = 5,
  required = true,
  className = ''
}) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filter hulpvragen based on search term
  const filteredHulpvragen = useMemo(() => {
    if (!searchTerm) return HULPVRAGEN;

    const searchLower = searchTerm.toLowerCase();
    return HULPVRAGEN.filter(item => {
      const displayText = language === 'en' ? item.en : item.nl;
      return displayText.toLowerCase().includes(searchLower);
    });
  }, [searchTerm, language]);

  // Handle selection toggle
  const handleToggle = (hulpvraag: HulpvraagOption) => {
    const dutchName = hulpvraag.nl; // Always use Dutch name as identifier

    if (value.includes(dutchName)) {
      // Remove from selection
      onChange(value.filter(v => v !== dutchName));
    } else if (value.length < maxSelection) {
      // Add to selection
      onChange([...value, dutchName]);
      setIsOpen(true); // Keep dropdown open for multiple selections
    }
  };

  // Clear all selections
  const clearAll = () => {
    onChange([]);
  };

  // Get display name for selected value
  const getDisplayName = (dutchName: string): string => {
    const item = HULPVRAGEN.find(h => h.nl === dutchName);
    if (!item) return dutchName;
    return language === 'en' ? item.en : item.nl;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {language === 'en' ? 'Select your concerns' : 'Selecteer uw hulpvragen'} {required && '*'}
        </label>
        <p className="text-sm text-gray-500">
          {language === 'en'
            ? `Choose up to ${maxSelection} problems you'd like help with.`
            : `Kies maximaal ${maxSelection} problemen waarmee u hulp wilt.`
          }
        </p>
      </div>

      {/* Selection counter and clear button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className={value.length === maxSelection ? 'text-amber-600 font-medium' : ''}>
            {value.length} / {maxSelection} {language === 'en' ? 'selected' : 'geselecteerd'}
          </span>
        </div>
        {value.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            {language === 'en' ? 'Clear all' : 'Alles wissen'}
          </button>
        )}
      </div>

      {/* Selected hulpvragen chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(dutchName => {
            const hulpvraag = HULPVRAGEN.find(h => h.nl === dutchName);
            if (!hulpvraag) return null;

            return (
              <div
                key={dutchName}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
              >
                <CheckIcon className="w-3 h-3 mr-1.5" />
                <span>{getDisplayName(dutchName)}</span>
                <button
                  type="button"
                  onClick={() => handleToggle(hulpvraag)}
                  className="ml-2 hover:text-blue-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={language === 'en' ? 'Search concerns...' : 'Zoek hulpvragen...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div className="relative">
          <div className="absolute z-10 w-full max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
            {filteredHulpvragen.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {language === 'en'
                  ? 'No concerns found matching your search.'
                  : 'Geen hulpvragen gevonden die overeenkomen met uw zoekopdracht.'
                }
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredHulpvragen.map((hulpvraag) => {
                  const isSelected = value.includes(hulpvraag.nl);
                  const isDisabled = !isSelected && value.length >= maxSelection;
                  const displayText = language === 'en' ? hulpvraag.en : hulpvraag.nl;

                  return (
                    <label
                      key={hulpvraag.nl}
                      className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50' : ''
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !isDisabled && handleToggle(hulpvraag)}
                        disabled={isDisabled}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <span className={`flex-1 ${isSelected ? 'font-medium text-blue-900' : 'text-gray-900'}`}>
                        {displayText}
                      </span>
                      {isSelected && <CheckIcon className="w-4 h-4 text-blue-600" />}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          {/* Click outside to close */}
          <div
            className="fixed inset-0 z-0"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}

      {/* Show selected button when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {language === 'en' ? 'Click to select concerns' : 'Klik om hulpvragen te selecteren'}
        </button>
      )}

      {/* Help text */}
      <div className="text-xs text-gray-500">
        {language === 'en'
          ? 'Your selections are private and will only be used to match you with the most suitable therapist.'
          : 'Uw selecties zijn privé en worden alleen gebruikt om u te koppelen aan de meest geschikte therapeut.'
        }
      </div>
    </div>
  );
};

export default SimpleHulpvragenSelector;
