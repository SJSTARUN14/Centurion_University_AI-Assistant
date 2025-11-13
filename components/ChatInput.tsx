import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const attachmentOptionsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      const scrollHeight = textarea.scrollHeight;
      // Set a max height (e.g., 200px) and allow scrolling
      textarea.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

  // Click outside to close attachment options
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        attachmentOptionsContainerRef.current &&
        !attachmentOptionsContainerRef.current.contains(event.target as Node)
      ) {
        setShowAttachmentOptions(false);
      }
    };
    if (showAttachmentOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAttachmentOptions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview(null);
      }
    }
    // Reset value to allow re-uploading the same file if needed
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || selectedFile) && !isLoading) {
      onSendMessage(input.trim(), selectedFile ?? undefined);
      setInput('');
      handleRemoveFile();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-black p-4 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto">
        {selectedFile && (
          <div className="relative inline-flex items-center gap-2 mb-2 p-2 bg-gray-200 dark:bg-gray-800 rounded-lg max-w-full">
            {imagePreview ? (
              <img src={imagePreview} alt="Selected preview" className="h-12 w-12 object-cover rounded-md" />
            ) : (
              <div className="flex items-center justify-center h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-md shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{selectedFile.name}</span>
            <button
              onClick={handleRemoveFile}
              className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1 leading-none text-xs"
              aria-label="Remove file"
            >
              &#x2715;
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-end space-x-3 bg-white dark:bg-gray-900 rounded-xl p-2 shadow-inner">
          <div ref={attachmentOptionsContainerRef} className="relative">
            {showAttachmentOptions && (
              <div className="absolute bottom-14 left-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowAttachmentOptions(false);
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cameraInputRef.current?.click();
                    setShowAttachmentOptions(false);
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Take Photo
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => setShowAttachmentOptions(prev => !prev)}
              disabled={isLoading}
              className="p-3 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-50 transition-colors shrink-0"
              aria-label="Attach file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" />
              </svg>
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or attach a file..."
            disabled={isLoading}
            className="flex-grow bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none focus:ring-0 resize-none p-2"
            rows={1}
          />
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedFile)}
            className="bg-black dark:bg-white rounded-full p-3 text-white dark:text-black disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shrink-0 flex items-center justify-center w-12 h-12"
            aria-label="Send message"
          >
            {isLoading ? (
                <div className="w-5 h-5 border-t-2 border-r-2 border-white dark:border-black rounded-full animate-spin"></div>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;