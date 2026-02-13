/**
 * BD_MEO: Form Builder (Simplified)
 */
import { useEffect, useRef, useState } from "react";
import {
  Trash2,
  GripVertical,
  Eye,
  Save,
  Send,
  FileText,
  Upload,
  Image as ImageIcon,
  X,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
} from "lucide-react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import type { FormField, FormFieldType, Form } from "../../../lib/leadManagementTypes";
import { campaignsService } from "../services/campaignsService";
import { FormRenderer } from "./FormRenderer";

interface FormBuilderProps {
  campaignId: string;
  campaignName: string;
  formId?: string; // Optional: for editing existing form
  onBack: () => void;
  onSave: (form: Partial<Form>) => Promise<void> | void;
}

// Core fields (locked, cannot be deleted)
const CORE_FIELDS: FormField[] = [
  {
    id: "core1",
    type: "SHORT_TEXT",
    label: "Nama Perusahaan / Client",
    required: true,
    isCore: true,
    placeholder: "PT ABC Indonesia",
  },
  {
    id: "core2",
    type: "SHORT_TEXT",
    label: "Nama PIC",
    required: true,
    isCore: true,
    placeholder: "John Doe",
  },
  {
    id: "core3",
    type: "SHORT_TEXT",
    label: "Email",
    required: true,
    isCore: true,
    placeholder: "john@company.com",
  },
  {
    id: "core4",
    type: "SHORT_TEXT",
    label: "Nomor Telepon / WhatsApp",
    required: true,
    isCore: true,
    placeholder: "+62 812-3456-7890",
  },
];

// NOTE: Categories are used to build the <input accept="..."> on public form.
const FILE_UPLOAD_CATEGORIES: Array<{ key: string; label: string; hint: string }> = [
  { key: "DOCUMENT", label: "Dokumen", hint: "pdf, doc/docx, xls/xlsx, ppt/pptx, txt" },
  { key: "IMAGE", label: "Gambar", hint: "jpg, jpeg, png, gif, webp" },
  { key: "VIDEO", label: "Video", hint: "mp4, mov, avi, mkv, webm" },
  { key: "AUDIO", label: "Audio", hint: "mp3, wav, m4a, aac, ogg" },
  { key: "ARCHIVE", label: "Arsip", hint: "zip, rar, 7z" },
  { key: "ANY", label: "Bebas (semua tipe)", hint: "tanpa pembatasan tipe file" },
];

interface SortableFieldProps {
  field: FormField;
  selectedField: FormField | null;
  onSelectField: (field: FormField) => void;
  onDeleteField: (fieldId: string) => void;
}

function SortableField({ field, selectedField, onSelectField, onDeleteField }: SortableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    disabled: field.isCore, // Core fields cannot be dragged
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const escapeInlineHtml = (s: string) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // Local renderer for marker formatting in notes preview (HTML string)
  const markersToInlineHtml = (text: string): string => {
    const lines = String(text ?? "").split(/\r?\n/);

    const startsWithAt = (s: string, idx: number, pat: string) => s.slice(idx, idx + pat.length) === pat;

    const renderInline = (line: string): string => {
      const input = String(line ?? "");

      const findClosing = (s: string, from: number, marker: string) => s.indexOf(marker, from);
      const findItalicClosing = (s: string, from: number) => {
        for (let k = from; k < s.length; k++) {
          if (s[k] !== "*") continue;
          const p = k > 0 ? s[k - 1] : "";
          const n = k + 1 < s.length ? s[k + 1] : "";
          if (p !== "*" && n !== "*") return k;
        }
        return -1;
      };

      let i = 0;
      let out = "";

      while (i < input.length) {
        if (startsWithAt(input, i, "__")) {
          const close = findClosing(input, i + 2, "__");
          if (close !== -1) {
            out += `<u>${renderInline(input.slice(i + 2, close))}</u>`;
            i = close + 2;
            continue;
          }
        }

        if (startsWithAt(input, i, "***")) {
          const close = findClosing(input, i + 3, "***");
          if (close !== -1) {
            out += `<strong><em>${renderInline(input.slice(i + 3, close))}</em></strong>`;
            i = close + 3;
            continue;
          }
        }

        if (startsWithAt(input, i, "**")) {
          const close = findClosing(input, i + 2, "**");
          if (close !== -1) {
            out += `<strong>${renderInline(input.slice(i + 2, close))}</strong>`;
            i = close + 2;
            continue;
          }
        }

        if (input[i] === "*") {
          const prev = i > 0 ? input[i - 1] : "";
          const next = i + 1 < input.length ? input[i + 1] : "";
          const isSingle = prev !== "*" && next !== "*";

          if (isSingle) {
            const close = findItalicClosing(input, i + 1);
            if (close !== -1) {
              out += `<em>${renderInline(input.slice(i + 1, close))}</em>`;
              i = close + 1;
              continue;
            }
          }
        }

        out += escapeInlineHtml(input[i]);
        i++;
      }

      return out;
    };

    return lines.map((l) => `${renderInline(l)}<br/>`).join("");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelectField(field)}
      className={`bg-white rounded-lg border-2 p-4 transition-all ${
        selectedField?.id === field.id ? "border-blue-500 shadow-sm" : "border-gray-200 hover:border-gray-300"
      } ${field.isCore ? "bg-blue-50/30" : ""} cursor-pointer`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={`mt-1 ${
            field.isCore
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600"
          }`}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-medium text-gray-900">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {field.type}
                {field.isCore && (
                  <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">CORE</span>
                )}
              </div>
            </div>

            {!field.isCore && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteField(field.id);
                }}
                className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Field Preview */}
          <div className="text-sm text-gray-600">
            {field.placeholder && <div className="italic">Placeholder: {field.placeholder}</div>}
            {field.options && <div className="mt-1">Options: {field.options.join(", ")}</div>}

            {(field as any).note && (
              <div className="mt-1 text-gray-500 text-xs">
                <span
                  className="whitespace-pre-wrap break-words"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: markersToInlineHtml(String((field as any).note || "")),
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Field item component for drag overlay
function FieldItem({ field }: { field: FormField }) {
  return (
    <div className="bg-white rounded-lg border-2 border-blue-500 p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="text-gray-400 mt-1">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </div>
          <div className="text-xs text-gray-500 mt-1">{field.type}</div>
        </div>
      </div>
    </div>
  );
}

export function FormBuilder({ campaignId, campaignName, formId, onBack }: FormBuilderProps) {
  const [formTitle, setFormTitle] = useState(`Form: ${campaignName}`);
  const [formDescription, setFormDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fields, setFields] = useState<FormField[]>([...CORE_FIELDS]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [loadingForm, setLoadingForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [headerImagePath, setHeaderImagePath] = useState<string | null>(null);
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [pendingHeaderFile, setPendingHeaderFile] = useState<File | null>(null);
  const [pendingHeaderPreviewUrl, setPendingHeaderPreviewUrl] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const richDescRef = useRef<HTMLDivElement | null>(null);

  // Track which editor is active so toolbars don't affect each other
  const activeEditorRef = useRef<"desc" | "note" | null>(null);

  // WYSIWYG description init
  const hasInitRichDescRef = useRef(false);

  const escapeHtml = (s: string) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const slugifyLocal = (input: string): string => {
    const base = String(input || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/\-+/g, "-")
      .replace(/^\-+|\-+$/g, "");
    return base || "form";
  };

  const [publicSlug, setPublicSlug] = useState<string>("");
  const [publicQrUrlFromBackend, setPublicQrUrlFromBackend] = useState<string>("");

  const getEffectivePublicSlug = (title: string, explicitSlug?: string) => {
    const s = String(explicitSlug || "").trim();
    return s ? slugifyLocal(s) : slugifyLocal(title);
  };

  const buildPublicLink = (title: string, explicitSlug?: string) => {
    const slug = getEffectivePublicSlug(title, explicitSlug);
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
    return `${origin}/${slug}`;
  };

  const publicLinkPreview = buildPublicLink(formTitle, publicSlug);
  const publicQrUrl =
    publicQrUrlFromBackend?.trim() ||
    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(publicLinkPreview)}`;

  
  const htmlToMarkers = (html: string): string => {
    const container = document.createElement("div");
    container.innerHTML = html || "";

    type Ctx = { bold: boolean; italic: boolean; underline: boolean };

    const applyCtxDiff = (from: Ctx, to: Ctx): string => {
      let out = "";

      // CLOSE: italic -> bold -> underline
      if (from.italic && !to.italic) out += "*";
      if (from.bold && !to.bold) out += "**";
      if (from.underline && !to.underline) out += "__";

      // OPEN: underline -> bold -> italic
      if (!from.underline && to.underline) out += "__";
      if (!from.bold && to.bold) out += "**";
      if (!from.italic && to.italic) out += "*";

      return out;
    };

    const walkToMarkers = (node: Node, ctx: Ctx): string => {
      if (node.nodeType === Node.TEXT_NODE) return (node as Text).data;
      if (node.nodeType !== Node.ELEMENT_NODE) return "";

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === "br") return "\n";

      if (tag === 'a') {
        const href = (el.getAttribute('href') || '').trim();
        const inner = Array.from(el.childNodes)
          .map((c) => walkToMarkers(c, ctx))
          .join('')
          .trim();
      
        if (!href) return inner;
      
        // Kalau user cuma nulis URL (inner == href), simpan sebagai URL polos
        const normInner = inner.replace(/\/+$/, '');
        const normHref = href.replace(/\/+$/, '');
        if (!inner || normInner === normHref) return href;
      
        // Kalau label beda (misal "Klik di sini"), kamu bisa pilih:
        // 1) simpan href saja:
        // return href;
      
        // 2) atau simpan "label (href)" biar masih kebaca:
        return `${inner} (${href})`;
      }
      

      if (tag === "span") {
        return Array.from(el.childNodes)
          .map((c) => walkToMarkers(c, ctx))
          .join("");
      }

      const nextCtx: Ctx = {
        bold: ctx.bold || tag === "strong" || tag === "b",
        italic: ctx.italic || tag === "em" || tag === "i",
        underline: ctx.underline || tag === "u",
      };

      const isWrapper = tag === "strong" || tag === "b" || tag === "em" || tag === "i" || tag === "u";
      const isBlock = tag === "div" || tag === "p";

      if (isWrapper) {
        const open = applyCtxDiff(ctx, nextCtx);
        const inner = Array.from(el.childNodes)
          .map((c) => walkToMarkers(c, nextCtx))
          .join("");
        const close = applyCtxDiff(nextCtx, ctx);
        return `${open}${inner}${close}`;
      }

      const inner = Array.from(el.childNodes)
        .map((c) => walkToMarkers(c, nextCtx))
        .join("");

      if (isBlock) return `${inner}\n`;
      return inner;
    };

    const baseCtx: Ctx = { bold: false, italic: false, underline: false };
    const raw = Array.from(container.childNodes).map((n) => walkToMarkers(n, baseCtx)).join("");

    return raw.replace(/\n{3,}/g, "\n\n").replace(/\n$/, "");
  };

  /**
   * markers -> HTML (untuk in-editor display, includes linkify + formatting)
   */
  const markersToHtml = (text: string): string => {
    const lines = String(text ?? "").split(/\r?\n/);

    const startsWithAt = (s: string, idx: number, pat: string) => s.slice(idx, idx + pat.length) === pat;

    const isUrlChar = (ch: string) => !!ch && !/\s|[<>]/.test(ch);

    const parseUrlAt = (s: string, idx: number): { href: string; text: string; end: number } | null => {
      const rest = s.slice(idx);
      if (!/^((?:https?:\/\/|www\.)\S+)/i.test(rest)) return null;

      let j = idx;
      while (j < s.length && isUrlChar(s[j])) j++;

      let raw = s.slice(idx, j);
      raw = raw.replace(/[),.;:!?]+$/, "");
      const end = idx + raw.length;

      const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      return { href, text: raw, end };
    };

    const renderInline = (line: string): string => {
      const input = String(line ?? "");

      const findClosing = (s: string, from: number, marker: string) => s.indexOf(marker, from);

      const findItalicClosing = (s: string, from: number) => {
        for (let k = from; k < s.length; k++) {
          if (s[k] !== "*") continue;
          const p = k > 0 ? s[k - 1] : "";
          const n = k + 1 < s.length ? s[k + 1] : "";
          if (p !== "*" && n !== "*") return k;
        }
        return -1;
      };

      const parseMdLinkAt = (s: string, idx: number) => {
        if (s[idx] !== "[") return null;
        const closeText = s.indexOf("]", idx + 1);
        if (closeText === -1) return null;
        if (s[closeText + 1] !== "(") return null;
        const closeHref = s.indexOf(")", closeText + 2);
        if (closeHref === -1) return null;

        const textPart = s.slice(idx + 1, closeText);
        const hrefRaw = s.slice(closeText + 2, closeHref).trim();
        if (!hrefRaw) return null;

        const href = /^https?:\/\//i.test(hrefRaw) ? hrefRaw : `https://${hrefRaw}`;
        return { text: textPart, href, end: closeHref + 1 };
      };

      let i = 0;
      let out = "";

      while (i < input.length) {
        const md = parseMdLinkAt(input, i);
        if (md) {
          const hrefEsc = escapeHtml(md.href);
          const textEsc = escapeHtml(md.text || md.href);
          out += `<a href="${hrefEsc}" target="_blank" rel="noopener noreferrer" style="color:#820000;text-decoration:underline">${textEsc}</a>`;
          i = md.end;
          continue;
        }

        const url = parseUrlAt(input, i);
        if (url) {
          const hrefEsc = escapeHtml(url.href);
          const textEsc = escapeHtml(url.text);
          out += `<a href="${hrefEsc}" target="_blank" rel="noopener noreferrer" style="color:#820000;text-decoration:underline">${textEsc}</a>`;
          i = url.end;
          continue;
        }

        if (startsWithAt(input, i, "***")) {
          const close = findClosing(input, i + 3, "***");
          if (close !== -1) {
            out += `<strong><em>${renderInline(input.slice(i + 3, close))}</em></strong>`;
            i = close + 3;
            continue;
          }
        }

        if (startsWithAt(input, i, "__")) {
          const close = findClosing(input, i + 2, "__");
          if (close !== -1) {
            out += `<u>${renderInline(input.slice(i + 2, close))}</u>`;
            i = close + 2;
            continue;
          }
        }

        if (startsWithAt(input, i, "**")) {
          const close = findClosing(input, i + 2, "**");
          if (close !== -1) {
            out += `<strong>${renderInline(input.slice(i + 2, close))}</strong>`;
            i = close + 2;
            continue;
          }
        }

        if (input[i] === "*") {
          const prev = i > 0 ? input[i - 1] : "";
          const next = i + 1 < input.length ? input[i + 1] : "";
          const isSingle = prev !== "*" && next !== "*";
          if (isSingle) {
            const close = findItalicClosing(input, i + 1);
            if (close !== -1) {
              out += `<em>${renderInline(input.slice(i + 1, close))}</em>`;
              i = close + 1;
              continue;
            }
          }
        }

        out += escapeHtml(input[i]);
        i++;
      }

      return out;
    };

    return lines.map((l) => `${renderInline(l)}<br/>`).join("");
  };

  const setRichDescHtml = (html: string) => {
    const root = richDescRef.current;
    if (!root) return;
    root.innerHTML = html || "";
  };

  const [descFormatState, setDescFormatState] = useState<{ bold: boolean; italic: boolean; underline: boolean }>({
    bold: false,
    italic: false,
    underline: false,
  });

  const [noteFormatState, setNoteFormatState] = useState<{ bold: boolean; italic: boolean; underline: boolean }>({
    bold: false,
    italic: false,
    underline: false,
  });

  const richNoteRef = useRef<HTMLDivElement | null>(null);

  const updateRichFormatStateFromSelection = (root: HTMLDivElement | null) => {
    if (!root) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const anchorNode = sel.anchorNode;
    if (!anchorNode) return;
    if (!root.contains(anchorNode)) return;

    const isActiveTag = (tag: string) => {
      let n: Node | null = anchorNode;
      while (n && n !== root) {
        if (n.nodeType === Node.ELEMENT_NODE) {
          if ((n as HTMLElement).tagName.toLowerCase() === tag) return true;
        }
        n = (n as HTMLElement).parentNode;
      }
      return false;
    };

    setDescFormatState({
      bold: isActiveTag("strong") || isActiveTag("b"),
      italic: isActiveTag("em") || isActiveTag("i"),
      underline: isActiveTag("u"),
    });
  };

  const updateDescFormatStateFromSelection = () => {
    if (activeEditorRef.current !== "desc") return;
    updateRichFormatStateFromSelection(richDescRef.current);
  };

  const applyInlineFormatToSelection = (root: HTMLDivElement | null, tag: "strong" | "em" | "u") => {
    if (!root) return;

    if (document.activeElement !== root) root.focus();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const anchor = sel.anchorNode;
    if (!anchor || !root.contains(anchor)) return;

    const unwrapElement = (el: HTMLElement) => {
      const parent = el.parentNode;
      if (!parent) return;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
    };

    const findClosestTag = (node: Node | null): HTMLElement | null => {
      let n: Node | null = node;
      while (n && n !== root) {
        if (n.nodeType === Node.ELEMENT_NODE) {
          if ((n as HTMLElement).tagName.toLowerCase() === tag) return n as HTMLElement;
        }
        n = (n as HTMLElement).parentNode;
      }
      return null;
    };

    const selectionHasWrapper = () => {
      const startEl = findClosestTag(range.startContainer);
      const endEl = findClosestTag(range.endContainer);
      return startEl || endEl;
    };

    try {
      if (range.collapsed) {
        const existing = findClosestTag(range.startContainer);
        if (existing) {
          const zwsp = document.createTextNode("\u200B");
          existing.parentNode?.insertBefore(zwsp, existing.nextSibling);
          const newRange = document.createRange();
          newRange.setStart(zwsp, 1);
          newRange.setEnd(zwsp, 1);
          sel.removeAllRanges();
          sel.addRange(newRange);
        } else {
          const el = document.createElement(tag);
          el.appendChild(document.createTextNode("\u200B"));
          range.insertNode(el);
          const newRange = document.createRange();
          newRange.setStart(el.firstChild as any, 1);
          newRange.setEnd(el.firstChild as any, 1);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      } else {
        const existing = selectionHasWrapper();
        if (existing) {
          unwrapElement(existing);
        } else {
          const wrapper = document.createElement(tag);
          wrapper.appendChild(range.extractContents());
          range.insertNode(wrapper);
          const newRange = document.createRange();
          newRange.selectNodeContents(wrapper);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      }
    } catch {
      // ignore
    }
  };

  const toggleRich = (cmd: "bold" | "italic" | "underline") => {
    if (activeEditorRef.current !== "desc") return;
    const root = richDescRef.current;
    const tag = cmd === "bold" ? "strong" : cmd === "italic" ? "em" : "u";

    applyInlineFormatToSelection(root, tag);

    requestAnimationFrame(() => {
      const html = root?.innerHTML ?? "";
      setFormDescription(htmlToMarkers(html));
      updateDescFormatStateFromSelection();
    });
  };

  const toggleWrapSelection = (wrapper: { start: string; end: string }) => {
    const cmd = wrapper.start === "**" ? "bold" : wrapper.start === "*" ? "italic" : "underline";
    toggleRich(cmd);
  };

  const insertLinkToSelection = (root: HTMLDivElement | null, href: string, text?: string) => {
    if (!root) return;
    root.focus();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const anchor = sel.anchorNode;
    if (!anchor || !root.contains(anchor)) return;

    try {
      const a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.style.color = "#820000";
      a.style.textDecoration = "underline";

      if (range.collapsed) {
        a.textContent = text || href;
        range.insertNode(a);
        range.setStartAfter(a);
        range.collapse(true);
      } else {
        a.appendChild(range.extractContents());
        range.insertNode(a);
        const newRange = document.createRange();
        newRange.selectNodeContents(a);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }

      sel.removeAllRanges();
      sel.addRange(range);
    } catch {
      // ignore
    }
  };

  const insertLinkToRichDesc = () => {
    const root = richDescRef.current;
    if (!root) return;

    root.focus();

    const raw = window.prompt("Masukkan link (contoh: https://example.com)");
    if (!raw) return;

    const url = String(raw).trim();
    if (!url) return;

    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;

    const sel = window.getSelection();
    const hasSelection = !!sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed;

    if (!hasSelection) {
      const text = window.prompt("Teks yang ditampilkan (optional)", href) || href;
      insertLinkToSelection(root, href, text);
    } else {
      insertLinkToSelection(root, href);
    }

    requestAnimationFrame(() => {
      const html = root.innerHTML ?? "";
      setFormDescription(htmlToMarkers(html));
      updateDescFormatStateFromSelection();
    });
  };

  const insertLinkToRichNote = () => {
    const root = richNoteRef.current;
    if (!root || !selectedField) return;
  
    root.focus();
    activeEditorRef.current = "note";
  
    const raw = window.prompt("Masukkan link (contoh: https://example.com)");
    if (!raw) return;
  
    const url = String(raw).trim();
    if (!url) return;
  
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  
    const sel = window.getSelection();
    const hasSelection = !!sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed;
  
    if (!hasSelection) {
      const text = window.prompt("Teks yang ditampilkan (optional)", href) || href;
      insertLinkToSelection(root, href, text);
    } else {
      insertLinkToSelection(root, href);
    }
  
    requestAnimationFrame(() => {
      const html = root.innerHTML ?? "";
      const nextMarkers = htmlToMarkers(html);
  
      // simpan ke field.note
      updateField(selectedField.id, { note: nextMarkers } as any);
  
      // update state toolbar (biar tombol aktif kalau cursor ada di link/format)
      updateNoteFormatStateFromSelection();
    });
  };
  
  const autoResizeDescription = () => {
    const el = descriptionRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // Sync rich note editor with selectedField.note when switching fields.
  useEffect(() => {
    const root = richNoteRef.current;
    if (!root) return;

    if (!selectedField) {
      root.innerHTML = "";
      return;
    }

    if (activeEditorRef.current === "note") return;

    const nextHtml = markersToHtml(String((selectedField as any).note || ""));
    if ((root.innerHTML ?? "") !== (nextHtml ?? "")) root.innerHTML = nextHtml || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedField?.id]);

  const updateNoteFormatStateFromSelection = () => {
    if (activeEditorRef.current !== "note") return;

    const root = richNoteRef.current;
    if (!root) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const anchorNode = sel.anchorNode;
    if (!anchorNode) return;
    if (!root.contains(anchorNode)) return;

    const isActiveTag = (tag: string) => {
      let n: Node | null = anchorNode;
      while (n && n !== root) {
        if (n.nodeType === Node.ELEMENT_NODE) {
          if ((n as HTMLElement).tagName.toLowerCase() === tag) return true;
        }
        n = (n as HTMLElement).parentNode;
      }
      return false;
    };

    setNoteFormatState({
      bold: isActiveTag("strong") || isActiveTag("b"),
      italic: isActiveTag("em") || isActiveTag("i"),
      underline: isActiveTag("u"),
    });
  };

  const toggleRichNote = (cmd: "bold" | "italic" | "underline") => {
    const root = richNoteRef.current;
    if (!root) return;

    root.focus();
    activeEditorRef.current = "note";

    const tag = cmd === "bold" ? "strong" : cmd === "italic" ? "em" : "u";
    applyInlineFormatToSelection(root, tag);

    requestAnimationFrame(() => {
      const html = root.innerHTML ?? "";
      const nextMarkers = htmlToMarkers(html);

      if (selectedField) {
        const fieldId = selectedField.id;
        setFields((prev) => prev.map((f) => (f.id === fieldId ? ({ ...f, note: nextMarkers } as any) : f)));
        setSelectedField((prevSel) =>
          prevSel && prevSel.id === fieldId ? ({ ...prevSel, note: nextMarkers } as any) : prevSel
        );
      }

      updateNoteFormatStateFromSelection();
    });
  };

  // Keep toolbar active state in sync when user changes selection
  useEffect(() => {
    const handler = () => updateDescFormatStateFromSelection();
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = () => updateNoteFormatStateFromSelection();
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedField]);

  useEffect(() => {
    autoResizeDescription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDescription]);

  useEffect(() => {
    return () => {
      if (pendingHeaderPreviewUrl) URL.revokeObjectURL(pendingHeaderPreviewUrl);
    };
  }, [pendingHeaderPreviewUrl]);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load existing form if formId is provided
  useEffect(() => {
    if (!formId) return;

    setLoadingForm(true);
    campaignsService
      .getFormById(formId)
      .then((existingForm) => {
        setFormTitle(existingForm.title);
        setFormDescription(existingForm.description || "");

        hasInitRichDescRef.current = false;
        const html = markersToHtml(existingForm.description || "");
        requestAnimationFrame(() => {
          setRichDescHtml(html);
          hasInitRichDescRef.current = true;
        });

        setSuccessMessage((existingForm as any).successMessage || (existingForm as any).success_message || "");
        setHeaderImagePath((existingForm as any).headerImagePath || (existingForm as any).header_image_path || null);

        setFields(existingForm.fields?.length ? existingForm.fields : [...CORE_FIELDS]);

        setPublicSlug((existingForm as any).publicSlug || (existingForm as any).public_slug || "");
        setPublicQrUrlFromBackend((existingForm as any).publicQrUrl || (existingForm as any).public_qr_url || "");
      })
      .catch(() => {
        setFields([...CORE_FIELDS]);
      })
      .finally(() => setLoadingForm(false));
  }, [formId]);

  // Initialize rich editor for new form (no formId)
  useEffect(() => {
    if (formId) return;

    const html = markersToHtml(formDescription || "");
    requestAnimationFrame(() => {
      setRichDescHtml(html);
      hasInitRichDescRef.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rehydrate rich description editor when toggling Preview -> Edit
  useEffect(() => {
    if (showPreview) return;

    requestAnimationFrame(() => {
      const root = richDescRef.current;
      if (!root) return;
      if (document.activeElement === root) return;

      const html = markersToHtml(formDescription || "");
      root.innerHTML = html || "";
      hasInitRichDescRef.current = true;

      updateDescFormatStateFromSelection();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreview]);

  const resolveAssetUrl = (maybePath: string | null): string | null => {
    if (!maybePath) return null;

    const raw = String(maybePath);
    if (/^(https?:\/\/|blob:|data:)/i.test(raw)) return raw;

    const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3000";
    return `${String(apiBase).replace(/\/+$/, "")}${raw.startsWith("/") ? "" : "/"}${raw}`;
  };

  const headerPreviewSrc = pendingHeaderPreviewUrl || resolveAssetUrl(headerImagePath);

  const uploadHeaderImage = async (file: File) => {
    if (!formId) {
      if (pendingHeaderPreviewUrl) URL.revokeObjectURL(pendingHeaderPreviewUrl);
      setPendingHeaderFile(file);
      setPendingHeaderPreviewUrl(URL.createObjectURL(file));
      return;
    }

    setUploadingHeader(true);
    try {
      const data = await campaignsService.uploadFormHeaderImage(formId, file);
      setHeaderImagePath(data.header_image_path);
      setPendingHeaderFile(null);
      if (pendingHeaderPreviewUrl) URL.revokeObjectURL(pendingHeaderPreviewUrl);
      setPendingHeaderPreviewUrl(null);
    } finally {
      setUploadingHeader(false);
    }
  };

  const removeHeaderImage = async () => {
    if (!formId) {
      setHeaderImagePath(null);
      setPendingHeaderFile(null);
      if (pendingHeaderPreviewUrl) URL.revokeObjectURL(pendingHeaderPreviewUrl);
      setPendingHeaderPreviewUrl(null);
      return;
    }

    setUploadingHeader(true);
    try {
      await campaignsService.deleteFormHeaderImage(formId);
      setHeaderImagePath(null);
      setPendingHeaderFile(null);
      if (pendingHeaderPreviewUrl) URL.revokeObjectURL(pendingHeaderPreviewUrl);
      setPendingHeaderPreviewUrl(null);
    } finally {
      setUploadingHeader(false);
    }
  };

  // Add new field
  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: "New Field",
      required: false,
      placeholder: "",
    };

    if (type === "DROPDOWN" || type === "RADIO" || type === "CHECKBOX") {
      newField.options = ["Option 1", "Option 2"];
    }

    setFields((prev) => [...prev, newField]);
    setSelectedField(newField);
  };

  // Update field
  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId) return f;
        if ((f as any).isCore) return { ...f, ...updates, required: true };
        return { ...f, ...updates };
      })
    );

    setSelectedField((prevSel) => {
      if (!prevSel || prevSel.id !== fieldId) return prevSel;
      if ((prevSel as any).isCore) return { ...prevSel, ...updates, required: true };
      return { ...prevSel, ...updates };
    });
  };

  // Delete field
  const deleteField = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    setSelectedField((prevSel) => (prevSel?.id === fieldId ? null : prevSel));
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // Prevent moving into core fields area (index < 4)
        if (oldIndex < 4 || newIndex < 4) return items;

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Save form
  const handleSave = async (status: "DRAFT" | "PUBLISHED") => {
    setSaving(true);

    const payload: any = {
      title: formTitle,
      description: formDescription || null,
      success_message: (successMessage || "").trim() || null,
      status,
      public_slug: publicSlug.trim() ? getEffectivePublicSlug(formTitle, publicSlug) : null,
      public_link: status === "PUBLISHED" ? buildPublicLink(formTitle, publicSlug) : null,
      public_qr_url: status === "PUBLISHED" ? publicQrUrl : null,
      published_at: status === "PUBLISHED" ? new Date().toISOString() : null,
      primary_campaign_id: campaignId,
    };

    try {
      const savedForm = formId
        ? await campaignsService.updateForm(formId, payload)
        : await campaignsService.createForm(payload);

      // delete all existing fields then recreate
      try {
        const existing = await campaignsService.getFormFields(savedForm.id);
        for (const f of existing) {
          await campaignsService.deleteFormField(String((f as any).id));
        }
      } catch {
        // ignore
      }

      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        await campaignsService.createFormField({
          form_id: savedForm.id,
          field_key: `field_${i + 1}`,
          type: f.type as any,
          label: f.label,
          note: (f as any).note || null,
          required: !!f.required,
          is_core: !!(f as any).isCore,
          placeholder: (f as any).placeholder || null,
          file_settings: (f.type as any) === "FILE_UPLOAD" ? ((f as any).fileSettings || null) : null,
          sort_order: i + 1,
          options: (f as any).options?.map((opt: string) => ({ opt_value: opt })) || [],
        });
      }

      // Upload header if pending
      if (pendingHeaderFile) {
        setUploadingHeader(true);
        try {
          const data = await campaignsService.uploadFormHeaderImage(savedForm.id, pendingHeaderFile);
          setHeaderImagePath(data.header_image_path);
          setPendingHeaderFile(null);
          if (pendingHeaderPreviewUrl) URL.revokeObjectURL(pendingHeaderPreviewUrl);
          setPendingHeaderPreviewUrl(null);

          await campaignsService.updateForm(savedForm.id, { header_image_path: data.header_image_path } as any);
        } finally {
          setUploadingHeader(false);
        }
      }

      // refresh fields
      try {
        const refreshed = await campaignsService.getFormById(savedForm.id);
        setFields(refreshed.fields?.length ? refreshed.fields : [...CORE_FIELDS]);
      } catch {
        // ignore
      }

      onBack();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleClearPreview = () => {
    setAnswers({});
    setPreviewSubmitted(false);
  };

  const activeField = activeId ? fields.find((f) => f.id === activeId) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg shadow-sm">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg">
            <FileText className="w-7 h-7 text-black-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{formTitle}</div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? "Edit" : "Preview"}
          </button>

          <button
            onClick={() => handleSave("DRAFT")}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>

          <button
            onClick={() => handleSave("PUBLISHED")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={saving}
          >
            <Send className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gray-200">
        {loadingForm ? (
          <div className="h-full flex items-center justify-center text-gray-600">Loading form...</div>
        ) : showPreview ? (
          // PREVIEW MODE
          <div className="h-full overflow-y-auto">
            <FormRenderer
              mode="preview"
              form={{
                title: formTitle,
                description: formDescription || null,
                headerImagePath: headerPreviewSrc || null,
                successMessage: (successMessage || "").trim() || null,
                status: null,
                fields,
              }}
              answers={answers}
              onChange={(k, v) => setAnswers((prev) => ({ ...prev, [k]: v }))}
              submitting={false}
              validationError={null}
              submitted={previewSubmitted}
              onSubmit={() => setPreviewSubmitted(true)}
              onClear={handleClearPreview}
              onSubmitAnother={() => {
                setPreviewSubmitted(false);
                setAnswers({});
              }}
              footerHint={<div className="text-xs text-gray-500">Preview mode (tidak menyimpan ke database).</div>}
            />
          </div>
        ) : (
          // EDIT MODE: 2 columns
          <div className="flex h-full">
            {/* Left: Canvas */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-200 scrollbar-thin">
              <div className="max-w-3xl mx-auto">
                {/* Header image */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gray-600" />
                      <div className="text-sm font-medium text-gray-900">Header Image</div>
                    </div>

                    {(headerImagePath || pendingHeaderPreviewUrl) ? (
                      <button
                        type="button"
                        onClick={removeHeaderImage}
                        disabled={uploadingHeader}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove header"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>

                  {headerPreviewSrc ? (
                    <div className="mb-3">
                      <img
                        src={headerPreviewSrc || ""}
                        alt="Header"
                        className="w-full max-h-56 object-cover rounded-lg border border-gray-200"
                      />
                      {pendingHeaderPreviewUrl ? (
                        <div className="text-xs text-gray-500 mt-2">Gambar akan diupload saat Publish / Save.</div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 mb-3">Belum ada header image.</div>
                  )}

                  <div className="flex items-center gap-3">
                    <label
                      className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 cursor-pointer ${
                        uploadingHeader ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      title="Pilih header image (akan diupload saat Publish/Save)"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingHeader ? "Uploading..." : "Upload"}

                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingHeader}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          try {
                            await uploadHeaderImage(file);
                          } catch (err) {
                            // eslint-disable-next-line no-console
                            console.error(err);
                          } finally {
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Title + Description */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full text-2xl font-semibold mb-3 border-none focus:outline-none focus:ring-0 p-0"
                    placeholder="Form Title"
                  />

                  {/* Description toolbar */}
                  <div className="flex items-center gap-1 mb-2 border border-gray-200 rounded-md bg-white px-1 py-1 w-fit">
                    <button
                      type="button"
                      onClick={() => toggleWrapSelection({ start: "**", end: "**" })}
                      className={`h-9 w-9 inline-flex items-center justify-center rounded ${
                        descFormatState.bold ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                      }`}
                      title="Bold"
                    >
                      <Bold className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleWrapSelection({ start: "*", end: "*" })}
                      className={`h-9 w-9 inline-flex items-center justify-center rounded ${
                        descFormatState.italic ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                      }`}
                      title="Italic"
                    >
                      <Italic className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleWrapSelection({ start: "__", end: "__" })}
                      className={`h-9 w-9 inline-flex items-center justify-center rounded ${
                        descFormatState.underline ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                      }`}
                      title="Underline"
                    >
                      <Underline className="w-5 h-5" />
                    </button>

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <button
                      type="button"
                      onClick={insertLinkToRichDesc}
                      className="h-9 w-9 inline-flex items-center justify-center rounded text-gray-600 hover:bg-gray-50"
                      title="Insert link"
                    >
                      <LinkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* WYSIWYG Description Editor */}
                  <div
                    ref={richDescRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full text-sm text-gray-600 border border-gray-200 rounded-md p-3 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#820000]/30"
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    onFocus={() => {
                      activeEditorRef.current = "desc";
                      setNoteFormatState({ bold: false, italic: false, underline: false });
                      updateDescFormatStateFromSelection();
                    }}
                    onInput={() => {
                      const html = richDescRef.current?.innerHTML ?? "";
                      setFormDescription(htmlToMarkers(html));
                      requestAnimationFrame(() => updateDescFormatStateFromSelection());
                    }}
                    onClick={() => updateDescFormatStateFromSelection()}
                    onKeyUp={() => updateDescFormatStateFromSelection()}
                  />

                  {/* Hidden textarea for auto resize / compatibility */}
                  <textarea ref={descriptionRef} value={formDescription} readOnly className="hidden" rows={2} />
                </div>

                {/* Fields List */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                  <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {fields.map((field) => (
                        <SortableField
                          key={field.id}
                          field={field}
                          selectedField={selectedField}
                          onSelectField={setSelectedField}
                          onDeleteField={deleteField}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  {activeField ? (
                    <DragOverlay>
                      <FieldItem field={activeField} />
                    </DragOverlay>
                  ) : null}
                </DndContext>

                {/* Add Field Buttons */}
                <div className="mt-6 bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
                  <div className="text-sm font-medium text-gray-700 mb-3">Add Field:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => addField("SHORT_TEXT")}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      + Short Text
                    </button>
                    <button
                      onClick={() => addField("LONG_TEXT")}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      + Long Text
                    </button>
                    <button
                      onClick={() => addField("DROPDOWN")}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      + Dropdown
                    </button>
                    <button
                      onClick={() => addField("RADIO")}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      + Radio
                    </button>
                    <button
                      onClick={() => addField("CHECKBOX")}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      + Checkbox
                    </button>
                    <button
                      onClick={() => addField("DATE")}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      + Date
                    </button>
                    <button
                      onClick={() => addField("FILE_UPLOAD")}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      + File Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Settings */}
            <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto p-6 scrollbar-thin">
              {selectedField ? (
                <div>
                  <h3 className="mb-4">Field Settings</h3>

                  {(selectedField as any).isCore && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      This is a core field and cannot be deleted. You can edit the label and placeholder.
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Label */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Field Label</label>
                      <input
                        type="text"
                        value={selectedField.label}
                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Notes / Subtitle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes / Subtitle</label>

                      <div className="flex items-center gap-1 mb-2 border border-gray-200 rounded-md bg-white px-1 py-1 w-fit">
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggleRichNote("bold")}
                          className={`h-8 w-8 inline-flex items-center justify-center rounded ${
                            noteFormatState.bold ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                          }`}
                          title="Bold"
                        >
                          <Bold className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggleRichNote("italic")}
                          className={`h-8 w-8 inline-flex items-center justify-center rounded ${
                            noteFormatState.italic ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                          }`}
                          title="Italic"
                        >
                          <Italic className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggleRichNote("underline")}
                          className={`h-8 w-8 inline-flex items-center justify-center rounded ${
                            noteFormatState.underline ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                          }`}
                          title="Underline"
                        >
                          <Underline className="w-4 h-4" />
                        </button>
                        <div className="w-px h-5 bg-gray-200 mx-1" />
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={insertLinkToRichNote}
                          className="h-8 w-8 inline-flex items-center justify-center rounded text-gray-600 hover:bg-gray-50"
                          title="Insert link"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div
                        ref={richNoteRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm min-h-[72px] whitespace-pre-wrap break-words focus:outline-none"
                        contentEditable
                        suppressContentEditableWarning
                        onFocus={() => {
                          activeEditorRef.current = "note";
                          setDescFormatState({ bold: false, italic: false, underline: false });
                          updateNoteFormatStateFromSelection();
                        }}
                        onBlur={() => {
                          if (activeEditorRef.current === "note") activeEditorRef.current = null;
                        }}
                        onInput={() => {
                          if (!selectedField) return;
                          const html = richNoteRef.current?.innerHTML ?? "";
                          const nextMarkers = htmlToMarkers(html);
                          updateField(selectedField.id, { note: nextMarkers } as any);
                        }}
                        onKeyUp={() => updateNoteFormatStateFromSelection()}
                        onMouseUp={() => updateNoteFormatStateFromSelection()}
                        onClick={() => updateNoteFormatStateFromSelection()}
                      />

                      <div className="text-xs text-gray-500 mt-2">Mendukung: Bold, Italic, Underline.</div>
                    </div>

                    {/* Placeholder */}
                    {(selectedField.type === "SHORT_TEXT" || selectedField.type === "LONG_TEXT") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder</label>
                        <input
                          type="text"
                          value={(selectedField as any).placeholder || ""}
                          onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value } as any)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* Required */}
                    {!(selectedField as any).isCore && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="required"
                          checked={!!selectedField.required}
                          onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label htmlFor="required" className="text-sm text-gray-700">
                          Required field
                        </label>
                      </div>
                    )}

                    {/* Options */}
                    {(selectedField.type === "DROPDOWN" ||
                      selectedField.type === "RADIO" ||
                      selectedField.type === "CHECKBOX") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                        <div className="space-y-2">
                          {selectedField.options?.map((option: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={String(option ?? "")}
                                onChange={(e) => {
                                  const newOptions = [...(selectedField.options || [])] as any[];
                                  newOptions[idx] = e.target.value;
                                  updateField(selectedField.id, { options: newOptions } as any);
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = (selectedField.options || []).filter((_: any, i: number) => i !== idx);
                                  updateField(selectedField.id, { options: newOptions } as any);
                                }}
                                className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          <button
                            onClick={() => {
                              const count = selectedField.options?.length || 0;
                              const newOptions = [...(selectedField.options || []), `Option ${count + 1}`] as any[];
                              updateField(selectedField.id, { options: newOptions } as any);
                            }}
                            className="w-full px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    )}

                    {/* File settings */}
                    {selectedField.type === "FILE_UPLOAD" && !(selectedField as any).isCore && (
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-gray-700">File Upload Settings</div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Izinkan hanya jenis file tertentu
                          </label>

                          <div className="grid grid-cols-2 gap-2">
                            {FILE_UPLOAD_CATEGORIES.map((opt) => {
                              const current = (((selectedField as any).fileSettings?.allowedCategories || []) as any[]) || [];

                              return (
                                <label key={opt.key} className="flex items-start gap-2 text-sm text-gray-700">
                                  <input
                                    className="mt-0.5"
                                    type="checkbox"
                                    checked={current.includes(opt.key)}
                                    onChange={(e) => {
                                      const isAny = opt.key === "ANY";

                                      let next = e.target.checked
                                        ? Array.from(new Set([...current, opt.key]))
                                        : current.filter((x) => x !== opt.key);

                                      if (isAny && e.target.checked) next = ["ANY"];
                                      if (!isAny && e.target.checked) next = next.filter((x) => x !== "ANY");

                                      updateField(selectedField.id, {
                                        fileSettings: {
                                          ...((selectedField as any).fileSettings || {}),
                                          allowedCategories: next,
                                        },
                                      } as any);
                                    }}
                                  />

                                  <span>
                                    <div className="leading-tight">{opt.label}</div>
                                    <div className="text-xs text-gray-500 leading-tight">{opt.hint}</div>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah maksimum file</label>
                          <input
                            type="number"
                            min={1}
                            value={(selectedField as any).fileSettings?.maxFiles ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              updateField(selectedField.id, {
                                fileSettings: {
                                  ...((selectedField as any).fileSettings || {}),
                                  maxFiles: v === "" ? undefined : Number(v),
                                },
                              } as any);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Contoh: 1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ukuran file maksimal (MB)</label>
                          <input
                            type="number"
                            min={1}
                            value={(selectedField as any).fileSettings?.maxSizeMB ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              updateField(selectedField.id, {
                                fileSettings: {
                                  ...((selectedField as any).fileSettings || {}),
                                  maxSizeMB: v === "" ? undefined : Number(v),
                                },
                              } as any);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Contoh: 10"
                          />
                          <div className="text-xs text-gray-500 mt-1">Backend default: 10MB</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thank You Message */}
                  <div className="mt-6">
                    <div className="text-sm font-semibold text-gray-900 mb-2">Thank You Message (after submit)</div>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                      rows={5}
                      value={successMessage}
                      onChange={(e) => setSuccessMessage(e.target.value)}
                      placeholder="Contoh: Terima kasih! ..."
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      Pesan ini akan ditampilkan setelah user berhasil submit form publik.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <p>Select a field to edit its settings</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
