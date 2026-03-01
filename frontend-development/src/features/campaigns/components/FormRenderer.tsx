import React, { useMemo } from "react";
import type { FormField } from "../../../lib/leadManagementTypes";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";

type FormRendererForm = {
  title: string;
  description?: string | null;
  headerImagePath?: string | null;
  successMessage?: string | null;
  status?: string | null;
  fields: FormField[];
};

type FormRendererProps = {
  form: FormRendererForm;
  answers: Record<string, any>;
  onChange: (key: string, value: any) => void;
  submitting?: boolean;
  validationError?: string | null;
  submitted: boolean;
  onSubmit: () => void;
  onClear: () => void;
  onSubmitAnother: () => void;

  // Public mode: upload beneran. Preview mode: biasanya local.
  onFileUpload?: (fieldId: string, files: File[] | null) => void;

  footerHint?: React.ReactNode;
  mode: "public" | "preview";
};

const resolveAssetUrl = (maybePath: string | null | undefined): string | null => {
  if (!maybePath) return null;

  const raw = String(maybePath);

  // allow http(s), blob, data
  if (/^(https?:\/\/|blob:|data:)/i.test(raw)) return raw;

  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3000";
  return `${String(apiBase).replace(/\/+$/, "")}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

function linkifyText(input: string): Array<string | { href: string; text: string }> {
    const text = String(input ?? "");
    const parts: Array<string | { href: string; text: string }> = [];
  
    // Match Markdown link: [text](url)
    // and also plain URL: https://... or www....
    const regex =
      /(\[([^\]]+)\]\(((?:https?:\/\/|www\.)[^\s)<>]+)\))|\b((?:https?:\/\/|www\.)[^\s<]+)/gi;
  
    let lastIndex = 0;
    let match: RegExpExecArray | null;
  
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
  
      if (start > lastIndex) parts.push(text.slice(lastIndex, start));
  
      // Markdown link branch
      if (match[1]) {
        const label = match[2];
        const rawUrl = match[3];
        const href = rawUrl.toLowerCase().startsWith("http") ? rawUrl : `https://${rawUrl}`;
        parts.push({ href, text: label });
        lastIndex = start + match[1].length;
        continue;
      }
  
      // Plain URL branch
      const raw = match[4];
      const href = raw.toLowerCase().startsWith("http") ? raw : `https://${raw}`;
      parts.push({ href, text: raw });
      lastIndex = start + raw.length;
    }
  
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
  }
  

function RichTextWithLinks({ text }: { text: string }) {
  const parts = useMemo(() => linkifyText(text), [text]);

  return (
    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap break-words">
      {parts.map((p, idx) => {
        if (typeof p === "string") return <span key={idx}>{p}</span>;

        return (
          <a
            key={idx}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#820000] underline"
          >
            {p.text}
          </a>
        );
      })}
    </p>
  );
}

/**
 * Render markers:
 * - ***text*** => <strong><em>text</em></strong>
 * - **text**   => <strong>text</strong>
 * - *text*     => <em>text</em>
 * - __text__   => <u>text</u>
 * - url / www  => <a>
 */
function renderInlineFormatting(text: string): Array<string | React.ReactElement> {
  const input = String(text ?? "");

  // OPTIONAL: kalau mau aktifkan fix marker crossing, isi di sini.
  const normalizeMarkers = (s: string): string => {
    let out = String(s ?? "");
    return out;
  };

  const normalizedInput = normalizeMarkers(input);

  type Token =
    | { type: "text"; value: string }
    | { type: "u" | "strong" | "em"; children: Token[] }
    | { type: "link"; href: string; text: string };

  const startsWithAt = (s: string, i: number, pat: string) => s.slice(i, i + pat.length) === pat;

  const isUrlChar = (ch: string) => !!ch && !/\s|[<>]/.test(ch);

  const parseUrlAt = (
    s: string,
    idx: number
  ): { href: string; text: string; end: number } | null => {
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

  const parseSegment = (s: string): Token[] => {
    const tokens: Token[] = [];
    let i = 0;
    let buf = "";

    const flush = () => {
      if (buf) tokens.push({ type: "text", value: buf });
      buf = "";
    };

    const findClosing = (from: number, marker: string): number => s.indexOf(marker, from);

    const findItalicClosing = (from: number): number => {
      for (let k = from; k < s.length; k++) {
        if (s[k] !== "*") continue;
        const prev = k > 0 ? s[k - 1] : "";
        const next = k + 1 < s.length ? s[k + 1] : "";
        if (prev !== "*" && next !== "*") return k;
      }
      return -1;
    };

    while (i < s.length) {
      const url = parseUrlAt(s, i);
      if (url) {
        flush();
        tokens.push({ type: "link", href: url.href, text: url.text });
        i = url.end;
        continue;
      }

      // ***text***
      if (startsWithAt(s, i, "***")) {
        const close = findClosing(i + 3, "***");
        if (close !== -1) {
          flush();
          const innerRaw = s.slice(i + 3, close);
          const innerTokens = parseSegment(innerRaw);

          tokens.push({
            type: "strong",
            children: [{ type: "em", children: innerTokens }],
          });

          i = close + 3;
          continue;
        }
      }

      // __text__
      if (startsWithAt(s, i, "__")) {
        const close = findClosing(i + 2, "__");
        if (close !== -1) {
          flush();
          const innerRaw = s.slice(i + 2, close);
          tokens.push({ type: "u", children: parseSegment(innerRaw) });
          i = close + 2;
          continue;
        }
      }

      // **text**
      if (startsWithAt(s, i, "**")) {
        const close = findClosing(i + 2, "**");
        if (close !== -1) {
          flush();
          const innerRaw = s.slice(i + 2, close);
          tokens.push({ type: "strong", children: parseSegment(innerRaw) });
          i = close + 2;
          continue;
        }
      }

      // *text*
      if (s[i] === "*") {
        const prev = i > 0 ? s[i - 1] : "";
        const next = i + 1 < s.length ? s[i + 1] : "";
        const isSingle = prev !== "*" && next !== "*";

        if (isSingle) {
          const close = findItalicClosing(i + 1);
          if (close !== -1) {
            flush();
            const innerRaw = s.slice(i + 1, close);
            tokens.push({ type: "em", children: parseSegment(innerRaw) });
            i = close + 1;
            continue;
          }
        }
      }

      buf += s[i];
      i++;
    }

    flush();
    return tokens;
  };

  const tokens = parseSegment(normalizedInput);

  const renderTokens = (ts: Token[], keyPrefix: string): Array<string | React.ReactElement> =>
    ts.map((t, idx) => {
      const key = `${keyPrefix}-${idx}`;

      if (t.type === "text") return t.value;

      if (t.type === "link") {
        return (
          <a
            key={key}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#820000] underline"
          >
            {t.text}
          </a>
        );
      }

      if (t.type === "u") return <u key={key}>{renderTokens(t.children, `${key}-u`)}</u>;
      if (t.type === "strong") return <strong key={key}>{renderTokens(t.children, `${key}-b`)}</strong>;
      if (t.type === "em") return <em key={key}>{renderTokens(t.children, `${key}-i`)}</em>;

      return "";
    });

  return renderTokens(tokens, "t");
};

function RichTextWithBasicFormatting({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const lines = String(text ?? "").split(/\r?\n/);

  return (
    <div className={className}>
      {lines.map((line, idx) => (
        <p key={idx} className="whitespace-pre-wrap break-words">
          {renderInlineFormatting(line)}
        </p>
      ))}
    </div>
  );
}

function FieldCard({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-gray-200 rounded-lg p-4">{children}</div>;
}

function TitleCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="h-3" style={{ backgroundColor: "#820000" }} />
      <div className="p-6">{children}</div>
    </div>
  );
}

const FILE_CATEGORY_ACCEPT: Record<string, string> = {
  DOCUMENT: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt",
  IMAGE: ".jpg,.jpeg,.png,.gif,.webp",
  VIDEO: ".mp4,.mov,.avi,.mkv,.webm",
  AUDIO: ".mp3,.wav,.m4a,.aac,.ogg",
  ARCHIVE: ".zip,.rar,.7z",
  ANY: "",
};

const normalizeUploadCategories = (categories?: string[]): string[] | undefined => {
  if (!Array.isArray(categories) || categories.length === 0) return undefined;

  const mapped = categories.map((c) => {
    const k = String(c || "").trim().toUpperCase();
    if (k === "PHOTO") return "IMAGE";
    if (k === "SPREADSHEET") return "DOCUMENT";
    if (k === "PDF") return "DOCUMENT";
    if (k === "PRESENTATION") return "DOCUMENT";
    return k;
  });

  return Array.from(new Set(mapped));
};

const buildAcceptFromCategories = (categories?: string[]): string | undefined => {
  const normalized = normalizeUploadCategories(categories);
  if (!normalized || normalized.length === 0) return undefined;
  if (normalized.includes("ANY")) return undefined;

  const accepts = normalized
    .map((c) => FILE_CATEGORY_ACCEPT[c])
    .filter((v) => typeof v === "string" && v.trim().length > 0);

  if (accepts.length === 0) return undefined;

  return Array.from(
    new Set(
      accepts
        .join(",")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    )
  ).join(",");
};

const extractOptionStrings = (raw: any): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((opt) => {
      if (typeof opt === "string") return opt;
      if (opt && typeof opt === "object") {
        return String((opt as any).opt_value ?? (opt as any).value ?? (opt as any).label ?? "");
      }
      return "";
    })
    .map((s) => String(s).trim())
    .filter((s) => s.length > 0);
};

export function FormRenderer(props: FormRendererProps) {
  const {
    form,
    answers,
    onChange,
    submitting,
    validationError,
    submitted,
    onSubmit,
    onClear,
    onSubmitAnother,
    onFileUpload,
    footerHint,
    mode,
  } = props;

  const fields = useMemo<FormField[]>(() => form?.fields || [], [form]);

  const effectiveSuccessMessage = (() => {
    const v = form?.successMessage;
    if (v === undefined || v === null) return "";
    return String(v).trim();
  })();

  const isOtherOption = (opt: string) => /^lainnya\b/i.test(String(opt || "").trim());
  const otherKeyOf = (fieldKey: string) => `${fieldKey}__other`;


  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto p-6">
          <div className="space-y-4">
            {form.headerImagePath ? (
              <div className="w-full overflow-hidden rounded-lg">
                <div className="relative w-full" style={{ aspectRatio: "4 / 1" }}>
                  <img
                    src={resolveAssetUrl(form.headerImagePath) || undefined}
                    alt="Header form"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : null}

            <TitleCard>
              <h1 className="text-xl font-semibold text-gray-900">{form.title}</h1>

              {effectiveSuccessMessage ? <RichTextWithLinks text={effectiveSuccessMessage} /> : null}

              <div className="mt-4">
                <Button
                  type="button"
                  onClick={onSubmitAnother}
                  className="bg-[#820000] hover:bg-[#6d0000]"
                >
                  Submit another response
                </Button>
              </div>
            </TitleCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="space-y-4">
          {validationError ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
              {validationError}
            </div>
          ) : null}

          {form.headerImagePath ? (
            <div className="w-full overflow-hidden rounded-lg">
              <div className="relative w-full" style={{ aspectRatio: "4 / 1" }}>
                <img
                  src={resolveAssetUrl(form.headerImagePath) || undefined}
                  alt="Header form"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          ) : null}

          <TitleCard>
            <h1 className="text-xl font-semibold text-gray-900">{form.title}</h1>
            {form.description ? (
              <RichTextWithBasicFormatting
                text={form.description}
                className="text-sm text-gray-600 mt-2 space-y-1"
              />
            ) : null}
          </TitleCard>

          <div className="space-y-4">
            {fields.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                Form ini belum memiliki pertanyaan.
              </div>
            ) : null}

            {fields.map((f) => {
              const key = f.id;
              const label = f.label;
              const required = f.required;

              // FILE_UPLOAD
              if (f.type === "FILE_UPLOAD") {
                const maxFiles = (f as any)?.fileSettings?.maxFiles ?? 1;
                const maxSizeMB = (f as any)?.fileSettings?.maxSizeMB ?? 10;

                const allowedCategories = Array.isArray((f as any)?.fileSettings?.allowedCategories)
                  ? ((f as any).fileSettings.allowedCategories as string[])
                  : undefined;

                const accept = buildAcceptFromCategories(allowedCategories);

                const value = answers[key];
                const pickedCount = Array.isArray(value) ? value.length : value ? 1 : 0;

                return (
                  <FieldCard key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label} {required ? <span className="text-red-500"> *</span> : null}
                    </label>

                    {(f as any)?.note ? (
                      <RichTextWithBasicFormatting
                        text={String((f as any).note || "")}
                        className="text-xs text-gray-600 mb-2"
                      />
                    ) : null}

                    <div className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                      <input
                        type="file"
                        className="w-full text-sm"
                        multiple={maxFiles > 1}
                        accept={accept}
                        onClick={(e) => {
                          (e.currentTarget as HTMLInputElement).value = "";
                        }}
                        onChange={(e) => {
                          const list = e.target.files ? Array.from(e.target.files) : [];
                          if (mode === "public") {
                            onFileUpload?.(key, list);
                          } else {
                            // preview: simpan lokal (biar UI count sama)
                            onChange(
                              key,
                              list.map((x) => x.name)
                            );
                          }
                        }}
                      />
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Maks {maxFiles} file • Maks {maxSizeMB}MB per file
                      {accept ? <span> • Allowed: {accept}</span> : null}
                      {pickedCount ? <span> • {pickedCount} file dipilih</span> : null}
                    </div>
                  </FieldCard>
                );
              }

              // LONG_TEXT
              if (f.type === "LONG_TEXT") {
                return (
                  <FieldCard key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label} {required ? <span className="text-red-500"> *</span> : null}
                    </label>

                    {(f as any)?.note ? (
                      <RichTextWithBasicFormatting
                        text={String((f as any).note || "")}
                        className="text-xs text-gray-600 mb-2"
                      />
                    ) : null}

                    <Textarea
                      required={!!required}
                      value={answers[key] ?? ""}
                      onChange={(e) => onChange(key, e.target.value)}
                      placeholder={(f as any).placeholder}
                    />
                  </FieldCard>
                );
              }

              // DROPDOWN
                if (f.type === "DROPDOWN") {
                    const dropdownOptions = extractOptionStrings((f as any).options);
                
                    const selectedValue = String(answers[key] ?? "");
                    const otherOpt = dropdownOptions.find(isOtherOption) || "";
                    const otherKey = otherKeyOf(key);
                    const otherText = String(answers[otherKey] ?? "");
                
                    return (
                    <FieldCard key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label} {required ? <span className="text-red-500"> *</span> : null}
                        </label>
                
                        {(f as any)?.note ? (
                        <RichTextWithBasicFormatting
                            text={String((f as any).note || "")}
                            className="text-xs text-gray-600 mb-2"
                        />
                        ) : null}
                
                        <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        required={!!required}
                        value={selectedValue}
                        onChange={(e) => {
                            const v = e.target.value;
                            onChange(key, v);
                            // kalau pindah dari "Lainnya" ke opsi lain, kosongkan input lainnya biar gak nyangkut
                            if (!isOtherOption(v)) onChange(otherKey, "");
                        }}
                        >
                        <option value="">Pilih...</option>
                        {dropdownOptions.map((opt) => (
                            <option key={`${key}-${opt}`} value={opt}>
                            {opt}
                            </option>
                        ))}
                        </select>
                
                        {otherOpt && selectedValue === otherOpt ? (
                        <div className="mt-2">
                            <Input
                            value={otherText}
                            onChange={(e) => onChange(otherKey, e.target.value)}
                            placeholder="Tulis lainnya..."
                            />
                        </div>
                        ) : null}
                    </FieldCard>
                    );
                }
  

              // RADIO
                if (f.type === "RADIO") {
                    const radioOptions = extractOptionStrings((f as any).options);
                
                    const selectedValue = String(answers[key] ?? "");
                    const otherKey = otherKeyOf(key);
                    const otherText = String(answers[otherKey] ?? "");
                
                    return (
                    <FieldCard key={key}>
                        <div className="text-sm font-medium text-gray-700 mb-1">
                        {label} {required ? <span className="text-red-500"> *</span> : null}
                        </div>
                
                        {(f as any)?.note ? (
                        <RichTextWithBasicFormatting
                            text={String((f as any).note || "")}
                            className="text-xs text-gray-600 mb-2"
                        />
                        ) : null}
                
                        <div className="space-y-2">
                        {radioOptions.map((opt) => (
                            <div key={`${key}-${opt}`} className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                type="radio"
                                name={key}
                                required={!!required}
                                checked={selectedValue === opt}
                                onChange={() => {
                                    onChange(key, opt);
                                    if (!isOtherOption(opt)) onChange(otherKey, "");
                                }}
                                />
                                {opt}
                            </label>
                
                            {isOtherOption(opt) && selectedValue === opt ? (
                                <div className="pl-6">
                                <Input
                                    value={otherText}
                                    onChange={(e) => onChange(otherKey, e.target.value)}
                                    placeholder="Tulis lainnya..."
                                />
                                </div>
                            ) : null}
                            </div>
                        ))}
                        </div>
                    </FieldCard>
                    );
                }
  

              // CHECKBOX
                if (f.type === "CHECKBOX") {
                    const selected: string[] = Array.isArray(answers[key]) ? answers[key] : [];
                    const checkboxOptions = extractOptionStrings((f as any).options);
                
                    const hasOther = checkboxOptions.some(isOtherOption);
                    const otherOpt = checkboxOptions.find(isOtherOption) || "";
                    const otherKey = otherKeyOf(key);
                    const otherText = String(answers[otherKey] ?? "");
                    const isOtherChecked = hasOther && selected.includes(otherOpt);
                
                    return (
                    <FieldCard key={key}>
                        <div className="text-sm font-medium text-gray-700 mb-1">
                        {label} {required ? <span className="text-red-500"> *</span> : null}
                        </div>
                
                        {(f as any)?.note ? (
                        <RichTextWithBasicFormatting
                            text={String((f as any).note || "")}
                            className="text-xs text-gray-600 mb-2"
                        />
                        ) : null}
                
                        <div className="space-y-2">
                        {checkboxOptions.map((opt) => {
                            const checked = selected.includes(opt);
                
                            return (
                            <div key={`${key}-${opt}`} className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                    if (e.target.checked) onChange(key, [...selected, opt]);
                                    else {
                                        const next = selected.filter((x) => x !== opt);
                                        onChange(key, next);
                                        if (isOtherOption(opt)) onChange(otherKey, "");
                                    }
                                    }}
                                />
                                {opt}
                                </label>
                
                                {isOtherOption(opt) && checked ? (
                                <div className="pl-6">
                                    <Input
                                    value={otherText}
                                    onChange={(e) => onChange(otherKey, e.target.value)}
                                    placeholder="Tulis lainnya..."
                                    />
                                </div>
                                ) : null}
                            </div>
                            );
                        })}
                        </div>
                
                        {/* Optional: kalau other dicentang tapi kosong, bisa kasih hint */}
                        {isOtherChecked && !otherText.trim() ? (
                        <div className="text-xs text-gray-500 mt-2">Isi kolom "Lainnya" agar jawaban lengkap.</div>
                        ) : null}
                    </FieldCard>
                    );
                }
  

              // DATE
              if (f.type === "DATE") {
                return (
                  <FieldCard key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label} {required ? <span className="text-red-500"> *</span> : null}
                    </label>

                    {(f as any)?.note ? (
                      <RichTextWithBasicFormatting
                        text={String((f as any).note || "")}
                        className="text-xs text-gray-600 mb-2"
                      />
                    ) : null}

                    <Input
                      type="date"
                      required={!!required}
                      value={answers[key] ?? ""}
                      onChange={(e) => onChange(key, e.target.value)}
                    />
                  </FieldCard>
                );
              }

              // SHORT_TEXT default
              const normalizedLabel = String(label || "").trim().toLowerCase();
              const isEmail = normalizedLabel === "email";
              const isPhone = normalizedLabel === "nomor telepon / whatsapp";

              return (
                <FieldCard key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required ? <span className="text-red-500"> *</span> : null}
                  </label>

                  {(f as any)?.note ? (
                    <RichTextWithBasicFormatting
                      text={String((f as any).note || "")}
                      className="text-xs text-gray-600 mb-2"
                    />
                  ) : null}

                  {isEmail ? (
                    <Input
                      type="email"
                      required={!!required}
                      value={answers[key] ?? ""}
                      inputMode="email"
                      autoComplete="email"
                      pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$"
                      onBeforeInput={(e) => {
                        const data = (e as any).data as string | null | undefined;
                        if (!data) return;
                        if (/\s/.test(data)) e.preventDefault();
                      }}
                      onPaste={(e) => {
                        const pasted = e.clipboardData?.getData("text") ?? "";
                        if (/\s/.test(pasted)) {
                          e.preventDefault();
                          const cleaned = pasted.replace(/\s+/g, "");
                          onChange(key, cleaned);
                        }
                      }}
                      onChange={(e) => {
                        const next = e.target.value.replace(/\s+/g, "");
                        onChange(key, next);
                      }}
                      placeholder={(f as any).placeholder}
                    />
                  ) : (
                    <Input
                      required={!!required}
                      value={answers[key] ?? ""}
                      inputMode={isPhone ? "numeric" : undefined}
                      pattern={isPhone ? "[0-9]*" : undefined}
                      onBeforeInput={(e) => {
                        if (!isPhone) return;
                        const data = (e as any).data as string | null | undefined;
                        if (data && /\D/.test(data)) e.preventDefault();
                      }}
                      onPaste={(e) => {
                        if (!isPhone) return;
                        const pasted = e.clipboardData?.getData("text") ?? "";
                        if (/\D/.test(pasted)) {
                          e.preventDefault();
                          const digits = pasted.replace(/\D+/g, "");
                          onChange(key, digits);
                        }
                      }}
                      onChange={(e) => {
                        const next = isPhone ? e.target.value.replace(/\D+/g, "") : e.target.value;
                        onChange(key, next);
                      }}
                      placeholder={(f as any).placeholder}
                    />
                  )}
                </FieldCard>
              );
            })}

            <div className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={onSubmit}
                  className="w-full"
                  disabled={!!submitting}
                  style={{ backgroundColor: "#820000" }}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onClear}
                  className="w-full"
                  disabled={!!submitting}
                >
                  Clear Form
                </Button>
              </div>

              {footerHint ? <div className="mt-2">{footerHint}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
