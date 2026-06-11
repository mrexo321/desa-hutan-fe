import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  getOrCreateChatbotId,
  sendMessage,
  checkChatbotHealth,
  getPageContext,
  getSuggestedQuestions,
} from "../services/chatbotService";

// ─────────────────────────────────────────
// PESAN SAMBUTAN
// ─────────────────────────────────────────
const buildWelcomeMessage = (pathname) => {
  const pageHints = {
    "/dashboard": "Saya bisa membantu Anda memahami peta, status IDM desa, atau cara menggunakan fitur visualisasi. 🗺️",
    "/dashboard/performa-desa": "Saya siap membantu Anda dengan proses upload/download template, penggunaan formula, atau interpretasi data performa. 📊",
    "/dashboard/desa-psn": "Saya bisa menjelaskan apa itu PSN, cara import data, atau cara filter desa. 📋",
    "/dashboard/indikator": "Saya bisa memandu Anda membuat formula baru, mengelola indikator, atau menambah tahun perhitungan. 🎯",
    "/dashboard/klasifikasi": "Saya siap membantu Anda memahami klasifikasi hutan dan desa. 🌿",
    "/dashboard/manajemen-user": "Saya bisa membantu Anda mengelola user dan role. 👥",
    "/dashboard/site-settings": "Saya siap membantu Anda mengubah tampilan dan konten landing page. ⚙️",
  };

  const hint = pageHints[pathname] || "Saya siap membantu pertanyaan seputar fitur, data, dan cara penggunaan aplikasi ini. 🌿";

  return {
    id: "welcome",
    role: "bot",
    text: `Halo! 👋 Saya **Asisten AI Desa Hutan** — asisten cerdas yang memahami seluruh fitur aplikasi ini.\n\n${hint}\n\nSilakan tanyakan apa saja!`,
    timestamp: new Date(),
  };
};

// ─────────────────────────────────────────
// KOMPONEN: Bubble Pesan
// ─────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isBot = msg.role === "bot";
  const isError = msg.role === "error";

  const formatText = (text) => {
    // Proses teks: bold (**text**), baris baru, bullet points
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      // Bold processing
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const processedLine = parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <React.Fragment key={lineIdx}>
          {lineIdx > 0 && <br />}
          {processedLine}
        </React.Fragment>
      );
    });
  };

  if (isError) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "12px" }}>
        <div style={{
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "0 16px 16px 16px",
          padding: "10px 14px",
          maxWidth: "85%",
          fontSize: "13px",
          color: "#ef4444",
          lineHeight: "1.5",
        }}>
          ⚠️ {formatText(msg.text)}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: isBot ? "flex-start" : "flex-end",
      marginBottom: "12px",
      alignItems: "flex-end",
      gap: "8px",
    }}>
      {isBot && (
        <div style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00C47C, #0B8457)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "13px",
        }}>🌿</div>
      )}

      <div style={{
        maxWidth: "82%",
        padding: "10px 14px",
        borderRadius: isBot ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
        background: isBot
          ? "rgba(255,255,255,0.08)"
          : "linear-gradient(135deg, #00C47C, #0B8457)",
        border: isBot ? "1px solid rgba(255,255,255,0.12)" : "none",
        color: "white",
        fontSize: "13.5px",
        lineHeight: "1.7",
        wordBreak: "break-word",
        backdropFilter: isBot ? "blur(4px)" : "none",
      }}>
        {formatText(msg.text)}
        <div style={{
          fontSize: "10px",
          opacity: 0.45,
          marginTop: "5px",
          textAlign: isBot ? "left" : "right",
        }}>
          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// KOMPONEN: Typing Indicator
// ─────────────────────────────────────────
const TypingIndicator = () => (
  <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "12px", alignItems: "flex-end", gap: "8px" }}>
    <div style={{
      width: "28px", height: "28px", borderRadius: "50%",
      background: "linear-gradient(135deg, #00C47C, #0B8457)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, fontSize: "13px",
    }}>🌿</div>
    <div style={{
      padding: "12px 16px",
      borderRadius: "4px 16px 16px 16px",
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.12)",
      display: "flex", gap: "4px", alignItems: "center",
    }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: "6px", height: "6px",
          borderRadius: "50%",
          background: "#00C47C",
          animation: `chatbot-bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────
// KOMPONEN: Page Context Badge
// ─────────────────────────────────────────
const PageContextBadge = ({ pageLabel }) => {
  if (!pageLabel) return null;
  // Extract short name (before " —")
  const shortName = pageLabel.split(" —")[0].replace("Halaman ", "").split(" | ")[0];
  if (shortName.length > 30) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "5px",
      padding: "3px 8px",
      borderRadius: "20px",
      background: "rgba(0,196,124,0.08)",
      border: "1px solid rgba(0,196,124,0.15)",
      fontSize: "10px",
      color: "#00C47C",
      maxWidth: "160px",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
        <circle cx="4" cy="4" r="3" />
      </svg>
      {shortName}
    </div>
  );
};

// ─────────────────────────────────────────
// MAIN COMPONENT: ChatWidget
// ─────────────────────────────────────────
const ChatWidget = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // PENTING: Semua hooks harus dipanggil sebelum conditional return
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [buildWelcomeMessage(pathname)]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatbotId, setChatbotId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [pulseActive, setPulseActive] = useState(true);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);

  // Sembunyikan floating widget di halaman AI Asisten
  const isHidden = pathname === "/dashboard/ai-asisten";

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Update suggested questions saat halaman berubah
  useEffect(() => {
    setCurrentSuggestions(getSuggestedQuestions(pathname));
  }, [pathname]);

  // Auto-scroll ke bawah
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Fokus input saat dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasNewMessage(false);
    }
  }, [isOpen]);

  // Pulse setiap 6 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 1200);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Initialize chatbot saat widget dibuka
  useEffect(() => {
    if (!isOpen || chatbotId || isInitializing) return;

    const init = async () => {
      setIsInitializing(true);
      try {
        const healthy = await checkChatbotHealth();
        if (!healthy) {
          setIsOffline(true);
          setIsInitializing(false);
          return;
        }
        const id = await getOrCreateChatbotId();
        setChatbotId(id);
        setIsOffline(false);
      } catch (err) {
        console.error("Chatbot init error:", err);
        setIsOffline(true);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [isOpen, chatbotId, isInitializing]);

  // Kirim pesan
  const handleSend = async (customMessage = null) => {
    const text = customMessage || inputValue.trim();
    if (!text || isLoading || !chatbotId) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    // Bangun chat_history (pairs [user, bot])
    const history = messages
      .filter((m) => m.id !== "welcome" && (m.role === "user" || m.role === "bot"))
      .reduce((acc, msg, idx, arr) => {
        if (msg.role === "user" && arr[idx + 1]?.role === "bot") {
          acc.push([msg.text, arr[idx + 1].text]);
        }
        return acc;
      }, []);

    // Dapatkan konteks halaman
    const pageCtx = getPageContext(pathname);

    try {
      const result = await sendMessage(chatbotId, text, history, pageCtx);
      const botMsg = {
        id: Date.now() + 1,
        role: "bot",
        text: result.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen) setHasNewMessage(true);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "error",
        text: err.message || "Gagal terhubung ke server. Pastikan backend chatbot sedang berjalan di localhost:8080.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Dapatkan label halaman untuk tampilan
  const pageLabel = getPageContext(pathname);
  const isAtWelcome = messages.length === 1 && messages[0].id === "welcome";

  // Sembunyikan widget di halaman AI Asisten
  if (isHidden) return null;

  return (
    <>
      {/* ── CSS ANIMATIONS ── */}
      <style>{`
        @keyframes chatbot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes chatbot-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatbot-pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes chatbot-badge-pop {
          0% { transform: scale(0); } 60% { transform: scale(1.3); } 100% { transform: scale(1); }
        }
        .chatbot-panel { animation: chatbot-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .chatbot-scrollbar::-webkit-scrollbar { width: 4px; }
        .chatbot-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chatbot-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,196,124,0.3); border-radius: 10px; }
        .chatbot-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,196,124,0.6); }
        .chatbot-input:focus { outline: none; border-color: rgba(0,196,124,0.5) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── FLOATING BUTTON ── */}
      <div style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "10px",
      }}>
        {/* Tooltip */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            style={{
              background: "rgba(11,36,26,0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(0,196,124,0.3)",
              color: "white",
              padding: "8px 14px",
              borderRadius: "12px",
              fontSize: "12.5px",
              fontWeight: "500",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              animation: "chatbot-slide-up 0.4s ease",
              cursor: "pointer",
            }}
          >
            💬 Tanya Asisten Desa Hutan
          </div>
        )}

        <div style={{ position: "relative" }}>
          {/* Pulse ring */}
          {pulseActive && !isOpen && (
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "2px solid #00C47C",
              animation: "chatbot-pulse-ring 1.2s ease-out forwards",
            }} />
          )}

          {/* Notif badge */}
          {hasNewMessage && !isOpen && (
            <div style={{
              position: "absolute", top: "-4px", right: "-4px",
              width: "18px", height: "18px", borderRadius: "50%",
              background: "#ef4444", border: "2px solid white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", color: "white", fontWeight: "bold",
              animation: "chatbot-badge-pop 0.3s ease", zIndex: 1,
            }}>!</div>
          )}

          {/* Main FAB */}
          <button
            id="chatbot-fab-btn"
            onClick={() => setIsOpen((p) => !p)}
            title={isOpen ? "Tutup Chat" : "Buka Asisten AI Desa Hutan"}
            style={{
              width: "58px", height: "58px", borderRadius: "50%",
              background: isOpen
                ? "linear-gradient(135deg, #0B241A, #1a3d2b)"
                : "linear-gradient(135deg, #00C47C, #0B8457)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: isOpen
                ? "0 8px 32px rgba(0,0,0,0.4)"
                : "0 8px 32px rgba(0,196,124,0.4)",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {isOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="9" y1="10" x2="15" y2="10" /><line x1="9" y1="14" x2="13" y2="14" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── CHAT PANEL ── */}
      {isOpen && (
        <div className="chatbot-panel" style={{
          position: "fixed",
          bottom: "100px",
          right: "28px",
          width: "375px",
          maxWidth: "calc(100vw - 40px)",
          height: "540px",
          maxHeight: "calc(100vh - 130px)",
          borderRadius: "20px",
          background: "rgba(11, 36, 26, 0.94)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(0, 196, 124, 0.2)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 9998,
          fontFamily: "inherit",
        }}>

          {/* ── HEADER ── */}
          <div style={{
            padding: "14px 18px",
            background: "linear-gradient(135deg, rgba(0,196,124,0.12), rgba(11,132,87,0.08))",
            borderBottom: "1px solid rgba(0,196,124,0.12)",
            display: "flex",
            alignItems: "center",
            gap: "11px",
            flexShrink: 0,
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "linear-gradient(135deg, #00C47C, #0B8457)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", flexShrink: 0,
              boxShadow: "0 4px 12px rgba(0,196,124,0.3)",
            }}>🌿</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "white", fontWeight: "700", fontSize: "14px" }}>
                Asisten Desa Hutan
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: isOffline ? "#ef4444" : isInitializing ? "#f59e0b" : "#00C47C",
                    boxShadow: isOffline ? "none" : "0 0 5px #00C47C",
                  }} />
                  <span style={{ fontSize: "10.5px", color: isOffline ? "#ef4444" : "#6D9B87" }}>
                    {isOffline ? "Tidak tersedia" : isInitializing ? "Menghubungkan..." : "Online"}
                  </span>
                </div>
                <PageContextBadge pageLabel={pageLabel} />
              </div>
            </div>

            <div style={{
              padding: "3px 8px", borderRadius: "8px",
              background: "rgba(0,196,124,0.1)",
              border: "1px solid rgba(0,196,124,0.2)",
              fontSize: "9.5px", color: "#00C47C",
              fontWeight: "700", letterSpacing: "0.5px", flexShrink: 0,
            }}>
              GPT AI
            </div>
          </div>

          {/* ── MESSAGES AREA ── */}
          <div className="chatbot-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {/* Offline Banner */}
            {isOffline && (
              <div style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "12px", padding: "12px",
                marginBottom: "12px", fontSize: "12.5px",
                color: "#fca5a5", textAlign: "center", lineHeight: "1.5",
              }}>
                ⚠️ Backend chatbot tidak tersedia.<br />
                Pastikan server berjalan di{" "}
                <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 4px", borderRadius: "4px" }}>
                  localhost:8080
                </code>
              </div>
            )}

            {/* Initializing */}
            {isInitializing && (
              <div style={{
                textAlign: "center", color: "#6D9B87",
                fontSize: "13px", padding: "20px",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "10px",
              }}>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: "#00C47C",
                      animation: `chatbot-bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
                <span>Menginisialisasi asisten...</span>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Typing */}
            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* ── SUGGESTED QUESTIONS (dinamis per halaman) ── */}
          {isAtWelcome && !isInitializing && !isOffline && currentSuggestions.length > 0 && (
            <div style={{
              padding: "4px 14px 10px",
              flexShrink: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}>
              {currentSuggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "20px",
                    background: "rgba(0,196,124,0.1)",
                    border: "1px solid rgba(0,196,124,0.25)",
                    color: "#00C47C",
                    fontSize: "11px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,196,124,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,196,124,0.1)"; }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* ── INPUT AREA ── */}
          <div style={{
            padding: "10px 14px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            display: "flex",
            gap: "8px",
            alignItems: "flex-end",
            flexShrink: 0,
          }}>
            <textarea
              ref={inputRef}
              className="chatbot-input chatbot-scrollbar"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                isOffline ? "Server tidak tersedia..." :
                isInitializing ? "Menghubungkan..." :
                "Tanyakan seputar aplikasi Desa Hutan..."
              }
              disabled={isOffline || isInitializing}
              rows={1}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "10px 14px",
                color: "white",
                fontSize: "13px",
                resize: "none",
                fontFamily: "inherit",
                lineHeight: "1.5",
                minHeight: "42px",
                maxHeight: "100px",
                transition: "border-color 0.2s",
              }}
            />

            <button
              id="chatbot-send-btn"
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading || !chatbotId || isOffline}
              style={{
                width: "42px", height: "42px", borderRadius: "12px",
                background: !inputValue.trim() || isLoading || !chatbotId || isOffline
                  ? "rgba(255,255,255,0.06)"
                  : "linear-gradient(135deg, #00C47C, #0B8457)",
                border: "none",
                cursor: !inputValue.trim() || isLoading || !chatbotId || isOffline ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
                boxShadow: !inputValue.trim() || isLoading || !chatbotId || isOffline
                  ? "none" : "0 4px 12px rgba(0,196,124,0.3)",
              }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {isLoading ? (
                <div style={{
                  width: "16px", height: "16px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>

          {/* ── FOOTER ── */}
          <div style={{
            padding: "5px 16px 9px",
            textAlign: "center",
            fontSize: "10px",
            color: "rgba(109,155,135,0.55)",
            flexShrink: 0,
          }}>
            Asisten AI khusus Sistem Informasi Desa Hutan 🌿
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
