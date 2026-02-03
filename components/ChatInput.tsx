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
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

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
    e.target.value = '';
    setShowAttachmentOptions(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || selectedFile) && !isLoading) {
      onSendMessage(input.trim(), selectedFile ?? undefined);
      setInput('');
      handleRemoveFile();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="input-container p-4 md:p-6 pb-8">
      <div className="max-w-4xl mx-auto">
        {selectedFile && (
          <div className="relative inline-flex items-center gap-3 mb-4 p-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 animate-message">
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="h-12 w-12 object-cover rounded-xl" />
            ) : (
              <div className="flex items-center justify-center h-12 w-12 bg-slate-100 dark:bg-slate-700 rounded-xl shrink-0">
                <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
            )}
            <div className="flex flex-col pr-8">
              <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{selectedFile.name}</span>
              <span className="text-[10px] text-slate-500 uppercase">Wait for analysis...</span>
            </div>
            <button
              onClick={handleRemoveFile}
              className="absolute -top-2 -right-2 bg-maroon-800 text-white rounded-full p-1.5 shadow-lg bg-red-800 hover:scale-110 transition-transform"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden shadow-xl border border-black/5 dark:border-white/10 flex items-end p-2 transition-all focus-within:ring-2 focus-within:ring-maroon-500/20">
          <div className="flex items-center px-1">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-3 text-slate-400 hover:text-maroon-800 dark:hover:text-white transition-colors"
              title="Attach File"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-grow bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 border-none focus:ring-0 resize-none py-3 px-2 text-[15px]"
            rows={1}
          />

          <button
            onClick={() => handleSubmit()}
            disabled={isLoading || (!input.trim() && !selectedFile)}
            className={`p-3 rounded-2xl transition-all duration-200 transform ${isLoading || (!input.trim() && !selectedFile) ? 'text-slate-300' : 'text-maroon-800 dark:text-white hover:scale-110'}`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-slate-300 border-t-maroon-800 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
          CenturionAI may provide general info. Verify important facts.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;