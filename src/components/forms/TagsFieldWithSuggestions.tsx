import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TagsFieldWithSuggestionsProps {
  label: string;
  name: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
  allowCustom?: boolean;
}

export const TagsFieldWithSuggestions: React.FC<TagsFieldWithSuggestionsProps> = ({
  label,
  name,
  value,
  onChange,
  suggestions = [],
  placeholder = 'Type to search or add custom...',
  required = false,
  error,
  hint,
  disabled = false,
  allowCustom = true
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
  );

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        // Add highlighted suggestion
        addTag(filteredSuggestions[highlightedIndex]);
      } else if (inputValue.trim() && (allowCustom || filteredSuggestions.length === 0)) {
        // Add custom tag
        addTag(inputValue.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const addTag = (tag: string) => {
    if (!value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInputValue('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={inputRef}
            id={name}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
              setHighlightedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            `}
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors
                    ${highlightedIndex === index ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                  `}
                >
                  {suggestion}
                </button>
              ))}
              {allowCustom && inputValue && !suggestions.includes(inputValue) && (
                <button
                  type="button"
                  onClick={() => addTag(inputValue)}
                  onMouseEnter={() => setHighlightedIndex(filteredSuggestions.length)}
                  className={`
                    w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors border-t border-gray-100
                    ${highlightedIndex === filteredSuggestions.length ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                  `}
                >
                  Add "{inputValue}" as custom
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Selected tags */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {tag}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-blue-900"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
    </div>
  );
};

// Common specialization suggestions
export const THERAPIST_SPECIALIZATIONS = [
  'Anxiety Disorders',
  'Depression',
  'PTSD',
  'Trauma Therapy',
  'Relationship Counseling',
  'Family Therapy',
  'Child Psychology',
  'Adolescent Therapy',
  'Addiction Counseling',
  'Eating Disorders',
  'Personality Disorders',
  'Bipolar Disorder',
  'Schizophrenia',
  'OCD',
  'Autism Spectrum',
  'ADHD',
  'Grief Counseling',
  'Life Transitions',
  'Career Counseling',
  'Stress Management',
  'Anger Management',
  'Self-Esteem Issues',
  'Sexual Health',
  'LGBTQ+ Issues',
  'Cultural Issues',
  'Chronic Pain Management',
  'Sleep Disorders',
  'Phobias',
  'Social Anxiety',
  'Panic Disorder',
  'Generalized Anxiety',
  'Major Depression',
  'Postpartum Depression',
  'Seasonal Affective Disorder',
  'Adjustment Disorders',
  'Conduct Disorders',
  'Learning Disabilities',
  'Intellectual Disabilities',
  'Dementia Care',
  'Elder Care',
  'Couples Therapy',
  'Marriage Counseling',
  'Divorce Counseling',
  'Co-Parenting Issues',
  'Blended Family Issues',
  'Adoption Issues',
  'Foster Care Issues',
  'Parenting Skills',
  'Communication Skills',
  'Conflict Resolution'
];

// Common languages
export const LANGUAGES = [
  'Dutch',
  'English',
  'German',
  'French',
  'Spanish',
  'Italian',
  'Portuguese',
  'Polish',
  'Turkish',
  'Arabic',
  'Chinese',
  'Japanese',
  'Russian',
  'Hindi',
  'Urdu',
  'Bengali',
  'Punjabi',
  'Indonesian',
  'Malay',
  'Thai',
  'Vietnamese',
  'Korean',
  'Persian',
  'Hebrew',
  'Greek',
  'Romanian',
  'Hungarian',
  'Czech',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish'
];