"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { 
  Sparkles, 
  Check, 
  Pencil, 
  Copy, 
  Trash2, 
  Plus,
  BookOpen,
  Calendar,
  ChevronRight,
  Wand2,
  Undo2,
  Loader2,
  Bold,
  Italic,
  Code,
  Image,
  HelpCircle,
  Clipboard,
  Menu,
  Lock,
  Link2,
  Star,
  MoreHorizontal,
  Database,
  FileText,
  Layout,
  ClipboardList
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { callAIWithFallback } from "@/lib/ai-fallback";

interface Note {
  id: string;
  content: string;
  originalContent: string | null; // Stores the pre-AI content for revert
  createdAt: string;
  images?: Record<string, string>; // Maps image placeholders to base64
}

// Resilient AI call with auto-fallback rotation
async function callAIEnhance(noteContent: string): Promise<string> {
  return callAIWithFallback({
    systemPrompt: "You are a professional writing assistant. The user will give you a note or draft text. Your job is to improve it: fix grammar, enhance clarity, make it more professional and polished, while preserving the original meaning and tone. Return ONLY the improved text, no explanations, no markdown formatting, no quotes around it.",
    userMessage: noteContent,
    rawText: true,
    preferredModel: "deepseek/deepseek-v4-flash:free"
  });
}

// Helper to parse content and render inline images for markdown images
function parseContentWithImages(content: string, noteImages: Record<string, string> = {}, isPreview = false) {
  if (!content) return [];
  
  // Regex to match markdown image format: ![alt](data:image/... or http...) or ![alt]
  const mdRegex = /!\[([^\]]*)\](?:\(([^)]+)\))?/g;
  
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = mdRegex.exec(content)) !== null) {
    const matchIndex = match.index;
    const [fullMatch, altText, imgUrl] = match;

    // Add preceding text
    if (matchIndex > lastIndex) {
      elements.push(
        <span key={`text-${keyCounter++}`}>
          {content.substring(lastIndex, matchIndex)}
        </span>
      );
    }

    // Determine the actual image source
    let resolvedSrc = "";
    if (noteImages && noteImages[altText]) {
      resolvedSrc = noteImages[altText];
    } else if (imgUrl) {
      resolvedSrc = imgUrl;
    }

    if (resolvedSrc) {
      // Add image element
      elements.push(
        <div 
          key={`img-${keyCounter++}`} 
          className={cn(
            "my-3 relative group/img overflow-hidden rounded-xl border border-white/10 bg-black/20 flex justify-center",
            isPreview ? "max-h-[350px]" : "max-h-[160px]"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={resolvedSrc} 
            alt={altText || "Embedded Image"} 
            className={cn(
              "w-full rounded-xl transition-all duration-300",
              isPreview 
                ? "max-h-[350px] object-contain shadow-lg" 
                : "max-h-[160px] object-cover group-hover/img:scale-105"
            )}
          />
        </div>
      );
    } else {
      elements.push(<span key={`text-${keyCounter++}`}>{fullMatch}</span>);
    }

    lastIndex = mdRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    elements.push(
      <span key={`text-${keyCounter++}`}>
        {content.substring(lastIndex)}
      </span>
    );
  }

  return elements.length > 0 ? elements : [content];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.92, rotateY: -8 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    rotateY: 0,
    transition: { 
      type: "spring" as const, 
      stiffness: 220, 
      damping: 18 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.92, 
    y: -25, 
    transition: { duration: 0.2 } 
  }
};

interface GameNoteCardProps {
  note: Note;
  index: number;
  isCopied: boolean;
  isAILoading: boolean;
  hasOriginal: boolean;
  onDelete: (id: string) => void;
  onCopy: (id: string, text: string) => void;
  onAIEnhance: (id: string) => void;
  onRevert: (id: string) => void;
  onEdit: (note: Note) => void;
  formatDate: (isoStr: string) => string;
}

function GameNoteCard({
  note,
  index,
  isCopied,
  isAILoading,
  hasOriginal,
  onDelete,
  onCopy,
  onAIEnhance,
  onRevert,
  onEdit,
  formatDate,
}: GameNoteCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = React.useState<React.CSSProperties>({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
  });
  const [shineStyle, setShineStyle] = React.useState<React.CSSProperties>({
    opacity: 0,
    background: "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%)",
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    
    const rotateX = -yPct * 12; // Cap vertical tilt
    const rotateY = xPct * 12;  // Cap horizontal tilt
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: "transform 0.1s ease-out",
    });

    setShineStyle({
      opacity: 1,
      background: `radial-gradient(circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 55%)`,
      transition: "opacity 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
    });
    setShineStyle({
      opacity: 0,
      background: "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 50%)",
      transition: "all 0.5s ease-out",
    });
  };

  const cardNoStr = `NO. ${String(index + 1).padStart(3, "0")}`;

  return (
    <motion.div
      variants={cardVariants}
      layout
      className={cn(
        "rounded-2xl flex flex-col justify-between min-h-[250px] transition-all duration-300 group overflow-hidden relative select-none",
        hasOriginal 
          ? "p-[1.5px] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]" 
          : "p-[1px] bg-gradient-to-br from-border/60 via-border/20 to-border/40 hover:from-primary/30 hover:to-primary/10 shadow-lg hover:shadow-xl"
      )}
    >
      {/* 3D Glass shine reflection overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300" 
        style={shineStyle} 
      />

      {/* Holographic sweep light glint on hover */}
      <div className="absolute inset-0 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 cubic-bezier(0.3, 1, 0.2, 1) pointer-events-none z-10" />

      {/* Inner card container */}
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={tiltStyle}
        className="w-full h-full flex-1 flex flex-col justify-between rounded-[15px] bg-[#090b11]/95 backdrop-blur-3xl overflow-hidden relative z-0"
      >
        {/* Holographic background overlay for enhanced rare cards */}
        {hasOriginal && (
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 via-fuchsia-500/5 to-cyan-500/10 opacity-60 pointer-events-none z-0 animate-pulse" />
        )}

        {/* AI loading overlay */}
        {isAILoading && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-20 rounded-[15px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-xs font-bold text-primary animate-pulse">AI is enhancing...</span>
          </div>
        )}

        {/* Card header */}
        <div className="px-5 py-3 border-b border-border/10 bg-background/15 flex items-center justify-between text-muted-foreground select-none z-10">
          <span className="text-[10px] font-mono flex items-center gap-1.5 font-bold tracking-wider text-muted-foreground/80">
            <Calendar className="w-3.5 h-3.5 text-primary/80" />
            {formatDate(note.createdAt)}
          </span>
          {hasOriginal ? (
            <span className="text-[9px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 flex items-center gap-1 uppercase tracking-widest select-none bg-primary/10 px-2 py-0.5 rounded-full border border-violet-500/20">
              <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
              Holo Rare AI
            </span>
          ) : (
            <span className="text-[9px] font-mono font-bold tracking-widest text-muted-foreground/50 group-hover:text-primary/70 transition-colors uppercase">
              {cardNoStr}
            </span>
          )}
        </div>

        {/* Note content */}
        <div className="p-5 flex-1 select-text z-10 overflow-hidden">
          <div className="text-foreground/85 font-sans text-sm leading-relaxed whitespace-pre-wrap text-left line-clamp-6 select-text selection:bg-primary/20">
            {parseContentWithImages(note.content, note.images || {}, false)}
          </div>
        </div>

        {/* Actions footer */}
        <div className="px-5 py-3 border-t border-border/10 bg-background/20 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            {/* Delete */}
            <button
              onClick={() => onDelete(note.id)}
              className="p-2 rounded-xl border border-destructive/15 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/30 text-destructive transition-all cursor-pointer flex items-center justify-center active:scale-90"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Copy */}
            <button
              onClick={() => onCopy(note.id, note.content)}
              className="p-2 rounded-xl border border-border bg-background/30 hover:bg-muted hover:border-foreground/20 text-foreground transition-all cursor-pointer flex items-center justify-center active:scale-90"
              title="Copy note"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
              )}
            </button>

            {/* AI Enhance */}
            <button
              onClick={() => onAIEnhance(note.id)}
              disabled={isAILoading}
              className="p-2 rounded-xl border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/15 hover:border-violet-500/40 text-violet-500 transition-all cursor-pointer flex items-center justify-center active:scale-90 disabled:opacity-50"
              title="AI Enhance"
            >
              <Wand2 className="w-3.5 h-3.5 animate-pulse" />
            </button>

            {/* Revert */}
            {hasOriginal && (
              <button
                onClick={() => onRevert(note.id)}
                className="p-2 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-500/40 text-amber-500 transition-all cursor-pointer flex items-center justify-center active:scale-90"
                title="Revert to original"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Edit button */}
          <button
            onClick={() => onEdit(note)}
            className="py-1.5 px-3.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer text-[11px] font-bold flex items-center gap-1 active:scale-90 shadow-sm"
          >
            <span>Edit</span>
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function Notepad() {
  const t = useTranslations("notepad");
  const { toast } = useToast();

  const [viewState, setViewState] = React.useState<"dashboard" | "edit">("dashboard");
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = React.useState<string | null>(null);
  const [content, setContent] = React.useState("");
  
  const [isSaving, setIsSaving] = React.useState(false);
  const [isNotesLoaded, setIsNotesLoaded] = React.useState(false);
  const [copiedNoteId, setCopiedNoteId] = React.useState<string | null>(null);
  const [aiLoadingNoteId, setAiLoadingNoteId] = React.useState<string | null>(null);

  const [editTab, setEditTab] = React.useState<"edit" | "preview">("edit");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [editorImages, setEditorImages] = React.useState<Record<string, string>>({});
  const [editorTitle, setEditorTitle] = React.useState("");
  const [editorBody, setEditorBody] = React.useState("");
  const [isAiLoadingEditMode, setIsAiLoadingEditMode] = React.useState(false);

  // Keep content in sync with title/body for preview tab or backend compatibility
  React.useEffect(() => {
    if (viewState === "edit") {
      const fullContent = editorTitle.trim()
        ? `# ${editorTitle.trim()}\n\n${editorBody}`
        : editorBody;
      setContent(fullContent);
    }
  }, [editorTitle, editorBody, viewState]);

  // RESILIENT TIDB STATES
  const [dbStatus, setDbStatus] = React.useState<"checking" | "connected" | "offline">("checking");
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [customDbUrl, setCustomDbUrl] = React.useState("");
  const [isTestingConnection, setIsTestingConnection] = React.useState(false);
  const [testError, setTestError] = React.useState<string | null>(null);
  const [testSuccess, setTestSuccess] = React.useState(false);

  // Connection tester helper
  const checkDbConnection = async (urlToCheck?: string) => {
    setDbStatus("checking");
    try {
      const url = urlToCheck !== undefined ? urlToCheck : (localStorage.getItem("tidb_connection_url") || "");
      const res = await fetch("/api/notepad/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tidbUrl: url })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbStatus("connected");
        return true;
      } else {
        setDbStatus("offline");
        return false;
      }
    } catch (err) {
      setDbStatus("offline");
      return false;
    }
  };

  // Load notes and database settings on mount
  React.useEffect(() => {
    // 1. Load custom DB URL
    const savedUrl = localStorage.getItem("tidb_connection_url") || "";
    setCustomDbUrl(savedUrl);

    // 2. Ping DB connection
    checkDbConnection(savedUrl);

    // 3. Load notes from Redis Server
    fetch("/api/notepad")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch notes");
        return res.json();
      })
      .then((data) => {
        setNotes(data);
      })
      .catch((e) => {
        console.error("Failed to load notes from Redis", e);
        toast({
          title: "Lỗi kết nối",
          description: "Không thể tải danh sách ghi chú từ server.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsNotesLoaded(true);
      });
  }, []);

  const saveNotesList = async (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    setIsSaving(true);
    try {
      const res = await fetch("/api/notepad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedNotes)
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch (e) {
      console.error("Failed to save notes to Redis", e);
      toast({
        title: "Lỗi lưu dữ liệu",
        description: "Không thể lưu ghi chú lên server. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = () => {
    setActiveNoteId(null);
    setContent("");
    setEditorTitle("");
    setEditorBody("");
    setEditTab("edit");
    setEditorImages({});
    setViewState("edit");
  };

  const handleEditNote = (note: Note) => {
    setActiveNoteId(note.id);
    setContent(note.content);
    
    // Split the content into title and body
    const lines = note.content.split("\n");
    const titleLine = lines[0] || "";
    // If the first line is a markdown heading, strip it
    const parsedTitle = titleLine.startsWith("# ") ? titleLine.replace(/^#\s+/, "") : titleLine;
    const parsedBody = titleLine.startsWith("# ") ? lines.slice(1).join("\n").trim() : note.content;
    
    setEditorTitle(parsedTitle);
    setEditorBody(parsedBody);
    setEditTab("edit");
    setEditorImages(note.images || {});
    setViewState("edit");
  };

  // Safe credentials test
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestError(null);
    setTestSuccess(false);

    try {
      const res = await fetch("/api/notepad/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tidbUrl: customDbUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestSuccess(true);
        setDbStatus("connected");
        toast({
          title: "🟢 Connection Verified",
          description: "Database credentials are correct and responsive!",
        });
      } else {
        setTestError(data.error || "Connection failed.");
        setDbStatus("offline");
      }
    } catch (err: any) {
      setTestError(err.message || "Network error. Failed to connect.");
      setDbStatus("offline");
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Save custom credentials
  const handleSaveConnectionSettings = () => {
    localStorage.setItem("tidb_connection_url", customDbUrl.trim());
    toast({
      title: "💾 Settings Saved",
      description: "Database credentials updated successfully.",
    });
    checkDbConnection(customDbUrl.trim());
    setIsSettingsOpen(false);
  };

  // Reset to default credentials
  const handleResetConnectionSettings = () => {
    localStorage.removeItem("tidb_connection_url");
    setCustomDbUrl("");
    toast({
      title: "🔄 Reset Complete",
      description: "Reverted to default system database environment configuration.",
    });
    checkDbConnection("");
    setIsSettingsOpen(false);
  };

  const handleDeleteNote = async (id: string) => {
    const noteToDelete = notes.find((n) => n.id === id);
    if (!noteToDelete) return;

    if (confirm("Are you sure you want to delete this note?")) {
      // 1. Immediately update UI locally for a premium, fast experience
      const updated = notes.filter((n) => n.id !== id);
      saveNotesList(updated);
      
      toast({
        variant: "destructive",
        title: "Deleted",
        description: "Note removed successfully.",
      });

      // 2. Safely trigger background TiDB snapshot archive request
      try {
        const response = await fetch("/api/notepad/snapshot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: noteToDelete.id,
            content: noteToDelete.content,
            images: noteToDelete.images || {},
            createdAt: noteToDelete.createdAt,
            tidbUrl: localStorage.getItem("tidb_connection_url") || ""
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          if (data.savedToTiDB) {
            toast({
              title: "🗑️ Snapshot Archived",
              description: "A secure backup was successfully saved to your TiDB database.",
            });
          } else {
            toast({
              title: "📂 Local Backup Saved",
              description: "TiDB backup is offline. Snapshot was successfully saved locally in your project files.",
            });
          }
        } else {
          console.warn("[TiDB Backup] API returned non-success state:", data);
          toast({
            variant: "default",
            title: "⚠️ Backup Offline",
            description: `Note deleted locally. TiDB backup error: ${data.details || "Database is offline."}`,
          });
        }
      } catch (err: any) {
        console.error("[TiDB Backup] Failed to post snapshot to API:", err);
        // Fallback local save already executed, but connection failed
        toast({
          variant: "default",
          title: "⚠️ Backup Offline",
          description: "Note deleted locally, but connection to TiDB backup failed.",
        });
      }
    }
  };

  const handleCopyNote = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedNoteId(id);
      toast({ title: "Copied!", description: "Note content copied to clipboard." });
      setTimeout(() => setCopiedNoteId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // AI Enhance: call the free DeepSeek model to improve the note
  const handleAIEnhance = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note || !note.content.trim()) return;

    setAiLoadingNoteId(noteId);
    try {
      const enhanced = await callAIEnhance(note.content);
      
      const updated = notes.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            originalContent: n.originalContent === null ? n.content : n.originalContent,
            content: enhanced,
            createdAt: new Date().toISOString(),
          };
        }
        return n;
      });
      saveNotesList(updated);
      toast({ title: "✨ AI Enhanced", description: "Note content has been improved by AI." });
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: err.message || "Failed to enhance with AI.",
      });
    } finally {
      setAiLoadingNoteId(null);
    }
  };

  // AI Enhance for Edit Mode (Notion "Ask AI" pill)
  const handleAIEnhanceEditMode = async () => {
    const textToEnhance = editorBody.trim() || editorTitle.trim();
    if (!textToEnhance) return;

    setIsAiLoadingEditMode(true);
    try {
      const enhanced = await callAIEnhance(textToEnhance);
      setEditorBody(enhanced);
      toast({ title: "✨ AI Enhanced", description: "Content improved by AI." });
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: err.message || "Failed to enhance with AI.",
      });
    } finally {
      setIsAiLoadingEditMode(false);
    }
  };

  // Revert: restore the original content before AI modifications
  const handleRevertNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note || note.originalContent === null) return;

    const updated = notes.map((n) => {
      if (n.id === noteId) {
        return {
          ...n,
          content: n.originalContent!,
          originalContent: null,
        };
      }
      return n;
    });
    saveNotesList(updated);
    toast({ title: "Reverted", description: "Note restored to original content." });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorBody(e.target.value);
  };

  const handleImageInsertion = (base64: string, label = "Image") => {
    const key = `image_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setEditorImages((prev) => ({ ...prev, [key]: base64 }));

    const textarea = document.getElementById("notepad-textarea") as HTMLTextAreaElement;
    const imagePlaceholder = `\n![${key}]\n`;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = textarea.value;
      const newContent = currentText.substring(0, start) + imagePlaceholder + currentText.substring(end);
      setEditorBody(newContent);

      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + imagePlaceholder.length;
      }, 0);
    } else {
      setEditorBody((prev) => prev + imagePlaceholder);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        toast({
          variant: "destructive",
          title: "Not Supported",
          description: "Your browser does not support reading clipboard directly. Try Ctrl+V!",
        });
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      let imageFound = false;

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            imageFound = true;
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              if (base64) {
                handleImageInsertion(base64, "Clipboard Image");
                toast({
                  title: "🖼️ Image Pasted",
                  description: "Image successfully pasted from clipboard.",
                });
              }
            };
            reader.readAsDataURL(blob);
            break;
          }
        }
        if (imageFound) break;
      }

      if (!imageFound) {
        toast({
          variant: "destructive",
          title: "No Image Found",
          description: "No copied image found in clipboard. Copy an image first!",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Clipboard Access Denied",
        description: "Please allow clipboard permissions or use Ctrl+V directly.",
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          if (base64) {
            handleImageInsertion(base64, "Pasted Image");
            toast({
              title: "🖼️ Image Pasted",
              description: "Image successfully pasted from clipboard.",
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          if (base64) {
            handleImageInsertion(base64, "Dropped Image");
            toast({
              title: "🖼️ Image Dropped",
              description: "Image successfully embedded.",
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          handleImageInsertion(base64, "Attached Image");
          toast({
            title: "🖼️ Image Attached",
            description: "Image successfully attached.",
          });
        }
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const insertMarkdown = (syntaxBefore: string, syntaxAfter = "") => {
    const textarea = document.getElementById("notepad-textarea") as HTMLTextAreaElement;
    if (!textarea) {
      setEditorBody((prev) => prev + syntaxBefore + syntaxAfter);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end);

    const inserted = syntaxBefore + selectedText + syntaxAfter;
    const newContent = currentText.substring(0, start) + inserted + currentText.substring(end);

    setEditorBody(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + syntaxBefore.length;
      textarea.selectionEnd = start + syntaxBefore.length + selectedText.length;
    }, 0);
  };

  const handleOk = () => {
    const fullContent = editorTitle.trim() 
      ? `# ${editorTitle.trim()}\n\n${editorBody.trim()}`
      : editorBody.trim();

    if (fullContent.trim() === "") {
      toast({
        variant: "destructive",
        title: "Cannot Save",
        description: "Note content cannot be empty.",
      });
      return;
    }

    setIsSaving(true);

    let updatedNotes = [...notes];
    if (activeNoteId) {
      updatedNotes = notes.map((n) => {
        if (n.id === activeNoteId) {
          return { 
            ...n, 
            content: fullContent, 
            images: editorImages, 
            createdAt: new Date().toISOString() 
          };
        }
        return n;
      });
    } else {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        content: fullContent,
        originalContent: null,
        createdAt: new Date().toISOString(),
        images: editorImages,
      };
      updatedNotes = [newNote, ...notes];
    }

    saveNotesList(updatedNotes);
    toast({ title: t("saved") || "Saved!", description: "Note updated successfully." });

    setTimeout(() => {
      setIsSaving(false);
      setViewState("dashboard");
    }, 400);
  };

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="container min-h-[calc(100vh-6rem)] max-w-6xl flex flex-col items-center justify-start p-4 md:p-8 select-none z-10 relative">
      
      {/* Background radial glowing gradient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] md:w-[800px] h-[400px] rounded-full blur-[100px] md:blur-[140px] bg-primary/10 opacity-30 -z-10 animate-pulse" />

      {/* Screen Title */}
      <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center justify-center gap-2.5 font-heading">
          <Sparkles className="w-7 h-7 text-primary animate-pulse" />
          {t("title") || "Interactive Notepad"}
        </h1>
        <p className="text-muted-foreground mt-1 text-xs md:text-sm">
          {viewState === "dashboard" 
            ? "Your dashboard of professional popup notes." 
            : "Edit your note using the clean customizable card."}
        </p>
      </div>

      <div className="w-full">
        <AnimatePresence mode="wait">
          {viewState === "dashboard" ? (
            
            /* STATE A: MULTI-POPUP DASHBOARD */
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b border-border/20 pb-4 select-none">
                <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Your Floating Popups ({notes.length})
                </span>

                {/* DATABASE CONNECTION STATUS BADGE */}
                {/* <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] md:text-[11px] font-bold transition-all duration-300 active:scale-95 cursor-pointer shadow-sm select-none backdrop-blur-md",
                      dbStatus === "checking" && "bg-white/5 border-white/10 text-muted-foreground animate-pulse",
                      dbStatus === "connected" && "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 shadow-emerald-500/5",
                      dbStatus === "offline" && "bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20 shadow-amber-500/5"
                    )}
                    title="Configure TiDB Credentials"
                  >
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      dbStatus === "checking" && "bg-muted-foreground animate-bounce",
                      dbStatus === "connected" && "bg-emerald-400 animate-pulse",
                      dbStatus === "offline" && "bg-amber-400"
                    )} />
                    <span>
                      {dbStatus === "checking" && "Checking DB..."}
                      {dbStatus === "connected" && "🟢 TiDB Cloud Active"}
                      {dbStatus === "offline" && "🟡 Local File Backup Active"}
                    </span>
                  </button>
                </div> */}
              </div>

              {!isNotesLoaded ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-muted-foreground">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm">Đang tải ghi chú từ server...</p>
                </div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >                
                {/* Add Note Trigger Card */}
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateNew}
                  className="border-2 border-dashed border-border/40 hover:border-primary/50 bg-background/5 hover:bg-primary/5 cursor-pointer rounded-2xl flex flex-col items-center justify-center min-h-[250px] transition-all duration-300 p-6 group shadow-lg select-none relative"
                >
                  <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 rounded-2xl transition-all duration-300 pointer-events-none" />
                  
                  <div className="w-14 h-14 rounded-full bg-primary/10 group-hover:bg-primary/20 text-primary flex items-center justify-center transition-all mb-4 shadow-inner border border-primary/10">
                    <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
                  </div>
                  <span className="font-extrabold text-sm tracking-wide text-foreground/80 group-hover:text-primary transition-colors">
                    New Note
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-1.5 text-center max-w-[190px] leading-relaxed">
                    Create a fresh centered glass popup card.
                  </span>
                </motion.div>

                {/* Existing Notes */}
                <AnimatePresence initial={false}>
                  {notes.map((note, index) => {
                    const isCopied = copiedNoteId === note.id;
                    const isAILoading = aiLoadingNoteId === note.id;
                    const hasOriginal = note.originalContent !== null;
                    
                    return (
                      <GameNoteCard
                        key={note.id}
                        note={note}
                        index={index}
                        isCopied={isCopied}
                        isAILoading={isAILoading}
                        hasOriginal={hasOriginal}
                        onDelete={handleDeleteNote}
                        onCopy={handleCopyNote}
                        onAIEnhance={handleAIEnhance}
                        onRevert={handleRevertNote}
                        onEdit={handleEditNote}
                        formatDate={formatDate}
                      />
                    );
                  })}
                </AnimatePresence>
              </motion.div>
              )}
            </motion.div>
          ) : (
            
            /* STATE B: MINIMALIST INPUT CARD (EDIT MODE) - NOTION STYLE */
            <motion.div
              key="edit-view"
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.99 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl mx-auto rounded-3xl border border-border/40 bg-[#191919]/90 backdrop-blur-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 focus-within:border-primary/20 focus-within:shadow-[0_0_40px_rgba(var(--primary),0.03)]"
              style={{ minHeight: "70vh" }}
            >
              {/* Notion Style Header Bar */}
              <div className="px-4 py-2 border-b border-border/10 bg-background/25 flex items-center justify-between select-none text-[13px] text-muted-foreground select-none flex-wrap gap-2">
                {/* Left Side */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewState("dashboard")}
                    className="p-1 rounded hover:bg-white/5 transition-colors cursor-pointer text-foreground/80 hover:text-foreground flex items-center justify-center"
                    title="Back to dashboard"
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                  <span className="font-medium text-foreground/90 max-w-[120px] md:max-w-[200px] truncate">
                    {editorTitle.trim() || "New page"}
                  </span>
                  <span className="text-muted-foreground/30">/</span>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/5 cursor-pointer text-muted-foreground/80 hover:text-foreground transition-colors">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="text-xs">Private</span>
                    <span className="text-[9px]">▼</span>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                  <span className="text-xs text-muted-foreground/60 hidden sm:inline">Edited just now</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-foreground font-semibold text-xs cursor-pointer border border-white/5 transition-colors active:scale-95">
                    <Lock className="w-3 h-3" />
                    <span>Share</span>
                    <span className="text-[8px]">▼</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({ title: "Link Copied!", description: "Copied page URL to clipboard." });
                    }}
                    className="p-1.5 rounded hover:bg-white/5 hover:text-foreground transition-colors cursor-pointer"
                    title="Copy link"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-1.5 rounded hover:bg-white/5 hover:text-foreground transition-colors cursor-pointer"
                    title="Favorite"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setEditTab(editTab === "edit" ? "preview" : "edit")}
                    className="px-2.5 py-1 rounded hover:bg-white/5 text-xs font-semibold hover:text-foreground transition-colors cursor-pointer border border-white/5"
                    title="Toggle Edit/Preview"
                  >
                    {editTab === "edit" ? "Preview" : "Edit"}
                  </button>
                  <button 
                    className="p-1.5 rounded hover:bg-white/5 hover:text-foreground transition-colors cursor-pointer"
                    title="More options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Textarea or Preview */}
              <div className="p-6 md:p-8 flex flex-col flex-1 relative">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                {editTab === "edit" ? (
                  <>
                    {/* Markdown Formatting Toolbar */}
                    <div className="flex items-center gap-1 pb-3 mb-5 border-b border-border/10 select-none">
                      <button
                        type="button"
                        onClick={() => insertMarkdown("**", "**")}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Bold text"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("*", "*")}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Italic text"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("\n```\n", "\n```\n")}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Code block"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                      <span className="w-[1px] h-4 bg-border/25 mx-1" />
                      <button
                        type="button"
                        onClick={handlePasteFromClipboard}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer text-xs"
                        title="Paste image from clipboard"
                      >
                        <Clipboard className="w-4 h-4 text-primary animate-pulse" />
                        <span className="hidden sm:inline">Paste Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer text-xs"
                        title="Attach image from local files"
                      >
                        <Image className="w-4 h-4" />
                        <span className="hidden sm:inline">Attach Image</span>
                      </button>

                      {/* Helper visual tip on paste */}
                      <span className="ml-auto text-[10px] text-muted-foreground/60 hidden md:flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-primary/80" />
                        <span>Pro-tip: Paste images directly with Ctrl+V!</span>
                      </span>
                    </div>

                    {/* Attached Images Thumbnail Row */}
                    {Object.keys(editorImages).length > 0 && (
                      <div className="flex flex-wrap gap-2.5 mb-4 p-2 bg-white/5 border border-white/5 rounded-2xl select-none">
                        {Object.entries(editorImages).map(([key, base64]) => (
                          <div key={key} className="relative group/thumb w-16 h-16 rounded-xl border border-white/10 overflow-hidden bg-black/40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={base64} 
                              alt="Thumbnail" 
                              className="w-full h-full object-cover"
                            />
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = { ...editorImages };
                                delete updated[key];
                                setEditorImages(updated);
                                setEditorBody(prev => prev.replace(`![${key}]`, ""));
                              }}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity cursor-pointer font-bold text-xs"
                              title="Remove image"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Notion-style Title Input */}
                    <input
                      type="text"
                      value={editorTitle}
                      onChange={(e) => setEditorTitle(e.target.value)}
                      placeholder="New page"
                      className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-3xl md:text-4xl font-extrabold text-foreground placeholder-foreground/20 font-sans tracking-tight mb-5 p-0 select-text"
                      spellCheck={false}
                    />

                    {/* Notion-style Body Textarea */}
                    <textarea
                      id="notepad-textarea"
                      value={editorBody}
                      onChange={handleInputChange}
                      onPaste={handlePaste}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      placeholder='Press "Enter" to write, or select an AI template below...'
                      className="w-full flex-1 bg-transparent border-none focus:outline-none resize-none p-0 text-foreground placeholder-foreground/30 font-sans text-base md:text-lg leading-relaxed focus-visible:outline-none focus-visible:ring-0 select-text"
                      style={{ minHeight: "380px" }}
                      spellCheck={false}
                      autoFocus
                    />

                    {/* Notion Action Pills ("Get started with") */}
                    <div className="mt-8 border-t border-border/15 pt-5 select-none">
                      <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-3">
                        Get started with
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        {/* Ask AI Pill */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!editorBody.trim()) {
                              setEditorBody("Drafting a new project idea with AI...");
                            }
                            handleAIEnhanceEditMode();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer duration-200 active:scale-95"
                          disabled={isAiLoadingEditMode}
                        >
                          {isAiLoadingEditMode ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          <span>Ask AI</span>
                        </button>

                        {/* AI Meeting Notes Pill */}
                        <button
                          type="button"
                          onClick={() => {
                            const meetingNotesTemplate = `### 📅 Meeting Notes: Project Sync\n\n**Participants:** @Trung, @Team\n**Date:** ${new Date().toLocaleDateString()}\n\n#### 🎯 Objectives\n- [ ] Align on Q3 deliverables\n- [ ] Database migration review\n\n#### 📝 Discussion\n- Discussed switching to TiDB serverless.\n- Code is fully compatible.\n\n#### 🚀 Action Items\n- [ ] Deploy new build to production`;
                            setEditorBody(meetingNotesTemplate);
                            toast({ title: "Template Applied", description: "Meeting Notes template loaded." });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-foreground/80 hover:bg-white/10 hover:text-foreground transition-all cursor-pointer duration-200 active:scale-95"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>AI Meeting Notes</span>
                        </button>

                        {/* Database Pill */}
                        <button
                          type="button"
                          onClick={() => {
                            const tableTemplate = `### 📊 Project Roadmap Database\n\n| Task ID | Description | Status | Assignee |\n| :--- | :--- | :--- | :--- |\n| TASK-1 | TiDB database migration | Done | @Trung |\n| TASK-2 | Notion UI redesign | In Progress | @Trung |\n| TASK-3 | Go backend integration | Planning | @Trung |`;
                            setEditorBody(tableTemplate);
                            toast({ title: "Template Applied", description: "Database table template loaded." });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-foreground/80 hover:bg-white/10 hover:text-foreground transition-all cursor-pointer duration-200 active:scale-95"
                        >
                          <Database className="w-3.5 h-3.5 animate-pulse" />
                          <span>Database</span>
                        </button>

                        {/* Form Pill */}
                        <button
                          type="button"
                          onClick={() => {
                            const formTemplate = `### 📝 Feedback Survey Form\n\n**1. Overall Satisfaction:**\n- [ ] Very Satisfied\n- [ ] Satisfied\n- [ ] Neutral\n- [ ] Dissatisfied\n\n**2. Key comments & suggestions:**\n\n\n*Thank you for your valuable feedback!*`;
                            setEditorBody(formTemplate);
                            toast({ title: "Template Applied", description: "Form template loaded." });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-foreground/80 hover:bg-white/10 hover:text-foreground transition-all cursor-pointer duration-200 active:scale-95"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>Form</span>
                        </button>

                        {/* Templates Pill */}
                        <button
                          type="button"
                          onClick={() => {
                            const todoTemplate = `### 🎯 Personal Task List\n\n- [ ] 🏃‍♂️ Morning workout\n- [ ] 📧 Check email replies\n- [ ] 💻 Complete portfolio section\n- [ ] 📚 Read 10 pages of book`;
                            setEditorBody(todoTemplate);
                            toast({ title: "Template Applied", description: "Todo checklist template loaded." });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-foreground/80 hover:bg-white/10 hover:text-foreground transition-all cursor-pointer duration-200 active:scale-95"
                        >
                          <Layout className="w-3.5 h-3.5" />
                          <span>Templates</span>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full flex-1 overflow-y-auto select-text max-h-[400px] pb-4">
                    <div className="text-foreground/85 font-sans text-base leading-relaxed whitespace-pre-wrap text-left">
                      {parseContentWithImages(content, editorImages, true)}
                    </div>
                  </div>
                )}
              </div>

              {/* OK button */}
              <div className="p-4 md:p-5 border-t border-border/20 bg-background/25 flex justify-center">
                <button
                  onClick={handleOk}
                  className={cn(
                    "w-full sm:w-44 py-3.5 px-6 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all duration-200 active:scale-[0.97] cursor-pointer shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-1.5 text-xs",
                    isSaving && "opacity-80 scale-95"
                  )}
                >
                  {isSaving ? (
                    <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>OK</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resilient Settings Modal Drawer */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Dialog Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0c0f17]/90 p-6 md:p-8 shadow-2xl backdrop-blur-2xl z-10"
            >
              {/* Top glowing edge decoration */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              {/* Close / Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  Database Settings
                </h3>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer active:scale-95 text-xs font-bold"
                >
                  Close
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground/80 leading-relaxed mb-6">
                Connect your custom <strong>TiDB Cloud Serverless</strong> cluster to archive deletes and securely back up your notes list.
                Leave empty to fallback to the automated local files backup. Stored securely inside your browser&apos;s <code className="text-primary font-mono bg-white/5 px-1 py-0.5 rounded">localStorage</code>.
              </p>

              {/* Input section */}
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                    TiDB Connection URL
                  </label>
                  <input
                    type="text"
                    value={customDbUrl}
                    onChange={(e) => setCustomDbUrl(e.target.value)}
                    placeholder="mysql://user:pass@host:port/dbname?ssl=..."
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/45 transition-colors focus:border-primary/50 focus:outline-none"
                    spellCheck={false}
                  />
                </div>

                {/* Connection status feedback */}
                {isTestingConnection && (
                  <div className="flex items-center gap-2 text-xs text-primary font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying credentials live...</span>
                  </div>
                )}
                {testError && (
                  <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-normal">
                    <strong>Connection Failed:</strong> {testError}
                  </div>
                )}
                {testSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    🟢 Connection verified successfully! Your TiDB server is responsive and ready.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !customDbUrl.trim()}
                    className="py-3 px-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-extrabold tracking-wide transition-all active:scale-95 text-foreground flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Test connection
                  </button>
                  <button
                    onClick={handleSaveConnectionSettings}
                    className="py-3 px-4 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-extrabold tracking-wide transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save settings
                  </button>
                </div>
                {customDbUrl && (
                  <button
                    onClick={handleResetConnectionSettings}
                    className="py-2.5 px-4 rounded-2xl border border-destructive/15 bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    Clear custom & Revert to default
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
