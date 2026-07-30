<div align="center">

<img src="./public/logo.svg" width="64" height="64" alt="Buildflow AI logo" />

# Buildflow AI

**Build full‑stack web apps by chatting with an AI agent that writes, runs, and previews real code — live, in an isolated sandbox.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react)](https://react.dev/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?logo=trpc)](https://trpc.io/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io/)
[![Inngest](https://img.shields.io/badge/Inngest-4-7A3EF4)](https://www.inngest.com/)
[![E2B](https://img.shields.io/badge/E2B-Sandboxes-000000)](https://e2b.dev/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth%20%26%20Billing-6C47FF?logo=clerk)](https://clerk.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-unspecified-lightgrey)](#license)

[Overview](#introduction) • [Features](#features) • [Architecture](#architecture-overview) • [Getting Started](#installation) • [AI Agent](#ai-agent-workflow) • [Database](#database) • [API Reference](#api--trpc-reference)

</div>

---

> **Repository:** [github.com/abhijeethkv17/Buildflow-AI](https://github.com/abhijeethkv17/Buildflow-AI)
>
> Buildflow AI is a **Lovable / v0‑style AI app builder**: a user describes what they want in plain English, and a multi‑agent system writes real Next.js code, executes it inside a live E2B sandbox, and streams the result back as a working, clickable preview alongside the generated source files.

<div align="center">
  <img src="screenshots/Home Page.png" alt="Buildflow AI dashboard screenshot" width="100%" />
  <br/>
  <img src="screenshots/Services section.png" alt="Buildflow AI demo screenshot" width="100%" />
  <br/>
  <img src="screenshots/Pricing Page.png" alt="Buildflow AI demo screenshot" width="100%" />
  <br/>
  <img src="screenshots/Generated code.png" alt="Buildflow AI demo screenshot" width="100%" />
  <br/>
  <sub>Demo Screenshots of the home page and the workspace page of Buildflow AI.</sub>
</div>

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [System Design Diagrams](#system-design-diagrams)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API & tRPC Reference](#api--trpc-reference)
- [AI Agent Workflow](#ai-agent-workflow)
- [Authentication & Billing](#authentication--billing)
- [Usage Limits & Credits](#usage-limits--credits)
- [Frontend Architecture](#frontend-architecture)
- [Sandbox Template](#sandbox-template)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Testing](#testing)
- [FAQ](#faq)
- [Acknowledgements](#acknowledgements)
- [License](#license)
- [Author](#author)

---

## Introduction

Buildflow AI turns a single natural‑language prompt into a running web app. Instead of returning a code snippet in a chat bubble, it:

1. Spins up a **real, isolated cloud sandbox** (via [E2B](https://e2b.dev/)) with a pre‑baked Next.js + shadcn/ui environment.
2. Hands the prompt to an **AI coding agent** that has tool access to a terminal, a file writer, and a file reader inside that sandbox.
3. Lets the agent iterate — installing packages, writing files, running commands, reading its own output back — until the app compiles cleanly.
4. Serves the finished app back to the user through a **live iframe preview** and a **file explorer with syntax‑highlighted source**, next to the chat thread that produced it.

**Who it's for:** developers and builders who want to scaffold a working prototype from an idea in seconds, without leaving a chat interface — the same category of product as Lovable, v0, or bolt.new.

**Why it exists:** as a hands‑on systems project to explore agentic code‑generation pipelines end‑to‑end: multi‑agent orchestration ([Inngest Agent Kit](https://agentkit.inngest.com/)), durable background execution ([Inngest](https://www.inngest.com/)), ephemeral compute sandboxes ([E2B](https://e2b.dev/)), and a fully type‑safe full‑stack layer (tRPC + Prisma + Zod) tying it together.

---

## Features

| Feature | What it does | How it works | Why it matters |
|---|---|---|---|
| 💬 **Prompt‑to‑app generation** | Turns a plain‑text description into a working Next.js project | A `code-agent` Inngest function drives an OpenAI‑backed agent with `terminal`, `createOrUpdateFiles`, and `readFiles` tools against a live E2B sandbox | Removes the gap between "idea" and "running code" |
| 🖥️ **Live sandboxed preview** | Every generated app runs in a real browser‑accessible sandbox, not a static render | `FragmentWeb` renders the sandbox's public URL (`sandbox.getHost(3000)`) in an iframe with refresh / copy‑link / open‑in‑new‑tab controls | The output is an actual running server, so navigation, forms, and client interactivity all work |
| 📁 **Generated file explorer** | Every file the agent wrote is browsable and viewable with syntax highlighting | `FileExplorer` + `TreeView` render the `Fragment.files` JSON blob as a collapsible tree; `code-view` uses PrismJS for highlighting | Lets users inspect, copy, or learn from the exact code that was produced |
| 🧵 **Multi‑turn project threads** | Each project is a running conversation — follow‑up prompts refine the same app | `Message` rows are threaded under a `Project`; the agent is seeded with the last 5 messages as conversation history | Supports "now make the button blue" style iteration instead of one‑shot generation |
| 🔁 **Live status polling** | The chat updates automatically while the agent is working in the background | `messages.getMany` is polled client‑side every 2 seconds (`refetchInterval: 2000`) via TanStack Query | Generation runs as a durable Inngest background job (can take longer than an HTTP request), so the UI needs to catch up asynchronously |
| 🤖 **Multi‑agent post‑processing** | A second and third AI pass turn the raw build summary into a friendly chat reply and a short fragment title | `response-generator` and `fragment-title-generator` agents run after the coding agent finishes, each with their own system prompt | Keeps the main coding agent focused purely on code, while presentation is handled by specialized, cheaper prompts |
| 🔐 **Authentication** | Sign‑up / sign‑in, session handling, and route protection | [Clerk](https://clerk.com/) via `clerkMiddleware` in `src/proxy.ts`, with `<Show when="signed-in"/"signed-out">` for conditional UI | Production‑grade auth without hand‑rolling sessions or JWTs |
| 💳 **Plan‑gated billing** | Free vs. Pro plans with different generation quotas | Clerk's `has({ plan: "pro" })` check plus Clerk's hosted `<PricingTable />` on `/pricing` | Lets the product monetize usage without a custom billing/webhook stack |
| ⏳ **Metered usage credits** | Every generation (project creation or follow‑up message) consumes a credit | `rate-limiter-flexible`'s `RateLimiterPrisma`, backed by the `Usage` table, with a 30‑day rolling window (2 free / 100 Pro points) | Caps AI spend per user and creates a natural upsell path to Pro |
| 🌗 **Light / dark theme** | Full app, Clerk widgets, and code viewer all respect the selected theme | `next-themes` `ThemeProvider` + a `useCurrentTheme` hook that also themes Clerk's `appearance` prop | Consistent visual experience regardless of system preference |
| 🧩 **Type‑safe API layer** | Every client‑server call is fully typed, end‑to‑end | tRPC v11 routers (`projects`, `messages`, `usage`) with Zod input validation and a `superjson` transformer | Eliminates a whole class of API contract bugs between client and server |

---

## Architecture Overview

Buildflow AI is a single Next.js 16 application (App Router) that plays three roles at once:

- **Frontend** — React 19 Server & Client Components, styled with Tailwind CSS v4 and a shadcn/ui component set built on Base UI (`@base-ui/react`) rather than Radix primitives.
- **API layer** — a tRPC v11 router mounted at `/api/trpc`, consumed via `@trpc/tanstack-react-query` on the client and a server‑side caller during SSR/prefetch.
- **Background compute layer** — an [Inngest](https://www.inngest.com/) function (`code-agent`) served from `/api/inngest`, which owns all long‑running AI + sandbox work so it never blocks an HTTP request.

Supporting services:

| Layer | Technology | Role |
|---|---|---|
| Database | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`) | Stores projects, messages, generated fragments, and usage counters |
| Auth & Billing | Clerk (`@clerk/nextjs`) | Sign‑in/up, sessions, route protection, plan checks, hosted pricing table |
| AI orchestration | `@inngest/agent-kit` | Defines agents, tools, and a network/router that drives the coding loop |
| LLM inference | OpenAI‑compatible endpoint (`openai` SDK, custom `baseUrl`) | Executes the actual model calls for all three agents |
| Sandboxed execution | E2B (`@e2b/code-interpreter`, `e2b`) | Provides an isolated, internet‑connected VM per project where the agent runs commands and writes files |
| Durable background jobs | Inngest | Retries, step‑functions, and observability for the multi‑minute agent run |

---

## System Design Diagrams

### High‑level component diagram

```mermaid
flowchart LR
    subgraph Client["Browser"]
        UI["Next.js App Router UI\n(React 19 + Tailwind + shadcn)"]
    end

    subgraph Server["Next.js Server"]
        TRPC["tRPC Router\n/api/trpc"]
        INNGEST_EP["Inngest Endpoint\n/api/inngest"]
        MW["Clerk Middleware\nsrc/proxy.ts"]
    end

    subgraph Background["Inngest Cloud"]
        FN["code-agent Function"]
    end

    subgraph AI["AI Layer"]
        AGENT["Coding Agent\n(gpt-4.1-mini)"]
        TITLE["Fragment Title Agent\n(gpt-4o-mini)"]
        RESP["Response Agent\n(gpt-4o-mini)"]
    end

    subgraph Sandbox["E2B Sandbox (per project)"]
        FS["File System"]
        SRV["Next.js Dev Server :3000"]
    end

    DB[("PostgreSQL\nvia Prisma")]
    CLERK["Clerk\n(Auth + Billing)"]

    UI -- "auth session" --> MW
    UI <-- "typed queries/mutations" --> TRPC
    TRPC -- "reads/writes" --> DB
    TRPC -- "send('code-agent/run')" --> INNGEST_EP
    INNGEST_EP --> FN
    FN --> AGENT
    AGENT -- "terminal / createOrUpdateFiles / readFiles" --> FS
    FS --> SRV
    FN --> TITLE
    FN --> RESP
    FN -- "save Message + Fragment" --> DB
    UI -- "poll every 2s" --> TRPC
    UI -- "iframe preview" --> SRV
    MW <--> CLERK
```

### AI generation sequence

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant W as Next.js UI
    participant T as tRPC (projects/messages)
    participant I as Inngest (code-agent)
    participant E as E2B Sandbox
    participant A as Coding Agent (LLM)
    participant P as Prisma / Postgres

    U->>W: Types a prompt ("Build me a kanban board")
    W->>T: projects.create / messages.create
    T->>P: consumeCredits() + create Project/Message
    T->>I: inngest.send("code-agent/run", { value, projectId })
    T-->>W: Returns immediately (job runs async)
    par Background job
        I->>E: Sandbox.create(template)
        I->>P: Fetch last 5 messages for context
        I->>A: network.run(prompt, state)
        loop Up to 15 iterations
            A->>E: terminal / createOrUpdateFiles / readFiles
            E-->>A: command output / file contents
        end
        A-->>I: <task_summary> once finished
        I->>A: fragment-title-generator + response-generator
        I->>E: sandbox.getHost(3000) → public URL
        I->>P: Create ASSISTANT Message + Fragment
    end
    loop Every 2s
        W->>T: messages.getMany (refetchInterval)
        T->>P: query messages + fragment
        T-->>W: New assistant message appears
    end
    W->>U: Renders chat reply + live iframe preview
```

### Authentication flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Clerk Middleware (proxy.ts)
    participant C as Clerk
    participant P as Protected Route / tRPC Procedure

    U->>M: Request to any non-public route
    M->>M: isPublicRoute? ("/", "/sign-in", "/sign-up", "/api/*")
    alt Public route
        M-->>U: Pass through, no auth check
    else Protected route
        M->>C: auth.protect()
        alt No valid session
            C-->>U: Redirect to /sign-in
        else Valid session
            C-->>M: Session + userId
            M-->>P: Request continues with auth context
            P->>P: protectedProcedure middleware checks ctx.auth.userId
        end
    end
```

---

## Tech Stack

| Technology | Purpose | Why it was chosen | Notable alternative |
|---|---|---|---|
| **Next.js 16** (App Router) | Full‑stack React framework, routing, SSR | Unifies frontend, API routes, and middleware (`proxy.ts`) in one deployable app | Remix, plain Vite + Express |
| **React 19** | UI rendering | Server Components + latest concurrent features | — |
| **TypeScript 5** | Static typing across the whole stack | End‑to‑end type safety from DB → API → UI | Plain JavaScript |
| **tRPC v11** | Typed client‑server RPC layer | No schema/codegen step; types are inferred directly from server routers | REST + OpenAPI, GraphQL |
| **Zod 4** | Runtime input validation | Pairs natively with tRPC input parsers and with agent tool‑call schemas | Yup, io-ts |
| **Prisma 7** (`@prisma/adapter-pg`) | ORM + migrations for PostgreSQL | Type‑safe queries, first‑class Postgres driver adapter | Drizzle ORM |
| **PostgreSQL** | Primary datastore | Relational integrity between projects/messages/fragments; also backs the rate limiter | MySQL, SQLite |
| **Clerk** (`@clerk/nextjs`, `@clerk/themes`) | Authentication + subscription billing | Hosted sign‑in/up UI, plan‑based feature gating (`has({ plan })`), and a hosted `<PricingTable />` with no custom Stripe webhook code | NextAuth + Stripe (manual) |
| **Inngest** + **Agent Kit** | Durable background functions + agent/tool orchestration | Long‑running, multi‑step AI + sandbox work needs retries and step‑level durability that a single HTTP request can't provide | BullMQ / custom queue, LangGraph |
| **E2B** (`@e2b/code-interpreter`) | Ephemeral, internet‑connected code sandboxes | Gives the agent a real filesystem and shell per project, isolated from the host and from other users | Self‑hosted Docker/Firecracker sandboxes |
| **OpenAI SDK** (custom `baseUrl`) | LLM inference for all three agents | `openai()` model helper from Agent Kit, pointed at a custom OpenAI‑compatible proxy for the coding agent | Direct OpenAI API, Anthropic, local models |
| **Tailwind CSS v4** | Styling | Utility‑first, zero runtime CSS‑in‑JS overhead | CSS Modules, styled-components |
| **shadcn/ui** on **Base UI** (`@base-ui/react`) | Component primitives | Copy‑in components (not a dependency black box); this project uses the newer Base UI–flavored variant instead of Radix | Radix UI, Headless UI |
| **TanStack Query** | Client‑side data fetching/caching | Powers polling (`refetchInterval`), suspense queries, and hydration from server prefetch | SWR |
| **rate-limiter-flexible** | Usage metering | `RateLimiterPrisma` persists rolling usage windows directly in Postgres — no Redis dependency | Redis‑backed limiter |
| **PrismJS** | Code syntax highlighting | Lightweight highlighting for the generated‑file viewer | Shiki, highlight.js |
| **react-resizable-panels** | Split chat/preview layout | Drag‑resizable panel group for the workspace view | CSS grid + manual resize logic |
| **random-word-slugs** | Project naming | Auto‑generates kebab‑case project names (`generateSlug(2)`) on creation | UUID/incrementing names |

---

## Project Structure

```text
Buildflow-AI/
├── prisma/
│   ├── schema.prisma          # Project, Message, Fragment, Usage models
│   └── migrations/            # Prisma migration history
├── sandbox-templates/
│   └── nextjs/
│       ├── e2b.Dockerfile     # Pre-bakes a Next.js 15 + shadcn/ui image for E2B
│       └── compile_page.sh    # Boots the dev server and waits for "/" to compile
├── src/
│   ├── app/
│   │   ├── (home)/
│   │   │   ├── page.tsx             # Landing page: prompt box + project list
│   │   │   ├── pricing/page.tsx     # Clerk <PricingTable /> (Free vs Pro)
│   │   │   ├── sign-in/[[...]]      # Clerk hosted sign-in
│   │   │   └── sign-up/[[...]]      # Clerk hosted sign-up
│   │   ├── projects/[projectId]/page.tsx   # Split chat / live-preview workspace
│   │   ├── api/
│   │   │   ├── trpc/[trpc]/route.ts        # tRPC fetch adapter
│   │   │   └── inngest/route.ts            # Inngest function server (serve())
│   │   ├── layout.tsx           # ClerkProvider, ThemeProvider, TRPCReactProvider
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives (button, dialog, tabs, ...)
│   │   ├── code-view/           # PrismJS-based code viewer
│   │   ├── file-explorer.tsx    # Renders Fragment.files as a browsable tree
│   │   ├── tree-view.tsx        # Generic recursive file-tree component
│   │   ├── hint.tsx             # Tooltip wrapper
│   │   └── user-control.tsx     # Clerk <UserButton /> wrapper
│   ├── modules/                 # Feature-oriented domain modules
│   │   ├── home/ui/components/  # Navbar, ProjectForm, ProjectsList
│   │   ├── projects/
│   │   │   ├── server/procedures.ts    # projects.getOne / getMany / create
│   │   │   └── ui/                     # ProjectView, FragmentWeb, MessageCard, ...
│   │   ├── messages/server/procedures.ts   # messages.getMany / create
│   │   └── usage/server/procedures.ts      # usage.status
│   ├── inngest/
│   │   ├── client.ts            # Inngest client instance
│   │   ├── functions.ts         # codeAgentFunction — the core agent pipeline
│   │   ├── utils.ts             # Sandbox connect helper, output parsers
│   │   └── types.ts             # SANDBOX_TIMEOUT constant
│   ├── trpc/
│   │   ├── init.ts              # tRPC init, context, protectedProcedure
│   │   ├── client.tsx           # Client-side tRPC + React Query provider
│   │   ├── server.tsx           # Server-side caller for RSC prefetching
│   │   └── routers/_app.ts      # Root router (messages, projects, usage)
│   ├── lib/
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── usage.ts             # Credit consumption + rate-limiter setup
│   │   └── utils.ts             # cn() class-merging helper
│   ├── hooks/                   # use-current-theme, use-mobile, use-scroll
│   ├── prompt.ts                 # System prompts for all three agents
│   ├── proxy.ts                  # Clerk middleware / route matcher (Next 16)
│   └── types.ts
├── AGENTS.md / CLAUDE.md         # Coding-agent instructions for this repo itself
├── components.json               # shadcn/ui configuration
├── prisma.config.ts               # Prisma CLI config (schema path, migrations, datasource)
└── package.json
```

---

## Installation

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** database (local or hosted, e.g. Neon/Supabase/RDS)
- A **Clerk** application (publishable + secret key)
- An **Inngest** account (for background job execution — or the local `inngest-cli` dev server)
- An **E2B** account, API key, and a Next.js sandbox template built from `sandbox-templates/nextjs`
- An **OpenAI‑compatible** API key for the LLM calls

### 1. Clone and install

```bash
git clone https://github.com/abhijeethkv17/Buildflow-AI.git
cd Buildflow-AI
npm install
```

`npm install` automatically runs `prisma generate` via the `postinstall` script.

### 2. Configure environment variables

Create a `.env` file in the project root — see [Environment Variables](#environment-variables) below for the full list.

### 3. Set up the database

```bash
npx prisma migrate dev
```

This applies the existing migrations in `prisma/migrations/` and generates the Prisma client into `src/generated/prisma`.

### 4. Build the E2B sandbox template

The coding agent expects a sandbox template that already has Next.js + shadcn/ui installed (so it doesn't have to scaffold a project from scratch on every run):

```bash
cd sandbox-templates/nextjs
e2b template build --name <your-team>/<your-template-name> --cmd "/compile_page.sh"
```

Update the template name referenced in `Sandbox.create(...)` inside `src/inngest/functions.ts` to match.

### 5. Run the app

```bash
# Terminal 1 — Next.js app
npm run dev

# Terminal 2 — Inngest dev server (local event bus + dashboard)
npx inngest-cli@latest dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Purpose | Required | Example |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by Prisma | ✅ | `postgresql://user:pass@localhost:5432/buildflow` |
| `OPENAI_API_KEY` | API key used by all three agents (coding, title, response) | ✅ | `sk-...` |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the deployed app | ✅ | `http://localhost:3000` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (client‑side) | ✅ | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key (server‑side) | ✅ | `sk_test_...` |
| `NODE_ENV` | Standard Node environment flag | Auto‑set by Next.js | `development` / `production` |
| `E2B_API_KEY` | Authenticates E2B sandbox creation | ✅ (used by the E2B SDK internally) | `e2b_...` |
| `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` | Required when using Inngest Cloud instead of the local dev server | For production | — |

> ⚠️ The coding agent's OpenAI client is hard‑coded to a custom `baseUrl` (`https://aicredits.in/v1`) in `src/inngest/functions.ts`, while the title‑generator and response‑generator agents call the standard OpenAI endpoint. Point `OPENAI_API_KEY` at whichever provider(s) you configure, or edit the `baseUrl` values to match your own setup.

---

## Database

Buildflow AI uses four Prisma models on PostgreSQL:

```mermaid
erDiagram
    PROJECT ||--o{ MESSAGE : "has many"
    MESSAGE ||--o| FRAGMENT : "has one (optional)"

    PROJECT {
        string id PK
        string name
        string userId
        datetime createdAt
        datetime updatedAt
    }
    MESSAGE {
        string id PK
        string content
        enum role "USER | ASSISTANT"
        enum type "RESULT | ERROR"
        string projectId FK
        datetime createdAt
        datetime updatedAt
    }
    FRAGMENT {
        string id PK
        string messageId FK "unique"
        string sandboxUrl
        string title
        json files
        datetime createdAt
        datetime updatedAt
    }
    USAGE {
        string key PK
        int points
        datetime expire
    }
```

| Model | Purpose | Notes |
|---|---|---|
| `Project` | One AI‑generated app / conversation thread | Scoped to `userId` (Clerk user ID); has many `Message`s; cascades delete to messages |
| `Message` | A single turn in the conversation (user prompt or assistant reply) | `role` distinguishes user vs. assistant; `type` distinguishes a normal result from an error state |
| `Fragment` | The generated code artifact attached to an assistant message | One‑to‑one with `Message`; stores the live sandbox URL, an AI‑generated title, and the full file map as JSON |
| `Usage` | Backing table for `rate-limiter-flexible`'s `RateLimiterPrisma` | Not a domain model — it's the limiter's own storage, keyed by user ID |

---

## API & tRPC Reference

All application data access goes through a single tRPC router mounted at `/api/trpc`, using the `fetch` adapter and a `superjson` transformer. There is a corresponding Inngest HTTP endpoint at `/api/inngest` used only to serve/receive Inngest function invocations (`serve()` from `inngest/next`) — it is not a data API.

### `projects` router

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `getOne` | query | Protected | `{ id: string }` | Fetches a single project owned by the current user; throws `NOT_FOUND` otherwise |
| `getMany` | query | Protected | — | Lists all projects for the current user, newest‑updated first |
| `create` | mutation | Protected | `{ value: string (1–10000 chars) }` | Consumes a usage credit, creates a `Project` with an auto‑generated slug name and an initial `USER` message, then dispatches a `code-agent/run` Inngest event |

### `messages` router

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `getMany` | query | Protected | `{ projectId: string }` | Lists all messages (with their `Fragment`, if any) for a project owned by the current user, oldest first |
| `create` | mutation | Protected | `{ value: string (1–10000 chars), projectId: string }` | Verifies project ownership, consumes a usage credit, creates a `USER` message, and dispatches a new `code-agent/run` event to continue the same project |

### `usage` router

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `status` | query | Protected | — | Returns the current rate‑limiter status (`points` remaining, `msBeforeNext` reset) for the signed‑in user, or `null` on error |

All protected procedures run through a shared `isAuthed` tRPC middleware (`src/trpc/init.ts`) that reads Clerk's `auth()` context and throws `UNAUTHORIZED` if there is no `userId`.

---

## AI Agent Workflow

The heart of the project is `codeAgentFunction` in `src/inngest/functions.ts` — a single Inngest function triggered by the `code-agent/run` event. It runs as a series of durable `step.run()` calls so that sandbox creation, agent iterations, and DB writes can each be retried independently without repeating work already completed.

**Pipeline:**

1. **Sandbox provisioning** — creates (or, on later runs, effectively re‑provisions) an E2B sandbox from a pre‑built template and sets a 10‑minute idle timeout.
2. **Context loading** — pulls the last 5 messages for the project and formats them as Agent Kit `Message` objects to seed conversation memory.
3. **Coding agent** (`gpt-4.1-mini`, `temperature: 0.1`) — runs inside an Agent Kit `createNetwork`, with a router that keeps invoking the agent until it emits a `<task_summary>` block, up to `maxIter: 15` iterations. It has exactly three tools:
   - `terminal` — runs shell commands in the sandbox (e.g. `npm install <pkg> --yes`)
   - `createOrUpdateFiles` — writes files into the sandbox and accumulates them in shared network state
   - `readFiles` — reads existing files back, used before edits or before assuming a component exists
4. **Fragment title generation** (`gpt-4o-mini`) — a small, separate agent turns the task summary into a 1–3 word title.
5. **Response generation** (`gpt-4o-mini`) — another small agent turns the task summary into a casual, user‑facing chat message.
6. **Persistence** — if the coding agent produced no summary or no files, an `ERROR`‑type message is saved ("Something went wrong. Please try again."). Otherwise, a `RESULT` message is saved along with a `Fragment` containing the sandbox's public preview URL, the generated title, and the full file map.

The system prompt (`PROMPT` in `src/prompt.ts`) is extremely prescriptive by design — it constrains the agent to relative file paths, forbids restarting the already‑running dev server, mandates reading a file before editing it, requires verifying that a shadcn component exists before importing it, and defines the exact `<task_summary>` termination format the router watches for.

> **Note on "streaming":** the UI does not use WebSockets or SSE for agent output. The Inngest job runs fully in the background, and the client discovers new assistant messages via 2‑second polling (`refetchInterval: 2000`) on `messages.getMany`.

---

## Authentication & Billing

- **Sign‑in / sign‑up** are fully hosted by Clerk (`<SignInButton>`, `<SignUpButton>`, and dedicated `/sign-in`, `/sign-up` routes).
- **Route protection** happens once, centrally, in `src/proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`): every route except `/`, `/sign-in`, `/sign-up`, and `/api/*` requires `auth.protect()` to pass.
- **Conditional UI** uses Clerk's `<Show when="signed-in">` / `<Show when="signed-out">` components (the Clerk Core 3 replacement for the deprecated `<SignedIn>`/`<SignedOut>`).
- **Plans** are enforced with Clerk's `has({ plan: "pro" })` check, both on the client (`useAuth()`) and implicitly through the credit limits below. The `/pricing` page renders Clerk's hosted `<PricingTable />`, themed to match the app's light/dark mode.

---

## Usage Limits & Credits

Generation is metered per user with [`rate-limiter-flexible`](https://github.com/animir/node-rate-limiter-flexible)'s Prisma store (`src/lib/usage.ts`):

| Plan | Points | Window |
|---|---|---|
| Free | 2 | 30 days |
| Pro | 100 | 30 days |

Each project creation or follow‑up message costs **1 point** (`GENERATION_COST`). The `Usage` table (keyed by Clerk `userId`) tracks remaining points and their reset time; the `usage.status` procedure and the `<Usage />` component surface this to the user, including a countdown ("Resets in …") formatted with `date-fns`.

---

## Frontend Architecture

- **Server Components by default** — pages like `projects/[projectId]/page.tsx` prefetch tRPC queries on the server via `getQueryClient()` / `trpc.*.queryOptions()`, then hydrate a client tree with `<HydrationBoundary>`.
- **Client state** is otherwise minimal and local: `useState` for the active fragment / active tab in `ProjectView`, and TanStack Query's cache for all server data — there is no separate global store (Redux/Zustand).
- **Resilience** — each major panel (`ProjectHeader`, `MessagesContainer`) is wrapped independently in `<ErrorBoundary>` + `<Suspense>`, so a failure in one panel doesn't take down the whole workspace.
- **Design system** — shadcn/ui components generated on top of Base UI, configured via `components.json`, styled entirely with Tailwind CSS v4 utility classes and CSS variables (see `globals.css`) for theming.

---

## Sandbox Template

`sandbox-templates/nextjs/` defines the E2B image the coding agent provisions for every project:

- `e2b.Dockerfile` starts from `node:21-slim`, scaffolds a Next.js 15.3.3 app with `create-next-app`, then runs `npx shadcn@latest init -d` and `add --all -y` so the full shadcn component library is pre‑installed and ready for the agent to import — no install step needed at generation time.
- `compile_page.sh` boots `next dev --turbopack` and polls `http://localhost:3000` until it returns `200`, ensuring the template is only marked "ready" once the app has actually compiled.

This template is built once (via the E2B CLI) and referenced by name in `Sandbox.create(...)`.

---

## Known Limitations

In the spirit of accurate documentation rather than marketing copy:

- **No automated test suite** — see [Testing](#testing) below.
- **No `LICENSE` file** is currently present in the repository.
- **Hard‑coded sandbox template name** (`abhijeeths-default-team/buildflow-nextjs-test`) inside `src/inngest/functions.ts` — forking the project requires updating this to your own E2B template.
- **Mixed inference providers** — the coding agent points at a custom OpenAI‑compatible proxy (`aicredits.in`) while the title/response agents call OpenAI directly; this is a deliberate cost‑optimization but means a single `OPENAI_API_KEY` needs to be valid against both.
- **Polling, not streaming** — agent progress is surfaced via 2‑second polling rather than a push‑based channel, which is simple but not instantaneous.
- Some debug logging (a commented‑out sandbox health‑check block in `functions.ts`) is left in place from development and can be safely removed.

---

## Roadmap

**Near‑term**
- Replace polling with a push‑based update mechanism (e.g. Inngest Realtime or Server‑Sent Events) for instant status updates.
- Add a `LICENSE` file and a `.env.example` template.
- Add automated tests around the tRPC routers and the credit‑consumption logic.

**Mid‑term**
- Support multiple sandbox templates (e.g. per‑framework) selectable at project‑creation time.
- Persist and surface per‑iteration agent progress (not just the final summary) in the UI.

**Long‑term**
- Support exporting a generated project as a downloadable repo or one‑click deploy to Vercel.
- Multi‑model routing (let users choose the underlying LLM per project).

---

## Deployment

Buildflow AI is a standard Next.js app and deploys cleanly to **Vercel**:

1. Push the repository to GitHub and import it into Vercel.
2. Configure all variables from [Environment Variables](#environment-variables) in the Vercel project settings.
3. Point `DATABASE_URL` at a production Postgres instance (e.g. Neon, Supabase, or RDS) and run `npx prisma migrate deploy` against it.
4. Register the deployed `/api/inngest` endpoint with your Inngest app so the `code-agent` function is picked up in production, and set `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY`.
5. Ensure the E2B API key and sandbox template referenced in `functions.ts` are valid for the production E2B account/team.
6. Update Clerk's allowed redirect URLs / instance settings for the production domain.

**Pre‑launch checklist**
- [ ] Production database migrated and reachable
- [ ] Clerk production instance keys in place (not test keys)
- [ ] Inngest app registered and function visible in the Inngest dashboard
- [ ] E2B template built under the production team/org
- [ ] `NEXT_PUBLIC_APP_URL` set to the real production URL

---

## Contributing

Contributions are welcome.

1. Fork the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes, keeping to the existing module structure (`src/modules/<domain>/{server,ui}`).
3. Run `npm run lint` before committing.
4. Open a pull request describing the change, the motivation, and any manual testing performed (see [Testing](#testing) — there's currently no CI test gate, so a clear description of manual verification is especially valuable).

Please open an issue first for any change to the agent's system prompt (`src/prompt.ts`) or the Inngest pipeline (`src/inngest/functions.ts`), since these directly affect generation quality and cost.

---

## Testing

There is currently no automated test suite in this repository. For a project of this shape, a reasonable strategy going forward would be:

- **Unit tests** for pure logic — `src/lib/usage.ts`, `src/inngest/utils.ts` (`parseAgentOutput`, `lastAssistantTextMessageContent`).
- **Integration tests** for the tRPC routers using a test database, covering ownership checks (`getOne`/`getMany` scoping by `userId`) and credit consumption.
- **End‑to‑end tests** (e.g. Playwright) covering the sign‑in → create project → see a fragment appear flow, potentially mocking the Inngest function to skip real LLM/sandbox calls.

---

## FAQ

**Does the generated app actually run, or is it just a code preview?**
It actually runs — each project gets its own E2B sandbox running a real Next.js dev server, and the preview panel is a live iframe pointed at that sandbox's public URL.

**What happens if the agent can't finish in time?**
The sandbox has a 10‑minute idle timeout, and the agent network caps out at 15 iterations. If no `<task_summary>` is produced or no files were written, the project receives an `ERROR`‑type message instead of a fragment.

**Can I keep chatting with the same project after the first generation?**
Yes — sending another message on an existing project reuses the same `Project` and dispatches another `code-agent/run` event, with the last 5 messages provided as context.

**What LLM does it use?**
The coding agent uses `gpt-4.1-mini` through a custom OpenAI‑compatible proxy; the title and response agents use `gpt-4o-mini` directly against OpenAI. Both are configurable in `src/inngest/functions.ts`.

**Why Clerk instead of a custom auth system?**
It provides sign‑in/up, session/middleware handling, and plan‑based billing (via a hosted pricing table) without a custom Stripe integration — letting the project focus on the agent pipeline instead of auth plumbing.

---

## Acknowledgements

- [Inngest](https://www.inngest.com/) and [Agent Kit](https://agentkit.inngest.com/) for the durable execution and agent orchestration primitives.
- [E2B](https://e2b.dev/) for sandboxed code execution.
- [Clerk](https://clerk.com/) for authentication and billing.
- [shadcn/ui](https://ui.shadcn.com/) for the component foundation.

---

## License

No license file is currently included in this repository. Until one is added, all rights are reserved by default — consider adding an [MIT](https://choosealicense.com/licenses/mit/) or similar license if you intend for others to reuse this code.

---

## Author

**Abhijeeth K V**
Computer Science Engineering student, RNS Institute of Technology, Bengaluru.

[![GitHub](https://img.shields.io/badge/GitHub-abhijeethkv17-181717?logo=github)](https://github.com/abhijeethkv17)
