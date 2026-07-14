"use client";

import {
  ArrowLeft,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  Code2,
  Copy,
  ExternalLink,
  FileText,
  GraduationCap,
  GripVertical,
  Link2,
  Menu,
  Minimize2,
  MoreHorizontal,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  Video,
  PictureInPicture2,
  X,
} from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import {
  CourseThumbnail,
  getCourseThumbnail,
  normalizeImageUrl,
  type PlayableMedia,
} from "@/components/classroom/classroom-media";
import { ClassroomAttachments } from "@/components/classroom/classroom-attachments";
import { LessonMediaPanel } from "@/components/classroom/classroom-lesson-media";

type Role = "instructor" | "student";
type View = "dashboard" | "lesson" | "quiz";
type LessonKind = "Multimedia" | "PDF" | "Quiz" | "Embed" | "Code";

interface QuizQuestion {
  prompt: string;
  options: string[];
  correct: number;
}

interface Attachment {
  id: string;
  mimeType?: string;
  name: string;
  size?: number;
  url?: string;
}

interface Lesson {
  id: string;
  title: string;
  kind: LessonKind;
  duration?: string;
  videoName?: string;
  videoUrl?: string;
  embedUrl?: string;
  pdfName?: string;
  pdfUrl?: string;
  code?: string;
  language?: string;
  description: string;
  summary: string;
  sop: string;
  transcript?: string;
  attachments: Attachment[];
  quiz?: QuizQuestion[];
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  badge: string;
  image: string;
  duration: string;
  chapters: Chapter[];
}

export const CLASSROOM_PREVIEW_SIZE = { width: 1440, height: 960 } as const;

const DEMO_VIDEO = "https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?autoplay=1";
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]";
const iconButton = `inline-flex size-9 items-center justify-center rounded-[10px] border border-[#292930] bg-[#111114] text-[#a1a1aa] transition-[color,background-color,border-color] duration-150 hover:border-[#3a3a44] hover:bg-[#18181d] hover:text-white ${focusRing}`;

const quizQuestions: QuizQuestion[] = [
  {
    prompt: "Which file declares a FiveM resource and its scripts?",
    options: ["server.cfg", "fxmanifest.lua", "package.json", "resource.lock"],
    correct: 1,
  },
  {
    prompt: "Where should trusted game-state validation run?",
    options: ["Only in the NUI", "On every client", "On the server", "Inside CSS"],
    correct: 2,
  },
  {
    prompt: "What does Citizen.Wait(0) do inside a Lua thread?",
    options: ["Stops the resource", "Yields until the next game tick", "Waits one second", "Clears all events"],
    correct: 1,
  },
];

const makeLesson = (id: string, title: string, kind: LessonKind, duration?: string): Lesson => ({
  id,
  title,
  kind,
  duration,
  videoUrl: kind === "Multimedia" ? DEMO_VIDEO : undefined,
  embedUrl: kind === "Embed" ? DEMO_VIDEO : undefined,
  code: kind === "Code" ? "RegisterCommand('hello', function()\n  print('Hello from FiveM')\nend, false)" : undefined,
  language: kind === "Code" ? "lua" : undefined,
  description: "Learn the concept, follow the implementation, then prove it inside a running FiveM resource.",
  summary: "A practical walkthrough focused on the decisions you need to repeat in your own server.",
  sop: "1. Watch the lesson once without pausing.\n2. Rebuild the example in a clean resource.\n3. Test the client and server behavior.\n4. Record what changed and why.",
  transcript: kind === "Multimedia" ? "Transcript sample: Today we will connect the resource manifest, client script and server script into one predictable workflow." : undefined,
  attachments: kind === "Multimedia" ? [
    { id: `${id}-slides`, name: "Class presentation.pdf" },
    { id: `${id}-notes`, name: "Lua notes.txt" },
  ] : [],
  quiz: kind === "Quiz" ? quizQuestions : undefined,
});

const initialCourses: Course[] = [
  {
    id: "lua-zero-to-hero",
    title: "Master LUA: Zero to Hero",
    description: "Build production-ready FiveM resources with a clear client-server mental model.",
    badge: "LUA · ZERO TO HERO",
    image: "/images/school/track-lua-workshop.jpg",
    duration: "7h 37m",
    chapters: [
      { id: "lua-ch-1", title: "Foundations", lessons: [makeLesson("lua-1", "Introduction to FiveM & Basic Lua", "Multimedia", "38m"), makeLesson("lua-2", "Your first resource", "PDF"), makeLesson("lua-q1", "Test your knowledge", "Quiz")] },
      { id: "lua-ch-2", title: "Client and server", lessons: [makeLesson("lua-3", "Events without guesswork", "Multimedia", "44m"), makeLesson("lua-4", "Scopes and state guide", "PDF"), makeLesson("lua-q2", "Client-server checkpoint", "Quiz")] },
      { id: "lua-ch-3", title: "Production patterns", lessons: [makeLesson("lua-5", "Commands, callbacks & exports", "Multimedia", "52m"), makeLesson("lua-6", "Resource security checklist", "PDF")] },
      { id: "lua-ch-4", title: "Ship your resource", lessons: [makeLesson("lua-7", "Package, test and release", "Multimedia", "1h 06m")] },
    ],
  },
  {
    id: "ui-ux-fivem",
    title: "FiveM UI/UX Systems",
    description: "Design readable HUDs, menus and NUI flows that feel at home inside the game.",
    badge: "NUI · INTERFACE LAB",
    image: "/images/school/track-server-citadel.jpg",
    duration: "9h 08m",
    chapters: [
      { id: "ui-ch-1", title: "Interface foundations", lessons: [makeLesson("ui-1", "Designing for play", "Multimedia", "42m"), makeLesson("ui-2", "HUD hierarchy", "PDF"), makeLesson("ui-q1", "Interface checkpoint", "Quiz")] },
      { id: "ui-ch-2", title: "NUI workflow", lessons: [makeLesson("ui-3", "From browser to resource", "Multimedia", "58m"), makeLesson("ui-4", "Focus and callbacks", "PDF")] },
      { id: "ui-ch-3", title: "Design systems", lessons: [makeLesson("ui-5", "Tokens for game UI", "Multimedia", "51m"), makeLesson("ui-6", "Component inventory", "PDF"), makeLesson("ui-q2", "System checkpoint", "Quiz")] },
      { id: "ui-ch-4", title: "Interaction", lessons: [makeLesson("ui-7", "Motion with purpose", "Multimedia", "46m"), makeLesson("ui-8", "Accessible controls", "PDF")] },
      { id: "ui-ch-5", title: "Delivery", lessons: [makeLesson("ui-9", "QA inside FiveM", "Multimedia", "1h 02m"), makeLesson("ui-q3", "Final assessment", "Quiz")] },
    ],
  },
  {
    id: "mapping-blender",
    title: "Mapping & Blender",
    description: "Move from blockout to an optimized, playable FiveM environment.",
    badge: "WORLD · BLENDER",
    image: "/images/school/track-gameworld-map.jpg",
    duration: "42m",
    chapters: [
      { id: "map-ch-1", title: "Blockout", lessons: [makeLesson("map-1", "A clean mapping workflow", "Multimedia", "24m")] },
      { id: "map-ch-2", title: "Optimization", lessons: [makeLesson("map-2", "Budgets, LODs and collision", "Multimedia", "18m")] },
      { id: "map-ch-3", title: "Publishing", lessons: [] },
    ],
  },
];

function countLessons(course: Course) {
  return course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
}

function kindIcon(kind: LessonKind) {
  if (kind === "Quiz") return CircleHelp;
  if (kind === "PDF") return FileText;
  if (kind === "Code") return Code2;
  if (kind === "Embed") return ExternalLink;
  return Video;
}

function kindLabel(kind: LessonKind) {
  return kind === "Multimedia" ? "Video" : kind;
}

export function ClassroomApp() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [view, setView] = useState<View>("dashboard");
  const [role, setRole] = useState<Role>("instructor");
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourses[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState(initialCourses[0].chapters[0].lessons[0].id);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(initialCourses[0].chapters.map((chapter) => chapter.id)));
  const [courseMenu, setCourseMenu] = useState<string | null>(null);
  const [courseEditor, setCourseEditor] = useState<string | null>(null);
  const [lessonMenu, setLessonMenu] = useState<string | null>(null);
  const [lessonPickerChapter, setLessonPickerChapter] = useState<string | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [floatingVideo, setFloatingVideo] = useState<{ media: PlayableMedia; title: string } | null>(null);
  const [floatingMinimized, setFloatingMinimized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const thumbnailCourseIdRef = useRef<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0];
  const selectedLesson = selectedCourse?.chapters.flatMap((chapter) => chapter.lessons).find((lesson) => lesson.id === selectedLessonId);
  const selectedChapter = selectedCourse?.chapters.find((chapter) => chapter.lessons.some((lesson) => lesson.id === selectedLessonId));
  const orderedLessons = selectedCourse?.chapters.flatMap((chapter) => chapter.lessons) ?? [];
  const selectedLessonIndex = orderedLessons.findIndex((lesson) => lesson.id === selectedLessonId);
  const previousLesson = selectedLessonIndex > 0 ? orderedLessons[selectedLessonIndex - 1] : undefined;
  const nextLesson = selectedLessonIndex >= 0 ? orderedLessons[selectedLessonIndex + 1] : undefined;
  const currentQuiz = selectedLesson?.quiz ?? quizQuestions;
  const selectedAnswer = quizAnswers[quizIndex];
  const quizScore = quizAnswers.reduce((score, answer, index) => score + (answer === currentQuiz[index]?.correct ? 1 : 0), 0);
  const isInstructor = role === "instructor";

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const announce = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const createObjectUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    return url;
  };

  const releaseObjectUrl = (url?: string) => {
    if (!url?.startsWith("blob:")) return;
    URL.revokeObjectURL(url);
    objectUrlsRef.current = objectUrlsRef.current.filter((item) => item !== url);
  };

  const updateCourse = (courseId: string, updater: (course: Course) => Course) => {
    setCourses((current) => current.map((course) => course.id === courseId ? updater(course) : course));
  };

  const updateSelectedLesson = (changes: Partial<Lesson>) => {
    if (!selectedCourse || !selectedLesson) return;
    updateCourse(selectedCourse.id, (course) => ({
      ...course,
      chapters: course.chapters.map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.map((lesson) => lesson.id === selectedLesson.id ? { ...lesson, ...changes } : lesson),
      })),
    }));
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizAnswers([]);
    setQuizComplete(false);
  };

  const openCourse = (course: Course) => {
    const firstLesson = course.chapters.flatMap((chapter) => chapter.lessons)[0];
    setSelectedCourseId(course.id);
    setExpanded(new Set(course.chapters.map((chapter) => chapter.id)));
    if (firstLesson) {
      setSelectedLessonId(firstLesson.id);
      setView(firstLesson.kind === "Quiz" ? "quiz" : "lesson");
    }
    setCourseMenu(null);
    setVideoPlaying(false);
  };

  const selectLesson = (lesson: Lesson) => {
    setSelectedLessonId(lesson.id);
    setView(lesson.kind === "Quiz" ? "quiz" : "lesson");
    setVideoPlaying(false);
    setSidebarOpen(false);
    setLessonMenu(null);
    resetQuiz();
  };

  const addCourse = () => {
    const stamp = Date.now();
    const lesson = makeLesson(`lesson-${stamp}`, "Welcome lesson", "Multimedia", "12m");
    const course: Course = {
      id: `course-${stamp}`,
      title: "Untitled FiveM course",
      description: "Describe the practical outcome students will achieve in this course.",
      badge: "NEW · COURSE",
      image: "",
      duration: "12m",
      chapters: [{ id: `chapter-${stamp}`, title: "Chapter 1", lessons: [lesson] }],
    };
    setCourses((current) => [...current, course]);
    announce("Course added. Edit its details inline.");
  };

  const deleteCourse = (courseId: string) => {
    setCourses((current) => current.filter((course) => course.id !== courseId));
    if (selectedCourseId === courseId) {
      const next = courses.find((course) => course.id !== courseId);
      if (next) setSelectedCourseId(next.id);
    }
    setCourseMenu(null);
    announce("Course deleted");
  };

  const addLesson = (chapterId: string, kind: LessonKind) => {
    if (!selectedCourse) return;
    const titles: Record<LessonKind, string> = { Multimedia: "Untitled video lesson", PDF: "Untitled PDF lesson", Quiz: "Untitled quiz", Embed: "Untitled embed", Code: "Untitled code lab" };
    const lesson = makeLesson(`lesson-${selectedCourse.id}-${countLessons(selectedCourse) + 1}`, titles[kind], kind, kind === "Multimedia" ? "10m" : undefined);
    updateCourse(selectedCourse.id, (course) => ({
      ...course,
      chapters: course.chapters.map((chapter) => chapter.id === chapterId ? { ...chapter, lessons: [...chapter.lessons, lesson] } : chapter),
    }));
    setExpanded((current) => new Set(current).add(chapterId));
    setLessonPickerChapter(null);
    selectLesson(lesson);
    announce(`${kindLabel(kind)} lesson added`);
  };

  const updateQuizQuestion = (questionIndex: number, updater: (question: QuizQuestion) => QuizQuestion) => {
    if (!selectedLesson?.quiz) return;
    const quiz = selectedLesson.quiz.map((question, index) => index === questionIndex ? updater(question) : question);
    updateSelectedLesson({ quiz });
    resetQuiz();
    setQuizIndex(Math.min(questionIndex, quiz.length - 1));
  };

  const deleteLesson = (lessonId: string) => {
    if (!selectedCourse) return;
    const remaining = selectedCourse.chapters.flatMap((chapter) => chapter.lessons).filter((lesson) => lesson.id !== lessonId);
    updateCourse(selectedCourse.id, (course) => ({
      ...course,
      chapters: course.chapters.map((chapter) => ({ ...chapter, lessons: chapter.lessons.filter((lesson) => lesson.id !== lessonId) })),
    }));
    if (selectedLessonId === lessonId && remaining[0]) selectLesson(remaining[0]);
    setLessonMenu(null);
    announce("Lesson deleted");
  };

  const deleteChapter = (chapterId: string) => {
    if (!selectedCourse) return;
    const nextChapters = selectedCourse.chapters.filter((chapter) => chapter.id !== chapterId);
    updateCourse(selectedCourse.id, (course) => ({ ...course, chapters: nextChapters }));
    const nextLesson = nextChapters.flatMap((chapter) => chapter.lessons)[0];
    if (selectedChapter?.id === chapterId && nextLesson) selectLesson(nextLesson);
    announce("Chapter deleted");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      announce("Link copied");
    } catch {
      announce("Copy unavailable in this preview");
    }
  };

  const uploadCourseThumbnail = (event: ChangeEvent<HTMLInputElement>) => {
    const courseId = thumbnailCourseIdRef.current;
    const file = event.target.files?.[0];
    if (!courseId || !file) return;
    if (!file.type.startsWith("image/")) {
      announce("Choose an image file for the course thumbnail");
      event.target.value = "";
      return;
    }
    const url = createObjectUrl(file);
    releaseObjectUrl(courses.find((course) => course.id === courseId)?.image);
    updateCourse(courseId, (course) => ({ ...course, image: url }));
    event.target.value = "";
    announce("Course thumbnail added");
  };

  const uploadLessonVideo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedLesson) return;
    if (!file.type.startsWith("video/")) {
      announce("Choose a video file");
      event.target.value = "";
      return;
    }
    releaseObjectUrl(selectedLesson.videoUrl);
    updateSelectedLesson({ videoName: file.name, videoUrl: createObjectUrl(file) });
    setVideoPlaying(false);
    event.target.value = "";
    announce("Video added");
  };

  const uploadLessonPdf = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedLesson) return;
    if (file.type !== "application/pdf") {
      announce("Choose a PDF file");
      event.target.value = "";
      return;
    }
    releaseObjectUrl(selectedLesson.pdfUrl);
    updateSelectedLesson({ pdfName: file.name, pdfUrl: createObjectUrl(file) });
    event.target.value = "";
    announce("PDF added");
  };

  const uploadAttachments = (event: ChangeEvent<HTMLInputElement>) => {
    if (!selectedCourse || !selectedLesson || !event.target.files?.length) return;
    const files: Attachment[] = Array.from(event.target.files).map((file) => ({
      id: crypto.randomUUID(),
      mimeType: file.type || "application/octet-stream",
      name: file.name,
      size: file.size,
      url: createObjectUrl(file),
    }));
    updateCourse(selectedCourse.id, (course) => ({
      ...course,
      chapters: course.chapters.map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.map((lesson) => lesson.id === selectedLesson.id ? { ...lesson, attachments: [...lesson.attachments, ...files] } : lesson),
      })),
    }));
    event.target.value = "";
    announce(`${files.length} attachment${files.length === 1 ? "" : "s"} added`);
  };

  const deleteAttachment = (attachment: Attachment) => {
    releaseObjectUrl(attachment.url);
    updateSelectedLesson({ attachments: selectedLesson?.attachments.filter((item) => item.id !== attachment.id) ?? [] });
    announce("Attachment removed");
  };

  const chooseAnswer = (answer: number) => {
    if (selectedAnswer !== undefined) return;
    setQuizAnswers((current) => {
      const next = [...current];
      next[quizIndex] = answer;
      return next;
    });
  };

  const sidebar = selectedCourse ? (
    <>
      {sidebarOpen ? <button className="fixed inset-0 z-40 bg-black/65 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close course outline" /> : null}
      <aside className={`${sidebarOpen ? "fixed inset-y-0 left-0 z-50 flex" : "hidden"} w-[min(92vw,360px)] flex-col border-r border-[#1c1c22] bg-[#0d0d10] lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[350px] lg:shrink-0`}>
        <div className="flex h-16 items-center justify-between border-b border-[#1c1c22] px-4">
          <button onClick={() => setView("dashboard")} className={`inline-flex items-center gap-2 text-sm font-medium text-[#a1a1aa] hover:text-white ${focusRing}`}><ArrowLeft className="size-4" aria-hidden />Courses</button>
          <button className={`${iconButton} lg:hidden`} onClick={() => setSidebarOpen(false)} aria-label="Close course outline"><X aria-hidden /></button>
        </div>
        <div className="border-b border-[#1c1c22] px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5ab4ff]">Course outline</p>
          <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-white">{selectedCourse.title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {selectedCourse.chapters.map((chapter, chapterIndex) => {
              const isExpanded = expanded.has(chapter.id);
              return (
                <section key={chapter.id} className="overflow-hidden rounded-[14px] border border-[#24242b] bg-[#101014]">
                  <div className="flex items-center gap-2 border-b border-[#24242b] px-2 py-2.5">
                    <GripVertical className="size-4 shrink-0 text-[#52525b]" aria-hidden />
                    <button onClick={() => setExpanded((current) => { const next = new Set(current); if (next.has(chapter.id)) next.delete(chapter.id); else next.add(chapter.id); return next; })} className={`inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-[#a1a1aa] hover:bg-[#1a1a20] hover:text-white ${focusRing}`} aria-expanded={isExpanded} aria-label={`${isExpanded ? "Collapse" : "Expand"} ${chapter.title}`}><ChevronDown className={`size-4 transition-transform duration-150 ${isExpanded ? "" : "-rotate-90"}`} aria-hidden /></button>
                    {isInstructor ? (
                      <label className="min-w-0 flex-1"><span className="sr-only">Chapter {chapterIndex + 1} title</span><input value={chapter.title} onChange={(event) => updateCourse(selectedCourse.id, (course) => ({ ...course, chapters: course.chapters.map((item) => item.id === chapter.id ? { ...item, title: event.target.value } : item) }))} className={`w-full bg-transparent text-sm font-semibold text-white placeholder:text-[#52525b] ${focusRing}`} /></label>
                    ) : <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{chapter.title}</h3>}
                    {isInstructor ? <>
                      <button className={iconButton} onClick={() => setLessonPickerChapter(lessonPickerChapter === chapter.id ? null : chapter.id)} aria-label={`Add content to ${chapter.title}`} aria-expanded={lessonPickerChapter === chapter.id}><Plus aria-hidden /></button>
                      <button className={iconButton} onClick={() => deleteChapter(chapter.id)} aria-label={`Delete ${chapter.title}`}><Trash2 aria-hidden /></button>
                    </> : null}
                  </div>
                  {lessonPickerChapter === chapter.id ? (
                    <div className="border-b border-[#24242b] bg-[#0d0d10] p-3" onKeyDown={(event) => { if (event.key === "Escape") setLessonPickerChapter(null); }}>
                      <div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8f8f99]">Add content</p><button onClick={() => setLessonPickerChapter(null)} className={`inline-flex size-7 items-center justify-center rounded-lg text-[#71717a] hover:bg-[#202026] hover:text-white ${focusRing}`} aria-label="Close content picker"><X className="size-3.5" aria-hidden /></button></div>
                      <div className="grid grid-cols-2 gap-2">
                        {(["Multimedia", "PDF", "Quiz", "Embed", "Code"] as LessonKind[]).map((kind) => {
                          const KindIcon = kindIcon(kind);
                          return <button key={kind} onClick={() => addLesson(chapter.id, kind)} className={`flex min-h-11 items-center gap-2 rounded-[10px] border border-[#292930] bg-[#151519] px-3 text-left text-xs font-medium text-[#d4d4d8] hover:border-[#0091ff]/45 hover:bg-[#0091ff]/10 hover:text-white ${focusRing}`}><KindIcon className="size-3.5 text-[#5ab4ff]" aria-hidden />{kindLabel(kind)}</button>;
                        })}
                      </div>
                    </div>
                  ) : null}
                  {isExpanded ? (
                    <div className="divide-y divide-[#202026]">
                      {chapter.lessons.length ? chapter.lessons.map((lesson) => {
                        const LessonIcon = kindIcon(lesson.kind);
                        const active = lesson.id === selectedLessonId;
                        return (
                          <div key={lesson.id} className={`group relative flex items-center gap-3 px-3 py-3 ${active ? "bg-[#0091ff]/10" : "hover:bg-[#16161b]"}`}>
                            <GripVertical className="size-4 shrink-0 text-[#45454e]" aria-hidden />
                            <button onClick={() => selectLesson(lesson)} className={`grid size-11 shrink-0 place-items-center overflow-hidden rounded-[10px] border ${active ? "border-[#0091ff]/50 bg-[#0091ff]/15 text-[#82c6ff]" : "border-[#2b2b32] bg-[#18181d] text-[#a1a1aa]"} ${focusRing}`} aria-label={`Open ${lesson.title}`}><LessonIcon className="size-4" aria-hidden /></button>
                            <button onClick={() => selectLesson(lesson)} className={`min-w-0 flex-1 text-left ${focusRing}`}>
                              <span className={`block line-clamp-2 text-[13px] font-medium leading-5 ${active ? "text-white" : "text-[#d4d4d8]"}`}>{lesson.title}</span>
                              <span className="mt-0.5 block text-[11px] text-[#71717a]">{kindLabel(lesson.kind)}{lesson.duration ? ` · ${lesson.duration}` : ""}</span>
                            </button>
                            {isInstructor ? (
                              <div className="relative">
                                <button onClick={() => setLessonMenu(lessonMenu === lesson.id ? null : lesson.id)} className={`inline-flex size-8 items-center justify-center rounded-lg text-[#71717a] hover:bg-[#24242b] hover:text-white ${focusRing}`} aria-label={`Actions for ${lesson.title}`} aria-expanded={lessonMenu === lesson.id}><MoreHorizontal aria-hidden /></button>
                                {lessonMenu === lesson.id ? <div className="absolute right-0 top-9 z-20 w-40 rounded-[12px] border border-[#303038] bg-[#18181d] p-1.5 shadow-xl shadow-black/30">
                                  <button onClick={copyLink} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-[#d4d4d8] hover:bg-[#24242b] ${focusRing}`}><Copy className="size-3.5" aria-hidden />Copy link</button>
                                  <button onClick={() => deleteLesson(lesson.id)} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 ${focusRing}`}><Trash2 className="size-3.5" aria-hidden />Delete lesson</button>
                                </div> : null}
                              </div>
                            ) : null}
                          </div>
                        );
                      }) : <p className="px-4 py-5 text-xs text-[#71717a]">No lessons in this chapter.</p>}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  ) : null;

  const dashboard = (
    <>
      <main className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {isInstructor ? <input ref={thumbnailInputRef} type="file" accept="image/*" className="sr-only" onChange={uploadCourseThumbnail} aria-label="Upload course thumbnail" /> : null}
        <div className="mb-8 flex flex-col gap-5 border-b border-[#1c1c22] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-[11px] border border-[#0091ff]/35 bg-[#0091ff]/10 px-3 py-2 text-sm font-semibold text-[#b8ddff]"><GraduationCap className="size-4" aria-hidden />FiveM Courses</div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">Build skills that survive a live server.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8f8f99]">Create, teach and revisit practical FiveM courses from one focused classroom.</p>
          </div>
          <div className="flex gap-2">
            <button className={iconButton} aria-label="Copy classroom link" onClick={copyLink}><Link2 aria-hidden /></button>
            <button className={iconButton} aria-label="Manage students"><Users aria-hidden /></button>
            <button className={iconButton} aria-label="Course notifications"><Bell aria-hidden /></button>
          </div>
        </div>
        <section aria-label="Course library" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article key={course.id} className="group relative overflow-hidden rounded-[16px] border border-[#23232a] bg-[#101014] transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-[#3b3b46]">
              <button onClick={() => openCourse(course)} className={`relative block aspect-[16/9] w-full overflow-hidden text-left ${focusRing}`} aria-label={`Open ${course.title}`}>
                <CourseThumbnail course={course} className="opacity-75 transition-transform duration-200 group-hover:scale-[1.02]" />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#101014] via-transparent to-black/25" />
                <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-white backdrop-blur-sm">{course.badge}</span>
                <span className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-white text-[#0a0a0c] opacity-0 transition-opacity duration-150 group-hover:opacity-100"><Play className="size-4 fill-current" aria-hidden /></span>
              </button>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  {isInstructor ? <label className="min-w-0 flex-1"><span className="sr-only">Course title</span><input value={course.title} onChange={(event) => updateCourse(course.id, (item) => ({ ...item, title: event.target.value }))} className={`w-full bg-transparent text-lg font-semibold tracking-[-0.02em] text-white ${focusRing}`} /></label> : <h2 className="min-w-0 flex-1 text-lg font-semibold tracking-[-0.02em] text-white">{course.title}</h2>}
                  {isInstructor ? <div className="relative">
                    <button onClick={() => setCourseMenu(courseMenu === course.id ? null : course.id)} className={`inline-flex size-8 items-center justify-center rounded-lg text-[#71717a] hover:bg-[#202026] hover:text-white ${focusRing}`} aria-label={`Actions for ${course.title}`} aria-expanded={courseMenu === course.id}><MoreHorizontal aria-hidden /></button>
                    {courseMenu === course.id ? <div className="absolute right-0 top-9 z-20 w-40 rounded-[12px] border border-[#303038] bg-[#18181d] p-1.5 shadow-xl shadow-black/30">
                      <button onClick={() => openCourse(course)} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-[#d4d4d8] hover:bg-[#24242b] ${focusRing}`}><BookOpen className="size-3.5" aria-hidden />Open course</button>
                      <button onClick={() => { setCourseEditor(courseEditor === course.id ? null : course.id); setCourseMenu(null); }} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-[#d4d4d8] hover:bg-[#24242b] ${focusRing}`}><Code2 className="size-3.5" aria-hidden />Edit details</button>
                      <button onClick={() => deleteCourse(course.id)} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 ${focusRing}`}><Trash2 className="size-3.5" aria-hidden />Delete course</button>
                    </div> : null}
                  </div> : null}
                </div>
                {isInstructor ? <label className="mt-2 block"><span className="sr-only">Course description</span><textarea rows={2} value={course.description} onChange={(event) => updateCourse(course.id, (item) => ({ ...item, description: event.target.value }))} className={`w-full resize-none bg-transparent text-sm leading-6 text-[#a1a1aa] ${focusRing}`} /></label> : <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#a1a1aa]">{course.description}</p>}
                {isInstructor && courseEditor === course.id ? <div className="mt-4 grid gap-3 border-t border-[#28282f] pt-4 sm:grid-cols-2">
                  <label className="text-[11px] font-medium text-[#8f8f99]">Cover label<input value={course.badge} onChange={(event) => updateCourse(course.id, (item) => ({ ...item, badge: event.target.value }))} className={`mt-1 h-9 w-full rounded-[9px] border border-[#303038] bg-[#151519] px-3 text-xs text-white ${focusRing}`} /></label>
                  <label className="text-[11px] font-medium text-[#8f8f99]">Duration<input value={course.duration} onChange={(event) => updateCourse(course.id, (item) => ({ ...item, duration: event.target.value }))} className={`mt-1 h-9 w-full rounded-[9px] border border-[#303038] bg-[#151519] px-3 text-xs text-white ${focusRing}`} /></label>
                  <label className="text-[11px] font-medium text-[#8f8f99] sm:col-span-2">Custom thumbnail URL <span className="font-normal text-[#5f5f68]">Optional</span><input type="text" value={course.image} onChange={(event) => updateCourse(course.id, (item) => ({ ...item, image: event.target.value }))} placeholder="https://example.com/cover.jpg" className={`mt-1 h-9 w-full rounded-[9px] border border-[#303038] bg-[#151519] px-3 text-xs text-white placeholder:text-[#52525b] ${focusRing}`} /></label>
                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    <button onClick={() => { thumbnailCourseIdRef.current = course.id; thumbnailInputRef.current?.click(); }} className={`h-9 rounded-[9px] border border-[#34343c] px-3 text-xs font-semibold text-[#d4d4d8] hover:border-[#5ab4ff] hover:bg-[#0091ff]/5 ${focusRing}`}><Upload className="mr-1.5 inline size-3.5" aria-hidden />Upload image</button>
                    <button disabled={!course.image} onClick={() => { releaseObjectUrl(course.image); updateCourse(course.id, (item) => ({ ...item, image: "" })); announce("Using an automatic course thumbnail"); }} className={`h-9 rounded-[9px] border border-[#34343c] px-3 text-xs font-semibold text-[#a1a1aa] hover:bg-[#202026] disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}>Use automatic</button>
                  </div>
                  <p className={`text-[11px] leading-5 sm:col-span-2 ${getCourseThumbnail(course) ? "text-[#8f8f99]" : "text-red-300"}`}>{getCourseThumbnail(course) ? course.image && normalizeImageUrl(course.image) ? "Using the custom thumbnail. Clear it to use the first video, website, or PDF preview." : "Using the first available video, website, or PDF preview automatically." : "Add a thumbnail or add a video, website, or PDF before finishing."}</p>
                  <button disabled={!getCourseThumbnail(course)} onClick={() => setCourseEditor(null)} className={`h-9 rounded-[9px] bg-[#0091ff] px-3 text-xs font-semibold text-white hover:bg-[#38a8ff] disabled:cursor-not-allowed disabled:opacity-40 sm:col-start-2 ${focusRing}`}>Done editing</button>
                </div> : null}
                <p className="mt-4 text-xs font-medium text-[#71717a]">{course.chapters.length} chapters · {countLessons(course)} lessons · {course.duration}</p>
              </div>
            </article>
          ))}
          {isInstructor ? <button onClick={addCourse} className={`group min-h-[360px] rounded-[16px] border border-dashed border-[#303039] bg-[#0d0d10] p-6 text-[#71717a] transition-[color,border-color,background-color] duration-150 hover:border-[#0091ff]/60 hover:bg-[#0091ff]/5 hover:text-[#b8ddff] ${focusRing}`}>
            <span className="mx-auto grid size-14 place-items-center rounded-[14px] border border-[#2b2b32] bg-[#141418] group-hover:border-[#0091ff]/40"><Plus className="size-5" aria-hidden /></span>
            <span className="mt-4 block text-sm font-semibold">Add course</span>
            <span className="mt-1 block text-xs text-[#5f5f68]">Start with one chapter and lesson</span>
          </button> : null}
        </section>
        {!courses.length ? <div className="rounded-[16px] border border-[#23232a] bg-[#101014] px-6 py-16 text-center"><BookOpen className="mx-auto size-7 text-[#71717a]" aria-hidden /><h2 className="mt-4 font-semibold text-white">No courses published yet</h2><p className="mt-1 text-sm text-[#71717a]">Switch to instructor mode to create the first course.</p></div> : null}
      </main>
    </>
  );

  const contentHeader = (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1c22] px-4 py-3 sm:px-6">
      <div className="flex items-center gap-2">
        <button className={`${iconButton} lg:hidden`} onClick={() => setSidebarOpen(true)} aria-label="Open course outline"><Menu aria-hidden /></button>
        <button onClick={() => setView("dashboard")} className={`inline-flex items-center gap-2 text-sm font-medium text-[#a1a1aa] hover:text-white ${focusRing}`}><ArrowLeft className="size-4" aria-hidden />Back</button>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[#18181d] px-3 text-xs font-medium text-[#8f8f99]"><Check className="size-3.5" aria-hidden />Saved</span>
        <button onClick={copyLink} className={`inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#292930] bg-[#111114] px-3 text-xs font-semibold text-[#d4d4d8] hover:bg-[#18181d] ${focusRing}`}><Copy className="size-3.5" aria-hidden />Copy link</button>
      </div>
    </div>
  );

  const lessonNavigation = (
    <nav className="mt-12 grid gap-3 border-t border-[#24242b] pt-6 sm:grid-cols-2" aria-label="Lesson navigation">
      {previousLesson ? <button onClick={() => selectLesson(previousLesson)} className={`flex min-h-14 items-center gap-3 rounded-[12px] border border-[#292930] bg-[#111114] px-4 text-left hover:border-[#41414b] hover:bg-[#18181d] ${focusRing}`}><ChevronLeft className="size-4 text-[#5ab4ff]" aria-hidden /><span><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717a]">Previous</span><span className="mt-1 line-clamp-1 block text-sm font-medium text-white">{previousLesson.title}</span></span></button> : <span />}
      {nextLesson ? <button onClick={() => selectLesson(nextLesson)} className={`flex min-h-14 items-center justify-between gap-3 rounded-[12px] border border-[#292930] bg-[#111114] px-4 text-left hover:border-[#0091ff]/45 hover:bg-[#0091ff]/5 ${focusRing}`}><span><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5ab4ff]">Next</span><span className="mt-1 line-clamp-1 block text-sm font-medium text-white">{nextLesson.title}</span></span><ChevronLeft className="size-4 rotate-180 text-[#5ab4ff]" aria-hidden /></button> : null}
    </nav>
  );

  const lessonNotes = selectedLesson ? (
    <section className="mt-10 border-t border-[#24242b] pt-8" aria-labelledby="lesson-notes-title">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5ab4ff]">Learning notes</p>
      <h2 id="lesson-notes-title" className="mt-1 text-xl font-semibold text-white">Description, summary and SOP</h2>
      <div className="mt-6 divide-y divide-[#24242b] border-y border-[#24242b]">
        {([
          ["description", "Description", "What this lesson covers and why it matters."],
          ["summary", "Summary", "The key ideas to remember after watching."],
          ["sop", "Standard operating procedure", "The repeatable steps students should follow."],
          ["transcript", "Transcript", "Optional searchable transcript for the video."],
        ] as const).map(([key, label, help]) => (
          <div key={key} className="grid gap-3 py-5 md:grid-cols-[220px_minmax(0,1fr)]">
            <div><h3 className="text-sm font-semibold text-white">{label}</h3><p className="mt-1 text-xs leading-5 text-[#71717a]">{help}</p></div>
            {isInstructor ? <label><span className="sr-only">{label}</span><textarea rows={key === "sop" || key === "transcript" ? 5 : 3} value={selectedLesson[key] ?? ""} onChange={(event) => updateSelectedLesson({ [key]: event.target.value })} placeholder={key === "transcript" ? "No transcript available yet." : `Add ${label.toLowerCase()}`} className={`w-full resize-y rounded-[12px] border border-[#303038] bg-[#111114] px-4 py-3 text-sm leading-6 text-[#d4d4d8] placeholder:text-[#52525b] ${focusRing}`} /></label> : selectedLesson[key] ? <p className="whitespace-pre-line text-sm leading-7 text-[#b5b5bd]">{selectedLesson[key]}</p> : <p className="text-sm italic text-[#71717a]">Not available for this lesson.</p>}
          </div>
        ))}
      </div>
    </section>
  ) : null;

  const lessonView = selectedCourse && selectedLesson ? (
    <>
      <div className="flex min-h-dvh">
        {sidebar}
        <main className="min-w-0 flex-1">
          {contentHeader}
          <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5ab4ff]">{selectedChapter?.title ?? "Course content"}</p>
            {isInstructor ? <label className="mt-2 block"><span className="sr-only">Lesson title</span><input value={selectedLesson.title} onChange={(event) => updateCourse(selectedCourse.id, (course) => ({ ...course, chapters: course.chapters.map((chapter) => ({ ...chapter, lessons: chapter.lessons.map((lesson) => lesson.id === selectedLesson.id ? { ...lesson, title: event.target.value } : lesson) })) }))} className={`w-full bg-transparent text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl ${focusRing}`} /></label> : <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">{selectedLesson.title}</h1>}
            <LessonMediaPanel
              course={selectedCourse}
              isInstructor={isInstructor}
              lesson={selectedLesson}
              onChange={updateSelectedLesson}
              onDeletePdf={() => { releaseObjectUrl(selectedLesson.pdfUrl); updateSelectedLesson({ pdfName: undefined, pdfUrl: undefined }); announce("PDF deleted"); }}
              onDeleteVideo={() => { releaseObjectUrl(selectedLesson.videoUrl); updateSelectedLesson({ videoName: undefined, videoUrl: undefined }); setVideoPlaying(false); announce("Video deleted"); }}
              onFloatVideo={(media) => { setFloatingVideo({ media, title: selectedLesson.title }); setFloatingMinimized(false); setVideoPlaying(false); announce("Video moved to the floating player"); }}
              onPdfUpload={uploadLessonPdf}
              onVideoUpload={uploadLessonVideo}
              pdfInputRef={pdfInputRef}
              setVideoPlaying={setVideoPlaying}
              videoInputRef={videoInputRef}
              videoPlaying={videoPlaying}
            />
            {selectedLesson.kind === "Code" ? <section className="mt-8"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5ab4ff]">Code lab</p><h2 className="mt-1 text-xl font-semibold text-white">Copy-ready snippet</h2></div>{isInstructor ? <label className="text-xs text-[#8f8f99]">Language<input value={selectedLesson.language ?? "lua"} onChange={(event) => updateSelectedLesson({ language: event.target.value })} className={`ml-2 h-9 w-24 rounded-[9px] border border-[#303038] bg-[#111114] px-3 text-xs text-white ${focusRing}`} /></label> : <span className="font-mono text-xs text-[#5ab4ff]">{selectedLesson.language ?? "lua"}</span>}</div>{isInstructor ? <label className="mt-4 block"><span className="sr-only">Code snippet</span><textarea value={selectedLesson.code ?? ""} onChange={(event) => updateSelectedLesson({ code: event.target.value })} rows={14} spellCheck={false} className={`w-full resize-y rounded-[14px] border border-[#303038] bg-[#09090b] p-5 font-mono text-sm leading-6 text-[#d4d4d8] ${focusRing}`} /></label> : <pre className="mt-4 overflow-x-auto rounded-[14px] border border-[#303038] bg-[#09090b] p-5 text-sm leading-6 text-[#d4d4d8]"><code>{selectedLesson.code}</code></pre>}</section> : null}
            {lessonNotes}
            <ClassroomAttachments attachments={selectedLesson.attachments} inputRef={attachmentInputRef} isInstructor={isInstructor} onDelete={deleteAttachment} onUpload={uploadAttachments} />
            {lessonNavigation}
          </div>
        </main>
      </div>
    </>
  ) : null;

  const quizView = selectedCourse && selectedLesson ? (
    <>
      <div className="flex min-h-dvh">
        {sidebar}
        <main className="min-w-0 flex-1">
          {contentHeader}
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
            {isInstructor && currentQuiz[quizIndex] ? <section className="mb-8 rounded-[16px] border border-[#0091ff]/30 bg-[#0091ff]/5 p-5 sm:p-6" aria-labelledby="quiz-builder-title">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5ab4ff]">Instructor tools</p><h1 id="quiz-builder-title" className="mt-1 text-lg font-semibold text-white">Quiz builder</h1></div><div className="flex gap-2"><button onClick={() => { const quiz = [...currentQuiz, { prompt: "New question", options: ["Answer A", "Answer B", "Answer C", "Answer D"], correct: 0 }]; updateSelectedLesson({ quiz }); resetQuiz(); setQuizIndex(quiz.length - 1); }} className={`inline-flex h-9 items-center gap-2 rounded-[9px] border border-[#0091ff]/35 bg-[#0091ff]/10 px-3 text-xs font-semibold text-[#b8ddff] hover:bg-[#0091ff]/15 ${focusRing}`}><Plus className="size-3.5" aria-hidden />Add question</button>{currentQuiz.length > 1 ? <button onClick={() => { const quiz = currentQuiz.filter((_, index) => index !== quizIndex); updateSelectedLesson({ quiz }); resetQuiz(); setQuizIndex(Math.max(0, quizIndex - 1)); }} className={`inline-flex size-9 items-center justify-center rounded-[9px] border border-red-500/30 text-red-300 hover:bg-red-500/10 ${focusRing}`} aria-label="Delete current question"><Trash2 className="size-3.5" aria-hidden /></button> : null}</div></div>
              <label className="mt-5 block text-xs font-medium text-[#a1a1aa]">Question<input value={currentQuiz[quizIndex].prompt} onChange={(event) => updateQuizQuestion(quizIndex, (question) => ({ ...question, prompt: event.target.value }))} className={`mt-2 h-11 w-full rounded-[10px] border border-[#34343c] bg-[#111114] px-4 text-sm text-white ${focusRing}`} /></label>
              <fieldset className="mt-4 space-y-2"><legend className="mb-2 text-xs font-medium text-[#a1a1aa]">Answers <span className="font-normal text-[#71717a]">Select the correct one</span></legend>{currentQuiz[quizIndex].options.map((option, optionIndex) => <label key={`${quizIndex}-${optionIndex}`} className="flex items-center gap-3"><input type="radio" name={`correct-answer-${selectedLesson.id}-${quizIndex}`} checked={currentQuiz[quizIndex].correct === optionIndex} onChange={() => updateQuizQuestion(quizIndex, (question) => ({ ...question, correct: optionIndex }))} className="size-4 accent-[#0091ff]" /><span className="sr-only">Answer {String.fromCharCode(65 + optionIndex)}</span><input value={option} onChange={(event) => updateQuizQuestion(quizIndex, (question) => ({ ...question, options: question.options.map((item, index) => index === optionIndex ? event.target.value : item) }))} aria-label={`Answer ${String.fromCharCode(65 + optionIndex)}`} className={`h-10 min-w-0 flex-1 rounded-[9px] border border-[#303038] bg-[#111114] px-3 text-sm text-[#d4d4d8] ${focusRing}`} /></label>)}</fieldset>
            </section> : null}
            {!quizComplete ? <>
              <div className="mb-10">
                <div className="mb-3 flex items-center justify-between text-xs font-semibold"><span className="uppercase tracking-[0.16em] text-[#5ab4ff]">Test your knowledge</span><span className="text-[#8f8f99]">Question {quizIndex + 1} of {currentQuiz.length}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#202026]"><div className="h-full rounded-full bg-gradient-to-r from-[#0091ff] to-[#0072c6] transition-[width] duration-200" style={{ width: `${((quizIndex + 1) / currentQuiz.length) * 100}%` }} /></div>
              </div>
              <section className="rounded-[16px] border border-[#24242b] bg-[#101014] p-5 sm:p-8">
                <p className="text-xs font-medium text-[#71717a]">Choose one answer</p>
                <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-3xl">{currentQuiz[quizIndex].prompt}</h1>
                <div className="mt-8 space-y-3">
                  {currentQuiz[quizIndex].options.map((option, optionIndex) => {
                    const answered = selectedAnswer !== undefined;
                    const correct = currentQuiz[quizIndex].correct === optionIndex;
                    const selected = selectedAnswer === optionIndex;
                    const state = answered && correct ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-100" : answered && selected ? "border-red-500/60 bg-red-500/10 text-red-100" : "border-[#2a2a32] bg-[#141418] text-[#d4d4d8] hover:border-[#41414b] hover:bg-[#18181d]";
                    return <button key={option} onClick={() => chooseAnswer(optionIndex)} disabled={answered} className={`flex w-full items-center gap-4 rounded-[13px] border p-4 text-left text-sm font-medium transition-[background-color,border-color,color] duration-150 disabled:cursor-default ${state} ${focusRing}`}><span className={`grid size-8 shrink-0 place-items-center rounded-[9px] border text-xs font-bold ${answered && correct ? "border-emerald-500/40 bg-emerald-500/15" : answered && selected ? "border-red-500/40 bg-red-500/15" : "border-[#35353e] bg-[#1c1c22]"}`}>{String.fromCharCode(65 + optionIndex)}</span><span className="flex-1">{option}</span>{answered && correct ? <Check className="size-4" aria-hidden /> : answered && selected ? <X className="size-4" aria-hidden /> : null}</button>;
                  })}
                </div>
                <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#24242b] pt-6">
                  <p className="text-xs text-[#71717a]">{selectedAnswer === undefined ? "Select an option to continue." : selectedAnswer === currentQuiz[quizIndex].correct ? "Correct. Nice work." : "Not quite. The correct answer is highlighted."}</p>
                  <button disabled={selectedAnswer === undefined} onClick={() => { if (quizIndex === currentQuiz.length - 1) setQuizComplete(true); else setQuizIndex((index) => index + 1); }} className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-[11px] bg-gradient-to-r from-[#0091ff] to-[#0072c6] px-4 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}>{quizIndex === currentQuiz.length - 1 ? "Finish" : "Next"}<ChevronLeft className="size-4 rotate-180" aria-hidden /></button>
                </div>
              </section>
            </> : <section className="rounded-[16px] border border-[#2c2c34] bg-[#101014] p-7 text-center sm:p-12">
              <span className="mx-auto grid size-16 place-items-center rounded-[16px] bg-gradient-to-br from-[#0091ff] to-[#0072c6]"><CheckCircle2 className="size-7 text-white" aria-hidden /></span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#5ab4ff]">Quiz complete</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-white">{quizScore} / {currentQuiz.length}</h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#a1a1aa]">{quizScore === currentQuiz.length ? "Perfect score. Your FiveM foundations are ready for the next chapter." : quizScore >= Math.ceil(currentQuiz.length / 2) ? "Good progress. Review the highlighted answers, then try once more." : "Revisit the lesson before another attempt. Focus on manifests, server authority and game ticks."}</p>
              <button onClick={resetQuiz} className={`mt-7 inline-flex h-10 items-center gap-2 rounded-[11px] border border-[#35353e] bg-[#18181d] px-4 text-sm font-semibold text-white hover:bg-[#202026] ${focusRing}`}><RotateCcw className="size-4" aria-hidden />Retry quiz</button>
            </section>}
            {lessonNavigation}
          </div>
        </main>
      </div>
    </>
  ) : null;

  return (
    <div data-preview-size={`${CLASSROOM_PREVIEW_SIZE.width}x${CLASSROOM_PREVIEW_SIZE.height}`} className="dark min-h-dvh bg-[#0a0a0c] text-[#f4f4f5] [font-family:var(--font-classroom),Inter,sans-serif] [color-scheme:dark]">
      {view === "dashboard" ? dashboard : view === "quiz" ? quizView : lessonView}
      {floatingVideo ? <aside className={`fixed bottom-20 right-4 z-[65] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[14px] border border-[#0091ff]/40 bg-[#101014] shadow-2xl shadow-black/60 ${floatingMinimized ? "w-[min(280px,calc(100vw-2rem))]" : ""}`} aria-label="Floating video player">
        <div className="flex h-11 items-center gap-3 border-b border-[#292930] px-3"><span className="size-2 shrink-0 rounded-full bg-[#5ab4ff]" /><p className="min-w-0 flex-1 truncate text-xs font-semibold text-white">{floatingVideo.title}</p><button onClick={() => setFloatingMinimized((current) => !current)} className={`inline-flex size-7 items-center justify-center rounded-lg text-[#a1a1aa] hover:bg-[#202026] hover:text-white ${focusRing}`} aria-label={floatingMinimized ? "Expand floating player" : "Minimize floating player"}>{floatingMinimized ? <PictureInPicture2 className="size-3.5" aria-hidden /> : <Minimize2 className="size-3.5" aria-hidden />}</button><button onClick={() => setFloatingVideo(null)} className={`inline-flex size-7 items-center justify-center rounded-lg text-[#a1a1aa] hover:bg-red-500/10 hover:text-red-300 ${focusRing}`} aria-label="Close floating player"><X className="size-3.5" aria-hidden /></button></div>
        <div className={`bg-black ${floatingMinimized ? "h-0 overflow-hidden" : "aspect-video"}`}>{floatingVideo.media.kind === "video" ? <video src={floatingVideo.media.url} title={`Floating player: ${floatingVideo.title}`} controls autoPlay playsInline className="size-full" /> : <iframe src={floatingVideo.media.url} title={`Floating player: ${floatingVideo.title}`} className="size-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}</div>
      </aside> : null}
      <div className="fixed bottom-4 right-4 z-[70] flex items-center gap-1 rounded-[14px] border border-[#303038] bg-[#141418]/95 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-md" role="group" aria-label="Classroom role">
        <button onClick={() => { setRole("instructor"); setCourseMenu(null); setLessonMenu(null); announce("Instructor mode enabled"); }} aria-label="Instructor mode" aria-pressed={role === "instructor"} className={`inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-xs font-semibold transition-colors duration-150 ${role === "instructor" ? "bg-gradient-to-r from-[#0091ff] to-[#0072c6] text-white" : "text-[#8f8f99] hover:text-white"} ${focusRing}`}><ShieldCheck className="size-3.5" aria-hidden /><span className="hidden sm:inline">Instructor</span></button>
        <button onClick={() => { setRole("student"); setCourseMenu(null); setLessonMenu(null); announce("Student watch-only mode enabled"); }} aria-label="Student mode" aria-pressed={role === "student"} className={`inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-xs font-semibold transition-colors duration-150 ${role === "student" ? "bg-white text-[#0a0a0c]" : "text-[#8f8f99] hover:text-white"} ${focusRing}`}><GraduationCap className="size-3.5" aria-hidden /><span className="hidden sm:inline">Student</span></button>
      </div>
      <div aria-live="polite" className={`fixed right-4 top-20 z-[80] max-w-xs rounded-[12px] border border-[#303038] bg-[#18181d] px-4 py-3 text-xs font-medium text-white shadow-xl transition-opacity duration-150 ${toast ? "opacity-100" : "pointer-events-none opacity-0"}`}>{toast}</div>
    </div>
  );
}
