# Code Dungeon - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [Data Flow & Synchronization](#data-flow--synchronization)
6. [AI Integration](#ai-integration)
7. [Code Execution System](#code-execution-system)
8. [Firebase Configuration](#firebase-configuration)
9. [Development Workflow](#development-workflow)
10. [API References](#api-references)

---

## Architecture Overview

Code Dungeon is a collaborative, real-time coding platform built with Next.js 15, featuring a retro RPG aesthetic. The application enables multiple users to work together on coding challenges in a shared virtual "dungeon" environment.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  (Next.js 15 + React 19 + TypeScript + Tailwind CSS)        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Landing    │  │ CodeDungeon  │  │  Quest Board │     │
│  │     Page     │  │   Component  │  │  & UI Layers │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ ↕ ↕
┌─────────────────────────────────────────────────────────────┐
│                      Synchronization Layer                   │
│                  (Firebase Realtime Database)                │
│                                                              │
│  • Code synchronization    • Quest state management         │
│  • Party member tracking   • Real-time presence             │
│  • Quest claims & completions                               │
└─────────────────────────────────────────────────────────────┘
                            ↕ ↕ ↕
┌─────────────────────────────────────────────────────────────┐
│                      Processing Layer                        │
│                     (Server Actions)                         │
│                                                              │
│  ┌────────────────────┐         ┌────────────────────┐     │
│  │  Code Execution    │         │  Quest Generation  │     │
│  │  (Piston API)      │         │  (OpenAI/OpenRouter)│    │
│  └────────────────────┘         └────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Real-time Collaboration**: All state changes are synchronized across clients via Firebase Realtime Database
2. **Server Actions**: Heavy processing (code execution, AI generation) happens server-side using Next.js Server Actions
3. **Component Modularity**: UI is broken into focused, reusable components
4. **Type Safety**: Full TypeScript coverage with Zod schema validation
5. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with real-time features

---

## Technology Stack

### Frontend Framework
- **Next.js 15.5.9**: React framework with App Router, Server Actions, and Turbopack
- **React 19.2.1**: UI library with latest concurrent features
- **TypeScript 5**: Type-safe development

### UI & Styling
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI primitives
  - Dialog, Dropdown, Tooltip, Tabs, Progress, and more
- **Lucide React 0.475.0**: Icon library
- **Monaco Editor 4.6.0**: Code editor component (VS Code's editor)
- **Custom Fonts**:
  - `Press Start 2P`: Pixel-style headers
  - `VT323`: Monospace body text

### Backend & Data
- **Firebase 11.9.1**: Backend-as-a-Service
  - Realtime Database for synchronization
  - Anonymous Authentication
- **Next.js Server Actions**: Server-side API routes

### AI & Code Execution
- **OpenAI SDK 4.52.7**: AI API client
- **OpenRouter**: AI model routing service
- **Genkit 1.20.0**: Google's generative AI toolkit
- **Piston API**: Remote code execution service
- **Zod 3.24.2**: Schema validation

### Development Tools
- **Genkit CLI 1.20.0**: AI flow development and debugging
- **PostCSS 8**: CSS processing
- **ESLint**: Code linting

---

## Project Structure

```
studio/
├── src/
│   ├── ai/                      # AI generation flows
│   │   ├── flows/
│   │   │   └── generate-coding-quests.ts  # Quest generation logic
│   │   ├── dev.ts               # Genkit development server
│   │   └── genkit.ts            # Genkit configuration
│   │
│   ├── app/                     # Next.js App Router
│   │   ├── actions/
│   │   │   └── code.ts          # Server actions (execute, generate)
│   │   ├── globals.css          # Global styles & CSS variables
│   │   ├── layout.tsx           # Root layout with fonts
│   │   └── page.tsx             # Main entry point
│   │
│   ├── components/
│   │   ├── codedungeon/         # Main application components
│   │   │   ├── CodeDungeon.tsx  # Main container component
│   │   │   ├── LandingPage.tsx  # Home/room selection
│   │   │   ├── Header.tsx       # Top navigation bar
│   │   │   ├── Spellbook.tsx    # Code editor pane
│   │   │   ├── MonacoEditor.tsx # Monaco editor wrapper
│   │   │   ├── Hud.tsx          # Right sidebar (stats, chat, log)
│   │   │   ├── QuestBoard.tsx   # Quest management modal
│   │   │   ├── CombatLog.tsx    # Output/console display
│   │   │   ├── PartyChat.tsx    # Real-time chat
│   │   │   └── RoomTransition.tsx # Room join animation
│   │   └── ui/                  # Reusable UI components (Radix)
│   │
│   ├── hooks/
│   │   ├── use-toast.ts         # Toast notification hook
│   │   ├── use-mobile.tsx       # Mobile detection
│   │   └── useCodeSync.ts       # Firebase code sync hook
│   │
│   └── lib/
│       ├── firebase.ts          # Firebase initialization
│       ├── languages.ts         # Supported languages config
│       ├── dungeons.ts          # Dungeon themes & levels
│       ├── utils.ts             # Utility functions (cn, etc.)
│       └── placeholder-images.ts # Avatar image generation
│
├── docs/
│   ├── blueprint.md             # Original design document
│   ├── TECHNICAL.md             # This file
│   └── USER_GUIDE.md            # End-user documentation
│
├── public/                      # Static assets
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── components.json              # Shadcn/UI configuration
├── apphosting.yaml              # Firebase App Hosting config
└── package.json                 # Dependencies & scripts
```

---

## Core Components

### 1. CodeDungeon (`/src/components/codedungeon/CodeDungeon.tsx`)

**Purpose**: Main application container that orchestrates all features.

**Key Responsibilities**:
- Manages room state and Firebase subscriptions
- Coordinates code execution and quest generation
- Handles theme switching based on dungeon level
- Manages player stats (HP, Mana, Gold, XP)
- Orchestrates communication between child components

**State Management**:
```typescript
const [code, setCode] = useState<string>("// Welcome...");
const [language, setLanguage] = useState<Language>({...});
const [quests, setQuests] = useState<Quest[]>([]);
const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
const [party, setParty] = useState<Record<string, PartyMember>>({});
const [logs, setLogs] = useState<LogMessage[]>([]);
const [hp, mana, gold, xp] = useState(...);
```

**Firebase Listeners**:
- `dungeon-sessions/${roomId}/quests`: Quest list
- `dungeon-sessions/${roomId}/questClaims`: Quest ownership
- `dungeon-sessions/${roomId}/completedQuests`: Completed quests
- `dungeon-sessions/${roomId}/partyMembers`: Online users
- `dungeon-sessions/${roomId}/dungeonLevel`: Current theme
- `dungeon-sessions/${roomId}/partyChatter`: Chat messages

### 2. Spellbook (`/src/components/codedungeon/Spellbook.tsx`)

**Purpose**: Code editor interface with Monaco editor integration.

**Features**:
- Syntax highlighting for C++
- Parchment-themed editor
- Language selection (currently C++ only)
- Code execution controls
- Quest briefing display

**Editor Configuration**:
```typescript
monaco.editor.defineTheme('parchment-scroll', {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '#8B7355', fontStyle: 'italic' },
    { token: 'keyword', foreground: '#3b82f6', fontStyle: 'bold' },
    // ... more styling rules
  ],
  colors: {
    'editor.background': '#f4e7c3',
    'editor.foreground': '#2c1810',
    // ... theme colors
  }
});
```

### 3. QuestBoard (`/src/components/codedungeon/QuestBoard.tsx`)

**Purpose**: Quest management interface for viewing, claiming, and tracking quests.

**Features**:
- Display available quests with difficulty levels
- Claim/unclaim quests
- Generate new quests via AI
- Show quest rewards (Gold, XP)
- Display completed quests
- Quest filtering by difficulty

**Quest Lifecycle**:
1. User clicks "Generate Quests"
2. AI generates quests via `createQuests()` server action
3. Quests saved to Firebase: `dungeon-sessions/${roomId}/quests`
4. User claims a quest → saves to `questClaims/${questIndex}`
5. User completes quest → moves to `completedQuests/${questIndex}`

### 4. Hud (`/src/components/codedungeon/Hud.tsx`)

**Purpose**: Right sidebar containing player stats, chat, and combat log.

**Components**:
- **Stats Panel**: HP, Mana, Gold, Level, XP
- **Party Chat**: Real-time messaging
- **Combat Log**: Code execution output and system messages

**Real-time Chat**:
```typescript
// Send message
const chatRef = ref(db, `dungeon-sessions/${roomId}/partyChatter/${Date.now()}`);
await set(chatRef, { sender, message, timestamp });

// Listen to messages
onValue(ref(db, `dungeon-sessions/${roomId}/partyChatter`), (snapshot) => {
  // Update chat display
});
```

### 5. LandingPage (`/src/components/codedungeon/LandingPage.tsx`)

**Purpose**: Entry point for creating or joining dungeon rooms.

**Features**:
- Display active rooms from Firebase
- Filter rooms by age (<24 hours) and completion status
- Create new room
- Join existing room
- Show room metadata (player count, creation time)

---

## Data Flow & Synchronization

### Real-time Data Synchronization

Code Dungeon uses Firebase Realtime Database for all multi-user state synchronization.

#### Firebase Data Structure

```
dungeon-sessions/
└── room-{timestamp}/
    ├── code: string                    # Current code in editor
    ├── language: { name, version, alias }
    ├── partyMembers/
    │   └── {userId}/
    │       ├── name: string
    │       ├── online: boolean
    │       └── lastSeen: timestamp
    ├── quests: Quest[]                 # Available quests
    ├── questClaims/
    │   └── {questIndex}/
    │       ├── uid: string
    │       └── name: string
    ├── completedQuests/
    │   └── {questIndex}/
    │       ├── title: string
    │       ├── completedBy: string
    │       └── timestamp: number
    ├── partyChatter/
    │   └── {timestamp}/
    │       ├── sender: string
    │       ├── message: string
    │       └── timestamp: number
    ├── dungeonLevel: number            # Current theme level
    └── createdAt: timestamp
```

### Code Synchronization Flow

**useCodeSync Hook** (`/src/hooks/useCodeSync.ts`):

```typescript
export function useCodeSync(roomId: string) {
  // Listen to Firebase changes
  useEffect(() => {
    const codeRef = ref(db, `dungeon-sessions/${roomId}/code`);
    const unsub = onValue(codeRef, (snapshot) => {
      setCode(snapshot.val() || defaultCode);
    });
    return () => unsub();
  }, [roomId]);

  // Debounced write to Firebase
  const updateCode = useDebouncedCallback((newCode: string) => {
    set(ref(db, `dungeon-sessions/${roomId}/code`), newCode);
  }, 500);

  return { code, updateCode };
}
```

**Flow**:
1. User types in editor → `updateCode()` called
2. After 500ms debounce → writes to Firebase
3. Firebase broadcasts change → all clients receive update
4. Other clients' editors update automatically

### Quest State Synchronization

**Generate Quests**:
```typescript
// Client initiates
const result = await createQuests({ count: 3, difficulty: "Journeyman" });

// Server action calls AI
const quests = await generateCodingQuests(input);

// Server writes to Firebase
await set(ref(db, `dungeon-sessions/${roomId}/quests`), quests);

// All clients receive via listener
onValue(questsRef, (snapshot) => setQuests(snapshot.val()));
```

**Claim Quest**:
```typescript
// Client writes claim
await set(ref(db, `dungeon-sessions/${roomId}/questClaims/${index}`), {
  uid: currentUser.uid,
  name: currentUser.displayName
});

// All clients see quest is claimed
onValue(claimsRef, (snapshot) => setQuestClaims(snapshot.val()));
```

### Presence Tracking

**Online Status**:
```typescript
useEffect(() => {
  const userId = auth.currentUser?.uid;
  const memberRef = ref(db, `dungeon-sessions/${roomId}/partyMembers/${userId}`);
  
  // Set online
  set(memberRef, { name: userName, online: true });
  
  // On disconnect, set offline
  onDisconnect(memberRef).update({ online: false });
  
  return () => {
    update(memberRef, { online: false });
  };
}, [roomId]);
```

---

## AI Integration

### Quest Generation System

**Technology**: OpenAI SDK + OpenRouter + Structured Outputs

**File**: `/src/ai/flows/generate-coding-quests.ts`

#### Configuration

```typescript
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
```

**Model**: `xiaomi/mimo-v2-flash:free` (via OpenRouter)

#### Input Schema

```typescript
const GenerateCodingQuestsInputSchema = z.object({
  count: z.number().describe('Number of quests to generate'),
  difficulty: z.string().optional().describe('Difficulty level')
});
```

#### Output Schema

```typescript
const SingleQuestSchema = z.object({
  title: z.string(),
  difficulty: z.string(),
  mission_briefing: z.string(),
  starter_code: z.string(),
  test_cases: z.array(z.string()),
  gold_reward: z.number(),
  xp_reward: z.number(),
  language_alias: z.enum(['cpp'])
});
```

#### Structured Output Configuration

```typescript
const questListSchema = {
  name: 'quest_list',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      quests: {
        type: 'array',
        items: { /* Quest schema */ }
      }
    },
    required: ['quests'],
    additionalProperties: false
  }
};

const response = await openai.chat.completions.create({
  model: 'xiaomi/mimo-v2-flash:free',
  messages: [{ role: 'user', content: prompt }],
  response_format: {
    type: 'json_schema',
    json_schema: questListSchema
  },
  plugins: [{ id: 'response-healing' }]
});
```

#### Quest Generation Flow

1. User clicks "Generate Quests" button
2. Client calls `createQuests()` server action
3. Server action calls `generateCodingQuests()`
4. AI generates JSON with quest data
5. Zod validates response against schema
6. Validated quests returned to client
7. Client writes quests to Firebase
8. All connected clients receive new quests

#### Error Handling

- JSON parsing with fallback repair
- Zod schema validation
- Response healing plugin for malformed JSON
- User-friendly error messages

---

## Code Execution System

### Piston API Integration

**Service**: [Piston](https://github.com/engineer-man/piston) - Code execution engine

**File**: `/src/app/actions/code.ts`

#### Execution Flow

```typescript
export async function executeCode(
  language: string,
  version: string,
  code: string,
  quest: Quest | null
): Promise<ExecutionResult> {
  // Append test cases if quest is active
  let codeToRun = code;
  if (quest && quest.test_cases.length > 0) {
    const testRunnerCode = quest.test_cases.join('\n');
    codeToRun = `${code}\n\n${testRunnerCode}`;
  }

  // Execute via Piston API
  const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
    language: language,
    version: version,
    files: [{ content: codeToRun }],
  });

  return response.data;
}
```

#### Response Format

```typescript
type ExecutionResult = {
  run: {
    stdout: string;      // Standard output
    stderr: string;      // Error output
    output: string;      // Combined output
    code: number;        // Exit code
    signal: null | string;
  };
  compile?: {            // For compiled languages
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: null | string;
  };
} | { error: string };
```

#### Quest Validation

When a quest is active:
1. User's code is concatenated with quest test cases
2. Test cases use C++ `assert()` statements
3. If asserts pass → stdout shows success
4. If asserts fail → program crashes with assertion error
5. Client parses output to determine quest completion

Example test case:
```cpp
#include <cassert>
assert(fibonacci(5) == 5);
assert(fibonacci(10) == 55);
std::cout << "All tests passed!" << std::endl;
```

---

## Firebase Configuration

### Setup & Initialization

**File**: `/src/lib/firebase.ts`

#### Configuration Object

```typescript
export const firebaseConfig = {
  apiKey: "AIzaSyBjWcsJEHOm70ySxAN4SNiRm2PecS3H2qA",
  authDomain: "codedungeon-fa594.firebaseapp.com",
  databaseURL: "https://codedungeon-fa594-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "codedungeon-fa594",
  storageBucket: "codedungeon-fa594.appspot.com",
  messagingSenderId: "518930424212",
  appId: "1:518930424212:web:6fc214c89155ea1c65af81"
};
```

#### Initialization

```typescript
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const auth = getAuth(app);

// Anonymous authentication
signInAnonymously(auth).catch((error) => {
  console.error("Anonymous sign-in failed:", error);
});
```

### Database Security Rules

**Recommended Rules** (to be set in Firebase Console):

```json
{
  "rules": {
    "dungeon-sessions": {
      "$roomId": {
        ".read": true,
        ".write": "auth != null",
        "partyMembers": {
          "$userId": {
            ".write": "auth != null && auth.uid == $userId"
          }
        }
      }
    }
  }
}
```

### Database Operations

**Write**:
```typescript
import { ref, set, update } from 'firebase/database';

await set(ref(db, 'path/to/data'), value);
await update(ref(db, 'path/to/data'), { field: value });
```

**Read (Real-time)**:
```typescript
import { ref, onValue } from 'firebase/database';

const unsub = onValue(ref(db, 'path/to/data'), (snapshot) => {
  const data = snapshot.val();
  // Handle data
});

// Cleanup
return () => unsub();
```

**Presence**:
```typescript
import { onDisconnect } from 'firebase/database';

const memberRef = ref(db, `path/to/user`);
onDisconnect(memberRef).update({ online: false });
```

---

## Development Workflow

### Getting Started

#### Prerequisites
- Node.js 20+ (LTS recommended)
- npm or yarn
- Firebase project (optional for local dev)

#### Installation

```bash
# Clone repository
git clone https://github.com/sudo-Mystic/studio.git
cd studio

# Install dependencies
npm install

# Set environment variables (optional for AI features)
cp .env.example .env.local
# Edit .env.local with your OPENROUTER_API_KEY
```

#### Environment Variables

`.env.local`:
```bash
# OpenRouter API Key for quest generation
OPENROUTER_API_KEY=your_key_here

# Firebase config (already in code, but can override)
NEXT_PUBLIC_FIREBASE_API_KEY=...
```

### Development Commands

#### Start Development Server

```bash
npm run dev
# Runs on http://localhost:9002 with Turbopack
```

#### Start Genkit Development Server

```bash
npm run genkit:dev
# Opens Genkit UI for testing AI flows
```

#### Build for Production

```bash
npm run build
# Creates optimized production build
```

#### Start Production Server

```bash
npm start
# Runs production server on port 3000
```

#### Type Checking

```bash
npm run typecheck
# Runs TypeScript compiler without emitting files
```

#### Linting

```bash
npm run lint
# Runs ESLint on the codebase
```

### Project Scripts

```json
{
  "dev": "next dev --turbopack -p 9002",
  "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
  "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts",
  "build": "NODE_ENV=production next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit"
}
```

### Development Tips

#### Hot Reload
- Code changes automatically reload via Turbopack
- Firebase changes propagate instantly to all connected clients
- Monaco editor preserves scroll position on reload

#### Debugging AI Flows
1. Start Genkit dev server: `npm run genkit:dev`
2. Open Genkit UI in browser
3. Test `generateCodingQuests` flow with sample inputs
4. View prompts, responses, and traces

#### Testing Code Execution
- Use built-in "Cast Spell" button in editor
- Check Combat Log for output
- Test with different quest test cases

#### Firebase Debugging
- Install [Firebase Realtime Database extension](https://chrome.google.com/webstore/detail/firebase-tools/cidijcpjkdapfkbhklpglhhbaoldieio)
- Monitor Firebase console for data changes
- Use `console.log` in `onValue` listeners

---

## API References

### Server Actions (`/src/app/actions/code.ts`)

#### `executeCode()`

Execute code via Piston API.

```typescript
async function executeCode(
  language: string,
  version: string,
  code: string,
  quest: Quest | null
): Promise<ExecutionResult>
```

**Parameters**:
- `language`: Programming language name (e.g., "c++")
- `version`: Language version (e.g., "10.2.0")
- `code`: Source code to execute
- `quest`: Active quest (null if no quest)

**Returns**: Execution result with stdout, stderr, exit code

**Usage**:
```typescript
const result = await executeCode("c++", "10.2.0", userCode, currentQuest);
if ('error' in result) {
  console.error(result.error);
} else {
  console.log(result.run.stdout);
}
```

#### `createQuests()`

Generate coding quests via AI.

```typescript
async function createQuests(
  input: GenerateCodingQuestsInput
): Promise<{ success: boolean, quests?: Quest[], error?: string }>
```

**Parameters**:
- `input.count`: Number of quests to generate
- `input.difficulty`: Difficulty level (optional)

**Returns**: Success status and quest array or error

**Usage**:
```typescript
const result = await createQuests({ count: 3, difficulty: "Journeyman" });
if (result.success) {
  setQuests(result.quests);
} else {
  showError(result.error);
}
```

### Hooks

#### `useCodeSync()`

Hook for Firebase code synchronization.

```typescript
function useCodeSync(
  roomId: string,
  defaultCode?: string
): {
  code: string;
  updateCode: (code: string) => void;
  language: Language;
  updateLanguage: (lang: Language) => void;
}
```

#### `useToast()`

Hook for displaying toast notifications.

```typescript
const { toast } = useToast();

toast({
  title: "Success",
  description: "Quest completed!",
  variant: "success"
});
```

### Types

#### `Quest`

```typescript
type Quest = {
  title: string;
  difficulty: string;
  mission_briefing: string;
  starter_code: string;
  test_cases: string[];
  gold_reward: number;
  xp_reward: number;
  language_alias: 'cpp';
}
```

#### `LogMessage`

```typescript
type LogMessage = {
  type: 'SYSTEM' | 'QUEST' | 'ERROR' | 'SUCCESS' | 'INFO' | 'DEBUG';
  message: string;
  timestamp: number;
}
```

#### `PartyMember`

```typescript
type PartyMember = {
  name: string;
  online: boolean;
}
```

#### `Language`

```typescript
type Language = {
  name: string;    // Display name
  version: string; // Version number
  alias: string;   // Short identifier (e.g., "cpp")
}
```

---

## Theming System

### Dungeon Levels

**File**: `/src/lib/dungeons.ts`

Each dungeon level has a unique theme applied via CSS variables:

```typescript
type DungeonLevel = {
  level: number;
  name: string;
  description: string;
  theme: Record<string, string>;  // CSS variables
}
```

**Theme Application**:
```typescript
useEffect(() => {
  const root = document.documentElement;
  Object.entries(currentDungeon.theme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}, [currentDungeon]);
```

### CSS Variables

Defined in `/src/app/globals.css`:

```css
:root {
  --wood-500: #a3642e;
  --parchment-default: #f4e7c3;
  --magic-default: #3b82f6;
  /* ... more variables */
}
```

Used in components:
```tsx
<div className="bg-[var(--parchment-default)]">
  {/* Content */}
</div>
```

---

## Performance Considerations

### Optimization Strategies

1. **Debounced Firebase Writes**: Code changes debounced by 500ms
2. **Selective Rendering**: React memoization for expensive components
3. **Lazy Loading**: Monaco editor loaded on demand
4. **Turbopack**: Fast development builds
5. **Server Actions**: Heavy computation server-side

### Monitoring

- Check Network tab for Firebase write frequency
- Monitor Console for Firebase listener warnings
- Profile React DevTools for render performance

---

## Security Considerations

### Current Security Measures

1. **Anonymous Authentication**: All users authenticated via Firebase
2. **Server-side Execution**: Code runs on Piston servers, not client
3. **Input Validation**: Zod schema validation for all AI outputs
4. **Environment Variables**: API keys stored in `.env.local`

### Recommended Enhancements

1. **Database Rules**: Restrict write access per user ID
2. **Rate Limiting**: Prevent AI spam via Firebase Functions
3. **Content Moderation**: Filter inappropriate chat messages
4. **CSRF Protection**: Next.js built-in CSRF tokens

---

## Troubleshooting

### Common Issues

#### Firebase Connection Errors

**Problem**: "Failed to connect to Firebase"

**Solution**:
- Check Firebase config in `/src/lib/firebase.ts`
- Verify network connectivity
- Check Firebase project status

#### AI Quest Generation Fails

**Problem**: "The Quest Giver is currently resting"

**Solution**:
- Verify `OPENROUTER_API_KEY` in `.env.local`
- Check OpenRouter account credits
- Review error logs in server console

#### Code Execution Timeout

**Problem**: Piston API takes too long

**Solution**:
- Check Piston API status: https://emkc.org/api/v2/piston/runtimes
- Verify code doesn't have infinite loops
- Consider increasing timeout in axios config

#### Monaco Editor Not Loading

**Problem**: Blank editor or loading forever

**Solution**:
- Check browser console for webpack errors
- Clear browser cache
- Verify `@monaco-editor/react` installation

---

## Deployment

### Firebase App Hosting

**Config**: `apphosting.yaml`

```yaml
runConfig:
  nodeVersion: 20
```

### Deployment Steps

1. Build application: `npm run build`
2. Deploy to Firebase: `firebase deploy --only hosting`
3. Verify deployment in Firebase Console

### Environment Variables

Set in Firebase App Hosting:
- `OPENROUTER_API_KEY`: Your OpenRouter API key

---

## Contributing

### Code Style

- **TypeScript**: Use strict type checking
- **React**: Functional components with hooks
- **CSS**: Tailwind utility classes
- **Naming**: camelCase for variables, PascalCase for components

### Testing

Currently no automated tests. Future additions:
- Jest for unit tests
- Playwright for E2E tests
- React Testing Library for component tests

---

## Future Enhancements

### Planned Features

1. **Multi-language Support**: Python, JavaScript, Java, etc.
2. **Leaderboards**: Track top players globally
3. **Custom Quests**: User-generated quest creation
4. **Voice Chat**: WebRTC-based party voice chat
5. **Advanced Editor**: Vim/Emacs keybindings, extensions
6. **Mobile App**: React Native version
7. **Achievements**: Unlock badges and titles
8. **Guilds**: Persistent teams across sessions

### Technical Debt

1. Add comprehensive test coverage
2. Implement proper error boundaries
3. Add loading states for all async operations
4. Optimize Firebase listener cleanup
5. Add TypeScript strict mode
6. Document all component props with JSDoc

---

## License

[Project License Information]

---

## Support

For issues or questions:
- GitHub Issues: [repository URL]
- Documentation: `/docs`
- Email: [contact email]

---

*Last Updated: December 2025*
