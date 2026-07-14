"use client";

import { ExternalLink, FileText, ImageIcon, Video } from "lucide-react";

export interface ClassroomAttachmentMedia {
  mimeType?: string;
  url?: string;
}

export interface ClassroomLessonMedia {
  attachments?: ClassroomAttachmentMedia[];
  embedUrl?: string;
  pdfUrl?: string;
  videoUrl?: string;
}

export interface ClassroomCourseMedia {
  image?: string;
  chapters: Array<{ lessons: ClassroomLessonMedia[] }>;
}

export interface PlayableMedia {
  kind: "frame" | "video";
  url: string;
}

type ThumbnailSource = {
  kind: "embed" | "image" | "pdf" | "video";
  url: string;
};

function extractSource(value: string): string {
  const trimmed = value.trim();
  const iframeSource = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1];
  return (iframeSource ?? trimmed).replaceAll("&amp;", "&");
}

function parseSafeUrl(value: string, allowRelative = false): URL | null {
  const source = extractSource(value);
  if (!source) return null;
  if (allowRelative && source.startsWith("/") && !source.startsWith("//")) {
    return new URL(source, "https://classroom.local");
  }

  try {
    const url = new URL(source);
    const localDevelopmentUrl = url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
    return url.protocol === "https:" || url.protocol === "blob:" || localDevelopmentUrl ? url : null;
  } catch {
    return null;
  }
}

function youtubeId(url: URL): string {
  if (url.hostname === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] ?? "";
  if (url.hostname.includes("youtube.com") || url.hostname === "www.youtube-nocookie.com") {
    if (url.searchParams.get("v")) return url.searchParams.get("v") ?? "";
    const parts = url.pathname.split("/").filter(Boolean);
    const marker = parts.findIndex((part) => ["embed", "shorts", "live"].includes(part));
    return marker >= 0 ? parts[marker + 1] ?? "" : "";
  }
  return "";
}

function withAutoplay(url: URL, autoplay: boolean): string {
  if (autoplay) url.searchParams.set("autoplay", "1");
  else url.searchParams.delete("autoplay");
  return url.toString();
}

export function normalizeEmbedUrl(value: string, autoplay = false): string {
  const url = parseSafeUrl(value);
  if (!url) return "";

  const youTubeVideoId = youtubeId(url);
  if (youTubeVideoId) {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youTubeVideoId)}${autoplay ? "?autoplay=1" : ""}`;
  }

  if (url.hostname === "vimeo.com") {
    const videoId = url.pathname.split("/").filter(Boolean)[0];
    return videoId ? `https://player.vimeo.com/video/${encodeURIComponent(videoId)}${autoplay ? "?autoplay=1" : ""}` : "";
  }

  if (url.hostname === "www.loom.com" && url.pathname.startsWith("/share/")) {
    url.pathname = url.pathname.replace("/share/", "/embed/");
  }

  return withAutoplay(url, autoplay);
}

export function getPlayableVideo(value: string, autoplay = false): PlayableMedia | null {
  const url = parseSafeUrl(value);
  if (!url) return null;
  const directVideo = url.protocol === "blob:" || /\.(mp4|m4v|webm|ogv|mov)(?:$|\?)/i.test(url.toString());
  return directVideo
    ? { kind: "video", url: url.toString() }
    : { kind: "frame", url: normalizeEmbedUrl(value, autoplay) };
}

export function normalizeImageUrl(value: string): string {
  const source = extractSource(value);
  if (source.startsWith("data:image/")) return source;
  const url = parseSafeUrl(source, true);
  if (!url) return "";
  return source.startsWith("/") ? source : url.toString();
}

export function normalizePdfUrl(value: string): string {
  const url = parseSafeUrl(value, true);
  if (!url) return "";
  const source = extractSource(value);
  return source.startsWith("/") ? source : url.toString();
}

function videoThumbnail(value: string): ThumbnailSource | null {
  const url = parseSafeUrl(value);
  if (!url) return null;
  const youTubeVideoId = youtubeId(url);
  if (youTubeVideoId) {
    return { kind: "image", url: `https://i.ytimg.com/vi/${encodeURIComponent(youTubeVideoId)}/hqdefault.jpg` };
  }
  const media = getPlayableVideo(value);
  if (!media) return null;
  return { kind: media.kind === "video" ? "video" : "embed", url: media.url };
}

export function getCourseThumbnail(course: ClassroomCourseMedia): ThumbnailSource | null {
  const customImage = course.image ? normalizeImageUrl(course.image) : "";
  if (customImage) return { kind: "image", url: customImage };

  const lessons = course.chapters.flatMap((chapter) => chapter.lessons);
  const lessonWithVideo = lessons.find((lesson) => lesson.videoUrl && getPlayableVideo(lesson.videoUrl));
  if (lessonWithVideo?.videoUrl) return videoThumbnail(lessonWithVideo.videoUrl);

  const lessonWithEmbed = lessons.find((lesson) => lesson.embedUrl && normalizeEmbedUrl(lesson.embedUrl));
  if (lessonWithEmbed?.embedUrl) return { kind: "embed", url: normalizeEmbedUrl(lessonWithEmbed.embedUrl) };

  const lessonPdf = lessons.find((lesson) => lesson.pdfUrl && normalizePdfUrl(lesson.pdfUrl))?.pdfUrl;
  if (lessonPdf) return { kind: "pdf", url: normalizePdfUrl(lessonPdf) };

  const attachmentPdf = lessons.flatMap((lesson) => lesson.attachments ?? []).find((attachment) => attachment.mimeType === "application/pdf" && attachment.url)?.url;
  return attachmentPdf ? { kind: "pdf", url: normalizePdfUrl(attachmentPdf) } : null;
}

function previewUrl(url: string): string {
  return `${url}${url.includes("#") ? "&" : "#"}page=1&toolbar=0&navpanes=0&scrollbar=0`;
}

export function CourseThumbnail({ course, className = "" }: { course: ClassroomCourseMedia; className?: string }) {
  const source = getCourseThumbnail(course);

  if (!source) {
    return (
      <span className={`absolute inset-0 grid place-items-center bg-[#111114] text-center ${className}`}>
        <span>
          <ImageIcon className="mx-auto size-7 text-[#52525b]" aria-hidden />
          <span className="mt-2 block text-xs font-semibold text-[#a1a1aa]">Thumbnail required</span>
          <span className="mt-1 block text-[11px] text-[#5f5f68]">Add an image, video, website, or PDF</span>
        </span>
      </span>
    );
  }

  if (source.kind === "image") {
    return <span className={`absolute inset-0 bg-cover bg-center ${className}`} style={{ backgroundImage: `url(${JSON.stringify(source.url)})` }} />;
  }

  if (source.kind === "video") {
    return <video src={source.url} muted playsInline preload="metadata" onLoadedMetadata={(event) => { event.currentTarget.currentTime = Math.min(0.1, event.currentTarget.duration || 0.1); }} className={`absolute inset-0 size-full object-cover ${className}`} />;
  }

  return (
    <span className={`absolute inset-0 bg-[#111114] ${className}`}>
      <iframe
        src={source.kind === "pdf" ? previewUrl(source.url) : source.url}
        title="Course media thumbnail"
        tabIndex={-1}
        loading="lazy"
        aria-hidden="true"
        sandbox={source.kind === "embed" ? "allow-forms allow-popups allow-presentation allow-same-origin allow-scripts" : undefined}
        className="pointer-events-none size-full border-0"
      />
      <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/70 px-2.5 py-1.5 text-[10px] font-semibold text-white">
        {source.kind === "pdf" ? <FileText className="size-3" aria-hidden /> : <ExternalLink className="size-3" aria-hidden />}
        {source.kind === "pdf" ? "PDF preview" : "Website preview"}
      </span>
    </span>
  );
}

export function UploadedFileIcon({ mimeType }: { mimeType?: string }) {
  if (mimeType?.startsWith("image/")) return <ImageIcon className="size-4 text-[#5ab4ff]" aria-hidden />;
  if (mimeType === "application/pdf") return <FileText className="size-4 text-[#5ab4ff]" aria-hidden />;
  if (mimeType?.startsWith("video/")) return <Video className="size-4 text-[#5ab4ff]" aria-hidden />;
  return <FileText className="size-4 text-[#5ab4ff]" aria-hidden />;
}
