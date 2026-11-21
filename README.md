# Little Leaf Library

A cozy personal library for your PDF collection. Shelve books in wooden bookcases, read them in a flipbook with pages you can actually turn, and keep your bookmarks, highlights, comments and new words in one place. A little pet keeps you company while you read.

**Live site:** [littleleaflibrary.my.id](https://littleleaflibrary.my.id)

## Features

**Library room**
- A room of bookcases you can slide through with arrows, touchpad or swipe
- Bookcases with 2 or 3 shelves, a name plate and a wood color, all editable later
- A bookcase grows an extra shelf on its own when its shelves fill up
- Books appear as spines. You pick the spine color, and the thickness follows the page count
- Hover a spine to see the title, author and reading progress, click it to open the book
- Name your library with the sign above the room
- Dialogs open instantly in the browser, and their state lives in the URL so links and the back button still work

**Uploading books**
- Drag and drop a PDF. Title, author and page count are read in the browser
- Files go straight from the browser to storage through a short lived signed URL, with a progress bar
- The server checks the PDF signature, the size limit and the storage quota before a book is shelved
- Shelving is safe to retry, so a slow or repeated request never creates a duplicate or breaks a book
- Each account has 50 MB of shelf space, with a maximum of 20 MB per book
- Files are private and are only served to their owner

**Reading**
- Flipbook reader with a custom page turn animation (two pages on desktop, one page on phones)
- Turn pages by dragging the page edge, clicking the arrows or using the keyboard
- The middle of the page stays free for selecting text, so turning and selecting never fight each other
- Zoom and full screen mode
- Reading position is saved automatically, and the book reopens where you left off
- Pages are rendered ahead of time in the background, so turning stays smooth
- Move a book to another bookcase straight from the reader

**Notes and words**
- Bookmarks with a ribbon on each page
- Highlights in four colors, stored relative to the page so they stay aligned at any zoom level
- Comments attached to highlighted text, shown as small sticky notes on the page
- Translate a selected word or sentence, with dictionary meanings for single words
- Save new words to build your own word list
- A Notes panel that lists bookmarks, highlights, comments and saved words, each one jumping straight to its page

**Your pet**
- A cat, dog or bunny lives in your library room
- It walks, sits, grooms, naps and stretches on its own, and rabbits hop instead of walking
- Pet it to see it react, pet it a few times in a row to make it happy, and toss its toy to play fetch
- Calm mode follows the system "reduce motion" setting and keeps the pet still and quiet

**Accounts**
- Sign up with username, name, email and password, or continue with Google
- Email verification for new accounts
- Log in with either email or username
- Password reset by email
- Profile page with 12 animal avatars, which also choose your pet
- A short welcome tour for new users, with next and back steps
- Delete your account with email confirmation, which also removes all of your files

**Legal**
- Terms of Service and Privacy Policy pages written with Indonesian law (UU PDP, UU ITE, UU Hak Cipta) and the GDPR in mind

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL, Prisma 7 with the `pg` adapter |
| Auth | Better Auth (email and password, username plugin, Google OAuth) |
| Storage | Local disk in development, any S3 compatible storage in production |
| Email | Resend |
| PDF | pdf.js through react-pdf, pdf-lib for metadata |
| Translation | MyMemory API |
| Validation | Zod |
| Local setup | Docker Compose |

## Deployment

The live site runs on:

| Part | Service |
| --- | --- |
| App | Vercel, with functions in Singapore (`sin1`) |
| Database | Neon PostgreSQL, Singapore |
| File storage | Supabase Storage through its S3 protocol, private bucket |
| Email | Resend with a verified domain |

The app, database and storage sit in the same region, which keeps every request close to its data.

## Architecture

```
src/
├── app/
│   ├── (marketing)/        Landing page, Terms and Privacy
│   ├── (auth)/             Log in, sign up, email verification, password reset
│   ├── (app)/              Library, reader and profile (require a session)
│   └── api/                Auth handler, uploads, protected files, storage usage, translation
├── components/             UI grouped by feature: library, reader, profile, auth, onboarding
├── server/                 Server only code: database access, storage, email, rate limits
├── lib/                    Shared logic and Zod schemas used on both sides
└── hooks/                  Small reusable React hooks
```

A few decisions worth pointing out:

- **Server code stays on the server.** Everything in `src/server` imports `server-only`, so database and storage code can never end up in the browser bundle.
- **Every query is scoped to the user.** Reads and writes always filter by `userId`, so one user can never see or change another user's bookcases, books or notes. A book that belongs to someone else returns 404, not 403.
- **One storage interface, two drivers.** The same functions save, copy, read and delete files on local disk or on S3 compatible storage, chosen by `STORAGE_DRIVER`.
- **Uploads skip the app server.** The browser uploads to storage with a signed URL. The server only checks the file and copies it into place, so large books never pass through a serverless function.
- **Reader logic is pure.** Page math and the page turn layers live in `src/lib/reader.ts` as plain functions, separate from the React components.
- **Optimistic updates.** Bookmarks and highlights update on screen right away and roll back if the server rejects the change.

## Security notes

- Uploaded files are checked by their content (`%PDF-` signature), not by their extension
- Upload URLs are signed, expire after a few minutes and only allow a PDF to one exact path
- Storage keys are resolved against a fixed root folder to block path traversal
- PDF files are served with `private, no-store` and `nosniff` headers
- Passwords are hashed by Better Auth, and all sessions are revoked after a password reset
- Sign in, sign up, password reset, verification emails, account deletion, uploads and translation are rate limited
- Auth emails are sent in the background, so response time does not reveal which emails have accounts
- All server actions and API routes validate their input with Zod

## Getting started

### Requirements

- Node.js 20 or newer
- Docker Desktop (for the local PostgreSQL database)

### 1. Install

```bash
git clone https://github.com/rielyta/little-leaf-library.git
cd little-leaf-library
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill it in.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. The example matches `docker-compose.yml` |
| `BETTER_AUTH_SECRET` | Random secret, for example from `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `BETTER_AUTH_URL` | Base URL of the app, `http://localhost:3000` in development |
| `GOOGLE_CLIENT_ID` | Optional. Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional. Google OAuth client secret |
| `RESEND_API_KEY` | Optional. Without it, emails are printed to the terminal |
| `EMAIL_FROM` | Sender address, for example `Little Leaf Library <noreply@your-domain.com>` |
| `MYMEMORY_EMAIL` | Optional. Raises the daily limit of the free translation API |
| `STORAGE_DRIVER` | `local` to keep files in the `storage` folder, or `s3` for cloud storage |
| `S3_ENDPOINT` | S3 endpoint of your storage provider (only for `s3`) |
| `S3_REGION` | Storage region, for example `ap-southeast-1` or `auto` (only for `s3`) |
| `S3_BUCKET` | Name of a private bucket (only for `s3`) |
| `S3_ACCESS_KEY_ID` | Storage access key (only for `s3`) |
| `S3_SECRET_ACCESS_KEY` | Storage secret key (only for `s3`) |
| `UNLIMITED_STORAGE_EMAILS` | Optional. Comma separated emails that have no storage limit once verified |

For Google sign in, create an OAuth client of type **Web application** in Google Cloud Console with:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

Add your production domain to both lists when you deploy.

### 3. Database

```bash
npm run db:up
npm run db:migrate
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
| `npm run db:migrate` | Create and apply a migration in development |
| `npm run db:deploy` | Apply migrations to a production database |
| `npm run db:studio` | Open Prisma Studio to browse the data |

## Keyboard shortcuts in the reader

| Key | Action |
| --- | --- |
| `←` `→` | Turn the page |
| `+` `-` | Zoom in or out |
| `F` | Toggle full screen |
| `B` | Bookmark the current page |
| `N` | Open or close the Notes panel |
| `T` | Translate the selected text |
| `Esc` | Close menus |
| `Ctrl` + `Enter` | Save a comment |

## How the page turn works

The flipbook does not use a page flip library. Most of them capture drags anywhere on the page, which breaks text selection.

Instead, each turn is one "leaf" with two faces, built with CSS 3D transforms. The front shows the page you are leaving and the back shows the page you are turning to. Underneath the leaf, the destination pages are already in place, so when the leaf finishes rotating the new spread is complete.

Pages are rendered with pdf.js into images a few spreads ahead and cached, so the animation only swaps images that already exist. The selectable text layer is added only to pages that are not moving.

## Roadmap

- [x] Delete books and bookcases
- [x] Cloud storage and deployment
- [ ] Better layout on phones
- [ ] Focus mode, background sounds and page color settings in the reader
- [ ] Reorder books and bookcases by dragging
- [ ] Search inside a book
- [ ] EPUB support
- [ ] Unit tests for `lib/reader.ts` and `lib/highlights.ts`, end to end tests for the reading flow

## Contact

Questions, feedback or a security report: [hello@littleleaflibrary.my.id](mailto:hello@littleleaflibrary.my.id)

## Author

Made by Desi Maria Elita Silalahi · [GitHub](https://github.com/rielyta)