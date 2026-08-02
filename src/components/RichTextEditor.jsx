import React, { useRef, useEffect, useCallback } from "react";
import { Bold, Italic, List, ListOrdered, Subscript, Superscript } from "lucide-react";

const escapeHtml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Ubah array value (paragraph objects [{ listType, runs }] atau flat runs) jadi HTML untuk contentEditable.
const runsToHtml = (value) => {
  if (!value) return "";

  if (Array.isArray(value) && value.length > 0) {
    const isParagraphArray = value.some(
      (item) => item && typeof item === "object" && Array.isArray(item.runs)
    );

    if (isParagraphArray) {
      let html = "";
      value.forEach((para) => {
        const runs = Array.isArray(para?.runs) ? para.runs : [];
        const inner = runs
          .map((run) => {
            if (run.text === "\n") return "<br>";
            let h = escapeHtml(run.text).replace(/\n/g, "<br>");
            if (run.bold) h = `<b>${h}</b>`;
            if (run.italic) h = `<i>${h}</i>`;
            if (run.subscript) h = `<sub>${h}</sub>`;
            if (run.superscript) h = `<sup>${h}</sup>`;
            return h;
          })
          .join("");

        if (para.listType === "numbered") {
          html += `<ol><li>${inner}</li></ol>`;
        } else if (para.listType === "bullet") {
          html += `<ul><li>${inner}</li></ul>`;
        } else {
          html += `<div>${inner}</div>`;
        }
      });
      return html;
    }

    // Legacy flat array of runs
    return value
      .map((run) => {
        if (run.text === "\n") return "<br>";
        let h = escapeHtml(run.text).replace(/\n/g, "<br>");
        if (run.bold) h = `<b>${h}</b>`;
        if (run.italic) h = `<i>${h}</i>`;
        if (run.subscript) h = `<sub>${h}</sub>`;
        if (run.superscript) h = `<sup>${h}</sup>`;
        return h;
      })
      .join("");
  }

  if (typeof value === "string") return escapeHtml(value);
  return "";
};

const BOLD_TAGS = new Set(["B", "STRONG"]);
const ITALIC_TAGS = new Set(["I", "EM"]);
const SUB_TAGS = new Set(["SUB"]);
const SUP_TAGS = new Set(["SUP"]);
const BLOCK_TAGS = new Set(["DIV", "P", "LI"]);

const walkNodes = (node, state, runs) => {
  node.childNodes.forEach((child, idx) => {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.textContent) {
        runs.push({
          text: child.textContent,
          bold: state.bold,
          italic: state.italic,
          subscript: state.subscript,
          superscript: state.superscript,
        });
      }
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;

    if (child.tagName === "BR") {
      runs.push({ text: "\n", bold: false, italic: false, subscript: false, superscript: false });
      return;
    }
    if (BLOCK_TAGS.has(child.tagName) && idx > 0 && child.tagName !== "LI") {
      runs.push({ text: "\n", bold: false, italic: false, subscript: false, superscript: false });
    }
    const nextState = {
      bold:
        state.bold ||
        BOLD_TAGS.has(child.tagName) ||
        child.style?.fontWeight === "bold",
      italic:
        state.italic ||
        ITALIC_TAGS.has(child.tagName) ||
        child.style?.fontStyle === "italic",
      subscript:
        state.subscript ||
        SUB_TAGS.has(child.tagName) ||
        child.style?.verticalAlign === "sub",
      superscript:
        state.superscript ||
        SUP_TAGS.has(child.tagName) ||
        child.style?.verticalAlign === "super",
    };
    walkNodes(child, nextState, runs);
  });
};

const htmlToParagraphs = (el) => {
  if (!el) return [];
  const paragraphs = [];

  const processBlock = (node, listType = null) => {
    const runs = [];
    walkNodes(node, { bold: false, italic: false, subscript: false, superscript: false }, runs);
    const validRuns = runs.filter((r) => r.text !== "");
    if (validRuns.length > 0) {
      paragraphs.push({
        listType: listType,
        runs: validRuns.map((r) => ({
          bold: !!r.bold,
          size: r.size || null,
          text: r.text,
          color: r.color || null,
          italic: !!r.italic,
          strike: !!r.strike,
          subscript: !!r.subscript,
          underline: !!r.underline,
          superscript: !!r.superscript,
        })),
      });
    }
  };

  const children = Array.from(el.childNodes);
  if (children.length === 0) return [];

  children.forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = child.tagName;
      if (tag === "OL") {
        Array.from(child.children).forEach((li) => {
          processBlock(li, "numbered");
        });
      } else if (tag === "UL") {
        Array.from(child.children).forEach((li) => {
          processBlock(li, "bullet");
        });
      } else if (tag === "LI") {
        const parentTag = child.parentElement?.tagName;
        const listType =
          parentTag === "OL" ? "numbered" : parentTag === "UL" ? "bullet" : null;
        processBlock(child, listType);
      } else {
        processBlock(child, null);
      }
    } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
      processBlock(child, null);
    }
  });

  return paragraphs;
};

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Tulis keterangan di sini...",
  minHeight = 140,
}) => {
  const editorRef = useRef(null);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current || isFocusedRef.current) return;
    editorRef.current.innerHTML = runsToHtml(value);
  }, [value]);

  const emitChange = useCallback(() => {
    if (!editorRef.current) return;
    onChange(htmlToParagraphs(editorRef.current));
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
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat("subscript")}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Subscript (Indeks Bawah)"
        >
          <Subscript size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat("superscript")}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Superscript (Indeks Atas)"
        >
          <Superscript size={14} />
        </button>
        <div className="w-px h-4 bg-slate-200 mx-1" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat("insertUnorderedList")}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Bullet List"
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat("insertOrderedList")}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered size={14} />
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
