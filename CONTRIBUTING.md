# 🤝 Contributing to BoostClient

First off, thank you for considering contributing to BoostClient! It's people like you that make BoostClient such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## 🤗 Code of Conduct

This project adheres to a simple code of conduct:
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Java** 17 or 21 ([Download Adoptium](https://adoptium.net/))
- **Git** ([Download](https://git-scm.com/))
- Basic knowledge of TypeScript, React, and Electron

### First Contribution?

Look for issues labeled:
- `good first issue` - Perfect for newcomers
- `help wanted` - We'd love your help on these
- `documentation` - Improve our docs

---

## 💻 Development Setup

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/boostclient.git
cd boostclient
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

This starts:
- Vite dev server on `http://localhost:5173` (React frontend with hot reload)
- Electron window (automatically restarts on backend changes)

### 4. Build for Production

```bash
# Build TypeScript backend + React frontend
npm run build

# Run production build
npm start

# Build installers (.exe files)
npm run dist
```

---

## 📁 Project Structure

```
boostclient/
├── electron/                      # Electron Main Process (Node.js Backend)
│   ├── main.ts                    # App entry, BrowserWindow, IPC handlers
│   ├── preload.ts                 # Secure contextBridge API
│   └── services/                  # Core business logic
│       ├── AuthManager.ts         # Offline UUID + Microsoft OAuth
│       ├── BoostXManager.ts       # BoostX mod JAR creator + config (100+ modules)
│       ├── CloudflareManager.ts   # Cloudflared.exe tunnel + custom domains
│       ├── ConfigStore.ts         # Persistent JSON store (profiles, servers, settings)
│       ├── LauncherManager.ts     # Mojang client launcher, assets, 10x FPS engine
│       ├── PlayitManager.ts       # Playit.exe tunnel automation + IP scraping
│       ├── PropertiesManager.ts   # server.properties parser/writer
│       ├── ServerAutomation.ts    # Aternos-style automation (Voice Chat, Geyser)
│       ├── ServerManager.ts       # Java server runner, Aikar's flags, console, metrics
│       ├── StoreManager.ts        # Modrinth API client, mod installer, dependencies
│       ├── UpdateManager.ts       # GitHub release checker + auto-updater
│       ├── VersionFetcher.ts      # Paper/Purpur/Fabric/Velocity API downloaders
│       └── VersionManager.ts      # BoostX version matcher, plugin auto-setup
│
├── src/                           # React Frontend (Renderer Process)
│   ├── main.tsx                   # React entry point
│   ├── App.tsx                    # Main shell, navigation, IPC event subscriptions
│   ├── types/index.ts             # Shared TypeScript interfaces
│   ├── styles/index.css           # Tailwind CSS + custom themes
│   ├── assets/
│   │   └── boostx-logo.svg        # BoostClient logo
│   └── components/
│       ├── layout/
│       │   └── Sidebar.tsx        # Navigation (Play, Profiles, Store, Servers, Settings)
│       ├── auth/
│       │   └── AccountModal.tsx   # Offline + Microsoft login modal
│       ├── play/
│       │   └── PlayView.tsx       # Launch screen, profile selector, logs drawer
│       ├── profiles/
│       │   ├── ProfileList.tsx    # Profile cards grid
│       │   └── ProfileModal.tsx   # Create/edit profiles + BoostX checkbox + presets
│       ├── store/
│       │   └── StoreView.tsx      # Modrinth browser, 1-click installer
│       ├── servers/
│       │   ├── ServerList.tsx     # Server instances grid + creation wizard
│       │   └── dashboard/
│       │       ├── ServerDashboard.tsx  # Aternos tab wrapper
│       │       ├── OverviewTab.tsx      # Status, IPs, console, RAM/CPU, players
│       │       ├── FilesTab.tsx         # "Open in File Explorer" button
│       │       ├── PluginsModsTab.tsx   # Installed items + enable/disable
│       │       ├── SettingsTab.tsx      # server.properties editor + RAM slider
│       │       └── VersionTab.tsx       # Platform/version switcher
│       └── settings/
│           └── SettingsView.tsx   # Theme picker, RAM defaults, Playit key
│
├── package.json                   # Dependencies + electron-builder config
├── tsconfig.json                  # React TypeScript config
├── tsconfig.electron.json         # Electron TypeScript config (outputs to dist-electron/)
├── vite.config.ts                 # Vite bundler config
├── tailwind.config.js             # Tailwind theme tokens
└── index.html                     # HTML entry point
```

---

## 🔄 Development Workflow

### Making Changes

1. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**:
   - Edit relevant files
   - Follow our [Coding Standards](#coding-standards)

3. **Test your changes**:
   ```bash
   npm run dev
   # Test in the Electron window
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add awesome new feature"
   ```
   
   Use [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc)
   - `refactor:` - Code refactoring
   - `perf:` - Performance improvements
   - `test:` - Test additions/changes
   - `chore:` - Build process or tooling changes

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** on GitHub

---

## 📝 Coding Standards

### TypeScript

- **Use TypeScript strict mode** - No `any` types unless absolutely necessary
- **Explicit return types** for public functions
- **Interfaces over types** for object shapes
- **Async/await** over `.then()` chains

```typescript
// ✅ Good
export async function fetchVersion(id: string): Promise<Version> {
  const response = await fetch(`https://api.example.com/${id}`);
  return response.json();
}

// ❌ Bad
export function fetchVersion(id: any) {
  return fetch(`https://api.example.com/${id}`).then(r => r.json());
}
```

### React Components

- **Functional components** with hooks (no class components)
- **Named exports** for components
- **Props interfaces** defined above component
- **Destructure props** in parameters

```typescript
// ✅ Good
interface ProfileCardProps {
  profile: GameProfile;
  onSelect: (id: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSelect }) => {
  return <div onClick={() => onSelect(profile.id)}>{profile.name}</div>;
};
```

### File Naming

- **React components**: `PascalCase.tsx` (e.g. `ServerDashboard.tsx`)
- **Services/utilities**: `PascalCase.ts` (e.g. `ServerManager.ts`)
- **Types/interfaces**: `index.ts` or descriptive name
- **Styles**: `kebab-case.css`

### Styling

- **Tailwind CSS utility classes** for styling
- **Avoid inline styles** unless dynamic
- **Use theme variables** from `tailwind.config.js`
- **Responsive classes** for mobile support

```tsx
// ✅ Good
<button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white">
  Click Me
</button>

// ❌ Bad
<button style={{ padding: '8px 16px', background: '#2563eb' }}>
  Click Me
</button>
```

### Error Handling

- **Try-catch blocks** for async operations
- **Meaningful error messages** for users
- **Console.error** for debugging

```typescript
// ✅ Good
try {
  await serverManager.start(serverId);
} catch (err: any) {
  console.error('[ServerManager] Failed to start server:', err);
  throw new Error(`Could not start server: ${err.message}`);
}
```

### IPC Communication

- **Type-safe IPC handlers** in `electron/main.ts`
- **Expose via preload.ts** with descriptive names
- **Handle errors gracefully** on both sides

```typescript
// electron/main.ts
ipcMain.handle('server:start', async (_event, serverId: string) => {
  try {
    await serverManager.start(serverId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// electron/preload.ts
startServer: (serverId: string) => ipcRenderer.invoke('server:start', serverId),

// src/components/ServerDashboard.tsx
const handleStart = async () => {
  const result = await window.electronAPI.startServer(server.id);
  if (!result.success) {
    alert(`Failed to start: ${result.error}`);
  }
};
```

---

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, test these workflows:

#### Client Launcher:
- [ ] Create a new profile (Fabric + Performance preset)
- [ ] Install BoostX mod
- [ ] Launch Minecraft in Offline mode
- [ ] Verify game launches successfully
- [ ] Test BoostX GUI opens (Right Shift key in-game)

#### Server Manager:
- [ ] Create a new Paper server
- [ ] Start server successfully
- [ ] Verify Playit tunnel connects and displays public IP
- [ ] Send `/version` command via console
- [ ] Open server folder in Windows Explorer
- [ ] Enable/disable a plugin
- [ ] Edit server.properties (toggle cracked mode)
- [ ] Stop server gracefully

#### Content Store:
- [ ] Search for a mod (e.g. "Sodium")
- [ ] Install mod to a profile
- [ ] Verify dependencies auto-install (e.g. Fabric API)
- [ ] Verify mod appears in profile's mods folder

#### Themes:
- [ ] Switch between all 5 themes
- [ ] Verify no visual glitches

### Automated Tests (Future)

We're working on adding:
- Unit tests (Jest)
- Integration tests (Playwright)
- E2E tests

---

## 📤 Pull Request Process

### Before Submitting

1. **Ensure your code builds**:
   ```bash
   npm run build:electron
   npm run build:renderer
   ```

2. **Test manually** (see checklist above)

3. **Update documentation** if needed:
   - `README.md` for user-facing features
   - `QUICKSTART.md` for setup/usage changes
   - Code comments for complex logic

4. **Write a clear PR description**:
   - What does this PR do?
   - Why is this change needed?
   - How was it tested?
   - Screenshots/videos for UI changes

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test this?

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code builds successfully
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Follows coding standards
```

### Review Process

1. Maintainer reviews your PR
2. Requested changes (if any) are addressed
3. PR is approved and merged
4. Your contribution is included in the next release! 🎉

---

## 🐛 Reporting Bugs

### Before Reporting

1. **Search existing issues** - Your bug might already be reported
2. **Update to latest version** - Bug might be fixed already
3. **Test in a clean environment** - Disable other software that might interfere

### Bug Report Template

Use this template when [creating an issue](https://github.com/boostclient/boostclient/issues/new):

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows 11 Pro]
 - BoostClient Version: [e.g. 1.2.0]
 - Java Version: [e.g. Java 17]

**Additional context**
Any other context about the problem.
```

---

## 💡 Suggesting Features

We love feature suggestions! Use this template:

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Mockups, screenshots, or examples from other apps.
```

---

## 🏗️ Architecture Decisions

### Why Electron?

- **Native file system access** - Direct manipulation of mods, plugins, worlds
- **Child process control** - Spawn Java servers and clients
- **Windows Explorer integration** - `shell.openPath()` for seamless file management
- **Cross-platform** - Same codebase for Windows, macOS, Linux

### Why Vite?

- **Fast HMR** - Instant hot reload during development
- **Modern build** - ESM-first with optimized bundling
- **TypeScript support** - Out-of-the-box TS compilation

### Why Tailwind CSS?

- **Utility-first** - Rapid UI development
- **Theme system** - Easy dark/light mode switching
- **Consistency** - Enforces design system via config

### Why Modrinth API?

- **Open-source friendly** - MIT licensed, community-driven
- **Modern API** - Clean REST endpoints with great docs
- **Rich ecosystem** - Mods, modpacks, shaders, resource packs

---

## 📚 Resources

### Learning Materials

- [Electron Docs](https://www.electronjs.org/docs/latest) - Official Electron documentation
- [React Docs](https://react.dev/) - Modern React with hooks
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Utility classes reference
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - TS deep dive

### BoostClient-Specific

- [Modrinth API Docs](https://docs.modrinth.com/api) - Mod installation endpoints
- [PaperMC API](https://docs.papermc.io/misc/paper-api) - Server version fetching
- [Playit.gg Docs](https://playit.gg/docs) - Tunnel setup
- [Minecraft Wiki](https://minecraft.fandom.com/wiki/Minecraft_Wiki) - Game mechanics

---

## 🎯 Roadmap Priorities

Want to contribute but not sure where to start? Here's what we need most:

### High Priority
- [ ] **Linux & macOS builds** - Adapt file paths and Java detection
- [ ] **Automated tests** - Jest unit tests + Playwright E2E
- [ ] **CurseForge API integration** - Expand mod library
- [ ] **Discord Rich Presence** - Show game status in Discord

### Medium Priority
- [ ] **Server backup system** - Automatic world backups
- [ ] **Built-in Dynmap viewer** - Embedded server map
- [ ] **Custom JVM args validator** - Warn about invalid flags
- [ ] **Mod conflict detection** - Warn about incompatible mods

### Low Priority (Nice to Have)
- [ ] **Server performance graphs** - TPS, RAM, CPU over time
- [ ] **Mod update checker** - Notify when mods have updates
- [ ] **Custom themes** - User-created color schemes
- [ ] **Server templates** - Pre-configured server types (Skyblock, Vanilla+, etc)

---

## 🙏 Contributors

Thank you to all our contributors! Your work makes BoostClient better for everyone.

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- This section is auto-generated, don't edit manually -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

---

## 📜 License

By contributing to BoostClient, you agree that your contributions will be licensed under the MIT License.

---

## 💬 Need Help?

- **Discord**: [Join our community](https://discord.gg/boostclient)
- **Discussions**: [GitHub Discussions](https://github.com/boostclient/boostclient/discussions)
- **Email**: support@boostclient.net

---

<div align="center">

**⚡ Thank you for contributing to BoostClient! ⚡**

Every contribution, no matter how small, makes a difference.

</div>
