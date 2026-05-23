export interface WorkspaceUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  accessToken: string | null;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject?: string;
  from?: string;
  date?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  updated?: string;
}

export interface TaskList {
  id: string;
  title: string;
}

export interface KeepNote {
  id: string;
  title: string;
  content: string;
  color?: string;
  updatedAt: string;
  isPinned?: boolean;
}

export interface ChatMessage {
  id: string;
  spaceName: string;
  senderName: string;
  text: string;
  createTime: string;
}

export interface ChatSpace {
  name: string;
  displayName: string;
  type: string;
}
