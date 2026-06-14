import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  FileText, Trash2, Send, Bot, Loader2,
  FilePlus, MessageSquare, Brain, Zap, CheckCircle2,
  AlertCircle, FileUp, RotateCcw, BookOpen, Lightbulb,
  ClipboardList, Sparkles, Download, Copy, Check,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "../../components/DashboardLayout";
import {
  getOrCreateChatbotId,
  sendMessageStream,
  checkChatbotHealth,
  uploadDocument,
  resetChatbotId,
  clearChatbotDocuments,
  getChatbotDocuments,
} from "../../services/chatbotService";

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────
const DOCS_STORAGE_KEY = "desa_hutan_uploaded_docs";

const QUICK_PROMPTS = [
  {
    icon: BookOpen,
    label: "Ringkasan",
    prompt: "Buatkan ringkasan lengkap dan terstruktur dari seluruh dokumen yang telah diupload. Gunakan format heading dan poin-poin.",
    color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    icon: ClipboardList,
    label: "Poin Penting",
    prompt: "Apa saja poin-poin penting dan temuan utama dari dokumen ini? Susun secara terstruktur.",
    color: "text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
  {
    icon: Lightbulb,
    label: "Rekomendasi",
    prompt: "Berikan rekomendasi actionable berdasarkan isi dokumen yang diupload. Format dengan heading dan sub-poin.",
    color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100",
  },
  {
    icon: Zap,
    label: "Analisis",
    prompt: "Lakukan analisis mendalam terhadap konten dokumen ini. Identifikasi kekuatan, kelemahan, dan peluang.",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
  },
];

// ─────────────────────────────────────────
// UTILITY: Download file client-side
// ─────────────────────────────────────────
const toPlainText = (markdown) =>
  markdown
    .replace(/\*\*([^*]+)\*\*/g, "$1")        // strip bold
    .replace(/\*([^*]+)\*/g, "$1")             // strip italic
    .replace(/#{1,6}\s/g, "")                  // strip headings
    .replace(/^[-•]\s/gm, "• ")               // normalize bullets
    .trim();

const buildMarkdown = (text, docName) => {
  const date = new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
  return `# Rangkuman AI — Desa Hutan
> Dibuat oleh: AI Asisten Desa Hutan
> Dokumen: ${docName || "Tidak diketahui"}
> Tanggal: ${date}

---

${text}

---
*Dokumen ini dibuat otomatis oleh AI Asisten Desa Hutan*
`;
};

const downloadFile = (content, filename) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke setelah delay singkat supaya download sempat mulai
  setTimeout(() => URL.revokeObjectURL(url), 500);
};

// ─────────────────────────────────────────
// KOMPONEN: Format teks (memo untuk performa)
// ─────────────────────────────────────────
const FormattedText = memo(({ text }) => {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, lineIdx) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {parts.map((part, i) =>
              part.startsWith("**") && part.endsWith("**")
                ? <strong key={i}>{part.slice(2, -2)}</strong>
                : part
            )}
          </React.Fragment>
        );
      })}
    </>
  );
});
FormattedText.displayName = "FormattedText";

// ─────────────────────────────────────────
// KOMPONEN: Download Dropdown (memo)
// ─────────────────────────────────────────
const DownloadDropdown = memo(({ text, docName, msgId }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const slug = `rangkuman_ai_${Date.now()}`;

  const handleDownloadMd = useCallback(() => {
    downloadFile(buildMarkdown(text, docName), `${slug}.md`);
    toast.success("File .md berhasil diunduh!");
    setOpen(false);
  }, [text, docName, slug]);

  const handleDownloadTxt = useCallback(() => {
    downloadFile(toPlainText(buildMarkdown(text, docName)), `${slug}.txt`);
    toast.success("File .txt berhasil diunduh!");
    setOpen(false);
  }, [text, docName, slug]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Teks berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    });
    setOpen(false);
  }, [text]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        title="Unduh / Salin"
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-[#00C47C] hover:bg-[#00C47C]/5 border border-transparent hover:border-[#00C47C]/20 transition-all"
      >
        <FileDown size={13} />
        <span className="font-medium">Unduh</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1.5 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={handleDownloadMd}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-[#00C47C]/5 hover:text-[#00C47C] transition-colors text-left"
          >
            <FileDown size={13} className="text-emerald-500 flex-shrink-0" />
            Unduh sebagai .md
          </button>
          <button
            onClick={handleDownloadTxt}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left"
          >
            <FileText size={13} className="text-blue-500 flex-shrink-0" />
            Unduh sebagai .txt
          </button>
          <div className="h-px bg-gray-100 mx-3 my-1" />
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors text-left"
          >
            {copied
              ? <Check size={13} className="text-purple-500 flex-shrink-0" />
              : <Copy size={13} className="text-purple-500 flex-shrink-0" />}
            {copied ? "Tersalin!" : "Salin teks"}
          </button>
        </div>
      )}
    </div>
  );
});
DownloadDropdown.displayName = "DownloadDropdown";

// ─────────────────────────────────────────
// KOMPONEN: Document Card (memo)
// ─────────────────────────────────────────
const DocCard = memo(({ doc, isActive, onSelect, onDelete }) => {
  const ext = doc.name.split(".").pop().toLowerCase();
  const extColors = {
    pdf: "bg-red-100 text-red-700",
    xlsx: "bg-green-100 text-green-700",
    xls: "bg-green-100 text-green-700",
    docx: "bg-blue-100 text-blue-700",
    doc: "bg-blue-100 text-blue-700",
  };
  const extColor = extColors[ext] || "bg-gray-100 text-gray-700";

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-150 ${
        isActive
          ? "border-[#00C47C] bg-[#00C47C]/5 shadow-sm shadow-[#00C47C]/10"
          : "border-gray-100 bg-white hover:border-[#00C47C]/40 hover:shadow-sm"
      }`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${extColor}`}>
        {ext}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "—"} &bull;{" "}
          {new Date(doc.uploadedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
        </p>
        {doc.status === "uploading" && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600">
            <Loader2 size={11} className="animate-spin" /> Mengupload...
          </div>
        )}
        {doc.status === "success" && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
            <CheckCircle2 size={11} /> Siap digunakan
          </div>
        )}
        {doc.status === "error" && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle size={11} /> Gagal diupload
          </div>
        )}
      </div>
      {isActive && <div className="w-2 h-2 rounded-full bg-[#00C47C] flex-shrink-0 mt-1.5" />}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
        className="absolute top-2 right-2 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        title="Hapus dokumen"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
});
DocCard.displayName = "DocCard";

// ─────────────────────────────────────────
// KOMPONEN: Message Bubble (memo + download)
// ─────────────────────────────────────────
const MessageBubble = memo(({ msg, activeDocName }) => {
  const isBot = msg.role === "bot";
  const isError = msg.role === "error";
  const isWelcome = msg.id === "welcome";

  if (isError) {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm leading-relaxed">
          <AlertCircle size={14} className="inline mr-1.5 mb-0.5" />
          <FormattedText text={msg.text} />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-3 ${isBot ? "justify-start" : "justify-end"} items-end gap-2.5 group/msg`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00C47C] to-[#0B8457] flex items-center justify-center flex-shrink-0 shadow-sm self-start mt-0.5">
          <Bot size={15} className="text-white" />
        </div>
      )}

      <div className="flex flex-col max-w-[80%] gap-1">
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isBot
              ? "bg-white border border-gray-100 text-gray-700 rounded-bl-sm"
              : "bg-gradient-to-br from-[#0B241A] to-[#163629] text-white rounded-br-sm"
          }`}
        >
          <FormattedText text={msg.text} />
          <p className={`text-[10px] mt-1.5 ${isBot ? "text-gray-400" : "text-white/50"} text-right`}>
            {msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
              : ""}
          </p>
        </div>

        {/* Toolbar unduh — hanya untuk pesan bot (bukan welcome) */}
        {isBot && !isWelcome && (
          <div className="flex items-center gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-150 pl-1">
            <DownloadDropdown
              text={msg.text}
              docName={activeDocName}
              msgId={msg.id}
            />
          </div>
        )}
      </div>
    </div>
  );
});
MessageBubble.displayName = "MessageBubble";

// ─────────────────────────────────────────
// KOMPONEN: Typing Indicator (memo)
// ─────────────────────────────────────────
const TypingIndicator = memo(() => (
  <div className="flex justify-start mb-3 items-end gap-2.5">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00C47C] to-[#0B8457] flex items-center justify-center flex-shrink-0 shadow-sm">
      <Bot size={15} className="text-white" />
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-gray-100 shadow-sm flex gap-1 items-center">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#00C47C]"
          style={{ animation: `typing-bounce 1.4s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  </div>
));
TypingIndicator.displayName = "TypingIndicator";

// ─────────────────────────────────────────
// KOMPONEN: Download All Button (Export Chat)
// ─────────────────────────────────────────
const ExportChatButton = memo(({ messages, activeDocName }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const botMessages = messages.filter(m => m.role === "bot" && m.id !== "welcome");
  if (botMessages.length === 0) return null;

  const slug = `chat_ai_desa_hutan_${Date.now()}`;
  const date = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const buildFullExport = () => {
    const header = `# Ekspor Chat AI Asisten — Desa Hutan\n> Dokumen: ${activeDocName || "Umum"}\n> Tanggal: ${date}\n\n---\n\n`;
    const body = messages
      .filter(m => m.role === "user" || m.role === "bot")
      .map(m => {
        const time = m.timestamp
          ? new Date(m.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          : "";
        const label = m.role === "user" ? `**[User] ${time}**` : `**[AI] ${time}**`;
        return `${label}\n\n${m.text}\n`;
      })
      .join("\n---\n\n");
    return header + body;
  };

  const handleExportMd = () => {
    downloadFile(buildFullExport(), `${slug}.md`);
    toast.success("Ekspor chat (.md) berhasil diunduh!");
    setOpen(false);
  };

  const handleExportTxt = () => {
    downloadFile(toPlainText(buildFullExport()), `${slug}.txt`);
    toast.success("Ekspor chat (.txt) berhasil diunduh!");
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-[#00C47C] hover:bg-[#00C47C]/5 rounded-xl transition-all border border-gray-200 hover:border-[#00C47C]/30"
        title="Ekspor seluruh percakapan"
      >
        <Download size={13} />
        Ekspor Chat
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
          <p className="px-3.5 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Format file</p>
          <button
            onClick={handleExportMd}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-[#00C47C]/5 hover:text-[#00C47C] transition-colors text-left"
          >
            <FileDown size={13} className="text-emerald-500" />
            Markdown (.md)
          </button>
          <button
            onClick={handleExportTxt}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left"
          >
            <FileText size={13} className="text-blue-500" />
            Plain Text (.txt)
          </button>
        </div>
      )}
    </div>
  );
});
ExportChatButton.displayName = "ExportChatButton";

// ─────────────────────────────────────────
// MAIN: AiAsisten Page
// ─────────────────────────────────────────
export default function AiAsisten() {
  const [chatbotId, setChatbotId] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Documents
  const [docs, setDocs] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Chat
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Load docs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DOCS_STORAGE_KEY);
      if (stored) setDocs(JSON.parse(stored));
    } catch {}
  }, []);

  // ── Persist docs
  useEffect(() => {
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
  }, [docs]);

  // ── Initialize chatbot
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setIsInitializing(true);
      try {
        const healthy = await checkChatbotHealth();
        if (cancelled) return;
        setIsBackendOnline(healthy);
        if (!healthy) return;
        const id = await getOrCreateChatbotId();
        if (cancelled) return;
        setChatbotId(id);

        // Load documents from backend
        try {
          const backendDocs = await getChatbotDocuments(id);
          if (!cancelled) {
            const formattedDocs = backendDocs.map(d => ({
              id: d.id,
              name: d.filename,
              size: null,
              uploadedAt: new Date().toISOString(),
              status: "success"
            }));
            setDocs(formattedDocs);
          }
        } catch (err) {
          console.error("Gagal mengambil dokumen dari backend:", err);
        }

        setMessages([{
          id: "welcome",
          role: "bot",
          text: "Selamat datang di **AI Asisten Desa Hutan**! 🌿\n\nSaya siap membantu Anda menganalisis dokumen.\n\n📄 **Cara menggunakan:**\n1. Upload dokumen PDF/DOCX di panel kiri\n2. Gunakan tombol analisis cepat atau ketik pertanyaan\n3. Hover pada jawaban AI → klik **Unduh** untuk simpan sebagai .md atau .txt",
          timestamp: new Date(),
        }]);
      } catch {
        if (!cancelled) setIsBackendOnline(false);
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  // ── Auto-scroll (throttled untuk performa)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [messages.length, isLoading]);

  // ── Prevent browser default drag/drop behaviors globally on this page
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", preventDefault);
    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  }, []);

  // ── Upload
  const handleUploadFiles = useCallback(async (files) => {
    if (!chatbotId) return toast.error("Chatbot belum siap, coba lagi.");
    const allowed = [".pdf", ".docx", ".doc"];
    const validFiles = Array.from(files).filter(f => {
      const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
      if (!allowed.includes(ext)) { toast.error(`"${f.name}" — format tidak didukung.`); return false; }
      if (f.size > 20 * 1024 * 1024) { toast.error(`"${f.name}" terlalu besar (maks 20MB).`); return false; }
      return true;
    });
    if (!validFiles.length) return;

    for (const file of validFiles) {
      const docId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setDocs(prev => [{ id: docId, name: file.name, size: file.size, uploadedAt: new Date().toISOString(), status: "uploading" }, ...prev]);
      setActiveDocId(docId);
      setIsUploading(true);
      try {
        await uploadDocument(chatbotId, file);
        setDocs(prev => prev.map(d => d.id === docId ? { ...d, status: "success" } : d));
        toast.success(`✅ "${file.name}" berhasil diupload! Silakan ketik pertanyaan Anda tentang dokumen ini.`);
      } catch (err) {
        setDocs(prev => prev.map(d => d.id === docId ? { ...d, status: "error" } : d));
        toast.error(`Gagal upload "${file.name}": ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  }, [chatbotId]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const isFile = e.dataTransfer.types && Array.from(e.dataTransfer.types).includes("Files");
    if (isFile) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  }, [handleUploadFiles]);

  const handleDeleteDoc = useCallback((id) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    setActiveDocId(prev => prev === id ? null : prev);
    toast.success("Dokumen dihapus.");
  }, []);

  // ── Send message
  const handleSend = useCallback(async (customMessage = null) => {
    const text = (customMessage || inputValue).trim();
    if (!text || isLoading || !chatbotId) return;

    const userMsg = { id: `u_${Date.now()}`, role: "user", text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    // Build history pairs [user, bot]
    const history = [];
    const filtered = messages.filter(m => m.id !== "welcome" && (m.role === "user" || m.role === "bot"));
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i].role === "user" && filtered[i + 1]?.role === "bot") {
        history.push([filtered[i].text, filtered[i + 1].text]);
        i++;
      }
    }

    // Dokumen aktif — backend akan filter retrieval hanya dari file ini
    const activeDoc = docs.find(d => d.id === activeDocId);
    const successDocs = docs.filter(d => d.status === "success");
    const docNames = successDocs.map(d => d.name).join(", ") || "tidak ada";
    const pageCtx = activeDoc
      ? `Halaman AI Asisten | Dokumen yang sedang ditanyakan: "${activeDoc.name}" | Semua dokumen tersedia: ${docNames}. PENTING: Jawab HANYA berdasarkan isi dokumen "${activeDoc.name}".`
      : `Halaman AI Asisten | Dokumen tersedia: ${docNames}`;

    // Kirim nama file aktif ke backend untuk filter PGVector
    const activeDocName = activeDoc?.name || null;

    // Buat placeholder message untuk streaming
    const botMsgId = `b_${Date.now()}`;
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: "bot",
      text: "",
      timestamp: new Date(),
      isStreaming: true,
    }]);

    try {
      await sendMessageStream(
        chatbotId, text, history, pageCtx, activeDocName,
        // onToken callback — update message text in real-time
        (partialAnswer) => {
          setMessages(prev => prev.map(m =>
            m.id === botMsgId ? { ...m, text: partialAnswer } : m
          ));
        }
      );
      // Mark streaming complete
      setMessages(prev => prev.map(m =>
        m.id === botMsgId ? { ...m, isStreaming: false } : m
      ));
    } catch (err) {
      // Remove empty streaming message and add error
      setMessages(prev => [
        ...prev.filter(m => m.id !== botMsgId || m.text),
        {
          id: `e_${Date.now()}`,
          role: "error",
          text: err.message || "Gagal terhubung ke server.",
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, chatbotId, messages, docs, activeDocId]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const handleReset = useCallback(async () => {
    // 1. Hapus semua vector dokumen dari database (BENAR-BENAR bersih)
    if (chatbotId) {
      try {
        await clearChatbotDocuments(chatbotId);
      } catch (err) {
        console.warn("Gagal hapus dokumen lama dari DB:", err.message);
        // Tetap lanjut reset meskipun gagal hapus
      }
    }

    // 2. Reset ID dan state
    resetChatbotId();
    setDocs([]);
    setActiveDocId(null);
    setMessages([{ id: "welcome", role: "bot", text: "Asisten direset. ✅ Semua dokumen lama telah dihapus. Upload dokumen baru untuk memulai.", timestamp: new Date() }]);
    toast.success("Asisten AI direset. Semua dokumen lama dihapus.");

    // 3. Buat chatbot baru
    try {
      const newId = await getOrCreateChatbotId();
      setChatbotId(newId);
    } catch (err) {
      console.error("Gagal buat chatbot baru:", err);
    }
  }, [chatbotId]);

  const activeDoc = docs.find(d => d.id === activeDocId);
  const hasSuccessDocs = docs.some(d => d.status === "success");
  const hasBotMessages = messages.some(m => m.role === "bot" && m.id !== "welcome");

  return (
    <DashboardLayout activeMenu="AI Asisten">
      <style>{`
        @keyframes typing-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes zoom-in-95 { from { transform: scale(0.95); } to { transform: scale(1); } }
        .animate-in { animation: fade-in 0.15s ease, zoom-in-95 0.15s ease; }
      `}</style>

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        className="flex flex-col h-[calc(100vh-110px)] relative"
      >

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00C47C] to-[#0B8457] flex items-center justify-center shadow-lg shadow-[#00C47C]/20">
              <Brain size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">AI Asisten</h1>
              <p className="text-sm text-gray-500 mt-0.5">Upload dokumen · Analisis AI · Unduh hasil (.md / .txt)</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
              isInitializing ? "bg-amber-50 border-amber-200 text-amber-700"
              : isBackendOnline ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isInitializing ? "bg-amber-400 animate-pulse"
                : isBackendOnline ? "bg-emerald-500" : "bg-red-500"
              }`} />
              {isInitializing ? "Menghubungkan..." : isBackendOnline ? "AI Aktif" : "Server Mati"}
            </div>

            {/* Ekspor seluruh chat */}
            <ExportChatButton messages={messages} activeDocName={activeDoc?.name} />

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>

        {/* ── OFFLINE BANNER ── */}
        {isBackendOnline === false && !isInitializing && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl flex-shrink-0">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">Server AI tidak tersedia</p>
              <p className="text-xs text-red-600 mt-0.5">
                Jalankan: <code className="bg-red-100 px-1 rounded">uvicorn main:app --host 0.0.0.0 --port 8080 --reload</code>
              </p>
            </div>
          </div>
        )}

        {/* ── MAIN ── */}
        <div className="flex gap-5 flex-1 min-h-0">

          {/* ══ LEFT: Upload + Docs ══ */}
          <div className="w-72 flex-shrink-0 flex flex-col gap-4">

            {/* Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-150 ${
                isDragging
                  ? "border-[#00C47C] bg-[#00C47C]/5 scale-[0.98]"
                  : "border-gray-200 bg-white hover:border-[#00C47C]/60 hover:bg-green-50/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc"
                multiple
                onChange={e => { handleUploadFiles(e.target.files); e.target.value = ""; }}
              />
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-[#00C47C]/15" : "bg-gray-50"}`}>
                {isUploading
                  ? <Loader2 size={22} className="text-[#00C47C] animate-spin" />
                  : <FileUp size={22} className={isDragging ? "text-[#00C47C]" : "text-gray-400"} />
                }
              </div>
              <div className="text-center">
                <p className={`text-sm font-semibold ${isDragging ? "text-[#00C47C]" : "text-gray-700"}`}>
                  {isUploading ? "Mengupload..." : isDragging ? "Lepaskan file" : "Upload Dokumen"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">PDF, DOCX, DOC &bull; Maks. 20MB</p>
              </div>
              {isDragging && <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-[#00C47C] animate-pulse" />}
            </div>

            {/* Doc List */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm min-h-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-gray-500" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Dokumen</span>
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{docs.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {docs.length === 0 ? (
                  <div className="py-8 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                      <FilePlus size={22} className="text-gray-300" />
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-[160px]">
                      Belum ada dokumen. Upload PDF/DOCX untuk memulai.
                    </p>
                  </div>
                ) : (
                  docs.map(doc => (
                    <DocCard
                      key={doc.id}
                      doc={doc}
                      isActive={activeDocId === doc.id}
                      onSelect={() => setActiveDocId(id => id === doc.id ? null : doc.id)}
                      onDelete={handleDeleteDoc}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-[#0B241A] to-[#163629] rounded-2xl p-4 text-white flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-[#00C47C]" />
                <span className="text-xs font-bold text-[#00C47C] uppercase tracking-wide">Tips</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Setelah AI menjawab, <strong className="text-white/90">hover pada balon pesan</strong> → klik tombol <strong className="text-white/90">Unduh</strong> untuk simpan sebagai <code className="bg-white/10 px-1 rounded">.md</code> atau <code className="bg-white/10 px-1 rounded">.txt</code>.
              </p>
            </div>
          </div>

          {/* ══ RIGHT: Chat ══ */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-0">

            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00C47C] to-[#0B8457] flex items-center justify-center shadow-sm">
                <MessageSquare size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">Tanya AI</p>
                {activeDoc ? (
                  <p className="text-xs text-[#00C47C] truncate mt-0.5 font-medium">📄 {activeDoc.name}</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">Pilih dokumen atau tanya langsung</p>
                )}
              </div>
              {chatbotId && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  GPT-4o Mini
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar">
              {/* Hint: multiple docs uploaded but no active doc selected */}
              {docs.filter(d => d.status === "success").length > 1 && !activeDocId && (
                <div className="mb-4 flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-700">
                  <span className="text-base leading-none mt-0.5">💡</span>
                  <span>
                    Anda memiliki <strong>{docs.filter(d => d.status === "success").length} dokumen</strong> yang sudah diupload.
                    Klik salah satu dokumen di panel kiri untuk menjadikannya <strong>dokumen aktif</strong>,
                    sehingga AI menjawab berdasarkan dokumen tersebut secara spesifik.
                  </span>
                </div>
              )}
              {/* Active doc badge */}
              {activeDocId && activeDoc && (
                <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                  <CheckCircle2 size={13} className="flex-shrink-0 text-emerald-500" />
                  <span>AI akan menjawab berdasarkan dokumen: <strong>{activeDoc.name}</strong></span>
                </div>
              )}
              {messages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  activeDocName={activeDoc?.name}
                />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts — muncul hanya jika ada dokumen dan belum banyak chat */}
            {hasSuccessDocs && messages.length <= 3 && (
              <div className="px-5 pb-3 flex-shrink-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Analisis Cepat</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map(({ icon: Icon, label, prompt, color }) => (
                    <button
                      key={label}
                      onClick={() => handleSend(prompt)}
                      disabled={isLoading || !chatbotId}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={e => {
                      setInputValue(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      !isBackendOnline ? "Server tidak tersedia..."
                      : isInitializing ? "Menginisialisasi AI..."
                      : hasSuccessDocs
                        ? `Tanya seputar "${activeDoc?.name || "dokumen yang diupload"}"...`
                        : "Tanya seputar aplikasi Desa Hutan..."
                    }
                    disabled={!isBackendOnline || isInitializing}
                    rows={1}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#00C47C]/20 focus:border-[#00C47C] transition-all placeholder-gray-400 custom-scrollbar"
                    style={{ minHeight: "46px", maxHeight: "120px" }}
                  />
                </div>
                <button
                  id="ai-asisten-send-btn"
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isLoading || !chatbotId || !isBackendOnline}
                  className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#00C47C] to-[#0B8457] text-white shadow-md shadow-[#00C47C]/30 hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-300 mt-2">
                Hover pada jawaban AI untuk melihat tombol Unduh (.md / .txt)
              </p>
            </div>
          </div>
        </div>

        {/* Full-screen Drag and Drop Overlay */}
        {isDragging && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleUploadFiles(e.dataTransfer.files);
              }
            }}
            className="absolute inset-0 bg-[#0B241A]/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center border-4 border-dashed border-[#00C47C] rounded-2xl m-2 transition-all duration-300 animate-in fade-in"
          >
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center border border-gray-100 scale-95 animate-in zoom-in-95 duration-200 pointer-events-none">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C47C] to-[#0B8457] flex items-center justify-center shadow-lg shadow-[#00C47C]/30 mb-5 animate-bounce">
                <FileUp size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Lepaskan Dokumen Anda</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Jatuhkan file di mana saja untuk mengunggah dokumen Anda ke AI Asisten.
              </p>
              <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-[10px] font-bold text-[#00C47C]">
                PDF, DOCX, DOC &bull; Maks. 20 MB
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
