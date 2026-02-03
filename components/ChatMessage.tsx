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

  // Lists
  html = html.replace(/^([•*] .+(?:\n[•*] .+)*)/gm, (listBlock) => {
    const items = listBlock.split('\n').map(item => `<li>${item.substring(2)}</li>`).join('');
    return `<ul class="list-disc list-inside space-y-1 my-2">${items}</ul>`;
  });

  // Newlines
  html = html.replace(/([^\n])\n(?![•*]|<li>|<\/ul>)/g, '$1<br />');

  return html;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  return (
    <div className={`flex items-start gap-4 my-6 px-4 md:px-6 animate-message ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100 dark:bg-slate-800 dark:border-slate-700 shrink-0">
          <img
            src={BOT_AVATAR_URL}
            alt="Bot"
            className="w-7 h-7"
          />
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-[85%] sm:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`p-4 shadow-sm text-[15px] leading-relaxed ${isUser ? 'user-bubble' : 'bot-bubble text-slate-800 dark:text-slate-200'}`}>
          {isUser && message.file && (
            <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
              {message.file.type.startsWith('image/') ? (
                <img
                  src={message.file.url}
                  alt="upload"
                  className="max-h-60 object-contain w-full bg-black/5"
                />
              ) : (
                <div className="p-3 bg-white/10 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                  <span className="text-xs truncate">{message.file.name}</span>
                </div>
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
        {!isUser && (
          <span className="text-[10px] text-gray-400 font-medium px-1">CenturionAI • Just now</span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;