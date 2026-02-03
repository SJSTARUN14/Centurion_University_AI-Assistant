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
      text: "Namaste! I'm **CenturionAI**. I'm here to help you with anything related to **Centurion University (CUTM)**.\n\nWhether it's about admissions, fees, or campus life, just ask! I can even understand **Tenglish** or **Hindi**. How can I help you today?",
      sender: Sender.Bot,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
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
      text: '',
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessages(prev => prev.map(msg =>
        msg.id === botMessageId
          ? { ...msg, text: "I'm sorry, I encountered an error: " + errorMessage }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen main-bg overflow-hidden">
      <Header />

      <main ref={chatContainerRef} className="flex-grow overflow-y-auto scroll-smooth">
        <div className="max-w-4xl mx-auto py-8">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {messages.length === 1 && (
            <InitialSuggestions onSuggestionClick={(suggestion) => handleSendMessage(suggestion)} />
          )}
          {isLoading && messages[messages.length - 1].text === '' && (
            <div className="px-6 py-4 animate-pulse italic text-sm text-gray-500">
              CenturionAI is thinking...
            </div>
          )}
        </div>
      </main>

      <footer className="w-full shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default App;
