# Quasar Next Classroom

A standalone classroom interface for creating courses, lessons, quizzes, video resources, website embeds, PDFs, and downloadable attachments.

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Current storage model

The classroom is an interactive frontend prototype. Course edits and locally uploaded files live in the current browser session. Connect a database and object-storage provider before using it as a persistent production classroom.

Some external websites block iframe embedding through their own security headers. The classroom provides a direct-open fallback for those resources.
