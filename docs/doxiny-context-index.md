# Doxiny - Project Context Index

## 📚 Context Documentation System

This repository maintains a living documentation system that provides complete project context for development sessions. These files are automatically updated whenever changes are made to the codebase.

## 🗂️ Context Files Overview

### 🏗️ [`doxiny-architecture.md`]
**Purpose**: Technical structure and build system
**Contains**: 
- File organization and responsibilities
- Tech stack and dependencies  
- Architecture patterns and code organization
- Build and deployment processes
- **UPDATED March 24, 2026**: Completion counter system, level reset functionality, and crown badge UI
- **CURRENT**: Enhanced mastery system with replayable progression and prestige tracking

**Update triggers**: File structure changes, new dependencies, build modifications, mastery system architecture

---

### 🎮 [`doxiny-game-mechanics.md`]
**Purpose**: Game rules, algorithms, and mathematical logic
**Contains**:
- The four operations and their behaviors
- BFS exercise generation and validation
- Difficulty progression and scoring system
- **UPDATED March 24, 2026**: Completion counter system and level reset upon mastery achievement
- **CURRENT**: Enhanced mastery achievement with prestige system and replayable progression

**Update triggers**: Game rule changes, new operations, algorithm modifications, achievement system updates

---

### 💻 [`doxiny-development-patterns.md`]  
**Purpose**: How to code correctly for this project
**Contains**:
- Code organization principles and patterns
- UI/UX implementation guidelines
- Error handling and performance optimization
- Testing patterns and debugging approaches
- **UPDATED March 24, 2026**: Crown badge UI patterns and completion counter management
- **CURRENT**: Enhanced mastery system patterns with automatic level reset and prestige tracking

**Update triggers**: New code patterns, UI changes, optimization techniques, mastery features

---

### 🎨 [`doxiny-branding.md`]
**Purpose**: Brand identity and visual consistency  
**Contains**:
- Core brand identity and positioning
- **UPDATED March 24, 2026**: Enhanced visual design with animated mode backgrounds
- **CURRENT**: Dynamic background system and mode-specific UI styling

**Update triggers**: Visual changes, messaging updates, branding decisions

---

### 📋 [`doxiny-context-rules.md`]
**Purpose**: Rules for maintaining these context files
**Contains**:
- When and how to update context files
- Validation checklists and workflows
- Cross-reference guidelines
- Emergency recovery procedures

**Update triggers**: Process improvements, new maintenance patterns discovered

## 🆕 Recent Major Changes (March 24, 2026)

### 🎨 Animated Game Mode Background System
- **Visual Enhancement**: Dynamic CSS animations distinguish between Normal and Free Play modes
- **Technology**: Multi-layer CSS gradients with coordinated JavaScript state management
- **User Experience**: Smooth 0.8s transitions with pulse overlay effects during mode switching

### 🔄 Cross-Mode Invitation System  
- **Success Modal Logic**: Smart button system based on game mode and Master status
  - Normal + Regular → "Next Level"
  - Normal + Master → "Try Free Play"  
  - Free Play → "Try Normal Mode"
- **Engagement Flow**: Bidirectional invitations create natural exploration between structured and creative gameplay

### 🎯 Enhanced Mode Indicators
- **Visual Feedback**: Mode-specific button styling with distinct color schemes and glowing effects
- **CSS Classes**: `.btn-mode-normal` (blue gradients) and `.btn-mode-freeplay` (green gradients)
- **Hover Animations**: Sweep effects and enhanced interactivity for mode selection

### 🧩 Modular UI Component System (Added Later March 24, 2026)
- **Level Selector Modularization**: Extracted complex rendering logic into dedicated methods
  - `renderLevelSelectorUI()` - Generates level selector HTML with current state
  - `updateLevelSelectorUI()` - Updates just level selector without full page re-render
- **Performance Benefits**: Efficient selective updates provide immediate visual feedback on level unlocks
- **Architecture Impact**: Better code organization, easier maintenance, smoother user experience

### 🔧 Game Mode State Synchronization Fix (Fixed March 24, 2026) 
- **Critical Bug Fix**: Exercise completion detection now works properly when switching Freeplay → Normal
- **Root Cause**: `gameState` was not syncing with new exercise after mode change
- **Solution**: Added `gameState = createGameState()` call during Normal mode activation
- **Impact**: Users can now complete exercises correctly regardless of mode switching patterns

---

## 🔄 Context Maintenance Workflow

### For Every Development Session:
1. **Read context files** to understand current state
2. **Make code changes** following documented patterns  
3. **Update context files** immediately after changes
4. **Validate consistency** across all context files

### Quick Context Check:
```
Architecture → "How is the code organized?"
Game Mechanics → "How does the game work?"  
Development → "How do I code this correctly?"
Branding → "How should this look and feel?"
Context Rules → "How do I maintain these files?"
```

## 🎯 Context File Relationships

```
doxiny-architecture.md ←→ doxiny-development-patterns.md
      ↓                           ↓
   Technical                   Code Implementation
   Structure                   Guidelines
      │                           │
      └─────── Game Logic ────────┘
                    ↓
            doxiny-game-mechanics.md
                    ↓
              Game Behavior & Rules
                    ↓
               Visual Identity
                    ↓
            doxiny-branding.md
```

## ⚡ Quick Reference by Task Type

### 🔧 **Adding New Features**
Read: Game Mechanics → Development Patterns → Architecture
Update: All files that the feature touches

### 🐛 **Fixing Bugs**  
Read: Development Patterns → Architecture
Update: Development Patterns (add debugging insights)

### 🎨 **UI/UX Changes**
Read: Branding → Development Patterns  
Update: Development Patterns → Branding (if identity changes)

### 🏗️ **Refactoring**
Read: Architecture → Development Patterns
Update: Architecture → Development Patterns

### 📱 **Performance Optimization**
Read: Development Patterns → Architecture
Update: Development Patterns

## 📊 Context Health Indicators

### ✅ Healthy Context:
- All "Last Updated" timestamps are recent
- Examples in files work with current codebase
- No contradictions between files
- New patterns are documented

### ⚠️ Stale Context:
- Outdated timestamps (>1 week old with active development)
- Examples that don't match current code
- Missing documentation for recent features
- Contradictory information between files

### 🚨 Emergency Context Update Needed:
- Major architectural changes not reflected
- Game mechanics changes not documented  
- New development patterns not captured
- Build system changes not recorded

## 🎮 Project Quick Facts

- **Name**: Doxiny (Do X in Y moves)
- **Type**: Mathematical number puzzle
- **Tech**: Vanilla JS + Vite + Tailwind CSS
- **Goal**: Transform 1 → target using 4 operations optimally
- **Operations**: REVERSE, SUM DIGITS, APPEND 1, DOUBLE
- **Validation**: BFS ensures all exercises are solvable

---

**Remember**: These context files are your development companion. Keep them updated, and they'll accelerate every development session by providing instant project knowledge.

Last Updated: March 24, 2026