<p align="center">
  <img src="https://img.shields.io/badge/Instagram-Wrapped-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram Wrapped"/>
</p>

<h1 align="center">📸 Instagram Wrapped</h1>

<p align="center">
  <strong>Your Year on Instagram, Beautifully Visualized</strong>
</p>
<p align="center">
  <strong>Project:</strong><br/>
  <a href="https://wrapped-instagram.vercel.app/" target="_blank">
    <img 
      src="https://img.shields.io/badge/Live%20Demo-View%20Website-00C853?style=for-the-badge&logo=vercel&logoColor=white" 
      alt="Live Demo"
    />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite" alt="Vite"/>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-privacy">Privacy</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-how-to-use">How to Use</a> •
  <a href="#-tech-stack">Tech Stack</a>
</p>

---

## ✨ Features

### 📊 **Comprehensive DM Analysis**
Dive deep into your messaging patterns with detailed statistics:

| Feature | Description |
|---------|-------------|
| **Top 5 Contacts** | See who you've messaged the most |
| **Message Balance** | Visual breakdown of sent vs received messages |
| **Monthly Trends** | Track your messaging activity throughout the year |
| **Hourly Patterns** | Discover when you're most active |
| **Streak Tracking** | Find your longest conversation streaks |

### 💬 **Contact Deep Dive**
Click on any top contact to reveal:

- 📈 **Total Message Count** — Sent, received, and overall totals
- 📊 **Message Balance Bar** — Visual ratio of who messages more
- 🔥 **Longest Streak** — Consecutive days of chatting
- 📅 **Monthly Activity Timeline** — Interactive chart showing message volume
- 😀 **Most Used Emojis** — Top 8 emojis you send to this person
- 💬 **Most Used Words** — Common words in your conversations (stop-words filtered)
- 🎬 **Media Shared** — Photos, videos, reels, and links count
- ⚔️ **Reel Sharing Battle** — Who sends more reels: you or them?
- 📝 **First & Last Messages** — See how your conversation started and the latest exchange

### ❤️ **Like Statistics**
- Total likes given
- Most liked accounts
- Monthly like trends
- Hourly like patterns

### 🎬 **Content Analysis**
- **Reels** — Total posted with monthly breakdown
- **Posts** — Publishing frequency and peak months
- **Stories** — Story posting patterns

### 👥 **Connection Insights**
- Follower & following counts
- Mutual connections
- Net growth analysis
- New followers tracking

### 🧠 **Personality Insights**
Get fun personality tags based on your Instagram behavior:
- 🦉 **Night Owl** — Late-night scrolling patterns
- 🎬 **Reel Addict** — Heavy reel consumption
- 💬 **Chatty** — High messaging activity
- ❤️ **Like Machine** — Generous with the double-tap
- 📸 **Content Creator** — Frequent poster
- And many more...

### 📤 **Shareable Cards**
- Export beautiful recap cards as images
- Privacy-first: **Blur usernames** by default before sharing
- Download individual contact stats
- Share your overall Instagram Wrapped summary

### 📅 **Multi-Year Support**
- Automatic year detection from your data
- Switch between years to compare your activity
- See how your Instagram usage evolved

---

## 🔒 Privacy

<p align="center">
  <img src="https://img.shields.io/badge/Privacy-100%25%20Local-00C853?style=for-the-badge" alt="Privacy"/>
</p>

**Your data never leaves your device.**

- ✅ All processing happens locally in your browser
- ✅ No data is uploaded to any server
- ✅ No cookies or tracking
- ✅ No account required
- ✅ Works completely offline after loading

We take privacy seriously. Your Instagram data export contains sensitive information, and we ensure it stays on your device at all times.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/instagram-wrapped.git

# Navigate to project directory
cd instagram-wrapped

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

---

## 📖 How to Use

### Step 1: Download Your Instagram Data

1. Open Instagram app or website
2. Go to **Settings → Your Activity → Download Your Information**
3. Select **JSON** format (important!)
4. Choose **All time** or specific date range
5. Request download and wait for email
6. Download the ZIP file

### Step 2: Upload to Instagram Wrapped

1. Open Instagram Wrapped in your browser
2. Drag & drop your ZIP file onto the upload area
3. Wait for processing (happens locally)
4. Explore your personalized stats!

### Step 3: Explore & Share

- Navigate between categories: Messages, Likes, Content, Connections, Personality
- Click on contacts to see detailed conversation stats
- Toggle username blur for privacy
- Download shareable cards

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI Components |
| **JSZip** | ZIP File Processing |
| **html-to-image** | Card Export |
| **Recharts** | Data Visualization |
| **Framer Motion** | Animations |
| **date-fns** | Date Utilities |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── stats/           # Statistics display components
│   │   ├── MessageStatsCard.tsx
│   │   ├── LikeStatsCard.tsx
│   │   ├── ContentStatsCard.tsx
│   │   ├── ConnectionStatsCard.tsx
│   │   ├── PersonalityCard.tsx
│   │   ├── TopContactCard.tsx
│   │   └── ContactDetailModal.tsx
│   ├── ui/              # Reusable UI components (shadcn)
│   ├── ChestUpload.tsx  # File upload component
│   ├── StoryFlow.tsx    # Main story navigation
│   ├── ShareCard.tsx    # Shareable summary card
│   └── YearSelector.tsx # Year switching component
├── utils/
│   ├── zipParser.ts     # ZIP extraction & parsing
│   └── dataAnalyzer.ts  # Instagram data analysis
├── types/
│   └── instagram.ts     # TypeScript interfaces
├── pages/
│   └── Index.tsx        # Main page
└── index.css            # Global styles & design tokens
```

---

## 🎨 Design Philosophy

- **Minecraft-inspired** pixel typography
- **Glassmorphism** UI elements
- **Dark neutral** color palette
- **Earthy accent tones** (Meadow Green, Mustard, Peach, Crimson)
- **Minimalist** and symmetrical layouts
- **Privacy-focused** with blur-by-default sharing

---

## 📊 Supported Data Categories

The app analyzes these Instagram data exports:

- ✅ Messages / DMs
- ✅ Likes (posts, reels, comments)
- ✅ Posts & Media
- ✅ Reels
- ✅ Stories
- ✅ Followers & Following
- ✅ Comments
- ✅ Saved Items
- ✅ Search History
- ✅ Login Activity
- ✅ Ad Interactions

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with 💜 by <strong>jaidev</strong>
</p>

<p align="center">
  <sub>Your data stays yours. Always.</sub>
</p>
