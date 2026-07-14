"use client";

import { Trash2, Upload } from "lucide-react";
import type { ChangeEvent, RefObject } from "react";

import { UploadedFileIcon } from "@/components/classroom/classroom-media";

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]";

export interface ClassroomAttachment {
  id: string;
  mimeType?: string;
  name: string;
  size?: number;
  url?: string;
}

function formatFileSize(size?: number) {
  if (size === undefined) return "Sample file";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function ClassroomAttachments({
  attachments,
  inputRef,
  isInstructor,
  onDelete,
  onUpload,
}: {
  attachments: ClassroomAttachment[];
  inputRef: RefObject<HTMLInputElement | null>;
  isInstructor: boolean;
  onDelete: (attachment: ClassroomAttachment) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <section className="mt-10" aria-labelledby="attachments-title">
      <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5ab4ff]">Resources</p><h2 id="attachments-title" className="mt-1 text-xl font-semibold text-white">File attachments</h2></div><span className="text-xs text-[#71717a]">{attachments.length} files</span></div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {isInstructor ? <><input ref={inputRef} type="file" multiple className="sr-only" onChange={onUpload} aria-label="Upload lesson attachments" /><button onClick={() => inputRef.current?.click()} className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-[12px] border border-dashed border-[#4a4a55] bg-[#111114] px-4 text-sm font-medium text-[#d4d4d8] hover:border-[#5ab4ff] hover:bg-[#0091ff]/5 ${focusRing}`}><Upload className="size-4" aria-hidden />Upload images, PDFs, or files</button></> : null}
        {attachments.map((attachment) => (
          <div key={attachment.id} className="flex min-w-0 items-center gap-2 rounded-[12px] border border-[#2b2b32] bg-[#111114] p-2">
            {attachment.mimeType?.startsWith("image/") && attachment.url ? <span className="size-10 shrink-0 rounded-[8px] bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(attachment.url)})` }} /> : <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#1b1b20]"><UploadedFileIcon mimeType={attachment.mimeType} /></span>}
            {attachment.url ? <a href={attachment.url} target="_blank" rel="noreferrer" className={`min-w-0 flex-1 rounded-md ${focusRing}`}><span className="block truncate text-sm font-medium text-[#d4d4d8]">{attachment.name}</span><span className="mt-0.5 block text-[11px] text-[#71717a]">{formatFileSize(attachment.size)} · Open file</span></a> : <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-[#8f8f99]">{attachment.name}</span><span className="mt-0.5 block text-[11px] text-[#5f5f68]">{formatFileSize(attachment.size)}</span></span>}
            {isInstructor ? <button onClick={() => onDelete(attachment)} className={`inline-flex size-9 shrink-0 items-center justify-center rounded-[9px] text-[#71717a] hover:bg-red-500/10 hover:text-red-300 ${focusRing}`} aria-label={`Remove ${attachment.name}`}><Trash2 className="size-3.5" aria-hidden /></button> : null}
          </div>
        ))}
        {!attachments.length && !isInstructor ? <p className="text-sm text-[#71717a]">No files attached to this lesson.</p> : null}
      </div>
    </section>
  );
}
