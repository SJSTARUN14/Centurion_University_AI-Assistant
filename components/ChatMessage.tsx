import React from 'react';
import { Message, Sender } from '../types';
import { BOT_AVATAR_URL } from '../constants';

interface ChatMessageProps {
  message: Message;
}

const renderMarkdown = (text: string): string => {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Lists: Process blocks of lines starting with • or *
  html = html.replace(/^([•*] .+(?:\n[•*] .+)*)/gm, (listBlock) => {
    const items = listBlock.split('\n').map(item => `<li>${item.substring(2)}</li>`).join('');
    return `<ul class="list-disc list-inside pl-4">${items}</ul>`;
  });

  // Convert remaining single newlines (that are not preceded by a list) to <br>
  html = html.replace(/([^\n])\n(?![•*]|<li>|<\/ul>)/g, '$1<br />');

  return html;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  const botIcon = (
    <img 
      src={BOT_AVATAR_URL} 
      alt="Bot Avatar" 
      className="w-10 h-10 rounded-full shrink-0" 
    />
  );

  return (
    <div className={`flex items-start gap-4 my-4 px-4 md:px-0 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && botIcon}
      <div className={`flex flex-col gap-1 w-full max-w-2xl ${isUser ? 'items-end' : ''}`}>
        <div className={`leading-relaxed text-base font-normal p-4 rounded-lg shadow-md ${isUser ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black'}`}>
          {isUser && message.file && (
            <div className="mb-2">
              {message.file.type.startsWith('image/') ? (
                <img 
                  src={message.file.url} 
                  alt={message.file.name} 
                  className="rounded-lg max-w-full sm:max-w-xs md:max-w-sm max-h-64 object-contain" 
                />
              ) : (
                <a 
                  href={message.file.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  download={message.file.name}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-black dark:text-white truncate">{message.file.name}</span>
                </a>
              )}
            </div>
          )}
          {message.text && (isUser ? (
            <p className="whitespace-pre-wrap">{message.text}</p>
          ) : (
             <div
               className="prose prose-sm max-w-none dark:prose-invert"
               dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }}
             />
           ))}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;