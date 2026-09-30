export interface Message {
  _id?: string;
  meetingId: string;
  sender: string;
  senderName: string;
  message: string;
  timestamp: string;
}
