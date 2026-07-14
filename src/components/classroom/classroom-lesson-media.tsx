"use client";

import { ExternalLink, FileText, PictureInPicture2, Play, Trash2, Upload, Video } from "lucide-react";
import type { ChangeEvent, RefObject } from "react";

import {
  CourseThumbnail,
  getPlayableVideo,
  normalizeEmbedUrl,
  normalizePdfUrl,
  type ClassroomCourseMedia,
  type PlayableMedia,
} from "@/components/classroom/classroom-media";

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]";

interface LessonMediaData {
  embedUrl?: string;
  kind: string;
  pdfName?: string;
  pdfUrl?: string;
  title: string;
  videoName?: string;
  videoUrl?: string;
}

interface LessonMediaPanelProps {
  course: ClassroomCourseMedia;
  isInstructor: boolean;
  lesson: LessonMediaData;
  onChange: (changes: Partial<Omit<LessonMediaData, "kind" | "title">>) => void;
  onDeletePdf: () => void;
  onDeleteVideo: () => void;
  onFloatVideo: (media: PlayableMedia) => void;
  onPdfUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onVideoUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  pdfInputRef: RefObject<HTMLInputElement | null>;
  setVideoPlaying: (playing: boolean) => void;
  videoInputRef: RefObject<HTMLInputElement | null>;
  videoPlaying: boolean;
}

export function LessonMediaPanel({
  course,
  isInstructor,
  lesson,
  onChange,
  onDeletePdf,
  onDeleteVideo,
  onFloatVideo,
  onPdfUpload,
  onVideoUpload,
  pdfInputRef,
  setVideoPlaying,
  videoInputRef,
  videoPlaying,
}: LessonMediaPanelProps) {
  const playableVideo = lesson.videoUrl ? getPlayableVideo(lesson.videoUrl, true) : null;
  const playableEmbedUrl = lesson.embedUrl ? normalizeEmbedUrl(lesson.embedUrl) : "";
  const playablePdfUrl = lesson.pdfUrl ? normalizePdfUrl(lesson.pdfUrl) : "";

  if (lesson.kind === "Multimedia") {
    return (
      <>
        {isInstructor ? (
          <div className="mt-7 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <label className="block text-xs font-medium text-[#8f8f99]">
              Video URL <span className="font-normal text-[#5f5f68]">YouTube, Vimeo, Loom, or a direct video file</span>
              <input type="text" value={lesson.videoName ? "" : lesson.videoUrl ?? ""} onChange={(event) => { onChange({ videoName: undefined, videoUrl: event.target.value }); setVideoPlaying(false); }} placeholder={lesson.videoName ?? "https://youtube.com/watch?v=..."} aria-invalid={Boolean(lesson.videoUrl && !playableVideo)} className={`mt-2 h-11 w-full rounded-[11px] border border-[#303038] bg-[#111114] px-4 text-sm text-white placeholder:text-[#52525b] ${focusRing}`} />
            </label>
            <input ref={videoInputRef} type="file" accept="video/*" className="sr-only" onChange={onVideoUpload} aria-label="Upload lesson video" />
            <button onClick={() => videoInputRef.current?.click()} className={`inline-flex h-11 items-center justify-center gap-2 rounded-[11px] border border-[#34343c] px-4 text-sm font-semibold text-[#d4d4d8] hover:border-[#5ab4ff] hover:bg-[#0091ff]/5 ${focusRing}`}><Upload className="size-4" aria-hidden />Upload video</button>
            {lesson.videoUrl && !playableVideo ? <p className="text-xs text-red-300 md:col-span-2">Use a secure HTTPS URL, supported embed, or uploaded video file.</p> : null}
          </div>
        ) : null}
        <div className="mt-4 overflow-hidden rounded-[16px] border border-[#24242b] bg-black">
          <div className="relative aspect-video">
            {playableVideo && videoPlaying ? playableVideo.kind === "video" ? (
              <video src={playableVideo.url} title={lesson.title} controls autoPlay playsInline className="absolute inset-0 size-full" />
            ) : (
              <iframe src={playableVideo.url} title={lesson.title} className="absolute inset-0 size-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : playableVideo ? (
              <button onClick={() => setVideoPlaying(true)} className={`group absolute inset-0 size-full overflow-hidden text-left ${focusRing}`} aria-label={`Play ${lesson.title}`}>
                <CourseThumbnail course={course} className="opacity-40" />
                <span aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.72)_75%)]" />
                <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-black/50 px-3 py-2 font-mono text-[11px] text-[#d4d4d8]"><span className="size-2 rounded-full bg-[#5ab4ff]" />Video lesson preview</span>
                <span className="absolute inset-0 grid place-items-center"><span className="grid size-20 place-items-center rounded-full bg-white text-black transition-transform duration-150 group-hover:scale-105"><Play className="ml-1 size-7 fill-current" aria-hidden /></span></span>
              </button>
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-[#0d0d10] text-center"><div><Video className="mx-auto size-7 text-[#52525b]" aria-hidden /><p className="mt-3 text-sm font-medium text-[#a1a1aa]">Add a video URL or file</p><p className="mt-1 text-xs text-[#5f5f68]">YouTube, Vimeo, Loom, MP4, and WebM are supported.</p></div></div>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {playableVideo ? <button onClick={() => onFloatVideo(playableVideo)} className={`inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#0091ff]/40 bg-[#0091ff]/10 px-3 text-xs font-semibold text-[#b8ddff] hover:bg-[#0091ff]/15 ${focusRing}`}><PictureInPicture2 className="size-3.5" aria-hidden />Keep playing</button> : null}
          {isInstructor && lesson.videoUrl ? <button onClick={onDeleteVideo} className={`inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#34343c] px-3 text-xs font-semibold text-[#d4d4d8] hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 ${focusRing}`}><Trash2 className="size-3.5" aria-hidden />Delete video</button> : null}
        </div>
      </>
    );
  }

  if (lesson.kind === "Embed") {
    return (
      <section className="mt-8">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5ab4ff]">Interactive embed</p><h2 className="mt-1 text-xl font-semibold text-white">Embedded website or resource</h2></div>
        {isInstructor ? <label className="mt-4 block text-xs font-medium text-[#8f8f99]">Website URL or iframe code<textarea rows={2} value={lesson.embedUrl ?? ""} onChange={(event) => onChange({ embedUrl: event.target.value })} placeholder="https://example.com or <iframe src=...>" aria-invalid={Boolean(lesson.embedUrl && !playableEmbedUrl)} className={`mt-2 w-full resize-y rounded-[11px] border border-[#303038] bg-[#111114] px-4 py-3 text-sm text-white placeholder:text-[#52525b] ${focusRing}`} /></label> : null}
        {lesson.embedUrl && !playableEmbedUrl ? <p className="mt-2 text-xs text-red-300">Use a valid HTTPS website URL or iframe snippet.</p> : null}
        <div className="mt-4 aspect-video overflow-hidden rounded-[16px] border border-[#24242b] bg-[#0d0d10]">
          {playableEmbedUrl ? <iframe src={playableEmbedUrl} title={lesson.title} className="size-full" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-downloads allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts" allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture" allowFullScreen /> : <div className="grid size-full place-items-center px-6 text-center text-sm text-[#71717a]">Add any embeddable HTTPS website, video, form, document, or interactive resource.</div>}
        </div>
        {playableEmbedUrl ? <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[#71717a]">Some websites block embedding. Use the direct link if the preview stays blank.</p><a href={playableEmbedUrl} target="_blank" rel="noreferrer" className={`inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#34343c] px-3 text-xs font-semibold text-[#d4d4d8] hover:bg-[#18181d] ${focusRing}`}><ExternalLink className="size-3.5" aria-hidden />Open website</a></div> : null}
      </section>
    );
  }

  if (lesson.kind !== "PDF") return null;

  return (
    <section className="mt-8">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5ab4ff]">Document lesson</p><h2 className="mt-1 text-xl font-semibold text-white">PDF viewer</h2></div>
      {isInstructor ? <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"><label className="block text-xs font-medium text-[#8f8f99]">PDF URL<input type="text" value={lesson.pdfName ? "" : lesson.pdfUrl ?? ""} onChange={(event) => onChange({ pdfName: undefined, pdfUrl: event.target.value })} placeholder={lesson.pdfName ?? "https://example.com/guide.pdf"} aria-invalid={Boolean(lesson.pdfUrl && !playablePdfUrl)} className={`mt-2 h-11 w-full rounded-[11px] border border-[#303038] bg-[#111114] px-4 text-sm text-white placeholder:text-[#52525b] ${focusRing}`} /></label><input ref={pdfInputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={onPdfUpload} aria-label="Upload lesson PDF" /><button onClick={() => pdfInputRef.current?.click()} className={`inline-flex h-11 items-center justify-center gap-2 rounded-[11px] border border-[#34343c] px-4 text-sm font-semibold text-[#d4d4d8] hover:border-[#5ab4ff] hover:bg-[#0091ff]/5 ${focusRing}`}><Upload className="size-4" aria-hidden />Upload PDF</button></div> : null}
      {lesson.pdfUrl && !playablePdfUrl ? <p className="mt-2 text-xs text-red-300">Use a valid HTTPS PDF URL or upload a PDF file.</p> : null}
      {playablePdfUrl ? <><div className="mt-4 h-[min(72dvh,760px)] min-h-[440px] overflow-hidden rounded-[16px] border border-[#24242b] bg-[#e8e8e8]"><iframe src={playablePdfUrl} title={lesson.title} className="size-full" /></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="min-w-0 truncate text-xs text-[#71717a]">{lesson.pdfName ?? "PDF document"}</p><div className="flex gap-2"><a href={playablePdfUrl} target="_blank" rel="noreferrer" className={`inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#34343c] px-3 text-xs font-semibold text-[#d4d4d8] hover:bg-[#18181d] ${focusRing}`}><ExternalLink className="size-3.5" aria-hidden />Open PDF</a>{isInstructor ? <button onClick={onDeletePdf} className={`inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#34343c] px-3 text-xs font-semibold text-[#d4d4d8] hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 ${focusRing}`}><Trash2 className="size-3.5" aria-hidden />Delete</button> : null}</div></div></> : <div className="mt-4 rounded-[16px] border border-dashed border-[#35353e] bg-[#101014] px-6 py-12 text-center"><FileText className="mx-auto size-8 text-[#5ab4ff]" aria-hidden /><h3 className="mt-4 text-lg font-semibold text-white">Add a PDF</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8f8f99]">Upload a file or paste a secure PDF URL. Its first page becomes the course thumbnail when no image, video, or website is available.</p></div>}
    </section>
  );
}
