import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Ticket, CheckSquare, MessageSquare, Briefcase, 
  BookOpen, GitPullRequest, GitBranch, Shield, Sparkles, Plus, 
  Calendar, Clock, Search, ChevronRight, Check, Heart, Play, AlertCircle, 
  UserPlus, Award, Flame, Hourglass, BarChart3, HelpCircle, HardDrive, Filter, RefreshCw
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend 
} from "recharts";

interface TribunalTeamCollaborationProps {
  onTriggerSound?: (multiplier?: number) => void;
  onTriggerNotification?: (msg: string, type: "success" | "info" | "error") => void;
}

interface Issue {
  id: string;
  title: string;
  desc: string;
  assignee: string;
  avatar: string;
  status: "Backlog" | "Todo" | "In Progress" | "In Review" | "Done";
  priority: "High" | "Medium" | "Low" | "Urgent";
  labels: string[];
  estimate: number;
  linkedTo?: string; // GitHub PR or Reactor Error block
}

interface PullRequest {
  id: string;
  title: string;
  repo: string;
  author: string;
  authorAvatar: string;
  diffLines: string[];
  comments: Array<{ author: string; line: number; text: string }>;
  mergeChecks: Array<{ id: string; label: string; passed: boolean }>;
  aiSummary: string;
}

export default function TribunalTeamCollaboration({
  onTriggerSound = () => {},
  onTriggerNotification = () => {}
}: TribunalTeamCollaborationProps) {
  // Mode tabs: Issues, PRs, Activity, Meetings, Health, Wiki
  const [activeSubTab, setActiveSubTab] = useState<
    "issues" | "prs" | "activity" | "meetings" | "health" | "wiki"
  >("issues");

  // Filter issue list view
  const [issueFilterText, setIssueFilterText] = useState<string>("");
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [issues, setIssues] = useState<Issue[]>([
    { id: "DEV-402", title: "Cache threadpool leakage on secondary nodes", desc: "Hydra reports sync thread spike errors when doing continuous heavy database requests context scans.", assignee: "Sreeshanth N.", avatar: "SN", status: "In Progress", priority: "Urgent", labels: ["Backend", "Hydra-Fix"], estimate: 8, linkedTo: "Reactor Alert #849" },
    { id: "DEV-398", title: "Refactor Vault API key initialization logic", desc: "Remove module load-time dependencies variables in Forge and replace with lazy initialization methods.", assignee: "Elena R.", avatar: "ER", status: "In Review", priority: "High", labels: ["Security", "Forge-Sync"], estimate: 3, linkedTo: "GitHub PR #122" },
    { id: "DEV-411", title: "Add composite indexes for Slow Query logger", desc: "Create appropriate indices columns in public space on chronicle databases records.", assignee: "Marcus A.", avatar: "MA", status: "Todo", priority: "Medium", labels: ["Chronicle"], estimate: 5 },
    { id: "DEV-405", title: "Aether-Bloom Terrarium floating particles canvas resize", desc: "Avoid strict window coordinate math, implement ResizeObservers to ensure responsive dimension tracking.", assignee: "Sophia T.", avatar: "ST", status: "Backlog", priority: "Low", labels: ["Frontend", "Labs"], estimate: 2 },
    { id: "DEV-380", title: "Deploy Kubernetes replica on staging Neon environments", desc: "Align Neon storage nodes and verify point-in-time restoration scripts compile successfully.", assignee: "Sreeshanth N.", avatar: "SN", status: "Done", priority: "Medium", labels: ["DevOps"], estimate: 5 }
  ]);

  // Pull request review states
  const [prs, setPrs] = useState<PullRequest[]>([
    {
      id: "PR-122",
      title: "Security: Implement lazy initializer client guard secrets",
      repo: "devstate-daemon-vault",
      author: "Elena R.",
      authorAvatar: "ER",
      diffLines: [
        "@@ -10,3 +10,12 @@",
        "-const secretsClient = new VaultClient(process.env.VAULT_TOKEN);",
        "+let secretsClient: VaultClient | null = null;",
        "+",
        "+export function getVault() {",
        "+  if (!secretsClient) {",
        "+    const tk = process.env.VAULT_TOKEN;",
        "+    if (!tk) throw new Error('VAULT_TOKEN is missing');",
        "+    secretsClient = new VaultClient(tk);",
        "+  }",
        "+  return secretsClient;",
        "+}"
      ],
      comments: [
        { author: "Sreeshanth N.", line: 8, text: "Excellent practice here. This directly solves our cold boot container crashes." }
      ],
      mergeChecks: [
        { id: "c1", label: "Build state compiled successfully", passed: true },
        { id: "c2", label: "Linter verified syntax constraints", passed: true },
        { id: "c3", label: "Security analyzer checked env secrets leak", passed: true },
        { id: "c4", label: "Code Coverage > 90%", passed: false }
      ],
      aiSummary: "Refactors stateful module declarations to be lazy. Replaces raw environment parsing constraints with guarded logic checks. Lowers cluster bootstrap times by 41%."
    }
  ]);
  const [activePrId, setActivePrId] = useState<string>("PR-122");
  const [newCommentLineText, setNewCommentLineText] = useState<string>("");
  const [selectedDiffLineIndex, setSelectedDiffLineIndex] = useState<number | null>(null);

  // Activity stream database
  const [activityFeed, setActivityFeed] = useState([
    { id: "act-1", user: "Sreeshanth N.", action: "resolved issue", target: "DEV-380 (Staging restoration)", timestamp: "12 mins ago", type: "issue", initials: "SN", color: "bg-amber-500" },
    { id: "act-2", user: "Elena R.", action: "opened pull request in", target: "devstate-daemon-vault (PR-122)", timestamp: "1 hr ago", type: "pr", initials: "ER", color: "bg-rose-500" },
    { id: "act-3", user: "Reactor Alert Daemon", action: "flagged incident", target: "Memory leaks spike on node-reactor-03", timestamp: "3 hrs ago", type: "error", initials: "RA", color: "bg-red-500" },
    { id: "act-4", user: "Sophia T.", action: "pushed commit to", target: "main branch (terrarium-resize-reloaded)", timestamp: "5 hrs ago", type: "commit", initials: "ST", color: "bg-[#c084fc]" }
  ]);

  // Meeting Prep states
  const [meetings, setMeetings] = useState([
    { id: "meet-1", summary: "DevState OS Staging & Core Sync", time: "2:00 PM - 2:45 PM", attendees: ["SN", "ER", "ST", "MA"], aiBrief: "Issues highlight thread blockage on node-reactors. Sreeshanth mapped a resolve fix, Elena uploaded Vault lazy parameters to staging which is pending code review approval." },
    { id: "meet-2", summary: "Chronicle Database & Schema Strategy", time: "Tomorrow 10:00 AM", attendees: ["SN", "MA"], aiBrief: "Focus is indexing and partitioning slow audit record payloads. S3 backup schedulers require tests before prod deployment execution." }
  ]);
  const [activeMeetingId, setActiveMeetingId] = useState<string>("meet-1");
  const [newMeetingActionText, setNewMeetingActionText] = useState<string>("");
  const [meetingActions, setMeetingActions] = useState<Array<{ id: string; text: string; done: boolean; assignee: string }>>([
    { id: "ma-1", text: "Approve Elena's Vault lazy security PR #122", done: false, assignee: "Sreeshanth N." },
    { id: "ma-2", text: "Create index partition template audit_logs on Chronicle", done: false, assignee: "Marcus A." },
    { id: "ma-3", text: "Verify container build error logs matches", done: true, assignee: "Sreeshanth N." }
  ]);

  // Team Health Metrics data
  const healthMetrics = [
    { name: "Sreeshanth N.", prTurnaround: 1.4, issuesClosed: 14, MTTR: 18, workIntensity: 85 },
    { name: "Elena R.", prTurnaround: 2.1, issuesClosed: 11, MTTR: 28, workIntensity: 90 },
    { name: "Marcus A.", prTurnaround: 3.5, issuesClosed: 9, MTTR: 32, workIntensity: 65 },
    { name: "Sophia T.", prTurnaround: 1.8, issuesClosed: 15, MTTR: 15, workIntensity: 78 }
  ];

  // Wiki Knowledge base states
  const [wikiArticles, setWikiArticles] = useState([
    { slug: "vault-keys-rotation", title: "Vault Environment Keys Rotation SOP", content: "To rotate production keys safely, synchronize with the Sentinel firewall first. Load credentials inside Fort Knox, trigger live reloads, and update the associated backup schedules.", repo: "devstate-daemon-vault" },
    { slug: "high-perf-scanner", title: "High-performance directory scanner template", content: "Our custom scanner recursively walks repositories using promises asynchronously. Prevents main thread node freeze state. Avoids scanning dist files and common cache directories.", repo: "devstate-daemon-terminal" },
    { slug: "terrarium-motion", title: "Aether-Bloom visual motion parameters", content: "Using Framer Motion spring configs for holographic floating canvas rendering. Maintain negative design density limits for responsive mobile look.", repo: "devstate-front" }
  ]);
  const [activeWikiSlug, setActiveWikiSlug] = useState<string>("vault-keys-rotation");
  const [wikiSearch, setWikiSearch] = useState<string>("");

  const selectedPr = prs.find(p => p.id === activePrId) || prs[0];
  const selectedMeeting = meetings.find(m => m.id === activeMeetingId) || meetings[0];

  const handleCreateIssue = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newIssueTitle.trim()) {
      setIsCreatingIssue(false);
      return;
    }
    onTriggerSound(1.2);
    const newIssue: Issue = {
      id: `DEV-${300 + Math.floor(Math.random() * 200)}`,
      title: newIssueTitle,
      desc: "Autocreated during Tribunal workspace align meeting simulation.",
      assignee: "Sreeshanth N.",
      avatar: "SN",
      status: "Todo",
      priority: "Medium",
      estimate: 3,
      labels: ["Tribunal-Align"]
    };
    setIssues([...issues, newIssue]);
    onTriggerNotification(`Created issue ${newIssue.id}.`, "success");
    setNewIssueTitle('');
    setIsCreatingIssue(false);
  };


  const handleAddPRComment = () => {
    if (selectedDiffLineIndex === null || !newCommentLineText.trim()) return;
    onTriggerSound(1.1);
    const updatedPrs = prs.map(p => {
      if (p.id === selectedPr.id) {
        return {
          ...p,
          comments: [...p.comments, { author: "Sreeshanth N.", line: selectedDiffLineIndex, text: newCommentLineText }]
        };
      }
      return p;
    });
    setPrs(updatedPrs);
    setNewCommentLineText("");
    setSelectedDiffLineIndex(null);
    onTriggerNotification("Inline code review comment published.", "success");
  };

  // Convert an action item to a real issue
  const handleConvertActionToIssue = (actionId: string, text: string) => {
    onTriggerSound(1.3);
    const newIssueId = `DEV-${420 + Math.floor(Math.random() * 50)}`;
    const newIssue: Issue = {
      id: newIssueId,
      title: text,
      desc: "Automatically spawned from Tribunal Sync Meting Action Item list.",
      assignee: "Sreeshanth N.",
      avatar: "SN",
      status: "Todo",
      priority: "High",
      estimate: 5,
      labels: ["Meeting-Action"]
    };
    setIssues([...issues, newIssue]);
    setMeetingActions(meetingActions.filter(ma => ma.id !== actionId));
    onTriggerNotification(`Spawned Issue card: ${newIssueId}.`, "success");
  };

  return (
    <div className="text-[#e2e8f0]" id="tribunal-team-container">
      {/* MODULE HEADER WITH COLLABORATION WARMTH */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-rose-500/10 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.12)] animate-pulse">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-100 to-rose-300 uppercase font-sans">
                Tribunal Collaboration Deck
              </h1>
              <p className="text-[11px] text-amber-400/70 font-mono tracking-widest uppercase">
                Synchronized Team Hub • Decisions • Milestones • Burnout Analytics
              </p>
            </div>
          </div>
        </div>

        {/* STATS COUNT */}
        <div className="flex gap-4.5 text-xs font-mono bg-[#0c0d15] px-4.5 py-2.5 border border-amber-500/10 rounded-xl shadow-md">
          <div className="text-center">
            <span className="block text-[9px] text-slate-500 uppercase">Incidents MTTR</span>
            <span className="text-rose-400 font-bold">20.7 mins</span>
          </div>
          <div className="w-[1px] bg-slate-900" />
          <div className="text-center">
            <span className="block text-[9px] text-slate-500 uppercase">PR reviews rate</span>
            <span className="text-zinc-300 font-bold">2.2 hrs avg</span>
          </div>
          <div className="w-[1px] bg-slate-900" />
          <div className="text-center">
            <span className="block text-[9px] text-slate-500 uppercase">Burnout Risk</span>
            <span className="text-zinc-300 font-bold">nominal</span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL SUB NAVS WITH AMBER-ORANGE THEMED WARMWTH */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-[#05070a]/90 border border-amber-500/10 rounded-2xl mb-6 scrollbar-none shadow-inner" id="tribunal-subtabs">
        {[
          { id: "issues", label: "Issue Pulse", icon: Ticket, badge: issues.filter(i => i.status !== "Done").length },
          { id: "prs", label: "Branch Review PR Center", icon: GitPullRequest, badge: 1 },
          { id: "activity", label: "Team Feed stream", icon: MessageSquare },
          { id: "meetings", label: "Meeting Prep Briefs", icon: Calendar },
          { id: "health", label: "Health Dashboard", icon: BarChart3 },
          { id: "wiki", label: "Wiki Knowledge base", icon: BookOpen }
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                onTriggerSound(1.1);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap outline-none cursor-pointer ${
                isActive 
                  ? "bg-amber-950/20 text-amber-300 border border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.15)]" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#080c14]/60 border border-transparent"
              }`}
              id={`tribunal-subtab-${tab.id}`}
            >
              <TabIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TABS VIEWPORT */}
      <div className="grid grid-cols-1 gap-6" id="tribunal-tabs-viewport">
        <AnimatePresence mode="wait">

          {/* TAB 1: KANBAN ISSUES */}
          {activeSubTab === "issues" && (
            <motion.div
              key="issues-kanban"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search active issues..."
                    value={issueFilterText}
                    onChange={(e) => setIssueFilterText(e.target.value)}
                    className="w-full bg-[#18181b] border border-amber-500/15 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-400 font-mono text-slate-100"
                  />
                </div>

                <div className="flex gap-2 shrink-0">
                  <div className="relative flex items-center gap-2">
                    {isCreatingIssue ? (
                      <form onSubmit={handleCreateIssue} className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={newIssueTitle}
                          onChange={(e) => setNewIssueTitle(e.target.value)}
                          onBlur={() => !newIssueTitle.trim() && setIsCreatingIssue(false)}
                          placeholder="Enter issue title..."
                          className="bg-black/50 border border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-400 w-48"
                        />
                        <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-xs font-bold transition-all">Add</button>
                      </form>
                    ) : (
                      <button 
                        onClick={() => setIsCreatingIssue(true)}
                        className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>CREATE ISSUE</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* KANBAN GRID columns representing statuses */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {(["Backlog", "Todo", "In Progress", "In Review", "Done"] as const).map((status) => {
                  const statusIssues = issues.filter(
                    (i) => i.status === status && (i.title.toLowerCase().includes(issueFilterText.toLowerCase()) || i.id.toLowerCase().includes(issueFilterText.toLowerCase()))
                  );
                  return (
                    <div key={status} className="bg-[#09090b]/95 border border-amber-500/5 rounded-2.5xl p-3 flex flex-col min-h-[440px]">
                      <div className="flex justify-between items-center mb-3.5 border-b border-amber-500/5 pb-2 px-1">
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">{status}</span>
                        <span className="text-[10px] bg-[#0c101b] border border-amber-500/10 px-1.5 rounded text-slate-400 font-mono font-semibold">
                          {statusIssues.length}
                        </span>
                      </div>

                      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                        {statusIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className="p-3 bg-[#0c101a] border border-slate-900 hover:border-amber-500/20 rounded-xl space-y-2 cursor-pointer transition duration-150 relative shadow-sm"
                            onClick={() => {
                              // Simulate status progress
                              onTriggerSound(1.0);
                              const idx = issues.findIndex(i => i.id === issue.id);
                              if (idx !== -1) {
                                const nextStatuses: Record<string, typeof status> = {
                                  "Backlog": "Todo",
                                  "Todo": "In Progress",
                                  "In Progress": "In Review",
                                  "In Review": "Done",
                                  "Done": "Backlog"
                                };
                                const updated = [...issues];
                                updated[idx].status = nextStatuses[status];
                                setIssues(updated);
                                onTriggerNotification(`Moved: ${issue.id} to ${nextStatuses[status]}`, "info");
                              }
                            }}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="text-[10px] font-mono font-bold text-amber-500/80">{issue.id}</span>
                              <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                issue.priority === "Urgent" ? "bg-red-950 text-red-400" :
                                issue.priority === "High" ? "bg-orange-950 text-orange-400" :
                                "bg-[#18181b] text-slate-400"
                              }`}>
                                {issue.priority}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-slate-200 line-clamp-2 leading-relaxed">{issue.title}</p>
                            
                            {issue.linkedTo && (
                              <div className="text-[9px] font-mono text-rose-400 bg-rose-950/20 p-1 rounded border border-rose-900/35 truncate">
                                Blocked: {issue.linkedTo}
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-1 mt-1 border-t border-slate-900 text-[10px] text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/20 uppercase flex items-center justify-center font-bold text-[8.5px] font-mono">
                                  {issue.avatar}
                                </div>
                                <span className="font-semibold text-slate-400 leading-none truncate max-w-[65px]">{issue.assignee}</span>
                              </div>
                              <span className="text-[9.5px] bg-slate-900 border border-amber-500/10 px-1.5 rounded font-mono font-semibold" title="Story point estimation">
                                {issue.estimate} SP
                              </span>
                            </div>
                          </div>
                        ))}

                        {statusIssues.length === 0 && (
                          <div className="h-full border border-dashed border-slate-900 rounded-xl flex items-center justify-center text-center p-4">
                            <span className="text-[10px] text-slate-600 font-mono uppercase tracking-wider">Empty State</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: PULL REQUESTS TARGET ROOM */}
          {activeSubTab === "prs" && (
            <motion.div
              key="prs-room"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* LISTING PENDING SYSTEM PRS */}
              <div className="bg-[#09090b]/95 border border-amber-500/5 rounded-2.5xl p-5 shadow-xl flex flex-col h-[500px]">
                <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-4">Cross-Service Pull Requests</h3>
                
                <div className="space-y-2">
                  {prs.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePrId(p.id);
                        onTriggerSound(1.05);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl transition flex flex-col gap-1.5 cursor-pointer ${
                        activePrId === p.id 
                          ? "bg-amber-950/20 border border-amber-500/25 text-amber-300 shadow-sm"
                          : "text-slate-400 hover:bg-slate-900/40 border border-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-amber-500 font-extrabold">{p.id}</span>
                        <span>{p.repo}</span>
                      </div>
                      <span className="text-xs font-bold font-semibold text-slate-100">{p.title}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/10 flex items-center justify-center text-[9px] font-mono">
                          {p.authorAvatar}
                        </div>
                        <span className="text-[10px] text-slate-400">By {p.author}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* DETAILED PANE WITH INTERACTIVE INLINE REVIEW */}
              <div className="lg:col-span-2 bg-[#09090b]/95 border border-amber-500/5 rounded-2.5xl p-6 shadow-xl flex flex-col justify-between min-h-[500px]">
                <div>
                  <div className="flex justify-between items-center pb-4 border-b border-amber-500/5 mb-4">
                    <div>
                      <h3 className="text-xs font-mono font-extrabold text-amber-400 uppercase">Interactive Review Code pane</h3>
                      <h4 className="text-sm font-bold text-slate-100 mt-1">{selectedPr.title}</h4>
                    </div>

                    <span className="text-[10px] bg-white/5 border border-white/5 text-zinc-200 rounded px-2 py-0.5 font-mono uppercase">
                      Oracle summary available
                    </span>
                  </div>

                  {/* AI reviewer summaries banner */}
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl mb-4 text-xs">
                    <h5 className="font-bold text-zinc-300 font-semibold mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Oracle AI Summary analysis
                    </h5>
                    <p className="text-slate-300 font-medium leading-relaxed">{selectedPr.aiSummary}</p>
                  </div>

                  {/* DIFF PANEL COMPONENT WITH CLICK TO INLINE COMMENT */}
                  <span className="text-[10.5px] text-slate-500 font-mono uppercase block mb-1.5">Click any line to comment:</span>
                  <div className="bg-slate-950 rounded-xl border border-white/5 font-mono text-xs overflow-hidden">
                    <div className="divide-y divide-slate-900">
                      {selectedPr.diffLines.map((line, idx) => {
                        const isSelected = selectedDiffLineIndex === idx;
                        const labelBg = line.startsWith("+") ? "bg-white/5 text-zinc-200" :
                                        line.startsWith("-") ? "bg-red-950/40 text-red-400" : "text-slate-400";
                        return (
                          <div key={idx} className="flex flex-col">
                            <div 
                              onClick={() => {
                                setSelectedDiffLineIndex(idx);
                                onTriggerSound(0.95);
                              }}
                              className={`flex cursor-pointer transition hover:bg-slate-900 ${labelBg} ${isSelected ? 'bg-amber-950/20' : ''}`}
                            >
                              <span className="w-8 border-r border-slate-900 text-right pr-2 text-[9px] text-slate-600 select-none">{idx + 1}</span>
                              <pre className="pl-3 py-1 text-[11px] overflow-x-auto whitespace-pre-wrap select-text">{line}</pre>
                            </div>

                            {/* Inline comment responses lists */}
                            {selectedPr.comments.filter(c => c.line === idx).map((comm, ci) => (
                              <div key={ci} className="bg-[#18181b] pl-11 pr-4 py-2 text-[10.5px] border-l-2 border-amber-500/50">
                                <span className="font-bold text-amber-400">{comm.author}: </span>
                                <span className="text-slate-300">{comm.text}</span>
                              </div>
                            ))}

                            {/* Click response editor container */}
                            {isSelected && (
                              <div className="p-3 bg-[#0c101a] pl-11 pr-4 border-t border-amber-500/25 flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Review comment text..."
                                  value={newCommentLineText}
                                  onChange={(e) => setNewCommentLineText(e.target.value)}
                                  className="flex-1 bg-[#04060a] border border-amber-500/20 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-amber-400"
                                  onKeyDown={(e) => { if (e.key === "Enter") handleAddPRComment(); }}
                                />
                                <button
                                  onClick={handleAddPRComment}
                                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-lg transition"
                                >
                                  REPLY
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RULES & CHECKS */}
                  <div className="mt-4 p-3 bg-[#0d0f17] rounded-xl border border-amber-500/5">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase mb-2">Branch Build & Test Matrix</span>
                    <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                      {selectedPr.mergeChecks.map((chk) => (
                        <div key={chk.id} className="flex items-center gap-1.5">
                          {chk.passed ? (
                            <Check className="w-3.5 h-3.5 text-zinc-300" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          <span className={chk.passed ? "text-slate-300" : "text-rose-400 font-semibold"}>{chk.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-amber-500/5 mt-6">
                  <span className="text-[10px] font-mono text-slate-500">Target merge branch: <code className="text-amber-500">origin/staging</code></span>
                  <button
                    onClick={() => {
                      const allPassed = selectedPr.mergeChecks.every(c => c.passed);
                      if (!allPassed) {
                        alert("RESTRICTION: Merge checks are currently failing (Code coverage < 90%). Force bypass requested.");
                      }
                      onTriggerSound(1.4);
                      onTriggerNotification(`Integrated ${selectedPr.id} codebase changes permanently.`, "success");
                    }}
                    className="bg-zinc-800 hover:bg-zinc-800 text-slate-900 font-extrabold text-[11px] px-4.5 py-2 rounded-xl transition active:scale-95"
                    id="db-merge-pr-btn"
                  >
                    MERGE BRANCH CHANGES
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: ACTIVITY STREAM */}
          {activeSubTab === "activity" && (
            <motion.div
              key="activity-log-stream"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#09090b]/95 border border-amber-500/5 rounded-2.5xl p-6 shadow-xl space-y-4 max-h-[520px] overflow-y-auto"
            >
              <h3 className="text-sm font-bold text-amber-350 font-mono uppercase border-b border-amber-500/5 pb-3">
                Team Synchronized Event Log Feed
              </h3>

              <div className="space-y-3.5">
                {activityFeed.map((act) => (
                  <div key={act.id} className="flex gap-3.5 items-start bg-[#0d101a] border border-slate-900 p-3.5 rounded-2xl hover:border-amber-500/10 transition">
                    <div className={`w-8 h-8 rounded-xl ${act.color} text-slate-950 font-extrabold flex items-center justify-center shrink-0 font-mono text-xs uppercase`}>
                      {act.initials}
                    </div>
                    <div className="flex-1 font-mono text-xs">
                      <div className="flex justify-between items-center text-slate-400 mb-1">
                        <span>Synced event: {act.user}</span>
                        <span>{act.timestamp}</span>
                      </div>
                      <p className="text-slate-100 font-medium">
                        {act.action} <span className="text-amber-400 font-bold">{act.target}</span>
                      </p>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button 
                        onClick={() => { onTriggerSound(1.0); onTriggerNotification("Reaction updated.", "info"); }}
                        className="p-1 rounded bg-[#04060a] hover:bg-amber-950/20 text-slate-400 hover:text-amber-400 text-[10px]"
                      >
                        👍 2
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: CALENDAR MEETINGS */}
          {activeSubTab === "meetings" && (
            <motion.div
              key="meetings-briefs"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* MEETING EVENTS DIRECTORY */}
              <div className="bg-[#09090b]/95 border border-amber-500/5 rounded-2.5xl p-5 shadow-xl h-[480px] flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-4">Google Calendar Sync</h3>
                  
                  <div className="space-y-2">
                    {meetings.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActiveMeetingId(m.id);
                          onTriggerSound(1.05);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl transition flex flex-col gap-1 cursor-pointer ${
                          activeMeetingId === m.id 
                            ? "bg-amber-950/20 border border-amber-500/25 text-amber-300"
                            : "text-slate-400 hover:bg-slate-900/40 border border-transparent"
                        }`}
                      >
                        <span className="text-[10px] font-mono font-semibold text-amber-500/85">{m.time}</span>
                        <span className="text-xs font-bold text-slate-100 leading-snug">{m.summary}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-1">Attendees: {m.attendees.join(", ")}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-amber-500/5 pt-4 text-[10px] text-slate-500 font-mono leading-relaxed">
                  Gmail Calendar synchronization online. Alerts matching workspace keywords auto-imported.
                </div>
              </div>

              {/* AUTOMATED AI PREP BRIEF CASE */}
              <div className="lg:col-span-2 bg-[#09090b]/95 border border-amber-500/5 rounded-2.5xl p-6 shadow-xl flex flex-col justify-between min-h-[480px]">
                <div>
                  <div className="pb-4 border-b border-amber-500/5 mb-4">
                    <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-extrabold Block">Active Workspace AI prep-brief</span>
                    <h3 className="text-sm font-bold text-slate-100 mt-1">{selectedMeeting.summary}</h3>
                  </div>

                  {/* AI PREP TEXT AREA */}
                  <div className="p-4 bg-amber-950/5 border border-amber-500/20 rounded-2xl mb-6 text-xs text-slate-300 leading-relaxed font-semibold">
                    <h4 className="flex items-center gap-1.5 text-amber-400 font-bold mb-2 font-mono uppercase tracking-wide">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      AUTOMATED SYNTHESIS SUMMARIZER
                    </h4>
                    <p>{selectedMeeting.aiBrief}</p>
                  </div>

                  {/* MEETING ACTIONS & ISSUES CONVERTER */}
                  <span className="text-[10px] font-mono text-slate-400 tracking-wider block mb-2 uppercase">Core Sync Action items dashboard</span>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {meetingActions.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-950/50 border border-slate-900 rounded-xl flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onTriggerSound(1.0);
                              setMeetingActions(meetingActions.map(ma => ma.id === item.id ? { ...ma, done: !ma.done } : ma));
                            }}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition ${item.done ? "bg-zinc-800 border-transparent text-slate-900" : "border-amber-500/30"}`}
                          >
                            {item.done && <Check className="w-3 h-3" />}
                          </button>
                          <span className={item.done ? "line-through text-slate-500" : "text-slate-200"}>{item.text}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] bg-[#0c101a] border border-amber-500/10 px-1.5 rounded">{item.assignee}</span>
                          <button 
                            onClick={() => handleConvertActionToIssue(item.id, item.text)}
                            className="text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase transition"
                            title="Spawn Linear-like task Issue Card"
                          >
                            [SPAWN ISSUE]
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 items-center border-t border-amber-500/5 pt-4 mt-6">
                  <input
                    type="text"
                    placeholder="New action item text..."
                    value={newMeetingActionText}
                    onChange={(e) => setNewMeetingActionText(e.target.value)}
                    className="flex-1 bg-[#04060a] border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-400 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newMeetingActionText.trim()) {
                        setMeetingActions([...meetingActions, { id: `ma-${Date.now()}`, text: newMeetingActionText, done: false, assignee: "Sreeshanth N." }]);
                        setNewMeetingActionText("");
                        onTriggerSound(1.1);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!newMeetingActionText.trim()) return;
                      setMeetingActions([...meetingActions, { id: `ma-${Date.now()}`, text: newMeetingActionText, done: false, assignee: "Sreeshanth N." }]);
                      setNewMeetingActionText("");
                      onTriggerSound(1.1);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition font-semibold shrink-0"
                  >
                    ADD ACTION
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: HEALTH DASHBOARD */}
          {activeSubTab === "health" && (
            <motion.div
              key="team-health"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* TEAM METRIC CHARTS */}
              <div className="lg:col-span-2 bg-[#09090b]/95 border border-amber-500/5 rounded-2.5xl p-6 shadow-xl flex flex-col justify-between min-h-[460px]">
                <div>
                  <h3 className="text-sm font-bold text-amber-300 font-mono uppercase tracking-widest mb-4">
                    Team Velocity & Issues closed per sprint
                  </h3>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={healthMetrics}>
                        <XAxis dataKey="name" stroke="#52525b" fontSize={11} fontStyle="italic" />
                        <YAxis stroke="#52525b" fontSize={11} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(245, 158, 11, 0.2)", borderRadius: "12px" }}
                          labelStyle={{ color: "#f5a623" }}
                        />
                        <Legend />
                        <Bar dataKey="issuesClosed" fill="#f59e0b" name="Resolved Tasks Sprint" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="MTTR" fill="#f43f5e" name="MTTR Index (minutes)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-4 border-t border-amber-500/5">
                  <span>Sprint Period: Active Milestone v2_release_alpha</span>
                  <span className="text-zinc-300 font-bold">Velocity capacity: Nominal alignment</span>
                </div>
              </div>

              {/* BURNOUT MONITOR LABS INCIDENTS */}
              <div className="bg-[#09090b]/95 border border-amber-500/5 rounded-2.5xl p-6 shadow-xl flex flex-col justify-between min-h-[460px]">
                <div>
                  <h3 className="text-sm font-bold text-amber-300 font-mono uppercase tracking-widest mb-4 flex items-center gap-1">
                    <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                    Burnout Radar signals
                  </h3>

                  <div className="space-y-4 font-mono text-xs">
                    {healthMetrics.map((member) => {
                      const isHighRisk = member.workIntensity >= 90;
                      return (
                        <div key={member.name} className="p-3 bg-[#0c101a] border border-slate-900 rounded-xl flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-200">{member.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isHighRisk ? 'bg-red-950 text-red-400' : 'bg-slate-900 text-slate-400'}`}>
                              {isHighRisk ? "OVERLOAD SPIKE" : "STABLE SYNC"}
                            </span>
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>PR review turnaround:</span>
                            <span className="text-amber-500 font-bold">{member.prTurnaround} hrs</span>
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Workload Intensity check:</span>
                            <span className={isHighRisk ? "text-red-400 font-bold" : "text-zinc-300"}>
                              {member.workIntensity}% load
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-amber-500/5">
                  <div className="flex items-start gap-2 text-xs text-amber-400 leading-snug">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>On-call Distribution Fairness: Sreeshanth N. currently assigned 4 consecutive shifts. Compensation suggested.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: KNOWLEDGE BASE */}
          {activeSubTab === "wiki" && (
            <motion.div
              key="wiki-base"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* ARTICLES DIRECTORY */}
              <div className="bg-[#09090b]/95 border border-amber-500/5 rounded-2.5xl p-5 shadow-xl h-[480px] flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-3">Service Wiki Docs</h3>
                  
                  <div className="relative mb-4">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={wikiSearch}
                      onChange={(e) => setWikiSearch(e.target.value)}
                      className="w-full bg-[#18181b] border border-amber-500/10 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-400 text-slate-100 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                    {wikiArticles
                      .filter(a => a.title.toLowerCase().includes(wikiSearch.toLowerCase()) || a.content.toLowerCase().includes(wikiSearch.toLowerCase()))
                      .map((art) => (
                        <button
                          key={art.slug}
                          onClick={() => {
                            setActiveWikiSlug(art.slug);
                            onTriggerSound(1.02);
                          }}
                          className={`w-full text-left p-3 rounded-xl transition flex flex-col gap-1 cursor-pointer ${
                            activeWikiSlug === art.slug 
                              ? "bg-amber-950/20 border border-amber-500/20 text-amber-300"
                              : "text-slate-400 hover:text-slate-200 hover:bg-[#0c101a]/60"
                          }`}
                        >
                          <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400 self-start font-mono uppercase tracking-wide">
                            {art.repo}
                          </span>
                          <span className="text-xs font-bold leading-normal text-slate-100">{art.title}</span>
                        </button>
                      ))}
                  </div>
                </div>

                <div className="border-t border-amber-500/5 pt-4">
                  <button
                    onClick={() => {
                      const title = window.prompt("New Wiki Doc Title:");
                      if (!title) return;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      setWikiArticles([...wikiArticles, { slug, title, content: "To be updated. Write your technical parameters here.", repo: "devstate-general" }]);
                      setActiveWikiSlug(slug);
                      onTriggerSound(1.3);
                      onTriggerNotification(`Created draft manual article: "${title}"`, "success");
                    }}
                    className="w-full border border-dashed border-amber-500/35 hover:bg-amber-950/15 text-amber-400 hover:text-white transition rounded-xl py-2 text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD MANUAL MANUAL</span>
                  </button>
                </div>
              </div>

              {/* ACTIVE ARTICLE VIEW & AI SUMMARY */}
              <div className="lg:col-span-2 bg-[#09090b]/95 border border-amber-500/5 rounded-2.5xl p-6 shadow-xl flex flex-col justify-between min-h-[480px]">
                <div>
                  <div className="pb-4 border-b border-amber-500/5 mb-4">
                    <span className="text-[10px] font-mono text-amber-500 uppercase font-extrabold block">
                      Wiki Article: {wikiArticles.find(a => a.slug === activeWikiSlug)?.repo}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-1 uppercase">
                      {wikiArticles.find(a => a.slug === activeWikiSlug)?.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-semibold select-text whitespace-pre-line my-4 font-mono">
                    {wikiArticles.find(a => a.slug === activeWikiSlug)?.content}
                  </p>
                </div>

                <div className="border-t border-amber-500/5 pt-4 mt-6 flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>Knowledge Base synced on-the-fly.</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onTriggerSound(1.15);
                        onTriggerNotification("Summarizing article with context preservation...", "info");
                      }}
                      className="text-amber-500 hover:text-amber-400 font-bold"
                    >
                      [ORACLE SUMMARIZE DOC]
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
