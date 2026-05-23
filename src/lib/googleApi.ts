import { CalendarEvent, GmailMessage, GoogleTask, TaskList, ChatSpace, ChatMessage } from '../types';

async function fetchGoogleApi(endpoint: string, token: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/json');

  const url = endpoint.startsWith('http') ? endpoint : `https://www.googleapis.com${endpoint}`;
  
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`Google API Error ${res.status}: ${res.statusText}. ${errorBody}`);
  }
  
  if (res.status === 204) return null;
  return res.json();
}

// 1. Google Calendar APIs
export const listCalendarEvents = async (token: string): Promise<CalendarEvent[]> => {
  try {
    const timeMin = new Date().toISOString();
    const data = await fetchGoogleApi(
      `/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(timeMin)}&maxResults=10`,
      token
    );
    return (data.items || []).map((item: any) => ({
      id: item.id,
      summary: item.summary || '(No Title)',
      description: item.description,
      start: {
        dateTime: item.start?.dateTime || item.start?.date,
      },
      end: {
        dateTime: item.end?.dateTime || item.end?.date,
      },
      htmlLink: item.htmlLink,
    }));
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    throw err;
  }
};

export const createCalendarEvent = async (
  token: string,
  event: { summary: string; description: string; startIso: string; endIso: string }
): Promise<CalendarEvent> => {
  try {
    const payload = {
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startIso },
      end: { dateTime: event.endIso },
    };
    const data = await fetchGoogleApi(
      '/calendar/v3/calendars/primary/events',
      token,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    return {
      id: data.id,
      summary: data.summary,
      description: data.description,
      start: { dateTime: data.start?.dateTime },
      end: { dateTime: data.end?.dateTime },
    };
  } catch (err) {
    console.error('Error creating calendar event:', err);
    throw err;
  }
};

export const deleteCalendarEvent = async (token: string, eventId: string): Promise<void> => {
  await fetchGoogleApi(`/calendar/v3/calendars/primary/events/${eventId}`, token, {
    method: 'DELETE',
  });
};

// 2. Google Tasks APIs
export const listTaskLists = async (token: string): Promise<TaskList[]> => {
  const data = await fetchGoogleApi('/tasks/v1/users/@me/lists', token);
  return (data.items || []).map((list: any) => ({
    id: list.id,
    title: list.title,
  }));
};

export const listTasks = async (token: string, tasklistId: string): Promise<GoogleTask[]> => {
  const data = await fetchGoogleApi(`/tasks/v1/lists/${tasklistId}/tasks`, token);
  return (data.items || []).map((task: any) => ({
    id: task.id,
    title: task.title,
    notes: task.notes,
    status: task.status,
    due: task.due,
    updated: task.updated,
  }));
};

export const createGoogleTask = async (
  token: string,
  tasklistId: string,
  title: string,
  notes?: string,
  due?: string
): Promise<GoogleTask> => {
  const payload: any = { title, notes };
  if (due) payload.due = due;
  
  const data = await fetchGoogleApi(`/tasks/v1/lists/${tasklistId}/tasks`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return {
    id: data.id,
    title: data.title,
    notes: data.notes,
    status: data.status,
  };
};

export const markGoogleTaskComplete = async (
  token: string,
  tasklistId: string,
  taskId: string,
  completed: boolean
): Promise<GoogleTask> => {
  const payload = {
    status: completed ? 'completed' : 'needsAction',
  };
  const data = await fetchGoogleApi(`/tasks/v1/lists/${tasklistId}/tasks/${taskId}`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return {
    id: data.id,
    title: data.title,
    notes: data.notes,
    status: data.status,
  };
};

export const deleteGoogleTask = async (token: string, tasklistId: string, taskId: string): Promise<void> => {
  await fetchGoogleApi(`/tasks/v1/lists/${tasklistId}/tasks/${taskId}`, token, {
    method: 'DELETE',
  });
};

// 3. Gmail API Wrapper
export const listGmailInbox = async (token: string, maxResults = 5): Promise<GmailMessage[]> => {
  try {
    const listRes = await fetchGoogleApi(`/gmail/v1/users/me/messages?maxResults=${maxResults}&q=category:primary`, token);
    if (!listRes.messages || listRes.messages.length === 0) {
      return [];
    }

    const detailPromises = listRes.messages.map(async (msgStub: any) => {
      try {
        const detail = await fetchGoogleApi(`/gmail/v1/users/me/messages/${msgStub.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, token);
        const headers: any[] = detail.payload?.headers || [];
        const subject = headers.find((h) => h.name === 'Subject')?.value || '(No Subject)';
        const from = headers.find((h) => h.name === 'From')?.value || 'Unknown sender';
        const date = headers.find((h) => h.name === 'Date')?.value || '';

        return {
          id: detail.id,
          threadId: detail.threadId,
          snippet: detail.snippet || '',
          style: 'primary',
          subject,
          from,
          date: new Date(date).toLocaleString(),
        };
      } catch (err) {
        console.error(`Error loading detail for msg ID ${msgStub.id}:`, err);
        return {
          id: msgStub.id,
          threadId: msgStub.threadId,
          snippet: 'Failed to fully synchronize body content.',
        };
      }
    });

    return await Promise.all(detailPromises);
  } catch (err) {
    console.error('Error listing Gmail inbox:', err);
    throw err;
  }
};

export const sendGmailMessage = async (
  token: string,
  to: string,
  subject: string,
  body: string
): Promise<{ id: string }> => {
  try {
    // Generate valid RFC 2822 base64url formatted payload
    const emailParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      body,
    ];
    const emailContent = emailParts.join('\n');
    
    // safe base64 encoding (matches RFC 4648)
    const rawBase64 = btoa(unescape(encodeURIComponent(emailContent)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const data = await fetchGoogleApi('/gmail/v1/users/me/messages/send', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: rawBase64 }),
    });
    return { id: data.id };
  } catch (err) {
    console.error('Error sending GMail:', err);
    throw err;
  }
};

// 4. Google Chat API Wrapper
export const listChatSpaces = async (token: string): Promise<ChatSpace[]> => {
  try {
    const data = await fetchGoogleApi('/chat/v1/spaces', token);
    return (data.spaces || []).map((space: any) => ({
      name: space.name,
      displayName: space.displayName || 'Unnamed Space',
      type: space.type,
    }));
  } catch (err) {
    console.error('Error listing Chat spaces:', err);
    return []; // Return empty gracefully for custom user chat integrations
  }
};

export const sendChatMessage = async (token: string, spaceName: string, text: string): Promise<ChatMessage> => {
  const payload = { text };
  const data = await fetchGoogleApi(`/${spaceName}/messages`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return {
    id: data.name,
    spaceName: spaceName,
    senderName: data.sender?.displayName || 'HUD System Bot',
    text: data.text,
    createTime: new Date(data.createTime).toLocaleString(),
  };
};
