# **App Name**: CodeDungeon

## Core Features:

- Collaborative Code Editing: Real-time code editing with presence indicators, allowing multiple users to work on the same file simultaneously.
- Code Execution: Execute code in a sandboxed environment using the Piston API to display output and errors.
- Retro Pixel UI: The "Retro Pixel / Cozy Dungeon" aesthetic with warm wood tones, parchment textures, and pixel-perfect graphics. Create pixel-style borders.
- Gemini-Powered Quest Generation: Use the Gemini API to dynamically generate coding challenges based on a defined schema. Act as Quest Tool: Generate a JSON schema dynamically by specifying mission briefs for AI learning new material and provide quest titles that match level of the brief
- Firebase Realtime Database Sync: Use Firebase Realtime Database to sync code changes in real time. Keeps UI State and scroll information up to date.
- Themed Editor: Parchment Scroll Theme Editor: highlight color and color that fits the theme of the UI
- Quest Board: Manage your quests and missions

## Style Guidelines:

- Primary color: Wood 500 (#a3642e) for panel frames, borders, and structural elements.
- Background color: Parchment Default (#f4e7c3) for editor background, text areas, and quest scrolls.
- Accent color: Magic Default (#3b82f6) for Mana bars, action buttons, and function highlighting.
- Headline font: 'Press Start 2P', cursive for main headers and short headings.
- Body and code font: 'VT323', monospace, for console logs, chat messages and code editor.
- Use Lucide Icons and DiceBear Pixel Art Avatars in a Retro-pixel RPG style to maintain a themed UI.
- SplitPane Layout (Editor Left, HUD Right): Divide UI and set the scene by splitting left side and right side
- Subtle transitions when generating code and displaying Piston API and AI completion output.