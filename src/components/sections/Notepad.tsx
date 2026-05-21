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
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { callAIWithFallback } from "@/lib/ai-fallback";

interface Note {
  id: string;
  content: string;
  originalContent: string | null; // Stores the pre-AI content for revert
  createdAt: string;
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
        <div className="p-5 flex-1 select-text z-10">
          <p className="text-foreground/85 font-sans text-sm leading-relaxed whitespace-pre-wrap text-left line-clamp-6 select-text selection:bg-primary/20">
            {note.content}
          </p>
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
  const [copiedNoteId, setCopiedNoteId] = React.useState<string | null>(null);
  const [aiLoadingNoteId, setAiLoadingNoteId] = React.useState<string | null>(null);

  // Load notes from localStorage on mount
  React.useEffect(() => {
    const savedNotes = localStorage.getItem("portfolio_custom_notepad_notes_list");
    setTimeout(() => {
      if (savedNotes !== null) {
        try {
          setNotes(JSON.parse(savedNotes));
        } catch (e) {
          console.error("Failed to parse notes", e);
        }
      } else {
        const defaultNotes: Note[] = [
          {
            id: "note-1",
            content: "Interactive Notepad 📝\n\nWelcome to your new multi-card notepad dashboard! Write short thoughts, tasks, code snippets, or quotes. They appear instantly here as floating professional popup cards.",
            originalContent: null,
            createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
          },
          {
            id: "note-2",
            content: "Pro Tips 💡\n\n- Click the Pencil icon on any popup card to edit its content.\n- Click the Trash icon to delete a card with smooth exit animations.\n- Use the '+' card to create a fresh new note.\n- Use the AI wand to enhance your writing!\n- Revert button restores the original text.",
            originalContent: null,
            createdAt: new Date().toISOString()
          }
        ];
        setNotes(defaultNotes);
        localStorage.setItem("portfolio_custom_notepad_notes_list", JSON.stringify(defaultNotes));
      }
    }, 0);
  }, []);

  const saveNotesList = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem("portfolio_custom_notepad_notes_list", JSON.stringify(updatedNotes));
  };

  const handleCreateNew = () => {
    setActiveNoteId(null);
    setContent("");
    setViewState("edit");
  };

  const handleEditNote = (note: Note) => {
    setActiveNoteId(note.id);
    setContent(note.content);
    setViewState("edit");
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      const updated = notes.filter((n) => n.id !== id);
      saveNotesList(updated);
      toast({
        variant: "destructive",
        title: "Deleted",
        description: "Note removed successfully.",
      });
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
    setContent(e.target.value);
  };

  const handleOk = () => {
    if (content.trim() === "") {
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
          return { ...n, content, createdAt: new Date().toISOString() };
        }
        return n;
      });
    } else {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        content,
        originalContent: null,
        createdAt: new Date().toISOString(),
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
              </motion.div>  </div>
            </motion.div>
          ) : (
            
            /* STATE B: MINIMALIST INPUT CARD (EDIT MODE) */
            <motion.div
              key="edit-view"
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.99 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl mx-auto rounded-3xl border border-border/40 bg-background/40 backdrop-blur-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 focus-within:border-primary/40 focus-within:shadow-[0_0_30px_rgba(var(--primary),0.05)] border-t-primary/20"
            >
              {/* Breadcrumb back to dashboard */}
              <div className="px-6 py-3 border-b border-border/10 bg-background/15 flex items-center justify-between">
                <button
                  onClick={() => setViewState("dashboard")}
                  className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground flex items-center gap-1 select-none transition-colors cursor-pointer"
                >
                  Dashboard
                  <ChevronRight className="w-3.5 h-3.5" />
                  {activeNoteId ? "Edit Note" : "New Note"}
                </button>
              </div>

              {/* Textarea */}
              <div className="p-6 md:p-8 min-h-[250px] md:min-h-[300px] flex flex-col">
                <textarea
                  value={content}
                  onChange={handleInputChange}
                  placeholder={t("emptyState") || "Type your note here..."}
                  className="w-full flex-1 bg-transparent border-none focus:outline-none resize-none p-0 text-foreground placeholder-foreground/30 font-sans text-base md:text-lg leading-relaxed focus-visible:outline-none focus-visible:ring-0 select-text"
                  spellCheck={false}
                  autoFocus
                />
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
    </div>
  );
}
