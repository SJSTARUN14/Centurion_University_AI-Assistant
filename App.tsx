import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import InitialSuggestions from './components/InitialSuggestions';
import Header from './components/Header';
import { getCenturionAIResponseStream } from './services/geminiService';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      text: "Hello! I'm CenturionAI. My main goal is to assist you with information about Centurion University (CUTM).\n\nHowever, feel free to ask me anything else you're curious about! I'll do my best to help.\n\nHow can I assist you today?",
      sender: Sender.Bot,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // A more reliable scroll-to-bottom
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (userMessage: string, file?: File) => {
    if (isLoading || (!userMessage.trim() && !file)) return;
    setIsLoading(true);

    const fileInfo = file ? { name: file.name, url: URL.createObjectURL(file), type: file.type } : undefined;
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: userMessage,
      sender: Sender.User,
      file: fileInfo,
    };
    
    const botMessageId = (Date.now() + 1).toString();
    const newBotMessage: Message = {
      id: botMessageId,
      text: '', // Start with empty text
      sender: Sender.Bot,
    };
    
    setMessages((prevMessages) => [...prevMessages, newUserMessage, newBotMessage]);

    try {
      let stream;
      if (file) {
        const base64 = await fileToBase64(file);
        const filePayload = { base64, mimeType: file.type };
        stream = getCenturionAIResponseStream(userMessage, filePayload);
      } else {
        stream = getCenturionAIResponseStream(userMessage);
      }

      for await (const chunk of stream) {
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: msg.text + chunk } 
            : msg
        ));
      }

    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: "Sorry, I'm having trouble connecting right now. Please try again later." }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 dark:bg-black font-sans text-black dark:text-gray-200">
      <Header />
      <main ref={chatContainerRef} className="flex-grow overflow-y-auto">
        <div className="max-w-4xl mx-auto pt-8 pb-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {messages.length === 1 && (
            <InitialSuggestions onSuggestionClick={(suggestion) => handleSendMessage(suggestion)} />
          )}
        </div>
      </main>
      <footer className="w-full shrink-0">
         <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
};

export default App;
