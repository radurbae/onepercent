# 1% Better - RPG Habit Tracker

A gamified habit tracking PWA inspired by "Solo Leveling" aesthetics. Level up your life by completing daily quests, earning XP and gold, and collecting loot.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-green)
![PWA](https://img.shields.io/badge/PWA-Installable-purple)

## Features

### 🎮 Core RPG System
- **Leveling** - Earn XP from completing habits and tasks, level up with increasing thresholds
- **Ranks** - Progress from E → D → C → B → A → S → SS based on level and weekly completion rate
- **Gold** - Earn currency for completing activities
- **Loot Drops** - 10% chance to unlock titles, badges, and themes on completion

### ✅ To Do (Daily Tasks)
- Create daily tasks with simple input
- Check off completed tasks
- Earn **+5 XP, +3 Gold** per task
- Progress bar shows daily completion

### ⚔️ Quests (Habits)
- Habits displayed as RPG quests
- **Main Quests** vs **Side Quests** categorization
- Streak tracking with bonuses
- XP/Gold preview on each quest card

### 🏰 Dungeon Run (Focus Mode)
- Pomodoro-style timer (10/15/25 min)
- **Double XP** for focused sessions
- Visual countdown with completion screen

### 👤 Profile
- Player status window with level, rank, XP bar
- Derived stats: STR (Consistency), AGI (Fast Starts), END (Streak Stability), INT (Learning Rate)
- Equipped title and badge display

### 🎒 Inventory
- View collected loot
- Filter by type (titles, badges, themes)
- Equip items to display on profile

### 🌓 Theme Toggle
- Dark mode (default) with neon RPG aesthetics
- Light mode for daytime use
- Persists in localStorage

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Supabase | Auth + PostgreSQL database |
| Lucide React | Icons |
| PWA | Installable on iOS/Android |

## Database Schema

```
├── habits          # User habits with frequency settings
├── checkins        # Daily habit completions
├── player_profile  # Level, XP, Gold, Rank, equipped items
├── loot            # Collected titles, badges, themes
├── tasks           # Daily to-do items
├── daily_summary   # Aggregated daily stats
└── reward_ledger   # Idempotent reward tracking
```

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project

### Installation

```bash
# Clone the repo
git clone https://github.com/radurbae/redemption.git
cd redemption

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# Go to Supabase SQL Editor and run:
# - supabase/migrations/001_initial_schema.sql
# - supabase/migrations/002_gamification_schema.sql
# - supabase/migrations/003_tasks_table.sql

# Start development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # To Do (home)
│   ├── quests/            # Habit quests
│   ├── tracker/           # Calendar view
│   ├── profile/           # Player status
│   ├── inventory/         # Loot collection
│   └── battle/            # Dungeon run timer
├── components/
│   ├── AppShell.tsx       # Layout wrapper
│   ├── TopNav.tsx         # Desktop navigation
│   ├── BottomNav.tsx      # Mobile navigation
│   ├── PlayerCard.tsx     # Status window
│   ├── QuestCard.tsx      # Habit as quest
│   ├── XPBar.tsx          # Animated XP progress
│   ├── RankBadge.tsx      # Rank display
│   ├── DungeonTimer.tsx   # Pomodoro timer
│   ├── LevelUpModal.tsx   # Level up celebration
│   ├── LootDropModal.tsx  # Loot reveal
│   └── ThemeProvider.tsx  # Dark/light mode
└── lib/
    ├── supabase/          # Supabase client
    ├── types.ts           # TypeScript interfaces
    └── utils/
        ├── rewards.ts     # XP/Gold/Rank calculations
        ├── streak.ts      # Streak logic
        └── dates.ts       # Date utilities
```

## Reward System

| Action | XP | Gold |
|--------|-----|------|
| Complete task | +5 | +3 |
| Complete habit | +10 | +5 |
| Streak bonus | +1 per day (max 10) | — |
| Daily clear bonus | +5 | +20 |
| Dungeon run | x2 multiplier | — |

### Level Curve
```
XP required = 50 + (level × 25)
```

### Rank Thresholds
| Rank | Level | Weekly Rate |
|------|-------|-------------|
| E | 1+ | 0% |
| D | 5+ | 40% |
| C | 10+ | 50% |
| B | 15+ | 60% |
| A | 20+ | 80% |
| S | 30+ | 90% |
| SS | 50+ | 95% |

## Deployment

The app auto-deploys to Vercel on push to `main`.

```bash
# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
