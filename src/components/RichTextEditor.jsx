import React, { useRef, useEffect, useCallback } from "react";
import { Bold, Italic } from "lucide-react";

const escapeHtml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Ubah array runs ({text, bold, italic}) jadi HTML aman untuk mengisi contentEditable.
const runsToHtml = (runs) => {
  if (!Array.isArray(runs) || runs.length === 0) return "";
  return runs
    .map((run) => {
      if (run.text === "\n") return "<br>";
      let html = escapeHtml(run.text).replace(/\n/g, "<br>");
      if (run.bold) html = `<b>${html}</b>`;
      if (run.italic) html = `<i>${html}</i>`;
      return html;
    })
    .join("");
};

const BOLD_TAGS = new Set(["B", "STRONG"]);
const ITALIC_TAGS = new Set(["I", "EM"]);
const BLOCK_TAGS = new Set(["DIV", "P"]);

const walkNodes = (node, state, runs) => {
  node.childNodes.forEach((child, idx) => {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.textContent) {
        runs.push({ text: child.textContent, bold: state.bold, italic: state.italic });
      }
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;

    if (child.tagName === "BR") {
      runs.push({ text: "\n", bold: false, italic: false });
      return;
    }
    // Browser membungkus baris baru (Enter) dalam <div>/<p> baru — anggap sebagai line break.
    if (BLOCK_TAGS.has(child.tagName) && idx > 0) {
      runs.push({ text: "\n", bold: false, italic: false });
    }
    const nextState = {
      bold: state.bold || BOLD_TAGS.has(child.tagName) || child.style?.fontWeight === "bold",
      italic: state.italic || ITALIC_TAGS.has(child.tagName) || child.style?.fontStyle === "italic",
    };
    walkNodes(child, nextState, runs);
  });
};

// Baca ulang isi contentEditable jadi array runs ({text, bold, italic}).
const htmlToRuns = (el) => {
  const runs = [];
  walkNodes(el, { bold: false, italic: false }, runs);
  return runs.filter((run) => run.text !== "");
};

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Tulis keterangan di sini...",
  minHeight = 140,
}) => {
  const editorRef = useRef(null);
  const isFocusedRef = useRef(false);

  // Hydrate value eksternal ke dalam elemen, tapi jangan timpa saat user sedang mengetik
  // (menghindari kursor melompat setiap render ulang).
  useEffect(() => {
    if (!editorRef.current || isFocusedRef.current) return;
    editorRef.current.innerHTML = runsToHtml(value);
  }, [value]);

  const emitChange = useCallback(() => {
    if (!editorRef.current) return;
    onChange(htmlToRuns(editorRef.current));
  }, [onChange]);

  const applyFormat = (command) => {
    editorRef.current?.focus();
    document.execCommand(command, false, null);
    emitChange();
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-slate-100 bg-slate-50/60">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat("bold")}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Tebal (Ctrl+B)"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat("italic")}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Miring (Ctrl+I)"
        >
          <Italic size={14} />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
        }}
        onInput={emitChange}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="w-full px-3.5 py-3 text-sm text-slate-700 leading-relaxed focus:outline-none rich-text-editable"
      />
    </div>
  );
};

export default RichTextEditor;
