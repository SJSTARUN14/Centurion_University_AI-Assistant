import React from 'react';

interface InitialSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  "Admissions",
  "Fee Details",
  "Hostels",
  "Contact Info",
];

const InitialSuggestions: React.FC<InitialSuggestionsProps> = ({ onSuggestionClick }) => {
  return (
    <div className="flex flex-col items-center gap-6 my-12 animate-message">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">How can I help you?</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Choose a topic or ask me anything</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3 px-4">
        {suggestions.map((text) => (
          <button
            key={text}
            onClick={() => onSuggestionClick(text)}
            className="group flex items-center gap-3 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-8 rounded-2xl transition-all duration-200 shadow-sm border border-black/5 dark:border-white/5 hover:shadow-md hover:-translate-y-1"
          >
            <span className="text-sm">{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InitialSuggestions;
