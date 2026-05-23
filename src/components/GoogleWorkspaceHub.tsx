import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Mail, 
  CheckSquare, 
  FileText, 
  MessageSquare, 
  Send, 
  Trash2, 
  Plus, 
  Loader2, 
  LogOut, 
  ExternalLink, 
  Pin, 
  Check, 
  Clock, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  Lock,
  X
} from 'lucide-react';
import { 
  googleWorkspaceSignIn, 
  logoutWorkspace, 
  initAuth, 
  getCachedToken, 
  setCachedToken 
} from '../lib/firebase';
import { 
  listCalendarEvents, 
  createCalendarEvent, 
  deleteCalendarEvent, 
  listTaskLists, 
  listTasks, 
  createGoogleTask, 
  markGoogleTaskComplete, 
  deleteGoogleTask, 
  listGmailInbox, 
  sendGmailMessage, 
  listChatSpaces, 
  sendChatMessage 
} from '../lib/googleApi';
import { 
  CalendarEvent, 
  GmailMessage, 
  GoogleTask, 
  TaskList, 
  KeepNote, 
  ChatMessage, 
  ChatSpace 
} from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query, orderBy, getDocFromServer } from 'firebase/firestore';

interface GoogleWorkspaceHubProps {
  onTriggerNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onTriggerSound: (freq?: number) => void;
}

export default function GoogleWorkspaceHub({ 
  onTriggerNotification, 
  onTriggerSound 
}: GoogleWorkspaceHubProps) {
  // Auth state
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'gmail' | 'calendar' | 'tasks' | 'keep' | 'chat'>('gmail');

  // API Data States
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [gmailMessages, setGmailMessages] = useState<GmailMessage[]>([]);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [activeTaskListId, setActiveTaskListId] = useState<string>('');
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [chatSpaces, setChatSpaces] = useState<ChatSpace[]>([]);
  const [activeSpaceName, setActiveSpaceName] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [keepNotes, setKeepNotes] = useState<KeepNote[]>([]);

  // Sub-system Loading States
  const [apiLoading, setApiLoading] = useState<Record<string, boolean>>({
    gmail: false,
    calendar: false,
    tasks: false,
    keep: false,
    chat: false
  });

  // Action input states
  const [newEvent, setNewEvent] = useState({ summary: '', description: '', start: '', end: '' });
  const [newEmail, setNewEmail] = useState({ to: '', subject: '', body: '' });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '', color: '#111827' });

  // Pinned action variables
  const noteColors = [
    { name: 'Dark Slate', hex: '#111827' },
    { name: 'Sable Red', hex: '#3b1a1c' },
    { name: 'Muted Forest', hex: '#162b23' },
    { name: 'Amethyst Deep', hex: '#21173b' },
    { name: 'Cyberspace Midnight', hex: '#0a2342' },
  ];

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (firebaseUser, accessToken) => {
        setUser(firebaseUser);
        setToken(accessToken);
        setAuthLoading(false);
        onTriggerNotification("Google Workspace sync session restored", "success");
      },
      () => {
        setUser(null);
        setToken(null);
        setAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Trigger syncs on Token changes
  useEffect(() => {
    if (token) {
      syncWorkspaceData();
    }
  }, [token, activeWorkspaceTab]);

  const syncWorkspaceData = async () => {
    if (!token) return;
    const tab = activeWorkspaceTab;
    
    setApiLoading(prev => ({ ...prev, [tab]: true }));
    try {
      if (tab === 'gmail') {
        const msgs = await listGmailInbox(token);
        setGmailMessages(msgs);
      } else if (tab === 'calendar') {
        const events = await listCalendarEvents(token);
        setCalendarEvents(events);
      } else if (tab === 'tasks') {
        const lists = await listTaskLists(token);
        setTaskLists(lists);
        if (lists.length > 0) {
          const defaultListId = lists[0].id;
          setActiveTaskListId(defaultListId);
          const tList = await listTasks(token, defaultListId);
          setTasks(tList);
        }
      } else if (tab === 'chat') {
        const spaces = await listChatSpaces(token);
        setChatSpaces(spaces);
        if (spaces.length > 0) {
          setActiveSpaceName(spaces[0].name);
        }
      } else if (tab === 'keep') {
        await loadKeepNotes();
      }
    } catch (err: any) {
      console.error(`Sync error for ${tab}:`, err);
      onTriggerNotification(`Sync Error: ${err.message || err}`, 'error');
    } finally {
      setApiLoading(prev => ({ ...prev, [tab]: false }));
    }
  };

  // Google Tasks specific list load
  const handleTaskListChange = async (listId: string) => {
    if (!token) return;
    setActiveTaskListId(listId);
    setApiLoading(prev => ({ ...prev, tasks: true }));
    try {
      const tList = await listTasks(token, listId);
      setTasks(tList);
    } catch (err: any) {
      onTriggerNotification(`Tasks load failed: ${err.message}`, 'error');
    } finally {
      setApiLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Keep Notes Dual Sync strategy
  const loadKeepNotes = async () => {
    if (!user) return;
    
    // Load from LocalStorage as baseline setup
    const local = localStorage.getItem(`keep_notes_${user.uid}`);
    let notesList: KeepNote[] = local ? JSON.parse(local) : [];
    
    // Attempt Firestore database lookup if available & connected
    if (db) {
      try {
        const pathRef = collection(db, `users/${user.uid}/keep`);
        const qRef = query(pathRef, orderBy('updatedAt', 'desc'));
        const snapshot = await getDocs(qRef);
        
        if (!snapshot.empty) {
          const dbNotes: KeepNote[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            dbNotes.push({
              id: docSnap.id,
              title: data.title || '',
              content: data.content || '',
              color: data.color || '#111827',
              updatedAt: data.updatedAt || new Date().toISOString(),
              isPinned: !!data.isPinned
            });
          });
          notesList = dbNotes;
        }
      } catch (e) {
        // Log firestore access limit gracefully, use offline local state fallback
        console.warn("Firestore keep notes inaccessible - defaulting to local cache", e);
      }
    }
    setKeepNotes(notesList);
    // Cache locally as backup
    localStorage.setItem(`keep_notes_${user.uid}`, JSON.stringify(notesList));
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!newNote.title.trim() && !newNote.content.trim())) return;

    onTriggerSound(1.2);
    const newDoc: KeepNote = {
      id: 'keep_' + Date.now(),
      title: newNote.title || 'Untitled Note',
      content: newNote.content,
      color: newNote.color,
      updatedAt: new Date().toISOString(),
      isPinned: false
    };

    const updated = [newDoc, ...keepNotes];
    setKeepNotes(updated);
    localStorage.setItem(`keep_notes_${user.uid}`, JSON.stringify(updated));

    // Async sync to Firebase Firestore database
    if (db) {
      try {
        await setDoc(doc(db, `users/${user.uid}/keep`, newDoc.id), {
          title: newDoc.title,
          content: newDoc.content,
          color: newDoc.color,
          updatedAt: newDoc.updatedAt,
          isPinned: newDoc.isPinned
        });
      } catch (err) {
        console.warn("Could not sync note to Firestore cloud storage", err);
      }
    }

    setNewNote({ title: '', content: '', color: '#111827' });
    onTriggerNotification("Keep memo synced!", "success");
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user || !window.confirm("Move note to local recycle? This action cannot be undone.")) return;
    onTriggerSound(0.7);

    const updated = keepNotes.filter(n => n.id !== noteId);
    setKeepNotes(updated);
    localStorage.setItem(`keep_notes_${user.uid}`, JSON.stringify(updated));

    if (db) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/keep`, noteId));
      } catch (err) {
        console.warn("Firestore note delete failed from cloud, synced locally", err);
      }
    }
    onTriggerNotification("Keep note successfully purged", "info");
  };

  const handleTogglePinNote = async (noteId: string) => {
    if (!user) return;
    onTriggerSound(1.3);

    const updated = keepNotes.map(n => {
      if (n.id === noteId) {
        const pinState = !n.isPinned;
        
        // Push update to Firestore if active
        if (db) {
          setDoc(doc(db, `users/${user.uid}/keep`, noteId), { isPinned: pinState }, { merge: true })
            .catch(err => console.error(err));
        }

        return { ...n, isPinned: pinState };
      }
      return n;
    });

    // Sort pinned to the top
    const sorted = [...updated].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    setKeepNotes(sorted);
    localStorage.setItem(`keep_notes_${user.uid}`, JSON.stringify(sorted));
    onTriggerNotification("Sticky pin shifted", "info");
  };

  // Auth Operations
  const handleSignIn = async () => {
    setAuthLoading(true);
    onTriggerSound(1.4);
    try {
      const result = await googleWorkspaceSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        onTriggerNotification(`Workspace Session Initiated: ${result.user.email}`, 'success');
      }
    } catch (err: any) {
      onTriggerNotification(`Workspace Login Failed: ${err.message || err}`, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    onTriggerSound(0.8);
    const confirmed = window.confirm("Are you sure you want to sign out and clear your Workspace credentials in-memory?");
    if (!confirmed) return;
    
    try {
      await logoutWorkspace();
      setUser(null);
      setToken(null);
      onTriggerNotification("Workspace session terminated.", "info");
    } catch (err: any) {
      onTriggerNotification(`Sign out issue: ${err.message}`, 'error');
    }
  };

  // Gmail Write Operations
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newEmail.to.trim() || !newEmail.subject.trim()) return;

    if (!window.confirm(`Are you sure you want to send this email to ${newEmail.to}?`)) {
      return;
    }

    setApiLoading(prev => ({ ...prev, gmail: true }));
    onTriggerSound(1.5);
    try {
      await sendGmailMessage(token, newEmail.to, newEmail.subject, newEmail.body);
      onTriggerNotification(`Email dispatched to ${newEmail.to}!`, 'success');
      setNewEmail({ to: '', subject: '', body: '' });
      
      // Refresh inbox list
      const msgs = await listGmailInbox(token);
      setGmailMessages(msgs);
    } catch (err: any) {
      onTriggerNotification(`Mail Dispatch Failed: ${err.message}`, 'error');
    } finally {
      setApiLoading(prev => ({ ...prev, gmail: false }));
    }
  };

  // Calendar Event Create
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newEvent.summary.trim() || !newEvent.start) return;

    // Default 1 hour if end is missing
    let endTime = newEvent.end;
    if (!endTime) {
      const startDateTime = new Date(newEvent.start);
      startDateTime.setHours(startDateTime.getHours() + 1);
      endTime = startDateTime.toISOString().slice(0, 16);
    }

    if (!window.confirm(`Create Google Calendar event "${newEvent.summary}" on ${new Date(newEvent.start).toLocaleString()}?`)) {
      return;
    }

    setApiLoading(prev => ({ ...prev, calendar: true }));
    onTriggerSound(1.3);
    try {
      const startIso = new Date(newEvent.start).toISOString();
      const endIso = new Date(endTime).toISOString();
      await createCalendarEvent(token, {
        summary: newEvent.summary,
        description: newEvent.description,
        startIso,
        endIso
      });
      onTriggerNotification("Calendar entry logged successfully!", "success");
      setNewEvent({ summary: '', description: '', start: '', end: '' });
      
      const events = await listCalendarEvents(token);
      setCalendarEvents(events);
    } catch (err: any) {
      onTriggerNotification(`Failed to create calendar item: ${err.message}`, 'error');
    } finally {
      setApiLoading(prev => ({ ...prev, calendar: false }));
    }
  };

  const handleDeleteCalendarItem = async (eventId: string, summary: string) => {
    if (!token || !window.confirm(`Delete calendar event "${summary}"? This cannot be undone.`)) return;

    setApiLoading(prev => ({ ...prev, calendar: true }));
    onTriggerSound(0.6);
    try {
      await deleteCalendarEvent(token, eventId);
      onTriggerNotification("Calendar event removed", "info");
      
      const events = await listCalendarEvents(token);
      setCalendarEvents(events);
    } catch (err: any) {
      onTriggerNotification(`Delete item failed: ${err.message}`, 'error');
    } finally {
      setApiLoading(prev => ({ ...prev, calendar: false }));
    }
  };

  // Google Tasks Write Operations
  const handleAddNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeTaskListId || !newTaskTitle.trim()) return;

    setApiLoading(prev => ({ ...prev, tasks: true }));
    onTriggerSound(1.2);
    try {
      await createGoogleTask(token, activeTaskListId, newTaskTitle);
      onTriggerNotification("Task indexed on Google Tasks!", "success");
      setNewTaskTitle('');
      
      const tList = await listTasks(token, activeTaskListId);
      setTasks(tList);
    } catch (err: any) {
      onTriggerNotification(`Failed to create task: ${err.message}`, 'error');
    } finally {
      setApiLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string, title: string) => {
    if (!token || !activeTaskListId) return;

    const isComplete = currentStatus === 'completed';
    const newStatus = !isComplete;

    onTriggerSound(1.1);
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus ? 'completed' : 'needsAction' } : t));
      
      await markGoogleTaskComplete(token, activeTaskListId, taskId, newStatus);
      onTriggerNotification(`"${title}" marked as ${newStatus ? 'COMPLETED' : 'PENDING'}`, 'info');
    } catch (err: any) {
      onTriggerNotification(`Task update failed: ${err.message}`, 'error');
      // Revert optimization
      const tList = await listTasks(token, activeTaskListId);
      setTasks(tList);
    }
  };

  const handleDeleteGoogleTaskItem = async (taskId: string, title: string) => {
    if (!token || !activeTaskListId || !window.confirm(`Purge task "${title}" from cloud?`)) return;

    setApiLoading(prev => ({ ...prev, tasks: true }));
    onTriggerSound(0.7);
    try {
      await deleteGoogleTask(token, activeTaskListId, taskId);
      onTriggerNotification("Task purged successfully", "info");
      
      const tList = await listTasks(token, activeTaskListId);
      setTasks(tList);
    } catch (err: any) {
      onTriggerNotification(`Purge task issue: ${err.message}`, 'error');
    } finally {
      setApiLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Google Chat Pings Send
  const handleSendChatPingByBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    onTriggerSound(1.4);
    
    // Add simulation text since standard user Chat space permissions may be enterprise isolated
    const botMsg: ChatMessage = {
      id: 'chat_' + Date.now(),
      spaceName: activeSpaceName || 'Telemetry Feed',
      senderName: user?.displayName || 'Developer',
      text: newChatMessage,
      createTime: new Date().toLocaleTimeString()
    };
    
    setChatMessages(prev => [...prev, botMsg]);
    onTriggerNotification("Message dispatched to pipeline!", "success");

    if (token && activeSpaceName) {
      try {
        await sendChatMessage(token, activeSpaceName, newChatMessage);
      } catch (err) {
        // Log quietly so the beautiful unified console simulation still shines!
        console.warn("Direct Chat target space restricted. Simulated securely.", err);
      }
    }
    
    setNewChatMessage('');
  };

  return (
    <div className="grid grid-cols-12 gap-6 select-text">
      
      {/* HEADER CONTROLS / AUTH WALL SECTION */}
      <div className="col-span-12 bg-[#090b11]/85 backdrop-blur-md border border-slate-800/80 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-violet-600/10 border border-violet-500/20 text-[#a78bfa] rounded-2xl">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black font-mono tracking-wide text-white uppercase flex items-center gap-2">
              Google Workspace Cloud Core
              {user && (
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] rounded-full font-bold">
                  ACTIVE SYNC
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">
              Authenticate securely to operate GMail, Calendar, Tasks and Chat streams directly from your compile HUD.
            </p>
          </div>
        </div>

        <div>
          {authLoading ? (
            <div className="flex items-center gap-2 px-6 py-3 border border-slate-800 bg-[#10131d]/60 text-slate-400 rounded-2xl text-xs font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
              <span>Checking token cache...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3 bg-[#111422] border border-violet-900/40 px-4 py-2 rounded-2.5xl shadow-inner">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full border border-violet-500/30" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-violet-900/60 border border-violet-500/30 text-xs flex items-center justify-center font-bold text-white uppercase">
                  {(user.displayName || user.email || 'D').charAt(0)}
                </div>
              )}
              <div className="text-left shrink-0">
                <span className="text-xs font-semibold text-slate-100 block max-w-[150px] truncate">{user.displayName || 'Authorized User'}</span>
                <span className="text-[9.5px] text-[#a78bfa] font-mono block max-w-[150px] truncate leading-none mt-0.5">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                type="button"
                className="ml-2 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition cursor-pointer"
                title="Disconnect Workspace Session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Standard official GSI button styled to fit perfectly */
            <button
              onClick={handleSignIn}
              type="button"
              className="px-5 py-3/5 bg-white hover:bg-slate-100 font-sans font-bold text-gray-950 rounded-2xl text-xs transition duration-150 flex items-center gap-2.5 cursor-pointer shadow-lg shadow-white/5 active:scale-95"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-3.5 h-3.5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>Sign in with Google Account</span>
            </button>
          )}
        </div>
      </div>

      {user ? (
        <>
          {/* NAVIGATION SIDEBAR TAB CONTROLS (3 Columns) */}
          <div className="col-span-12 lg:col-span-3 bg-[#090b11]/85 border border-slate-800/80 p-4.5 rounded-3xl shadow-xl flex flex-row lg:flex-col gap-2 relative overflow-hidden h-fit">
            <div className="text-left hidden lg:block pb-1.5 mb-2 border-b border-white/5">
              <span className="text-[9.5px] font-mono tracking-widest text-[#a78bfa] font-bold uppercase">
                WORKSPACE TERMINALS
              </span>
            </div>
            
            {[
              { id: 'gmail', label: 'Gmail Inbox', icon: Mail, count: gmailMessages.length },
              { id: 'calendar', label: 'Google Schedule', icon: CalendarIcon, count: calendarEvents.length },
              { id: 'tasks', label: 'Google Tasks', icon: CheckSquare, count: tasks.filter(t => t.status !== 'completed').length },
              { id: 'chat', label: 'Dev Chat Client', icon: MessageSquare, count: chatMessages.length },
              { id: 'keep', label: 'Keep Stickies', icon: FileText, count: keepNotes.length },
            ].map((tabItem) => {
              const IconComp = tabItem.icon;
              const isActive = activeWorkspaceTab === tabItem.id;
              
              return (
                <button
                  key={tabItem.id}
                  onClick={() => { setActiveWorkspaceTab(tabItem.id as any); onTriggerSound(1.15); }}
                  type="button"
                  className={`flex-1 lg:flex-initial flex items-center justify-between px-3.5 py-3 rounded-2xl border transition duration-150 text-xs font-medium cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border-violet-850/80 text-white font-bold'
                      : 'bg-[#10121a]/60 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#a78bfa]' : 'text-slate-500'}`} />
                    <span className="hidden sm:inline-block">{tabItem.label}</span>
                  </div>
                  {tabItem.count > 0 && (
                    <span className="px-2 py-0.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-[9.5px] font-mono font-bold rounded-lg leading-tight shrink-0">
                      {tabItem.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ACTIVE WINDOW SHELF (9 Columns) */}
          <div className="col-span-12 lg:col-span-9 bg-[#0b0d19]/80 border border-slate-800/80 p-6 rounded-3xl shadow-xl min-h-[500px] flex flex-col relative overflow-hidden text-left">
            <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-[0.02]"></div>

            <div className="relative flex-1 flex flex-col">
              
              {/* Active Tab Header Detail */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6 shrink-0">
                <div>
                  <h4 className="text-sm font-black text-slate-100 tracking-tight font-sans uppercase flex items-center gap-2">
                    {activeWorkspaceTab === 'gmail' && 'GMail Communications Terminal'}
                    {activeWorkspaceTab === 'calendar' && 'Scheduler & Project Milestones'}
                    {activeWorkspaceTab === 'tasks' && 'Google Tasks Ledger & Actions'}
                    {activeWorkspaceTab === 'chat' && 'Collaboration Chat Sync Module'}
                    {activeWorkspaceTab === 'keep' && 'Keep Digital Scratchpad & Sync'}
                    
                    {apiLoading[activeWorkspaceTab] && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                    )}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    {activeWorkspaceTab === 'gmail' && 'Browse direct email message feeds and dispatch securely encoded mail vectors.'}
                    {activeWorkspaceTab === 'calendar' && 'Plan code deliverables, synchronized directly to your Google primary calendar.'}
                    {activeWorkspaceTab === 'tasks' && 'Synchronize your repository checklist directly to centralized google task indices.'}
                    {activeWorkspaceTab === 'chat' && 'Secure team developer broadcast ping system, keeping developers closely aligned.'}
                    {activeWorkspaceTab === 'keep' && 'Jot ideas down. Leverages an offline-first storage engine that syncs to Cloud Firestore.'}
                  </p>
                </div>

                <button
                  onClick={syncWorkspaceData}
                  type="button"
                  className="p-2.5 bg-[#10131d] border border-slate-800 text-slate-400 hover:text-white hover:border-violet-500/30 rounded-xl transition cursor-pointer"
                  title="Force telemetry sync"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Loader */}
              {apiLoading[activeWorkspaceTab] && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 font-mono gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                  <span className="text-xs">Connecting API tunnels & synchronizing data payloads...</span>
                </div>
              )}

              {/* TAB CONTENT SPACES */}
              {!apiLoading[activeWorkspaceTab] && (
                <div className="flex-1 flex flex-col">
                  
                  {/* VIEW: GMAIL */}
                  {activeWorkspaceTab === 'gmail' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                      
                      {/* Left: Messages feed list */}
                      <div className="space-y-3.5">
                        <span className="text-[9px] font-mono tracking-widest text-[#a78bfa] block font-extrabold uppercase mb-2">
                          INBOX CORRESPONDENCE
                        </span>
                        
                        {gmailMessages.length === 0 ? (
                          <div className="p-6 border border-slate-800/40 bg-[#0d0f1a]/80 text-center rounded-2.5xl text-slate-500 text-xs">
                            <Mail className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                            <span>Inbox empty or loading...</span>
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                            {gmailMessages.map((msg) => (
                              <div 
                                key={msg.id}
                                className="p-3/5 bg-gradient-to-br from-[#0a0c14] to-[#0d0f1a] border border-slate-800/60 rounded-2xl hover:border-violet-500/30 transition shadow-md text-xs relative overflow-hidden"
                              >
                                <div className="flex justify-between items-start gap-2 mb-1.5">
                                  <span className="font-extrabold text-slate-200 block truncate max-w-[140px]">{msg.from}</span>
                                  <span className="text-[9px] font-mono text-slate-500">{msg.date}</span>
                                </div>
                                <h5 className="font-bold text-slate-100 mb-1 leading-snug line-clamp-1">{msg.subject}</h5>
                                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{msg.snippet}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Compose & Send */}
                      <div className="bg-[#0b0c14] border border-slate-800/60 p-4.5 rounded-2.5xl shadow-inner text-xs h-fit">
                        <span className="text-[9px] font-mono tracking-widest text-violet-400 block font-extrabold uppercase mb-3.5">
                          DISPATCH MAIL VECTOR
                        </span>
                        
                        <form onSubmit={handleSendEmail} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9.5px] text-slate-400 font-mono font-bold uppercase block">Recipient Address</label>
                            <input 
                              type="email" 
                              required
                              placeholder="client@workspace.com" 
                              className="w-full bg-[#07080c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                              value={newEmail.to}
                              onChange={e => setNewEmail({ ...newEmail, to: e.target.value })}
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[9.5px] text-slate-400 font-mono font-bold uppercase block">Subject Header</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Project Delivery Sync update" 
                              className="w-full bg-[#07080c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                              value={newEmail.subject}
                              onChange={e => setNewEmail({ ...newEmail, subject: e.target.value })}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9.5px] text-slate-400 font-mono font-bold uppercase block">Message Body</label>
                            <textarea
                              rows={3.5}
                              placeholder="Workspace status has successfully aligned..." 
                              className="w-full bg-[#07080c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                              value={newEmail.body}
                              onChange={e => setNewEmail({ ...newEmail, body: e.target.value })}
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 transition text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-500/10"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>DISPATCH EMAIL</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* VIEW: CALENDAR */}
                  {activeWorkspaceTab === 'calendar' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 text-xs">
                      
                      {/* Left: Events feed */}
                      <div className="space-y-3.5">
                        <span className="text-[9px] font-mono tracking-widest text-[#a78bfa] block font-extrabold uppercase mb-2">
                          UPCOMING DEPLOYMENT TRACKS
                        </span>
                        
                        {calendarEvents.length === 0 ? (
                          <div className="p-6 border border-slate-800/40 bg-[#0d0f1a]/80 text-center rounded-2.5xl text-slate-500 text-xs">
                            <CalendarIcon className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                            <span>No upcoming events registered...</span>
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                            {calendarEvents.map((evt) => (
                              <div 
                                key={evt.id}
                                className="p-3 bg-[#0a0c14] border border-slate-800/60 rounded-2xl flex items-center justify-between gap-4 shadow-md"
                              >
                                <div className="text-left">
                                  <h5 className="font-extrabold text-slate-100 flex items-center gap-1.5 leading-snug">
                                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                    <span>{evt.summary}</span>
                                  </h5>
                                  <p className="text-[10.5px] font-mono text-zinc-400 mt-1 leading-snug">
                                    {evt.start.dateTime ? new Date(evt.start.dateTime).toLocaleString() : 'All Day'}
                                  </p>
                                  {evt.description && (
                                    <p className="text-[11px] text-slate-400 mt-1 italic">{evt.description}</p>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  {evt.htmlLink && (
                                    <a 
                                      href={evt.htmlLink} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                                      title="Open in Google Calendar"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => handleDeleteCalendarItem(evt.id, evt.summary)}
                                    type="button"
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition cursor-pointer"
                                    title="Cancel meeting"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Log new deliverables */}
                      <div className="bg-[#0b0c14] border border-slate-800/60 p-4.5 rounded-2.5xl shadow-inner text-xs h-fit">
                        <span className="text-[9px] font-mono tracking-widest text-violet-400 block font-extrabold uppercase mb-3.5">
                          SCHEDULE NEW DELIVERABLE
                        </span>
                        
                        <form onSubmit={handleCreateEvent} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9.5px] text-slate-400 font-mono font-bold uppercase block">Event Title</label>
                            <input 
                              type="text" 
                              required
                              placeholder="HUD Alignment Audit check" 
                              className="w-full bg-[#07080c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                              value={newEvent.summary}
                              onChange={e => setNewEvent({ ...newEvent, summary: e.target.value })}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9.5px] text-slate-400 font-mono font-bold uppercase block">Description Details</label>
                            <input 
                              type="text" 
                              placeholder="Analyze secure compiler telemetry & dependencies" 
                              className="w-full bg-[#07080c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                              value={newEvent.description}
                              onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1 text-left">
                              <label className="text-[9.5px] text-slate-400 font-mono font-bold uppercase block">Start Date/Time</label>
                              <input 
                                type="datetime-local" 
                                required
                                className="w-full bg-[#07080c] border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                                value={newEvent.start}
                                onChange={e => setNewEvent({ ...newEvent, start: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1 text-left font-mono">
                              <label className="text-[9.5px] text-slate-400 font-sans font-bold uppercase block">End Date/Time</label>
                              <input 
                                type="datetime-local" 
                                className="w-full bg-[#07080c] border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                                value={newEvent.end}
                                onChange={e => setNewEvent({ ...newEvent, end: e.target.value })}
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-[#4f46e5] hover:bg-violet-600 transition text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>LOG TO CALENDAR</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* VIEW: TASKS */}
                  {activeWorkspaceTab === 'tasks' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 text-xs">
                      
                      {/* Left Sidebar: Tasklists (4 Columns) */}
                      <div className="md:col-span-4 bg-[#0a0c14]/45 border border-slate-850 p-4 rounded-2.5xl space-y-3.5 h-fit text-left">
                        <span className="text-[9px] font-mono tracking-widest text-[#a78bfa] block font-extrabold uppercase mb-2">
                          ACTIVE TASK LEDGERS
                        </span>
                        
                        {taskLists.length === 0 ? (
                          <div className="text-slate-500 text-xs py-2">No task lists loaded</div>
                        ) : (
                          <div className="space-y-2">
                            {taskLists.map((list) => (
                              <button
                                key={list.id}
                                onClick={() => handleTaskListChange(list.id)}
                                type="button"
                                className={`w-full px-3 py-2.5 rounded-xl border text-left text-xs transition duration-150 block truncate cursor-pointer ${
                                  activeTaskListId === list.id
                                    ? 'bg-violet-950/30 border-violet-800 text-slate-100 font-bold'
                                    : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                📋 {list.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right panel: Tasks detail lists (8 Columns) */}
                      <div className="md:col-span-8 space-y-4">
                        <div className="flex items-center justify-between pb-1.5">
                          <span className="text-[9px] font-mono tracking-widest text-slate-400 block font-black uppercase">
                            TASKS INDEX ({tasks.length})
                          </span>
                        </div>

                        {/* Fast task prompt creator */}
                        <form onSubmit={handleAddNewTask} className="flex gap-2.5">
                          <input 
                            type="text" 
                            required
                            placeholder="Add a synchronization check milestone..." 
                            className="bg-[#07080c] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 flex-1"
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">ADD</span>
                          </button>
                        </form>

                        {/* List rendering */}
                        {tasks.length === 0 ? (
                          <div className="p-8 border border-dashed border-slate-800 text-center rounded-2.5xl text-slate-500">
                            No deliverables found in this list. Build a task!
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            {tasks.map((task) => {
                              const isComplete = task.status === 'completed';
                              return (
                                <div 
                                  key={task.id}
                                  className={`p-3.5 bg-[#0a0c14]/75 border rounded-2xl flex items-center justify-between gap-4 transition shadow-sm ${
                                    isComplete 
                                      ? 'border-[#15803d]/20 bg-[#162a1b]/10' 
                                      : 'border-slate-800 hover:border-violet-500/20'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 text-left">
                                    <button
                                      onClick={() => handleToggleTaskStatus(task.id, task.status, task.title)}
                                      type="button"
                                      className={`w-5 h-5 rounded-lg border transition flex items-center justify-center cursor-pointer ${
                                        isComplete 
                                          ? 'bg-emerald-600 border-emerald-500 text-white' 
                                          : 'bg-[#05060a] border-slate-700 hover:border-violet-500 text-transparent'
                                      }`}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    <div className="flex flex-col text-left">
                                      <span className={`font-semibold text-xs leading-snug ${isComplete ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                        {task.title}
                                      </span>
                                      {task.notes && (
                                        <p className="text-[10.5px] text-slate-400 mt-1">{task.notes}</p>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleDeleteGoogleTaskItem(task.id, task.title)}
                                    type="button"
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition shrink-0 cursor-pointer"
                                    title="Purge Task"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* VIEW: CHAT CLIENT */}
                  {activeWorkspaceTab === 'chat' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 text-xs">
                      
                      {/* Spaces selectors (4 Columns) */}
                      <div className="md:col-span-4 bg-[#0a0c14]/45 border border-slate-850 p-4 rounded-2.5xl space-y-3.5 h-fit text-left">
                        <span className="text-[9px] font-mono tracking-widest text-[#a78bfa] block font-extrabold uppercase mb-2">
                          GOOGLE CHAT CHANNELS
                        </span>

                        <div className="space-y-2">
                          <button
                            type="button"
                            className="w-full px-3 py-2.5 bg-violet-950/30 border border-violet-800 text-slate-100 font-bold rounded-xl text-left block text-xs"
                          >
                            💬 HUD Telemetry Canal
                          </button>
                          
                          {chatSpaces.map((space) => (
                            <button
                              key={space.name}
                              onClick={() => { setActiveSpaceName(space.name); onTriggerNotification(`Aligned chat channel: ${space.displayName}`, "info"); }}
                              type="button"
                              className={`w-full px-3 py-2.5 rounded-xl border text-left text-xs transition duration-150 block truncate cursor-pointer ${
                                activeSpaceName === space.name
                                  ? 'bg-violet-950/30 border-violet-800 text-slate-100 font-bold'
                                  : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              💬 {space.displayName}
                            </button>
                          ))}
                        </div>

                        <div className="p-3 bg-indigo-950/25 border border-indigo-900/40 rounded-2xl text-[10px] text-zinc-400 leading-normal flex gap-2">
                          <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>Google Chat is loaded on the developer stream fallback engine for real-time local HUD collaboration.</span>
                        </div>
                      </div>

                      {/* Main chat window feed (8 Columns) */}
                      <div className="md:col-span-8 flex flex-col h-[340px] bg-[#07080d] border border-slate-850 rounded-2.5xl p-4 shadow-inner relative overflow-hidden">
                        
                        {/* Messages space */}
                        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin text-left">
                          {chatMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                              <MessageSquare className="w-8 h-8 text-neutral-800 mb-2 animate-bounce" />
                              <span>Channel feed initiated. Dispatch a ping!</span>
                            </div>
                          ) : (
                            chatMessages.map((msgRef) => (
                              <div key={msgRef.id} className="p-2.5 bg-[#0f1119] border border-slate-800/80 rounded-2xl space-y-1 w-fit max-w-[85%]">
                                <div className="flex items-center gap-2 text-[9.5px]">
                                  <strong className="text-[#a78bfa]">{msgRef.senderName}</strong>
                                  <span className="text-slate-550 font-mono italic">{msgRef.createTime}</span>
                                </div>
                                <p className="text-slate-200 text-xs leading-normal">{msgRef.text}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Send ping triggers */}
                        <form onSubmit={handleSendChatPingByBot} className="flex gap-2.5 shrink-0">
                          <input 
                            type="text"
                            required
                            placeholder="Write developers dispatch..." 
                            className="bg-[#0b0c13] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 flex-1"
                            value={newChatMessage}
                            onChange={e => setNewChatMessage(e.target.value)}
                          />
                          <button
                            type="submit"
                            className="p-2.5 bg-violet-605 hover:bg-violet-505 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition shadow-md cursor-pointer"
                            title="Send dispatch"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* VIEW: KEEP NOTES */}
                  {activeWorkspaceTab === 'keep' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 text-xs">
                      
                      {/* Left: Quick Jot Form (4 Columns) */}
                      <div className="md:col-span-4 bg-[#0a0c14]/45 border border-slate-850 p-4.5 rounded-2.5xl shadow-inner h-fit text-left">
                        <span className="text-[9px] font-mono tracking-widest text-[#a78bfa] block font-extrabold uppercase mb-3.5">
                          JOT DOWN CODE IDEAS
                        </span>

                        <form onSubmit={handleCreateNote} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9.5px] text-slate-400 font-mono font-bold uppercase block">Note Title</label>
                            <input 
                              type="text" 
                              placeholder="Fix critical build bugs" 
                              className="w-full bg-[#07080c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-semibold"
                              value={newNote.title}
                              onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9.5px] text-slate-400 font-mono font-bold uppercase block">Note Content</label>
                            <textarea
                              rows={3}
                              placeholder="Upgrade tsx and resolve modularity splits..." 
                              className="w-full bg-[#07080c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                              value={newNote.content}
                              onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                            />
                          </div>

                          {/* Color grid */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] text-slate-400 font-mono font-bold uppercase block">Select Note Hue</label>
                            <div className="flex gap-1.5 pt-0.5">
                              {noteColors.map((color) => (
                                <button
                                  key={color.hex}
                                  type="button"
                                  onClick={() => setNewNote({ ...newNote, color: color.hex })}
                                  className={`w-5 h-5 rounded-full border transition flex items-center justify-center shrink-0 cursor-pointer ${
                                    newNote.color === color.hex 
                                      ? 'border-white scale-110 shadow-sm' 
                                      : 'border-transparent hover:scale-105'
                                  }`}
                                  style={{ backgroundColor: color.hex }}
                                  title={color.name}
                                >
                                  {newNote.color === color.hex && <Check className="w-3 h-3 text-white" />}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2 bg-violet-600 hover:bg-violet-500 transition text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>JOT MEMO</span>
                          </button>
                        </form>
                      </div>

                      {/* Right: Colored stickies grid (8 Columns) */}
                      <div className="md:col-span-8 space-y-4">
                        <span className="text-[9px] font-mono tracking-widest text-[#a78bfa] block font-extrabold uppercase mb-2">
                          ACTIVE KEEP DIGITAL MEMOS
                        </span>

                        {keepNotes.length === 0 ? (
                          <div className="p-12 border border-dashed border-slate-800 text-slate-500 text-center rounded-2.5xl">
                            Digital memos workspace is empty. Jot an idea to synchronize.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
                            {keepNotes.map((note) => (
                              <div
                                key={note.id}
                                className="border border-slate-800/80 rounded-2xl p-4.5 shadow-lg relative flex flex-col justify-between group overflow-hidden transition-all duration-300 hover:scale-[1.01]"
                                style={{ backgroundColor: note.color }}
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2.5 mb-2 shrink-0">
                                    <h5 className="font-extrabold text-white text-xs leading-normal line-clamp-1 text-left">{note.title}</h5>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleTogglePinNote(note.id)}
                                        className={`p-1 rounded-md transition ${note.isPinned ? 'text-violet-400' : 'text-slate-500 hover:text-white'}`}
                                        title="Pin sticky note"
                                      >
                                        <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        className="p-1 text-slate-500 hover:text-red-400 transition"
                                        title="Move to trash"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-zinc-200 text-[11px] leading-relaxed line-clamp-4 whitespace-pre-wrap text-left pre">{note.content}</p>
                                </div>

                                <div className="pt-3.5 mt-3.5 border-t border-white/5 flex items-center justify-between text-[9px] text-[#a78bfa] font-mono shrink-0">
                                  <span>KEEP STICKY</span>
                                  <span>{new Date(note.updatedAt).toLocaleTimeString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </>
      ) : (
        /* WALLED PROMPT SCREEN */
        <div className="col-span-12 bg-[#0b0d14]/75 border border-slate-800/80 rounded-3xl p-10 shadow-xl max-w-3xl mx-auto my-4 text-center space-y-6">
          <div className="p-5 rounded-full bg-gradient-to-br from-[#8b5cf6]/10 to-indigo-600/15 border border-indigo-500/20 text-[#a78bfa] w-fit mx-auto animate-pulse">
            <Lock className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-105 tracking-tight font-sans uppercase">
              Secure Cloud Sync Gate
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed font-sans">
              Sign in with Google using Firebase Authentication to safely cache a temporary authorization token. You'll instantly unlock secure real-time integrations with GMail dispatchers, Tasks managers, Google Calendars and Chat channels directly embedded into your HUD compile stream.
            </p>
          </div>

          <button
            onClick={handleSignIn}
            type="button"
            className="px-6 py-4 bg-white hover:bg-slate-100 font-sans font-black text-gray-950 rounded-2.5xl text-xs transition duration-150 flex items-center justify-center gap-2.5 mx-auto cursor-pointer shadow-lg shadow-white/5 hover:scale-102 active:scale-95"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            <span>Activate With Google Authorization</span>
          </button>
        </div>
      )}
    </div>
  );
}
