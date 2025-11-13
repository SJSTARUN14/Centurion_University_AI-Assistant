
export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  file?: {
    name: string;
    url: string; // Object URL for preview
    type: string; // MIME type
  };
}
