export interface Participant {
  user?: string;
  name: string;
  socketId?: string;
  joinedAt?: string;
  leftAt?: string;
}

export interface Meeting {
  _id: string;
  meetingId: string;
  title: string;
  host: string;
  participants: Participant[];
  startTime?: string;
  endTime?: string;
  status: 'scheduled' | 'active' | 'ended';
  createdAt: string;
}
