"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, FileText, Search, Briefcase, FileSignature, 
  CheckCircle, AlertCircle, Download, Copy, Loader2, 
  BookOpen, Brain, Sparkles, Trash2, Volume2, VolumeX, 
  Image as ImageIcon, Clipboard, History, RefreshCw, 
  Plus, Check, HelpCircle, ArrowLeft, Send
} from "lucide-react";
import { callOpenRouter } from "@/lib/openrouter";
import { callAIVisionWithFallback } from "@/lib/ai-fallback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// ==========================================
// TYPES DEFINITIONS
// ==========================================

interface ScannedVocab {
  word: string;
  partOfSpeech: string;
  vietnameseMeaning: string;
  example: string;
  formality: "common_communication" | "formal_writing" | "both_cases";
  aiExpanded?: {
    synonyms: { word: string; meaning: string; usage: string }[];
    antonyms: { word: string; meaning: string; usage: string }[];
    nuanceExplanation: string;
  };
}

interface ScannedGrammar {
  grammarPoint: string;
  explanation: string;
  usage: string;
  originalSentence: string;
}

interface ScannedSheet {
  id: string;
  name: string;
  scannedAt: string;
  transcription: string;
  vocabulary: ScannedVocab[];
  grammar: ScannedGrammar[];
  imageUrl?: string;
  isPreset?: boolean;
}

interface SlangItem {
  id: string;
  phrase: string;
  noteType: "collocation" | "slang" | "idiom" | "expression";
  vietnameseMeaning: string;
  explanation: string;
  synonyms: string;
  antonyms: string;
  sentences: string[];
  createdAt: string;
}

interface PracticeFeedback {
  isNatural: boolean;
  coherenceScore: number;
  fluencyFeedback: string;
  suggestedAlternative: string;
}

// ==========================================
// INTERACTIVE HIGH-FIDELITY PRESET SAMPLES
// ==========================================

const SAMPLE_PRESET_1: ScannedSheet = {
  id: "preset1",
  name: "TOEIC Grammar: Question 139-142",
  scannedAt: "2026-05-21T08:00:00Z",
  isPreset: true,
  transcription: `### TOEIC Practice Set - Business Communications
**Question 139-142** refer to the following email.

To: All Staff <staff@company.com>
From: HR Department <hr@company.com>
Date: October 14

This is to remind everyone that the executive board has decided to **postpone** the annual policy revision meeting until next Monday.

* [Handwritten note in red: **postpone** (v) = trì hoãn, + N/V-ing]
* [Handwritten note: **until next Monday** -> cho tới thứ Hai tới]
* [Handwritten question annotation: *Decided to + V-inf. Postpone fits perfectly since the meeting is scheduled later.*]

If you have already submitted your feedback, we **highly appreciate** your cooperation.

* [Handwritten note in blue: **appreciate** (v) = trân trọng, đánh giá cao. appreciate + N/V-ing]`,
  vocabulary: [
    {
      word: "decided to postpone",
      partOfSpeech: "sentence pattern",
      vietnameseMeaning: "quyết định trì hoãn — cấu trúc decide + to-V kết hợp postpone + N/V-ing",
      example: "The executive board decided to postpone the annual meeting until next Monday.",
      formality: "both_cases",
      aiExpanded: {
        synonyms: [
          { word: "chose to put off", meaning: "chọn cách hoãn lại (thông dụng trong giao tiếp hàng ngày)", usage: "We chose to put off the team dinner until everyone is available." },
          { word: "agreed to delay", meaning: "đồng ý trì hoãn lại (nhấn mạnh sự đồng thuận)", usage: "Both parties agreed to delay the contract signing by one week." },
          { word: "opted to defer", meaning: "quyết định hoãn lại (trang trọng, thường dùng trong công việc)", usage: "The committee opted to defer the budget review to next quarter." }
        ],
        antonyms: [
          { word: "decided to bring forward", meaning: "quyết định đẩy lịch lên sớm hơn", usage: "They decided to bring forward the product launch to capture the holiday market." },
          { word: "rushed to expedite", meaning: "gấp rút thúc đẩy nhanh tiến độ", usage: "The team rushed to expedite the shipping before the deadline." },
          { word: "moved to advance", meaning: "tiến hành đẩy sớm hơn dự kiến", usage: "Management moved to advance the training schedule by two weeks." }
        ],
        nuanceExplanation: "Trong giao tiếp thường ngày, 'chose to put off' là cách nói tự nhiên nhất. 'Decided to postpone' trang trọng hơn, phù hợp email công việc và họp chính thức. 'Opted to defer' rất formal, thường gặp trong biên bản họp và văn bản pháp lý. Khi muốn nói ngược lại (đẩy sớm hơn), 'decided to bring forward' là lựa chọn phổ biến nhất trong cả giao tiếp lẫn viết."
      }
    },
    {
      word: "highly appreciate your cooperation",
      partOfSpeech: "expression",
      vietnameseMeaning: "đánh giá rất cao sự hợp tác của bạn — cụm diễn đạt lịch sự trong email công việc",
      example: "We highly appreciate your cooperation in this urgent matter.",
      formality: "formal_writing"
    },
    {
      word: "submitted your feedback",
      partOfSpeech: "sentence pattern",
      vietnameseMeaning: "đã nộp/gửi phản hồi — cấu trúc submit + N thường dùng trong bối cảnh công việc",
      example: "If you have already submitted your feedback, we will review it shortly.",
      formality: "both_cases"
    }
  ],
  grammar: [
    {
      grammarPoint: "Decide to do something",
      explanation: "Động từ 'decide' đi kèm trực tiếp với một động từ nguyên mẫu có 'to' (to-infinitive) để biểu thị quyết định làm một việc gì đó.",
      usage: "Subject + decide + to-infinitive (V-inf)\nVí dụ: She decided to apply for the full-stack developer position.",
      originalSentence: "This is to remind everyone that the executive board has decided to postpone the annual policy revision meeting..."
    },
    {
      grammarPoint: "Postpone + Gerund/Noun",
      explanation: "Động từ 'postpone' (trì hoãn) yêu cầu tân ngữ phía sau phải là một Danh từ (Noun) hoặc Danh động từ (V-ing), tuyệt đối không dùng to-V.",
      usage: "Subject + postpone + Noun/V-ing\nVí dụ: They postponed launching the social group-buying platform.",
      originalSentence: "...decided to postpone the annual policy revision meeting until next Monday."
    }
  ]
};

const SAMPLE_PRESET_2: ScannedSheet = {
  id: "preset2",
  name: "Verb Tenses Study Sheet",
  scannedAt: "2026-05-21T09:30:00Z",
  isPreset: true,
  transcription: `### English Grammar Hub: Verb Tenses Cheat Sheet

1. **Simple Present (Hiện tại Đơn)**
   - Form: S + V(s/es)
   - Usage: Habits, general truths.
   - [Handwritten note in purple: *Always, usually, often, everyday*]
   - *Example: Nguyen Chi Trung builds responsive applications.*

2. **Present Continuous (Hiện tại Tiếp diễn)**
   - Form: S + am/is/are + V-ing
   - Usage: Actions happening right now, temporary situations.
   - [Handwritten note in red: *Now, at the moment, currently*]
   - *Example: He is currently leading the CONUT platform development team.*

3. **Past Simple (Quá khứ Đơn)**
   - Form: S + V-ed / V2
   - Usage: Completed actions in the past with specific time.
   - [Handwritten note in orange: *Yesterday, ago, in 2025*]
   - *Example: He independently developed pixel-perfect UI screens in 2025.*`,
  vocabulary: [
    {
      word: "is currently leading",
      partOfSpeech: "sentence pattern",
      vietnameseMeaning: "đang hiện tại dẫn dắt/lãnh đạo — cấu trúc Present Continuous + trạng từ thời gian",
      example: "He is currently leading the CONUT platform development team.",
      formality: "both_cases",
      aiExpanded: {
        synonyms: [
          { word: "is presently managing", meaning: "hiện đang quản lý (trang trọng hơn, phù hợp email)", usage: "She is presently managing a cross-functional engineering team." },
          { word: "is now heading", meaning: "hiện đang đứng đầu (ngắn gọn, tự nhiên trong giao tiếp)", usage: "He is now heading the AI research division at the company." },
          { word: "is in charge of", meaning: "đang phụ trách/chịu trách nhiệm về", usage: "She is in charge of the entire front-end architecture." }
        ],
        antonyms: [
          { word: "previously led", meaning: "trước đây đã dẫn dắt (quá khứ đơn)", usage: "He previously led the mobile app team before switching to web." },
          { word: "used to manage", meaning: "từng quản lý (thói quen trong quá khứ, không còn nữa)", usage: "She used to manage a team of 20 developers in Hanoi." },
          { word: "stepped down from leading", meaning: "rời bỏ vị trí lãnh đạo", usage: "He stepped down from leading the project after two years." }
        ],
        nuanceExplanation: "Trong giao tiếp hàng ngày, 'is now heading' ngắn gọn và tự nhiên nhất. 'Is currently leading' phổ biến trong cả nói lẫn viết. 'Is presently managing' trang trọng hơn, thường thấy trong email và báo cáo. 'Is in charge of' nhấn mạnh trách nhiệm hơn là vai trò lãnh đạo. Khi muốn diễn đạt ngược lại (không còn dẫn dắt), 'previously led' đơn giản nhất, còn 'used to manage' nhấn mạnh sự thay đổi."
      }
    },
    {
      word: "worked independently to fix",
      partOfSpeech: "sentence pattern",
      vietnameseMeaning: "tự mình sửa chữa một cách độc lập — nhấn mạnh khả năng tự lực giải quyết vấn đề",
      example: "She worked independently to fix the complex React state management bug.",
      formality: "both_cases"
    },
    {
      word: "represents a general truth",
      partOfSpeech: "expression",
      vietnameseMeaning: "thể hiện một sự thật hiển nhiên — dùng với Simple Present cho chân lý bất biến",
      example: "The sentence 'Water boils at 100°C' represents a general truth.",
      formality: "formal_writing"
    }
  ],
  grammar: [
    {
      grammarPoint: "Present Continuous for Ongoing Projects",
      explanation: "Thì hiện tại tiếp diễn được sử dụng để nói về các hành động, dự án đang trong quá trình thực hiện xung quanh thời điểm nói, dù không nhất thiết phải diễn ra chính xác ngay lúc nói.",
      usage: "Subject + am/is/are + V-ing + (currently, these days)\nVí dụ: I am working on building my Next.js web portfolio.",
      originalSentence: "He is currently leading the CONUT platform development team."
    },
    {
      grammarPoint: "Past Simple with Defined Time Markers",
      explanation: "Thì quá khứ đơn diễn tả hành động đã bắt đầu và hoàn toàn kết thúc trong quá khứ, đi kèm mốc thời gian xác định cụ thể (như 'in 2025', 'yesterday').",
      usage: "Subject + V-ed / irregular verb V2 + past time-marker\nVí dụ: We launched the booking platform in November 2025.",
      originalSentence: "He independently developed pixel-perfect UI screens in 2025."
    }
  ]
};

const DEFAULT_PRESETS = [SAMPLE_PRESET_1, SAMPLE_PRESET_2];

export function EnglishLearning() {
  const t = useTranslations("english");
  const { toast } = useToast();
  
  // Navigation & Space state
  const [activeTab, setActiveTab] = useState<"dash" | "scanner" | "vocab" | "grammar" | "notepad">("dash");

  // Core Data Lists (loaded from localStorage or presets fallback)
  const [scannedSheets, setScannedSheets] = useState<ScannedSheet[]>([]);
  const [slangNotepad, setSlangNotepad] = useState<SlangItem[]>([]);
  
  // Image Upload / Scan state
  const [dragActive, setDragActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedFile, setScannedFile] = useState<File | null>(null);
  const [scannedImagePreview, setScannedImagePreview] = useState<string | null>(null);
  const [customSheetName, setCustomSheetName] = useState("");
  
  // Active Scanned Sheet detail view
  const [selectedSheet, setSelectedSheet] = useState<ScannedSheet | null>(null);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<"content" | "vocab" | "grammar">("content");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio Pronunciation SpeechSynthesis State
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  
  // AI Practice Workspace state
  const [activePracticeGrammar, setActivePracticeGrammar] = useState<ScannedGrammar | null>(null);
  const [practiceSentence, setPracticeSentence] = useState("");
  const [isCheckingSentence, setIsCheckingSentence] = useState(false);
  const [sentenceFeedback, setSentenceFeedback] = useState<PracticeFeedback | null>(null);

  // Slang Notepad state
  const [notePhrase, setNotePhrase] = useState("");
  const [noteType, setNoteType] = useState<"collocation" | "slang" | "idiom" | "expression">("idiom");
  const [noteVietMeaning, setNoteVietMeaning] = useState("");
  const [noteExplanation, setNoteExplanation] = useState("");
  const [noteSynonyms, setNoteSynonyms] = useState("");
  const [noteAntonyms, setNoteAntonyms] = useState("");
  const [noteSentences, setNoteSentences] = useState("");
  const [isAILoadingNotepad, setIsAILoadingNotepad] = useState(false);
  
  // Search states
  const [searchScansQuery, setSearchScansQuery] = useState("");
  const [searchVocabQuery, setSearchVocabQuery] = useState("");
  const [searchGrammarQuery, setSearchGrammarQuery] = useState("");
  const [searchNotepadQuery, setSearchNotepadQuery] = useState("");

  // AI Vocabulary Expansion state
  const [expandingWords, setExpandingWords] = useState<Record<string, boolean>>({});
  const [expandedVocabKeys, setExpandedVocabKeys] = useState<Record<string, boolean>>({});
  const [isExpandingAll, setIsExpandingAll] = useState(false);

  // ==========================================
  // INITIAL DATA LIFECYCLE
  // ==========================================

  useEffect(() => {
    // Load sheets from local storage or set default presets
    const savedSheets = localStorage.getItem("portfolio_scanned_sheets");
    if (savedSheets) {
      setScannedSheets(JSON.parse(savedSheets));
    } else {
      localStorage.setItem("portfolio_scanned_sheets", JSON.stringify(DEFAULT_PRESETS));
      setScannedSheets(DEFAULT_PRESETS);
    }

    // Load Slang Notepad from local storage
    const savedNotepad = localStorage.getItem("portfolio_slang_notepad");
    if (savedNotepad) {
      setSlangNotepad(JSON.parse(savedNotepad));
    } else {
      setSlangNotepad([]);
    }
  }, []);

  const saveSheetsToStorage = (updated: ScannedSheet[]) => {
    localStorage.setItem("portfolio_scanned_sheets", JSON.stringify(updated));
    setScannedSheets(updated);
  };

  const saveNotepadToStorage = (updated: SlangItem[]) => {
    localStorage.setItem("portfolio_slang_notepad", JSON.stringify(updated));
    setSlangNotepad(updated);
  };

  const handleResetHub = () => {
    if (window.confirm(t("confirmDelete") || "Are you sure you want to proceed?")) {
      saveSheetsToStorage([]);
      saveNotepadToStorage([]);
      toast({
        title: t("resetHub"),
        description: "All interactive data and files cleared successfully.",
        variant: "default",
      });
    }
  };

  const handleRestoreDefaults = () => {
    saveSheetsToStorage(DEFAULT_PRESETS);
    toast({
      title: t("restoreDefaults"),
      description: "Default TOEIC and Verb Tense worksheets loaded.",
      variant: "default",
    });
  };

  // ==========================================
  // AI VOCABULARY EXPANSION RESEARCH
  // ==========================================

  const handleAIExpandWord = async (sheetId: string | undefined, word: string, partOfSpeech: string) => {
    const uniqueKey = `${sheetId || "bank"}_${word.toLowerCase()}_${partOfSpeech.toLowerCase()}`;
    
    setExpandingWords(prev => ({ ...prev, [uniqueKey]: true }));
    
    try {
      const systemPrompt = `You are an expert English lexicographer and communication coach.
Analyze the English expression/sentence pattern "${word}" (type: "${partOfSpeech}") and provide SENTENCE-LEVEL synonym and antonym structures that are widely used in daily conversations and business English.

IMPORTANT:
- For SYNONYMS: Provide 2-3 alternative sentence structures/expressions that express the SAME MEANING using different wording. These should be natural, commonly-used alternatives.
- For ANTONYMS: Provide 2-3 sentence structures/expressions that express the OPPOSITE MEANING. These should be practical expressions a learner would actually encounter.
- Do NOT return single isolated words. Always return multi-word expressions or sentence patterns.

Return a single JSON object matching the following structure:
{
  "synonyms": [
    {
      "word": "alternative expression or sentence pattern (multi-word)",
      "meaning": "clear Vietnamese meaning explaining how this alternative is used in context",
      "usage": "a full, natural example sentence demonstrating this alternative"
    }
  ],
  "antonyms": [
    {
      "word": "opposite-meaning expression or sentence pattern (multi-word)",
      "meaning": "clear Vietnamese meaning explaining the opposite expression",
      "usage": "a full, natural example sentence demonstrating this opposite expression"
    }
  ],
  "nuanceExplanation": "A detailed explanation in Vietnamese (2-3 sentences) comparing when to use the original expression versus its synonym and antonym alternatives in common communication (e.g. formality level, spoken vs written, tone differences)."
}
Return ONLY the JSON string. Do not wrap in markdown code blocks. Ensure the JSON is valid.`;

      const responseText = await callOpenRouter(
        systemPrompt,
        `Expand on: "${word}" (${partOfSpeech})`,
        "deepseek/deepseek-v4-flash:free"
      );

      const cleanedText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const expandedData = JSON.parse(cleanedText);

      // Update scannedSheets
      const updatedSheets = scannedSheets.map(sheet => {
        const shouldUpdate = sheetId ? sheet.id === sheetId : sheet.vocabulary.some(v => v.word.toLowerCase() === word.toLowerCase() && v.partOfSpeech.toLowerCase() === partOfSpeech.toLowerCase());
        
        if (shouldUpdate) {
          const updatedVocab = sheet.vocabulary.map(v => {
            if (v.word.toLowerCase() === word.toLowerCase() && v.partOfSpeech.toLowerCase() === partOfSpeech.toLowerCase()) {
              return {
                ...v,
                aiExpanded: expandedData
              };
            }
            return v;
          });
          
          return {
            ...sheet,
            vocabulary: updatedVocab
          };
        }
        return sheet;
      });

      saveSheetsToStorage(updatedSheets);
      
      if (selectedSheet) {
        const matchingUpdatedSheet = updatedSheets.find(s => s.id === selectedSheet.id);
        if (matchingUpdatedSheet) {
          setSelectedSheet(matchingUpdatedSheet);
        }
      }

      setExpandedVocabKeys(prev => ({ ...prev, [uniqueKey]: true }));

      toast({
        title: "Vocabulary Expanded",
        description: `Successfully researched synonyms & antonyms for "${word}".`
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Expansion Failed",
        description: err.message || "Failed to research synonyms and antonyms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExpandingWords(prev => ({ ...prev, [uniqueKey]: false }));
    }
  };

  const handleAIExpandAllWords = async (sheetId: string) => {
    const sheet = scannedSheets.find(s => s.id === sheetId);
    if (!sheet) return;

    setIsExpandingAll(true);
    
    try {
      const systemPrompt = `You are an expert English lexicographer and communication coach.
Analyze the provided list of English expressions/sentence patterns. For each expression, provide SENTENCE-LEVEL synonym and antonym structures that are widely used in daily conversations and business English.

IMPORTANT:
- For SYNONYMS: Provide 2-3 alternative sentence structures/expressions that express the SAME MEANING using different wording.
- For ANTONYMS: Provide 2-3 sentence structures/expressions that express the OPPOSITE MEANING.
- Do NOT return single isolated words. Always return multi-word expressions or sentence patterns.

Return a single JSON object with the expression names as keys, matching the following structure:
{
  "expression_name": {
    "synonyms": [
      {
        "word": "alternative expression or sentence pattern (multi-word)",
        "meaning": "clear Vietnamese meaning explaining how this alternative is used in context",
        "usage": "a full, natural example sentence demonstrating this alternative"
      }
    ],
    "antonyms": [
      {
        "word": "opposite-meaning expression or sentence pattern (multi-word)",
        "meaning": "clear Vietnamese meaning explaining the opposite expression",
        "usage": "a full, natural example sentence demonstrating this opposite expression"
      }
    ],
    "nuanceExplanation": "A detailed explanation in Vietnamese (2-3 sentences) comparing when to use the original versus alternatives in common communication."
  }
}
Return ONLY the JSON string. Do not wrap in markdown code blocks. Ensure the JSON is completely valid.`;

      const vocabListPayload = sheet.vocabulary.map(v => ({ word: v.word, partOfSpeech: v.partOfSpeech }));

      const responseText = await callOpenRouter(
        systemPrompt,
        `Expand all words in this list: ${JSON.stringify(vocabListPayload)}`,
        "deepseek/deepseek-v4-flash:free"
      );

      const cleanedText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const batchData = JSON.parse(cleanedText);

      const updatedSheets = scannedSheets.map(s => {
        if (s.id === sheetId) {
          const updatedVocab = s.vocabulary.map(v => {
            const wordKey = v.word;
            const foundKey = Object.keys(batchData).find(k => k.toLowerCase() === wordKey.toLowerCase());
            if (foundKey && batchData[foundKey]) {
              return {
                ...v,
                aiExpanded: batchData[foundKey]
              };
            }
            return v;
          });
          return {
            ...s,
            vocabulary: updatedVocab
          };
        }
        return s;
      });

      saveSheetsToStorage(updatedSheets);

      if (selectedSheet && selectedSheet.id === sheetId) {
        const matchingUpdatedSheet = updatedSheets.find(s => s.id === sheetId);
        if (matchingUpdatedSheet) {
          setSelectedSheet(matchingUpdatedSheet);
        }
      }

      toast({
        title: "All Vocabulary Expanded",
        description: "Synonyms & antonyms successfully generated for all words."
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Batch Expansion Failed",
        description: err.message || "Failed to batch expand vocabulary. Please expand words individually.",
        variant: "destructive"
      });
    } finally {
      setIsExpandingAll(false);
    }
  };

  // ==========================================
  // AUDIO PRONUNCIATION (SPEECH SYNTHESIS)
  // ==========================================

  const handlePronounce = (text: string) => {
    if (!window.speechSynthesis) {
      toast({
        title: "Speech Synthesis unsupported",
        description: "Your browser does not support audio speech synthesis.",
        variant: "destructive"
      });
      return;
    }

    if (speakingWord === text) {
      window.speechSynthesis.cancel();
      setSpeakingWord(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onend = () => setSpeakingWord(null);
    utterance.onerror = () => setSpeakingWord(null);
    setSpeakingWord(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeakingWord(null);
  };

  // Read entire vocabulary card content aloud (word, example, synonyms, antonyms)
  const handleReadEntireCard = (vocab: ScannedVocab) => {
    if (!window.speechSynthesis) {
      toast({
        title: "Speech Synthesis unsupported",
        description: "Your browser does not support audio speech synthesis.",
        variant: "destructive"
      });
      return;
    }

    const parts: string[] = [];

    // Main expression
    parts.push(vocab.word);
    parts.push(`Part of speech: ${vocab.partOfSpeech}`);
    parts.push(`Example: ${vocab.example}`);

    // AI Expanded content
    if (vocab.aiExpanded) {
      if (vocab.aiExpanded.synonyms.length > 0) {
        parts.push("Synonym sentence structures:");
        vocab.aiExpanded.synonyms.forEach((syn, idx) => {
          parts.push(`Number ${idx + 1}: ${syn.word}`);
          parts.push(`Example: ${syn.usage}`);
        });
      }
      if (vocab.aiExpanded.antonyms.length > 0) {
        parts.push("Antonym sentence structures:");
        vocab.aiExpanded.antonyms.forEach((ant, idx) => {
          parts.push(`Number ${idx + 1}: ${ant.word}`);
          parts.push(`Example: ${ant.usage}`);
        });
      }
    }

    const fullScript = parts.join(". ");
    // Use a unique key to distinguish full-card reading from single-word reading
    const readKey = `__readall__${vocab.word}`;

    if (speakingWord === readKey) {
      window.speechSynthesis.cancel();
      setSpeakingWord(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullScript);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => setSpeakingWord(null);
    utterance.onerror = () => setSpeakingWord(null);
    setSpeakingWord(readKey);
    window.speechSynthesis.speak(utterance);
  };

  // ==========================================
  // SCAN WORKSPACE: DRAG, DROP & CLIPBOARD PASTE
  // ==========================================

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setupUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setupUploadedFile(e.target.files[0]);
    }
  };

  const setupUploadedFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, JPEG).",
        variant: "destructive"
      });
      return;
    }

    setScannedFile(file);
    setCustomSheetName(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (event) => {
      setScannedImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste Handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (activeTab !== "scanner" || selectedSheet) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            setupUploadedFile(blob);
            toast({
              title: t("pastedImageSuccess"),
              description: t("pastedImageSuccessDesc"),
              variant: "default"
            });
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [activeTab, selectedSheet]);

  // ==========================================
  // VISION SCANNER CALL (OPENROUTER FALLBACK)
  // ==========================================

  const triggerVisionScan = async () => {
    if (!scannedImagePreview) return;
    setIsScanning(true);
    
    try {
      const systemPrompt = `You are an elite AI English Syntax Scanner & Learning Assistant. 
Analyze the provided image of an English worksheet, handwriting, or study material. 
Transcribe the English text, extract meaningful expressions/sentence patterns, and analyze the grammar/syntax rules.

IMPORTANT RULES FOR VOCABULARY EXTRACTION:
- Do NOT extract single isolated words (e.g. "postpone", "currently"). 
- Instead, extract EXPRESSIONS, PHRASES, COLLOCATIONS, and SENTENCE PATTERNS that learners should master for natural communication.
- Examples of good extractions: "decided to postpone", "highly appreciate your cooperation", "is currently leading", "worked independently to fix"
- Each expression should be a meaningful multi-word unit that teaches how words combine naturally in English.
- Classify each expression by formality:
  - "common_communication": used in daily conversation, chatting, speaking
  - "formal_writing": used in emails, newspapers, reports, formal documents
  - "both_cases": used naturally in both spoken and written contexts

You MUST respond with a single, clean JSON object matching the following structure:
{
  "transcription": "A complete, beautifully formatted markdown transcription of the sheet, including any handwritten Vietnamese notes or annotations.",
  "vocabulary": [
    {
      "word": "English expression, phrase, collocation, or sentence pattern (multi-word)",
      "partOfSpeech": "expression, sentence pattern, phrase, collocation, phrasal verb, or idiom",
      "vietnameseMeaning": "Vietnamese definition explaining the expression and how it is used in context",
      "example": "A full, natural English sentence demonstrating correct usage of this expression",
      "formality": "common_communication"
    }
  ],
  "grammar": [
    {
      "grammarPoint": "Name of the grammar or syntax rule identified",
      "explanation": "Clear, premium explanation of the grammar rule in Vietnamese",
      "usage": "Detailed usage guidelines and syntax templates (e.g. subject + verb + object) in Vietnamese",
      "originalSentence": "The exact sentence from the sheet where this rule is applied"
    }
  ]
}
Return ONLY the JSON string. Do not wrap in markdown code blocks. Ensure the JSON is completely valid.`;

      // Call the Vision API with automatic model fallback rotation
      const responseJSON = await callAIVisionWithFallback({
        systemPrompt,
        userMessage: "Scan and transcribe this English learning worksheet. Extract vocabulary list and syntax grammar rules.",
        base64Image: scannedImagePreview
      });

      const parsedData = JSON.parse(responseJSON);
      
      const newSheet: ScannedSheet = {
        id: "sheet_" + Date.now(),
        name: customSheetName.trim() || "Scanned Material " + (scannedSheets.length + 1),
        scannedAt: new Date().toISOString(),
        transcription: parsedData.transcription,
        vocabulary: parsedData.vocabulary || [],
        grammar: parsedData.grammar || [],
        imageUrl: scannedImagePreview,
        isPreset: false
      };

      const updated = [newSheet, ...scannedSheets];
      saveSheetsToStorage(updated);
      setSelectedSheet(newSheet);
      setActiveAnalysisTab("content");
      
      // Clean states
      setScannedFile(null);
      setScannedImagePreview(null);
      setCustomSheetName("");

      toast({
        title: "Scan Completed",
        description: "Your grammar sheet has been successfully processed & structured."
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: t("errorGeneral"),
        description: err.message || "Failed to scan. Please check your network or OpenRouter API key.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  // ==========================================
  // PRACTICE SUITE: AI SENTENCE VERIFICATION
  // ==========================================

  const handleCheckSentence = async () => {
    if (!practiceSentence.trim() || !activePracticeGrammar) return;
    setIsCheckingSentence(true);
    setSentenceFeedback(null);

    try {
      const systemPrompt = `You are an expert English teacher evaluating a student's practice sentence.
The student wrote a sentence using the grammar structure: "${activePracticeGrammar.grammarPoint}".
Explanation: ${activePracticeGrammar.explanation}.
Target template/usage: ${activePracticeGrammar.usage}.

Evaluate the sentence and return a JSON object with:
{
  "isNatural": boolean (true if highly natural, false if awkward, unnatural or has grammar mistakes),
  "coherenceScore": number (0 to 100 representing correctness and structure coherence),
  "fluencyFeedback": "Detailed constructive feedback in Vietnamese highlighting errors or strengths",
  "suggestedAlternative": "A natural, high-quality alternative version of their sentence in English"
}
Return ONLY the JSON string. Do not include markdown code block wraps.`;

      const responseText = await callOpenRouter(
        systemPrompt,
        `Student's practice sentence: "${practiceSentence}"`,
        "deepseek/deepseek-v4-flash:free"
      );

      // Simple extraction of JSON just in case markdown blocks exist
      const cleanedText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const feedback: PracticeFeedback = JSON.parse(cleanedText);
      setSentenceFeedback(feedback);

      toast({
        title: "Evaluation Completed",
        description: "AI has successfully reviewed your practice sentence."
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Evaluation Failed",
        description: "Unable to process sentence feedback. Check connection or try again.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingSentence(false);
    }
  };

  // ==========================================
  // SLANG & IDIOMS NOTEPAD: MANUAL & AI ASSIST
  // ==========================================

  const handleVerifyNotepadPhrase = async () => {
    if (!notePhrase.trim()) {
      toast({
        title: t("emptyPhraseError"),
        variant: "destructive"
      });
      return;
    }

    // Check if the user entered only a single word to enforce collocations, idioms, slangs
    const wordsCount = notePhrase.trim().split(/\s+/).length;
    if (wordsCount <= 1) {
      toast({
        title: t("singleWordError"),
        variant: "destructive"
      });
      return;
    }

    setIsAILoadingNotepad(true);

    try {
      const systemPrompt = `You are an expert English linguist specializing in collocations, idioms, and slang.
Analyze the following phrase: "${notePhrase}".
Expression Type: ${noteType}.

Return a single JSON object containing:
{
  "vietnameseMeaning": "Standard Vietnamese translation/meaning of the phrase",
  "explanation": "Clear, premium explanation of the nuance, proper context, origin, and tips in Vietnamese",
  "synonyms": "comma, separated, synonyms, list",
  "antonyms": "comma, separated, antonyms, list",
  "sentences": ["Example sentence 1 showing natural usage.", "Example sentence 2 showing natural usage."]
}
Return ONLY the JSON string. Do not wrap in markdown code blocks.`;

      const responseText = await callOpenRouter(
        systemPrompt,
        `Analyze the expression: "${notePhrase}"`,
        "deepseek/deepseek-v4-flash:free"
      );

      const cleanedText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const data = JSON.parse(cleanedText);

      setNoteVietMeaning(data.vietnameseMeaning || "");
      setNoteExplanation(data.explanation || "");
      setNoteSynonyms(data.synonyms || "");
      setNoteAntonyms(data.antonyms || "");
      if (Array.isArray(data.sentences)) {
        setNoteSentences(data.sentences.join("\n"));
      }

      toast({
        title: "AI Analysis Completed",
        description: "Automatically filled meanings, explanations, and usage sentences."
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "AI Auto-fill Failed",
        description: "Failed to analyze the phrase. Please fill in the details manually.",
        variant: "destructive"
      });
    } finally {
      setIsAILoadingNotepad(false);
    }
  };

  const handleSaveNotepadItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notePhrase.trim()) {
      toast({ title: t("emptyPhraseError"), variant: "destructive" });
      return;
    }
    if (!noteVietMeaning.trim()) {
      toast({ title: "Please enter Vietnamese meaning", variant: "destructive" });
      return;
    }
    if (!noteSentences.trim()) {
      toast({ title: t("emptySentencesError"), variant: "destructive" });
      return;
    }

    const sentencesArray = noteSentences
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newItem: SlangItem = {
      id: "slang_" + Date.now(),
      phrase: notePhrase.trim(),
      noteType,
      vietnameseMeaning: noteVietMeaning.trim(),
      explanation: noteExplanation.trim(),
      synonyms: noteSynonyms.trim(),
      antonyms: noteAntonyms.trim(),
      sentences: sentencesArray,
      createdAt: new Date().toISOString()
    };

    const updated = [newItem, ...slangNotepad];
    saveNotepadToStorage(updated);

    // Clean notepad fields
    setNotePhrase("");
    setNoteVietMeaning("");
    setNoteExplanation("");
    setNoteSynonyms("");
    setNoteAntonyms("");
    setNoteSentences("");

    toast({
      title: t("noteSavedSuccess"),
      description: `Successfully added "${newItem.phrase}" to your notepad.`
    });
  };

  const handleDeleteNotepadItem = (id: string) => {
    if (window.confirm("Are you sure you want to delete this expression?")) {
      const updated = slangNotepad.filter(item => item.id !== id);
      saveNotepadToStorage(updated);
      toast({
        title: "Item Deleted",
        description: "Expression removed from your local notebook."
      });
    }
  };

  // ==========================================
  // DATA QUERIES & GETTERS
  // ==========================================

  // All cumulative vocabulary across all sheets
  const getAllVocabulary = (): ScannedVocab[] => {
    const vocabList: ScannedVocab[] = [];
    const seenWords = new Set<string>();

    scannedSheets.forEach(sheet => {
      if (sheet.vocabulary) {
        sheet.vocabulary.forEach(vocab => {
          const uniqueKey = `${vocab.word.toLowerCase()}_${vocab.partOfSpeech.toLowerCase()}`;
          if (!seenWords.has(uniqueKey)) {
            seenWords.add(uniqueKey);
            vocabList.push(vocab);
          }
        });
      }
    });

    return vocabList;
  };

  // All cumulative grammar across all sheets
  const getAllGrammar = (): ScannedGrammar[] => {
    const grammarList: ScannedGrammar[] = [];
    const seenPoints = new Set<string>();

    scannedSheets.forEach(sheet => {
      if (sheet.grammar) {
        sheet.grammar.forEach(g => {
          const uniqueKey = g.grammarPoint.toLowerCase();
          if (!seenPoints.has(uniqueKey)) {
            seenPoints.add(uniqueKey);
            grammarList.push(g);
          }
        });
      }
    });

    return grammarList;
  };

  // Filter sheets
  const filteredSheets = scannedSheets.filter(sheet => {
    const query = searchScansQuery.toLowerCase();
    return (
      sheet.name.toLowerCase().includes(query) ||
      sheet.transcription.toLowerCase().includes(query)
    );
  });

  // Filter vocabulary
  const filteredVocab = getAllVocabulary().filter(vocab => {
    const query = searchVocabQuery.toLowerCase();
    return (
      vocab.word.toLowerCase().includes(query) ||
      vocab.vietnameseMeaning.toLowerCase().includes(query) ||
      vocab.partOfSpeech.toLowerCase().includes(query)
    );
  });

  // Filter grammar
  const filteredGrammar = getAllGrammar().filter(g => {
    const query = searchGrammarQuery.toLowerCase();
    return (
      g.grammarPoint.toLowerCase().includes(query) ||
      g.explanation.toLowerCase().includes(query)
    );
  });

  // Filter notepad
  const filteredNotepad = slangNotepad.filter(item => {
    const query = searchNotepadQuery.toLowerCase();
    return (
      item.phrase.toLowerCase().includes(query) ||
      item.vietnameseMeaning.toLowerCase().includes(query) ||
      item.explanation.toLowerCase().includes(query) ||
      item.noteType.toLowerCase().includes(query)
    );
  });

  // Action helpers to navigate and prepare practice
  const handleStartPractice = (grammar: ScannedGrammar) => {
    setActivePracticeGrammar(grammar);
    setPracticeSentence("");
    setSentenceFeedback(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 space-y-8 relative">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent sm:text-4xl flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-emerald-400 animate-pulse" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-2xl">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleRestoreDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("restoreDefaults")}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleResetHub}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t("resetHub")}
          </Button>
        </div>
      </div>

      {/* SPACE SELECTION TABS */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-muted/40 rounded-xl max-w-fit border border-border/40">
        <Button 
          variant={activeTab === "dash" ? "default" : "ghost"} 
          size="sm"
          className="rounded-lg text-xs" 
          onClick={() => { setActiveTab("dash"); setSelectedSheet(null); }}
        >
          <History className="h-4 w-4 mr-2" />
          {t("dashTab")}
        </Button>
        <Button 
          variant={activeTab === "scanner" ? "default" : "ghost"} 
          size="sm"
          className="rounded-lg text-xs"
          onClick={() => { setActiveTab("scanner"); setSelectedSheet(null); }}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {t("scannerTab")}
        </Button>
        <Button 
          variant={activeTab === "vocab" ? "default" : "ghost"} 
          size="sm"
          className="rounded-lg text-xs"
          onClick={() => { setActiveTab("vocab"); setSelectedSheet(null); }}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          {t("vocabBankTab")}
        </Button>
        <Button 
          variant={activeTab === "grammar" ? "default" : "ghost"} 
          size="sm"
          className="rounded-lg text-xs"
          onClick={() => { setActiveTab("grammar"); setSelectedSheet(null); }}
        >
          <Brain className="h-4 w-4 mr-2" />
          {t("grammarHubTab")}
        </Button>
        <Button 
          variant={activeTab === "notepad" ? "default" : "ghost"} 
          size="sm"
          className="rounded-lg text-xs"
          onClick={() => { setActiveTab("notepad"); setSelectedSheet(null); }}
        >
          <FileSignature className="h-4 w-4 mr-2" />
          {t("notepadTab")}
        </Button>
      </div>

      {/* SPACE CONTAINER */}
      <div className="w-full min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* ==========================================
              SPACE 1: HUB DASHBOARD
              ========================================== */}
          {activeTab === "dash" && !selectedSheet && (
            <motion.div
              key="dash-space"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                      {t("totalSheets")}
                      <History className="h-4 w-4 text-emerald-400" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{scannedSheets.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Processed worksheets & notes</p>
                  </CardContent>
                </Card>

                <Card className="bg-cyan-500/5 border-cyan-500/10 hover:border-cyan-500/20 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                      {t("vocabMastered")}
                      <BookOpen className="h-4 w-4 text-cyan-400" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{getAllVocabulary().length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Unique active terms structured</p>
                  </CardContent>
                </Card>

                <Card className="bg-indigo-500/5 border-indigo-500/10 hover:border-indigo-500/20 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                      {t("rulesLearned")}
                      <Brain className="h-4 w-4 text-indigo-400" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{getAllGrammar().length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Compiled syntax rules available</p>
                  </CardContent>
                </Card>
              </div>

              {/* Scanned sheets library */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold tracking-tight">{t("recentScans")}</h2>
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder={t("searchScans") || "Search sheets..."}
                      className="pl-8" 
                      value={searchScansQuery}
                      onChange={(e) => setSearchScansQuery(e.target.value)}
                    />
                  </div>
                </div>

                {filteredSheets.length === 0 ? (
                  <Card className="p-12 text-center flex flex-col items-center justify-center bg-muted/10 border-dashed border-2">
                    <History className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground max-w-md mb-6">{t("emptyHistory")}</p>
                    <Button onClick={() => setActiveTab("scanner")}>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {t("scannerTab")}
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSheets.map((sheet) => (
                      <Card 
                        key={sheet.id} 
                        className="cursor-pointer border border-border/60 hover:border-primary/30 transition-all flex flex-col h-full bg-card/60 group"
                        onClick={() => setSelectedSheet(sheet)}
                      >
                        <CardHeader className="p-4 flex-1">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <Badge variant={sheet.isPreset ? "secondary" : "outline"} className="text-[10px]">
                              {sheet.isPreset ? "Preset Material" : "User Upload"}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(sheet.scannedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <CardTitle className="text-md group-hover:text-primary transition-colors line-clamp-1">{sheet.name}</CardTitle>
                          <CardDescription className="line-clamp-3 text-xs leading-relaxed mt-2 pt-2 border-t border-border/40">
                            {sheet.transcription.replace(/[#*`_]/g, "")}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0 border-t border-border/30 bg-muted/10 flex justify-between text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {sheet.vocabulary.length} words</span>
                          <span className="flex items-center gap-1"><Brain className="h-3 w-3" /> {sheet.grammar.length} syntax</span>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ==========================================
              SPACE 2: IMAGE SCANNER
              ========================================== */}
          {activeTab === "scanner" && !selectedSheet && (
            <motion.div
              key="scanner-space"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Image Drop Zone */}
                <div className="lg:col-span-7 space-y-6">
                  <h2 className="text-xl font-semibold tracking-tight">{t("uploadTitle")}</h2>
                  
                  {!scannedImagePreview ? (
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-xl p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px]",
                        dragActive ? "border-emerald-400 bg-emerald-500/5 scale-[0.99]" : "border-border hover:border-emerald-500/30 hover:bg-muted/10"
                      )}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileInputChange} 
                        className="hidden" 
                        accept="image/*"
                      />
                      <div className="relative p-4 bg-emerald-500/10 rounded-full mb-4 text-emerald-400">
                        <Upload className="h-8 w-8 animate-bounce" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Drag and drop syntax image</h3>
                      <p className="text-sm text-muted-foreground mb-3">{t("uploadDesc")}</p>
                      <p className="text-[10px] text-emerald-400/80 bg-emerald-500/15 px-3 py-1 rounded-full font-medium">
                        💡 Clipboard Copy & Paste (Ctrl+V) Supported!
                      </p>
                    </div>
                  ) : (
                    <Card className="overflow-hidden border border-border">
                      <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                        <div className="flex-1 mr-4">
                          <Input 
                            value={customSheetName}
                            onChange={(e) => setCustomSheetName(e.target.value)}
                            placeholder="Enter material title..."
                            className="bg-transparent border-none text-sm font-semibold h-8 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setScannedFile(null); setScannedImagePreview(null); }}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0 bg-black/5 flex items-center justify-center min-h-[300px] max-h-[450px] overflow-hidden">
                        <img 
                          src={scannedImagePreview} 
                          alt="Worksheet Preview" 
                          className="max-h-[300px] object-contain w-auto rounded-md shadow-inner"
                        />
                      </CardContent>
                      <CardFooter className="p-4 border-t flex gap-3 justify-end bg-muted/10">
                        <Button variant="outline" onClick={() => { setScannedFile(null); setScannedImagePreview(null); }}>
                          Clear
                        </Button>
                        <Button 
                          onClick={triggerVisionScan} 
                          disabled={isScanning}
                          className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold"
                        >
                          {isScanning ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("uploading")}</>
                          ) : (
                            <><Sparkles className="mr-2 h-4 w-4" /> Start AI Scanner</>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </div>

                {/* Preset List */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">{t("presetTitle")}</h2>
                    <p className="text-xs text-muted-foreground">{t("presetDesc")}</p>
                  </div>

                  <div className="space-y-4">
                    <Card 
                      className="cursor-pointer border border-border/60 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                      onClick={() => setSelectedSheet(SAMPLE_PRESET_1)}
                    >
                      <CardHeader className="p-4">
                        <Badge className="bg-emerald-500/10 text-emerald-400 w-max border-emerald-500/20 mb-2">{t("preset1Title")}</Badge>
                        <CardTitle className="text-sm font-semibold">{SAMPLE_PRESET_1.name}</CardTitle>
                        <CardDescription className="text-xs leading-relaxed mt-1">{t("preset1Desc")}</CardDescription>
                      </CardHeader>
                    </Card>

                    <Card 
                      className="cursor-pointer border border-border/60 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group"
                      onClick={() => setSelectedSheet(SAMPLE_PRESET_2)}
                    >
                      <CardHeader className="p-4">
                        <Badge className="bg-cyan-500/10 text-cyan-400 w-max border-cyan-500/20 mb-2">{t("preset2Title")}</Badge>
                        <CardTitle className="text-sm font-semibold">{SAMPLE_PRESET_2.name}</CardTitle>
                        <CardDescription className="text-xs leading-relaxed mt-1">{t("preset2Desc")}</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ==========================================
              DETAILED SCANNED SHEET ANALYSIS CONTAINER
              ========================================== */}
          {selectedSheet && (
            <motion.div
              key="sheet-details"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              {/* Back actions */}
              <div className="flex items-center gap-4 justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setSelectedSheet(null); setSentenceFeedback(null); setPracticeSentence(""); }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("backToHome")}
                </Button>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-semibold text-foreground">{selectedSheet.name}</span>
                  <span>•</span>
                  <span>{new Date(selectedSheet.scannedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* IMAGE SCREENSHOT VIEW OR TRANSCRIPTION */}
                <div className="lg:col-span-5 space-y-6">
                  {selectedSheet.imageUrl ? (
                    <Card className="overflow-hidden border border-border bg-black/5 flex flex-col justify-between h-full">
                      <CardHeader className="p-4 border-b bg-muted/20">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Document Screenshot</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex-1 flex items-center justify-center min-h-[250px] max-h-[380px] overflow-hidden">
                        <img 
                          src={selectedSheet.imageUrl} 
                          alt="Scanned Document" 
                          className="max-h-[260px] object-contain rounded-md border border-border"
                        />
                      </CardContent>
                      <CardFooter className="p-4 border-t bg-muted/15 text-[11px] text-muted-foreground italic">
                        Visual coordinates parsed. Scan structured into Interactive Tabs on the right.
                      </CardFooter>
                    </Card>
                  ) : (
                    <Card className="border border-border h-full flex flex-col bg-emerald-500/5">
                      <CardHeader className="p-4 border-b">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Preset Mock Image</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                        <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400 mb-4 animate-pulse">
                          <BookOpen className="h-8 w-8" />
                        </div>
                        <h4 className="font-semibold text-sm">Vietnamese Annotations Active</h4>
                        <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed">
                          This is a system preset worksheet. Hand-written red ink notes are compiled in the tabs on the right.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* INTERACTIVE WORKSPACE TABS */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Analysis Tabs Selector */}
                  <div className="flex gap-2 border-b border-border pb-3">
                    <Button 
                      variant={activeAnalysisTab === "content" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-lg text-xs"
                      onClick={() => setActiveAnalysisTab("content")}
                    >
                      {t("scannedTab")}
                    </Button>
                    <Button 
                      variant={activeAnalysisTab === "vocab" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-lg text-xs"
                      onClick={() => setActiveAnalysisTab("vocab")}
                    >
                      {t("vocabTab")} ({selectedSheet.vocabulary.length})
                    </Button>
                    <Button 
                      variant={activeAnalysisTab === "grammar" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-lg text-xs"
                      onClick={() => setActiveAnalysisTab("grammar")}
                    >
                      {t("grammarTab")} ({selectedSheet.grammar.length})
                    </Button>
                  </div>

                  {/* Tabs contents */}
                  <div className="min-h-[300px]">
                    <AnimatePresence mode="wait">
                      
                      {/* Analysis Content: Transcription */}
                      {activeAnalysisTab === "content" && (
                        <motion.div
                          key="analysis-transcription"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <Card className="border border-border/80">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-semibold">{t("transcriptionTitle")}</CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-line text-muted-foreground p-6 pt-0 font-mono bg-muted/10 rounded-b-xl border-t border-border/20">
                              {selectedSheet.transcription}
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                      {/* Analysis Content: Vocabulary table */}
                      {activeAnalysisTab === "vocab" && (
                        <motion.div
                          key="analysis-vocab"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          {selectedSheet.vocabulary.length === 0 ? (
                            <div className="text-center py-12 text-xs text-muted-foreground">No vocabulary detected.</div>
                          ) : (
                            <div className="space-y-4">
                              {/* Batch Expand Button */}
                              {selectedSheet.vocabulary.some(v => !v.aiExpanded) && (
                                <div className="flex justify-end mb-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAIExpandAllWords(selectedSheet.id)}
                                    disabled={isExpandingAll}
                                    className="bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 text-[10px] h-7"
                                  >
                                    {isExpandingAll ? (
                                      <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> {t("expandingAll")}</>
                                    ) : (
                                      <><Sparkles className="h-3 w-3 mr-1 animate-pulse" /> {t("researchAllBtn")}</>
                                    )}
                                  </Button>
                                </div>
                              )}

                              {selectedSheet.vocabulary.map((vocab, i) => {
                                const cardKey = `${selectedSheet.id}_${vocab.word.toLowerCase()}_${vocab.partOfSpeech.toLowerCase()}`;
                                const isExpanding = expandingWords[cardKey];
                                const isExpanded = expandedVocabKeys[cardKey];
                                
                                return (
                                  <Card key={i} className="border border-border/60 hover:border-emerald-500/30 transition-all overflow-hidden">
                                    <CardContent className="p-4 flex justify-between items-start gap-4">
                                      <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <h4 className="text-sm font-bold text-emerald-400">{vocab.word}</h4>
                                          <Badge variant="outline" className="text-[9px] px-1.5 py-0.2 capitalize">
                                            {vocab.partOfSpeech}
                                          </Badge>
                                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0.2 opacity-80">
                                            {vocab.formality === "common_communication" ? t("common_communication") : 
                                             vocab.formality === "formal_writing" ? t("formal_writing") : t("both_cases")}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-foreground font-medium">{vocab.vietnameseMeaning}</p>
                                        <p className="text-[11px] text-muted-foreground italic pl-3 border-l-2 border-emerald-500/20">
                                          "{vocab.example}"
                                        </p>
                                      </div>
                                      
                                      <div className="flex gap-1 shrink-0">
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className={cn(
                                            "h-8 w-8 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full",
                                            vocab.aiExpanded && "text-emerald-400"
                                          )}
                                          onClick={() => {
                                            if (vocab.aiExpanded) {
                                              setExpandedVocabKeys(prev => ({ ...prev, [cardKey]: !prev[cardKey] }));
                                            } else {
                                              handleAIExpandWord(selectedSheet.id, vocab.word, vocab.partOfSpeech);
                                            }
                                          }}
                                          disabled={isExpanding}
                                          title={t("aiResearchBtn")}
                                        >
                                          {isExpanding ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                                          ) : vocab.aiExpanded ? (
                                            <Sparkles className="h-4 w-4 fill-emerald-400/20" />
                                          ) : (
                                            <Brain className="h-4 w-4" />
                                          )}
                                        </Button>

                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full"
                                          onClick={() => handlePronounce(vocab.word)}
                                        >
                                          {speakingWord === vocab.word ? (
                                            <VolumeX className="h-4 w-4 text-emerald-400" />
                                          ) : (
                                            <Volume2 className="h-4 w-4" />
                                          )}
                                        </Button>

                                        {/* Read Entire Card Voice */}
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className={cn(
                                            "h-8 w-8 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full",
                                            speakingWord === `__readall__${vocab.word}` && "text-cyan-400 bg-cyan-500/10"
                                          )}
                                          onClick={() => handleReadEntireCard(vocab)}
                                          title={t("readAllBtn")}
                                        >
                                          {speakingWord === `__readall__${vocab.word}` ? (
                                            <VolumeX className="h-4 w-4 text-cyan-400" />
                                          ) : (
                                            <FileText className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </div>
                                    </CardContent>

                                    {/* AI Vocabulary Expansion Dropdown */}
                                    <AnimatePresence>
                                      {vocab.aiExpanded && isExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="border-t border-border/30 bg-emerald-500/[0.02] overflow-hidden"
                                        >
                                          <div className="p-4 space-y-4 text-xs leading-relaxed">
                                            
                                            {/* Synonyms & Antonyms grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              {/* Synonyms */}
                                              <div className="space-y-2">
                                                <h5 className="font-semibold text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1 py-0 h-4 uppercase">Synonyms</Badge>
                                                  {t("commonAlternatives")}
                                                </h5>
                                                <div className="space-y-2 pl-1 border-l-2 border-emerald-500/10">
                                                  {vocab.aiExpanded.synonyms.map((syn, sIdx) => (
                                                    <div key={sIdx} className="space-y-0.5">
                                                      <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-bold text-foreground">{syn.word}</span>
                                                        <span className="text-[10px] text-muted-foreground">• {syn.meaning}</span>
                                                      </div>
                                                      <p className="text-[10px] text-muted-foreground italic pl-3 border-l border-border/50">"{syn.usage}"</p>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>

                                              {/* Antonyms */}
                                              <div className="space-y-2">
                                                <h5 className="font-semibold text-yellow-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                                  <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[9px] px-1 py-0 h-4 uppercase">Antonyms</Badge>
                                                  {t("commonAlternatives")}
                                                </h5>
                                                <div className="space-y-2 pl-1 border-l-2 border-yellow-500/10">
                                                  {vocab.aiExpanded.antonyms.map((ant, aIdx) => (
                                                    <div key={aIdx} className="space-y-0.5">
                                                      <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-bold text-foreground">{ant.word}</span>
                                                        <span className="text-[10px] text-muted-foreground">• {ant.meaning}</span>
                                                      </div>
                                                      <p className="text-[10px] text-muted-foreground italic pl-3 border-l border-border/50">"{ant.usage}"</p>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Nuance Explanation */}
                                            {vocab.aiExpanded.nuanceExplanation && (
                                              <div className="pt-3 border-t border-border/20 space-y-1 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                                                <span className="font-semibold text-emerald-400 text-[10px] uppercase tracking-wider block">{t("nuanceTip")}</span>
                                                <p className="text-muted-foreground text-[11px] leading-relaxed">{vocab.aiExpanded.nuanceExplanation}</p>
                                              </div>
                                            )}

                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </Card>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Analysis Content: Grammar cards & practice workspace */}
                      {activeAnalysisTab === "grammar" && (
                        <motion.div
                          key="analysis-grammar"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-6"
                        >
                          {selectedSheet.grammar.length === 0 ? (
                            <div className="text-center py-12 text-xs text-muted-foreground">No grammar structures detected.</div>
                          ) : (
                            <div className="space-y-6">
                              {selectedSheet.grammar.map((g, i) => (
                                <Card key={i} className="border border-border/80 bg-gradient-to-br from-card to-card/50">
                                  <CardHeader className="pb-3 border-b border-border/30">
                                    <div className="flex justify-between items-center gap-2">
                                      <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">
                                        {t("grammarPoint")}
                                      </Badge>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 text-[10px] rounded-md"
                                        onClick={() => handleStartPractice(g)}
                                      >
                                        <Send className="h-3 w-3 mr-1" /> Practical test
                                      </Button>
                                    </div>
                                    <CardTitle className="text-sm font-bold text-indigo-400 mt-2">{g.grammarPoint}</CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-4 space-y-4 text-xs">
                                    <div>
                                      <h5 className="font-semibold text-muted-foreground mb-1">{t("explanation")}:</h5>
                                      <p className="text-muted-foreground leading-relaxed">{g.explanation}</p>
                                    </div>
                                    <div className="bg-muted/30 p-3 rounded-lg border">
                                      <h5 className="font-semibold text-indigo-400 mb-1">{t("usage")}:</h5>
                                      <p className="font-mono text-muted-foreground leading-relaxed whitespace-pre-line text-[11px]">{g.usage}</p>
                                    </div>
                                    <div className="pt-2 border-t border-border/20">
                                      <h5 className="font-semibold text-muted-foreground mb-1">{t("originalSentence")}:</h5>
                                      <p className="italic text-muted-foreground">"{g.originalSentence}"</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                </div>

              </div>

              {/* FLOATING PRACTICE COMPOSER WORKSPACE */}
              {activePracticeGrammar && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-6 border-t border-border/60"
                >
                  <Card className="border-2 border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center gap-4">
                        <CardTitle className="text-md font-bold text-indigo-400 flex items-center gap-2">
                          <Brain className="h-5 w-5 animate-pulse text-indigo-400" />
                          {t("practiceTitle")}: {activePracticeGrammar.grammarPoint}
                        </CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setActivePracticeGrammar(null); setPracticeSentence(""); setSentenceFeedback(null); }}
                          className="h-8 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                      <CardDescription className="text-xs leading-relaxed">{t("practiceDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea 
                        placeholder={t("placeholderPractice") || "Type your practice sentence here..."}
                        value={practiceSentence}
                        onChange={(e) => setPracticeSentence(e.target.value)}
                        className="min-h-[90px] text-xs bg-background"
                      />

                      <div className="flex justify-end">
                        <Button 
                          onClick={handleCheckSentence} 
                          disabled={isCheckingSentence || !practiceSentence.trim()}
                          className="bg-indigo-500 text-white font-semibold text-xs"
                        >
                          {isCheckingSentence ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("checking")}</>
                          ) : (
                            <><Sparkles className="mr-2 h-4 w-4" /> {t("btnCheckSentence")}</>
                          )}
                        </Button>
                      </div>

                      {/* FEEDBACK INSIGHTS VIEW */}
                      {sentenceFeedback && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          className="p-4 bg-background/80 rounded-xl border border-indigo-500/20 space-y-3"
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-border/30">
                            <h4 className="text-xs font-bold text-indigo-400">{t("feedbackTitle")}</h4>
                            <div className="flex items-center gap-3">
                              <Badge className={sentenceFeedback.isNatural ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}>
                                {sentenceFeedback.isNatural ? t("isNaturalYes") : t("isNaturalNo")}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {t("scoreLabel")}: <span className="font-bold text-indigo-400 ml-1">{sentenceFeedback.coherenceScore}/100</span>
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-semibold text-muted-foreground mr-2">{t("fluencyLabel")}:</span>
                              <p className="text-muted-foreground mt-0.5 leading-relaxed">{sentenceFeedback.fluencyFeedback}</p>
                            </div>
                            <div className="pt-2 border-t border-border/10">
                              <span className="font-semibold text-emerald-400 mr-2">{t("suggestAlternative")}:</span>
                              <p className="text-emerald-400 mt-0.5 italic">"{sentenceFeedback.suggestedAlternative}"</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

            </motion.div>
          )}

          {/* ==========================================
              SPACE 3: CUMULATIVE VOCABULARY BANK
              ========================================== */}
          {activeTab === "vocab" && !selectedSheet && (
            <motion.div
              key="vocab-space"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold tracking-tight">{t("vocabMastered")}</h2>
                  <p className="text-xs text-muted-foreground">Cumulative dictionary compiled across all processed worksheets.</p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={t("searchVocab") || "Search vocabulary..."}
                    className="pl-8" 
                    value={searchVocabQuery}
                    onChange={(e) => setSearchVocabQuery(e.target.value)}
                  />
                </div>
              </div>

              {filteredVocab.length === 0 ? (
                <Card className="p-12 text-center flex flex-col items-center justify-center bg-muted/10 border-dashed border-2">
                  <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground text-xs max-w-md">No matching vocabulary found. Create scans to expand your cumulative dictionary.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVocab.map((vocab, i) => {
                    const cardKey = `bank_${vocab.word.toLowerCase()}_${vocab.partOfSpeech.toLowerCase()}`;
                    const isExpanding = expandingWords[cardKey];
                    const isExpanded = expandedVocabKeys[cardKey];

                    return (
                      <Card key={i} className="border border-border/60 hover:border-emerald-500/30 transition-all overflow-hidden">
                        <CardContent className="p-4 flex justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-emerald-400">{vocab.word}</h4>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0.2 capitalize">
                                {vocab.partOfSpeech}
                              </Badge>
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0.2 opacity-80">
                                {vocab.formality === "common_communication" ? t("common_communication") : 
                                 vocab.formality === "formal_writing" ? t("formal_writing") : t("both_cases")}
                              </Badge>
                            </div>
                            <p className="text-xs text-foreground font-medium">{vocab.vietnameseMeaning}</p>
                            <p className="text-[11px] text-muted-foreground italic pl-3 border-l-2 border-emerald-500/20">
                              "{vocab.example}"
                            </p>
                          </div>
                          
                          <div className="flex gap-1 shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={cn(
                                "h-8 w-8 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full",
                                vocab.aiExpanded && "text-emerald-400"
                              )}
                              onClick={() => {
                                if (vocab.aiExpanded) {
                                  setExpandedVocabKeys(prev => ({ ...prev, [cardKey]: !prev[cardKey] }));
                                } else {
                                  handleAIExpandWord(undefined, vocab.word, vocab.partOfSpeech);
                                }
                              }}
                              disabled={isExpanding}
                              title={t("aiResearchBtn")}
                            >
                              {isExpanding ? (
                                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                              ) : vocab.aiExpanded ? (
                                <Sparkles className="h-4 w-4 fill-emerald-400/20" />
                              ) : (
                                <Brain className="h-4 w-4" />
                              )}
                            </Button>

                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full"
                              onClick={() => handlePronounce(vocab.word)}
                            >
                              {speakingWord === vocab.word ? (
                                <VolumeX className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
                            </Button>

                            {/* Read Entire Card Voice */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={cn(
                                "h-8 w-8 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full",
                                speakingWord === `__readall__${vocab.word}` && "text-cyan-400 bg-cyan-500/10"
                              )}
                              onClick={() => handleReadEntireCard(vocab)}
                              title={t("readAllBtn")}
                            >
                              {speakingWord === `__readall__${vocab.word}` ? (
                                <VolumeX className="h-4 w-4 text-cyan-400" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardContent>

                        {/* AI Vocabulary Expansion Dropdown */}
                        <AnimatePresence>
                          {vocab.aiExpanded && isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-border/30 bg-emerald-500/[0.02] overflow-hidden"
                            >
                              <div className="p-4 space-y-4 text-xs leading-relaxed">
                                
                                {/* Synonyms & Antonyms grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {/* Synonyms */}
                                  <div className="space-y-2">
                                    <h5 className="font-semibold text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1 py-0 h-4 uppercase">Synonyms</Badge>
                                      {t("commonAlternatives")}
                                    </h5>
                                    <div className="space-y-2 pl-1 border-l-2 border-emerald-500/10">
                                      {vocab.aiExpanded.synonyms.map((syn, sIdx) => (
                                        <div key={sIdx} className="space-y-0.5">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-foreground">{syn.word}</span>
                                            <span className="text-[10px] text-muted-foreground">• {syn.meaning}</span>
                                          </div>
                                          <p className="text-[10px] text-muted-foreground italic pl-3 border-l border-border/50">"{syn.usage}"</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Antonyms */}
                                  <div className="space-y-2">
                                    <h5 className="font-semibold text-yellow-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                      <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[9px] px-1 py-0 h-4 uppercase">Antonyms</Badge>
                                      {t("commonAlternatives")}
                                    </h5>
                                    <div className="space-y-2 pl-1 border-l-2 border-yellow-500/10">
                                      {vocab.aiExpanded.antonyms.map((ant, aIdx) => (
                                        <div key={aIdx} className="space-y-0.5">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-foreground">{ant.word}</span>
                                            <span className="text-[10px] text-muted-foreground">• {ant.meaning}</span>
                                          </div>
                                          <p className="text-[10px] text-muted-foreground italic pl-3 border-l border-border/50">"{ant.usage}"</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Nuance Explanation */}
                                {vocab.aiExpanded.nuanceExplanation && (
                                  <div className="pt-3 border-t border-border/20 space-y-1 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                                    <span className="font-semibold text-emerald-400 text-[10px] uppercase tracking-wider block">{t("nuanceTip")}</span>
                                    <p className="text-muted-foreground text-[11px] leading-relaxed">{vocab.aiExpanded.nuanceExplanation}</p>
                                  </div>
                                )}

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ==========================================
              SPACE 4: CUMULATIVE GRAMMAR HUB
              ========================================== */}
          {activeTab === "grammar" && !selectedSheet && (
            <motion.div
              key="grammar-space"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold tracking-tight">{t("grammarHubTab")}</h2>
                  <p className="text-xs text-muted-foreground">Cumulative catalog of syntax rules extracted across your worksheet library.</p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={t("searchGrammar") || "Search grammar rules..."}
                    className="pl-8" 
                    value={searchGrammarQuery}
                    onChange={(e) => setSearchGrammarQuery(e.target.value)}
                  />
                </div>
              </div>

              {filteredGrammar.length === 0 ? (
                <Card className="p-12 text-center flex flex-col items-center justify-center bg-muted/10 border-dashed border-2">
                  <Brain className="h-12 w-12 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground text-xs max-w-md">No syntax rules compiled yet. Upload or try preset worksheets to build the database.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredGrammar.map((g, i) => (
                    <Card key={i} className="border border-border/80 flex flex-col justify-between">
                      <CardHeader className="pb-3 border-b border-border/30">
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] w-max">
                          {t("grammarPoint")}
                        </Badge>
                        <CardTitle className="text-sm font-bold text-indigo-400 mt-2">{g.grammarPoint}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 text-xs flex-1">
                        <div>
                          <h5 className="font-semibold text-muted-foreground mb-1">{t("explanation")}:</h5>
                          <p className="text-muted-foreground leading-relaxed line-clamp-3">{g.explanation}</p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg border font-mono text-[10px] text-muted-foreground whitespace-pre-line leading-relaxed">
                          {g.usage}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 border-t border-border/20 bg-muted/5 flex justify-end">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-7 text-[10px]"
                          onClick={() => {
                            // Find the sheet containing this grammar to open its workspace
                            const matchedSheet = scannedSheets.find(sheet => 
                              sheet.grammar.some(gItem => gItem.grammarPoint === g.grammarPoint)
                            );
                            if (matchedSheet) {
                              setSelectedSheet(matchedSheet);
                              setActiveAnalysisTab("grammar");
                              handleStartPractice(g);
                            } else {
                              // If deleted somehow, build temp practice environment
                              toast({
                                title: "Please scan sheets first",
                                description: "Practice workspace requires active sheet context.",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          <Send className="h-3 w-3 mr-1" /> Practice structure
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ==========================================
              SPACE 5: SLANG & IDIOMS NOTEPAD
              ========================================== */}
          {activeTab === "notepad" && !selectedSheet && (
            <motion.div
              key="notepad-space"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Form to Create & Verify Expressions */}
                <div className="lg:col-span-6 space-y-6">
                  <h2 className="text-xl font-semibold tracking-tight">Phrase Logger</h2>
                  
                  <Card className="border border-border">
                    <form onSubmit={handleSaveNotepadItem}>
                      <CardContent className="p-6 space-y-4">
                        
                        {/* Title Input & AI autocomplete button */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">Phrase/Expression</label>
                          <div className="flex gap-2">
                            <Input 
                              placeholder={t("phrasePlaceholder") || "Enter phrase (e.g., 'bite the bullet')"}
                              value={notePhrase}
                              onChange={(e) => setNotePhrase(e.target.value)}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handleVerifyNotepadPhrase}
                              disabled={isAILoadingNotepad || !notePhrase.trim()}
                              className="shrink-0 text-xs px-3"
                            >
                              {isAILoadingNotepad ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <><Sparkles className="h-4 w-4 mr-1 text-emerald-400" /> AI Fill</>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Expression Type Selector */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">{t("noteType")}</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {["idiom", "slang", "collocation", "expression"].map((type) => (
                              <Button
                                key={type}
                                type="button"
                                variant={noteType === type ? "default" : "outline"}
                                size="sm"
                                className="capitalize text-[10px] h-7"
                                onClick={() => setNoteType(type as any)}
                              >
                                {type === "idiom" ? t("idiom") : 
                                 type === "slang" ? t("slang") : 
                                 type === "collocation" ? t("collocation") : t("expression")}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Meaning & Explanation fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground">{t("vietnameseMeaning")}</label>
                            <Input 
                              placeholder="e.g. Cắn răng chịu đựng"
                              value={noteVietMeaning}
                              onChange={(e) => setNoteVietMeaning(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground">{t("aiExplanation")}</label>
                            <Input 
                              placeholder="e.g. Nuances, context details..."
                              value={noteExplanation}
                              onChange={(e) => setNoteExplanation(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Synonyms & Antonyms */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground">{t("synonymsLabel")}</label>
                            <Input 
                              placeholder={t("synonymsPlaceholder") || "Synonyms list..."}
                              value={noteSynonyms}
                              onChange={(e) => setNoteSynonyms(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground">{t("antonymsLabel")}</label>
                            <Input 
                              placeholder={t("antonymsPlaceholder") || "Antonyms list..."}
                              value={noteAntonyms}
                              onChange={(e) => setNoteAntonyms(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Sentences */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">{t("sentencesLabel")} (One per line)</label>
                          <Textarea 
                            placeholder={t("sentencesPlaceholder") || "Write sample sentences demonstrating this phrase..."}
                            value={noteSentences}
                            onChange={(e) => setNoteSentences(e.target.value)}
                            className="min-h-[70px] text-xs"
                          />
                        </div>

                      </CardContent>
                      <CardFooter className="p-4 border-t flex justify-end">
                        <Button 
                          type="submit" 
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs"
                        >
                          <Plus className="h-4 w-4 mr-1.5" />
                          {t("addNoteBtn")}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </div>

                {/* Searchable catalog of Saved Items */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold tracking-tight">Saved expressions</h2>
                    <div className="relative w-full sm:max-w-xs">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder={t("searchNotepad") || "Search idioms..."}
                        className="pl-8" 
                        value={searchNotepadQuery}
                        onChange={(e) => setSearchNotepadQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {filteredNotepad.length === 0 ? (
                    <Card className="p-12 text-center flex flex-col items-center justify-center bg-muted/10 border-dashed border-2 min-h-[300px]">
                      <FileSignature className="h-12 w-12 text-muted-foreground/40 mb-4" />
                      <p className="text-muted-foreground text-xs max-w-sm">{t("noNotepadItems")}</p>
                    </Card>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {filteredNotepad.map((item) => (
                        <Card key={item.id} className="border border-border/60 hover:border-emerald-500/20 transition-all">
                          <CardHeader className="p-4 pb-2 border-b bg-muted/15 flex flex-row items-center justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-emerald-400">{item.phrase}</h4>
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 capitalize text-[9px] h-4">
                                {item.noteType === "idiom" ? t("idiom") : 
                                 item.noteType === "slang" ? t("slang") : 
                                 item.noteType === "collocation" ? t("collocation") : t("expression")}
                              </Badge>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteNotepadItem(item.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </CardHeader>
                          <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
                            <div>
                              <span className="font-semibold text-foreground mr-1.5">{t("vietnameseMeaning")}:</span>
                              <span className="text-foreground">{item.vietnameseMeaning}</span>
                            </div>
                            {item.explanation && (
                              <div>
                                <span className="font-semibold text-muted-foreground mr-1.5">{t("aiExplanation")}:</span>
                                <span>{item.explanation}</span>
                              </div>
                            )}
                            {(item.synonyms || item.antonyms) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/30">
                                {item.synonyms && (
                                  <div>
                                    <span className="font-semibold text-[10px] block text-muted-foreground">{t("synonymsLabel")}</span>
                                    <span className="text-[11px] text-emerald-400/90">{item.synonyms}</span>
                                  </div>
                                )}
                                {item.antonyms && (
                                  <div>
                                    <span className="font-semibold text-[10px] block text-muted-foreground">{t("antonymsLabel")}</span>
                                    <span className="text-[11px] text-yellow-400/90">{item.antonyms}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="pt-2 border-t border-border/30">
                              <span className="font-semibold text-foreground text-[10px] block mb-1">Usage examples</span>
                              <ul className="list-disc pl-4 space-y-1.5">
                                {item.sentences.map((sentence, sIdx) => (
                                  <li key={sIdx} className="italic pl-1">
                                    "{sentence}"
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-5 w-5 ml-1 text-muted-foreground hover:text-emerald-400 rounded-full inline-flex align-middle"
                                      onClick={() => handlePronounce(sentence)}
                                    >
                                      {speakingWord === sentence ? (
                                        <VolumeX className="h-3.5 w-3.5 text-emerald-400" />
                                      ) : (
                                        <Volume2 className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
