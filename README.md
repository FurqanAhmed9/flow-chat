# 💬 flowchat

A production-style, full-stack chat application built with a modern, typesafe tech stack. Features real-time AI responses, persistent chat history, and secure user authentication.

---
## 🚀 Live Demo

You can view the live deployed version of flowchat here:
**[https://flowchat.vercel.app](https://flowchat.vercel.app)** 

## How to Run Locally

### Prerequisites

-   Node.js (v18+)
-   npm
-   A [Supabase](https://supabase.com) account (free tier)
-   A [GroqCloud](https://console.groq.com/keys) account (free tier)


### 1. Clone & Install

Clone the repository and install all dependencies.

```bash
git clone https://github.com/FurqanAhmed9/flow-chat.git && cd flow-chat
```

```bash
npm install
npm run dev
```
Your app is now running at http://localhost:3000




## Features

-   **User Authentication**: Secure email & password signup/login using **Supabase Auth**.
-   **Session Management**: Persistent sessions across browser reloads using **Supabase SSR** helpers and Next.js Middleware.
-   **Persistent Chat History**: All messages are saved to a **Supabase Postgres** database.
-   **Dynamic AI Model Selection**: Users can choose from multiple AI models (e.g., Groq's Llama 3, Mixtral) or a simple "Echo" stub.
-   **Real-time AI Responses**: Queries are securely handled server-side via tRPC; no API keys are exposed to the client.
-   **Optimistic UI Updates**: User messages appear instantly in the UI while the tRPC mutation is in-flight. Assistant messages and typing indicators appear on response.
-   **Modern UI/UX**:
    -   Built with **shadcn/ui** and **Tailwind CSS**.
    -   Includes Dark / Light mode toggle.
    -   Responsive design for mobile and desktop.
    -   "Scroll to Bottom" button appears when not at the end of the chat.
-   **Developer Experience**:
    -   Full-stack **typesafety** with tRPC.
    -   Feature-folder project structure (`src/features/...`).

---

## Tech Stack & Rationale

| Technology | Purpose | Rationale |
| :--- | :--- | :--- |
| **Next.js 14** | Full-stack Framework | App Router, Server Components, and API routes (for tRPC). |
| **tRPC** | Typesafe API | End-to-end typesafety between client and server. Eliminates API guesswork. |
| **Supabase** | Backend-as-a-Service | **Auth**: Handles user management. **Postgres**: The primary database for `models` and `messages`. |
| **Groq** | AI/LLM Provider | Provides high-speed LLM responses. Easily swappable for other providers. |
| **React Query** | Data Fetching/Caching | The engine behind tRPC's `useQuery` and `useMutation` hooks. |
| **Tailwind CSS** | Utility-First CSS | Rapid, responsive UI development. |
| **shadcn/ui** | UI Component Library | Beautiful, accessible, and unopinionated components built on Radix UI. |
| **TypeScript** | Language | Enforces type safety across the entire application. |

## Core Implementation Details

### 1. tRPC & Typesafety

-   **`server/context.ts`**: Creates the tRPC context for every request, which includes an authenticated `supabase` instance and the user's `session`.
-   **`server/trpc.ts`**: Defines a `protectedProcedure` middleware that checks for a valid session, allowing us to create auth-protected API endpoints easily.
-   **`features/chat/router.ts`**: The `chat.send` mutation is a `protectedProcedure`, ensuring only logged-in users can send messages.

### 2. Supabase Integration

This project uses three different Supabase clients, each for a specific purpose:
1.  **Client Component Client** (`lib/supabase/client.ts`): Used in components (e.g., `/login`) for client-side auth actions.
2.  **Server Client** (`lib/supabase/server.ts`): Used in Server Components and tRPC `context.ts` to get the current user's session from cookies.
3.  **Admin Client** (`lib/supabase/admin.ts`): Uses the `SERVICE_ROLE_KEY` **exclusively on the server** (in tRPC routers) to bypass Row Level Security (RLS). This is necessary for the server to write the assistant's response to the database.

### 3. AI Integration (Server-Side Only)

To protect the `GROQ_API_KEY`, all AI calls are proxied through a tRPC mutation.
-   The `getLLMResponse` function in `src/features/chat/router.ts` checks if `GROQ_API_KEY` is present.
-   If the key exists and the user selected a valid model (e.g., `llama3-8b-8192`), it calls the Groq API.
-   If the key is missing or the "echo" model is selected, it returns a 1-second delayed stub: `You said: "{prompt}"`.
-   **No API keys are ever exposed to the client.**

### 4. Optimistic UI

In `src/features/chat/components/chat-client.tsx`, the `trpc.chat.send.useMutation` hook provides an optimistic update:
-   **`onMutate`**: The user's message is immediately added to the local `messages` state. This makes the app feel instant.
-   **`onSuccess`**: The assistant's real reply (from the server) is added to the state.
-   **`onError`**: A toast notification is shown, and the UI can be rolled back.
-   **`onSettled`**: The `chat.history` query is invalidated to re-fetch and sync the true state from the database.

---

