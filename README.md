<div align="center">

  <h1>✌️ RPS Royale 👊</h1>

  <p>
    <strong>The Ultimate Multiplayer Rock Paper Scissors Tournament Platform</strong>
  </p>

  <p>
    Built with modern full-stack technologies to deliver a real-time, scalable, and hyper-interactive arcade experience.
  </p>

  <br>

<a href="#-features">Features</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#-tech-stack">Tech Stack</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#-quick-start">Quick Start</a>

</div>

---

## ✨ Features

RPS Royale elevates the classic Rock, Paper, Scissors game into a massive multiplayer tournament. Whether playing with 2 people or scaling to a 50-person showdown, the engine handles everything seamlessly.

### 🎮 Gameplay Mechanics
- **Real-Time Synchronous Rounds**: Powered by `Socket.io`, all active matches in a round happen simultaneously with synchronized timers.
- **Dynamic Matchmaking**: Handles odd numbers of players by automatically assigning "BYE" (Free Win) matches.
- **Sudden Death Tie-breakers**: Draws are automatically flagged and rescheduled into an immediate Tie-Breaker match before the tournament advances.
- **Host Dashboard**: The Room Host can track exactly who has submitted their move, forcefully end the round if someone is AFK, or transfer host duties.
- **Spectator Mode**: Late joiners aren't blocked! They transition smoothly into a live spectator view where they can watch the leaderboard and chat.

### 💬 Interactive Social Arena
- **Floating Chat & Emotes**: Players and spectators can broadcast messages and fire floating arcade emojis (🔥, 😂) natively rendered via CSS keyframes.
- **Epic Battle Clash**: High-octane full-screen CSS3 animations whenever a round resolves, pitting your choice against your opponent before revealing the winner.
- **Arcade Audio Engine**: Zero-dependency pure JavaScript `AudioContext` synthesizer generating 8-bit bleeps, bloops, and ticking sound effects natively.

### 🚀 Accessibility & Security
- **Frictionless Onboarding**: Users can register accounts OR use the **Guest Quick-Join** logic (simply enter an Employee ID and the backend generates a secure ghost session).
- **QR Code Deep Links**: Generate instant QR codes from the lobby. Scanning sends users to `/?join=CODE`, which intercepts their session and auto-submits the form to throw them straight into the arena.
- **Brute-Force Protection**: Custom in-memory Adonis `ThrottleMiddleware` mitigates `/rooms/join` endpoint spam (max 5 requests/minute).
- **Report Pagination**: The Global Tournament history endpoint dynamically scales via Lucid ORM `.paginate()` to prevent Out-Of-Memory cascades on large databases.

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td><strong>Backend</strong></td>
    <td>
      <a href="https://adonisjs.com">AdonisJS 7</a> - Full-featured Node.js framework
    </td>
  </tr>
  <tr>
    <td><strong>Real-time</strong></td>
    <td>
      <a href="https://socket.io/">Socket.io</a> - Bidirectional WebSocket event loops
    </td>
  </tr>
  <tr>
    <td><strong>Views</strong></td>
    <td>
      <a href="https://edgejs.dev">Edge.js</a> - Expressive templating engine
    </td>
  </tr>
  <tr>
    <td><strong>Database</strong></td>
    <td>
      <a href="https://lucid.adonisjs.com">Lucid ORM</a> / <b>SQLite3</b> (with raw <code>database_dump.sql</code> scripts)
    </td>
  </tr>
  <tr>
    <td><strong>Styling</strong></td>
    <td>
      Custom Vanilla CSS with Mobile-first Flex/Grid scaling and Glassmorphism design
    </td>
  </tr>
  <tr>
    <td><strong>Validation</strong></td>
    <td>
      <a href="https://vinejs.dev">VineJS</a> - Type-safe schema validation
    </td>
  </tr>
  <tr>
    <td><strong>Security</strong></td>
    <td>
      In-memory Rate Limiting, CSRF Protection, Shield Middleware
    </td>
  </tr>
</table>

---

## 🚀 Quick Start

### 1. Requirements
Ensure you have Node.js 20+ installed.

### 2. Setup
Clone the repository and install dependencies:

```bash
npm install
```

### 3. Database Initialization
Run the migrations and seeders to scaffold the SQLite engine:
```bash
npx tsx bin/console.ts migration:run
npx tsx bin/console.ts db:seed
```

### 4. Start the Server
Launch the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

Your app will be running at `http://localhost:3333`.

---

## 📸 Usage & Tips

- **Create Room:** Login utilizing the admin credentials (or quick join as a guest), create a room, and share the **6-digit code** or **QR Code**.
- **Data Backup:** A custom `node dump_db.mjs` script is provided to rip the SQLite state into raw SQL queries for reporting or migration to external databases.
- **Sound Restrictions:** Modern browsers require standard UI interaction before audio contexts can play. Ensure users *click* something on the page (like Chat or Emotes) if sounds don't auto-play on the first tick!

<div align="center">
  <sub>Built for the thrill of the ultimate ✌️ RPS Showdown!</sub>
</div>
