# Little Leaf Library

A cozy personal library for your PDF collection. Shelve books in bookcases by category, then read them in a flipbook with pages you can actually turn, plus bookmarks, highlights and comments.

**Live demo:** [link demo]

![Little Leaf Library screenshot](docs/screenshot-library.png)

## Features

**Library room**
- Bookcases for each category, laid out in a room you can slide through with arrows, touchpad or swipe
- Create and edit bookcases with a live preview of the name plate and wood color
- Books appear as spines on the shelves. Spine color is chosen by the user, and thickness follows the page count
- Hovering a spine shows the title, author and reading progress, and clicking it opens the book

**Uploading books**
- Drag and drop a PDF. Title, author and page count are read from the file in the browser
- The server checks the file again before saving it: real PDF signature, size limit and a successful parse
- Files are private. They are only served to their owner through an authenticated route

**Reading**
- Flipbook reader with a custom page turn animation (two pages on desktop, one page on phones)
- Turn pages by dragging the page edge, clicking the arrows or using the keyboard
- The middle of the page stays free for selecting text, so turning and selecting never fight each other
- Zoom and full screen mode
- Reading position is saved automatically, and the book reopens where you left off
- Pages are rendered ahead of time in the background, so turning stays smooth

**Notes**
- Bookmarks with a ribbon on each page
- Highlights in four colors, stored as positions relative to the page so they stay aligned at any zoom level
- Comments attached to highlighted text, shown as small sticky notes on the page
- A Notes panel that lists bookmarks, highlights and comments, each one jumping straight to its page

**Accounts**
- Sign up with username, name, email and password, or continue with Google
- Log in with either email or username
- Google sign ups get a random 10 character username that can be changed later
- Password reset by email
- Profile page with 12 animal avatars (cats, dogs and bunnies)

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL, Prisma 7 |
| Auth | Better Auth (email and password, username plugin, Google OAuth) |
| Email | Resend |
| PDF | pdf.js through react-pdf, pdf-lib for metadata |
| Validation | Zod |
| Local setup | Docker Compose |

## Architecture

```
src/
├── app/
│   ├── (marketing)/        Landing page
│   ├── (auth)/             Log in, sign up, welcome, password reset
│   ├── (app)/              Library, reader and profile (require a session)
│   └── api/                Auth handler, book upload and protected file route
├── components/             UI grouped by feature: library, reader, profile, auth
├── server/                 Server only code: database access, storage, email, session
├── lib/                    Shared logic and Zod schemas used on both sides
└── hooks/                  Small reusable React hooks
```

A few decisions worth pointing out:

- **Server code stays on the server.** Everything in `src/server` imports `server-only`, so database and storage code can never end up in the browser bundle.
- **Every query is scoped to the user.** Reads and writes always filter by `userId`, so one user can never see or change another user's bookcases, books or notes. A book that belongs to someone else returns 404, not 403.
- **Reader logic is pure.** Page math and the page turn layers live in `src/lib/reader.ts` as plain functions, separate from the React components.
- **Optimistic updates.** Bookmarks and highlights update on screen right away and roll back if the server rejects the change.

## Security notes

- Uploaded files are checked by their content (`%PDF-` signature), not by their extension, and parsed again on the server
- Storage keys are resolved against a fixed root folder to block path traversal
- PDF files are served with `private, no-store` and `nosniff` headers
- Passwords are hashed by Better Auth, and all sessions are revoked after a password reset
- Reset emails are sent without waiting for the result, so response time does not reveal which emails have accounts
- All server actions and API routes validate their input with Zod

## Getting started

### Requirements

- Node.js 20 or newer
- Docker Desktop (for the local PostgreSQL database)

### 1. Install

```bash
git clone https://github.com/[username GitHub]/little-leaf-library.git
cd little-leaf-library
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill it in.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. The default matches `docker-compose.yml` |
| `BETTER_AUTH_SECRET` | Random secret, for example from `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `BETTER_AUTH_URL` | Base URL of the app, `http://localhost:3000` in development |
| `GOOGLE_CLIENT_ID` | Optional. Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional. Google OAuth client secret |
| `RESEND_API_KEY` | Optional. Without it, emails are printed to the terminal |
| `EMAIL_FROM` | Sender address for emails |

For Google sign in, create an OAuth client of type **Web application** in Google Cloud Console with:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Database

```bash
npm run db:up
npx prisma migrate dev
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run db:up` | Start PostgreSQL in Docker |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:studio` | Open Prisma Studio to browse the data |

## Keyboard shortcuts in the reader

| Key | Action |
| --- | --- |
| `←` `→` | Turn the page |
| `+` `-` | Zoom in or out |
| `F` | Toggle full screen |
| `B` | Bookmark the current page |
| `N` | Open or close the Notes panel |
| `Esc` | Close menus |
| `Ctrl` + `Enter` | Save a comment |

## How the page turn works

The flipbook does not use a page flip library. Most of them capture drags anywhere on the page, which breaks text selection.

Instead, each turn is one "leaf" with two faces, built with CSS 3D transforms. The front shows the page you are leaving and the back shows the page you are turning to. Underneath the leaf, the destination pages are already in place, so when the leaf finishes rotating the new spread is complete.

Pages are rendered with pdf.js into images a few spreads ahead and cached, so the animation only swaps images that already exist. The selectable text layer is added only to pages that are not moving.

## Roadmap

- [ ] Delete books and bookcases
- [ ] Reorder books and bookcases by dragging
- [ ] Search inside a book
- [ ] Unit tests for `lib/reader.ts` and `lib/highlights.ts`, end to end tests for the reading flow
- [ ] Cloud storage (Cloudflare R2) and deployment to Vercel with Neon

## Author

Made by Desi Maria Elita Silalahi · [GitHub] · [LinkedIn]