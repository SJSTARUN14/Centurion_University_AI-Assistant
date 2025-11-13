import React from 'react';

interface InitialSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  "Admissions Process",
  "Fee Structure",
  "Hostel Facilities",
  "Contact the Registrar",
];

const InitialSuggestions: React.FC<InitialSuggestionsProps> = ({ onSuggestionClick }) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-3 px-4 md:px-0 my-6">
      {suggestions.map((text) => (
        <button
          key={text}
          onClick={() => onSuggestionClick(text)}
          className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 font-medium py-2 px-6 rounded-full transition-colors duration-200 shadow-md text-sm"
        >
          {text}
        </button>
      ))}
    </div>
  );
};

export default InitialSuggestions;
