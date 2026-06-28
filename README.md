# 💬 AI Chat Interface

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111827)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-111827?style=for-the-badge&logo=express&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-AI-orange?style=for-the-badge)

**A sleek full-stack AI chat app with streaming replies, saved chat history, and a responsive dark UI.**

</div>

---

## ✨ Preview

![AI Chat Interface preview](docs/preview.svg)

---

## 🚀 Features

- 🌙 **Dark ChatGPT-style interface** with a clean full-screen layout
- 🧠 **Streaming AI responses** that appear chunk by chunk
- 🗂️ **Chat history sidebar** for switching between saved conversations
- 🔁 **Active chat tracking** so continuing a conversation updates the same thread
- 💬 **User and AI message bubbles** with clear left/right alignment
- 📱 **Responsive design** with a mobile sidebar drawer
- ⌨️ **Fixed bottom input bar** for a smooth chat experience
- ⚡ **Fast Vite frontend** paired with a lightweight Express backend

---

## 🛠️ Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Backend | Node.js, Express |
| AI | Groq SDK |
| Utilities | CORS, dotenv |

---

## 📦 Project Structure

```txt
ai-chat-interface/
|-- client/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- index.css
|   `-- package.json
|-- server/
|   |-- server.js
|   `-- package.json
|-- docs/
|   `-- preview.svg
`-- README.md
```

---

## 🧑‍💻 How to Run Locally

### 1. Install dependencies

Install dependencies in both app folders:

```bash
cd client
npm install
```

```bash
cd ../server
npm install
```

### 2. Add environment variables

Create a `.env` file inside the `server/` folder:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Start the backend

```bash
cd server
node server.js
```

The backend runs on:

```txt
http://localhost:3000
```

### 4. Start the frontend

Open a second terminal:

```bash
cd client
npm run dev
```

The frontend usually runs on:

```txt
http://localhost:5173
```

---

## 🧩 How It Works

1. The user sends a message from the React frontend.
2. The frontend sends the current message history to the Express API.
3. The backend calls Groq with streaming enabled.
4. Each streamed chunk is written back to the browser.
5. React updates the assistant bubble as chunks arrive.
6. Once complete, the full conversation is saved into chat history.

---

## 📚 What I Learned

- How to stream AI responses into a React UI in real time
- How `ReadableStream`, `reader.read()`, and `TextDecoder` work together
- Why React state can be stale if history is saved from the wrong value
- How to use an `activeChatId` to update an existing chat instead of creating duplicates
- How to build a responsive dark chat layout with Tailwind CSS
- How an Express backend can safely handle model requests for the frontend

---

## ✅ Future Improvements

- 💾 Save chat history to local storage or a database
- 🗑️ Add delete and rename options for chats
- 🔐 Add authentication
- 🧾 Render Markdown in AI responses
- 📎 Add file upload support
