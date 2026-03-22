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

**Update triggers**: File structure changes, new dependencies, build modifications

---

### 🎮 [`doxiny-game-mechanics.md`]
**Purpose**: Game rules, algorithms, and mathematical logic
**Contains**:
- The four operations and their behaviors
- BFS exercise generation and validation
- Difficulty progression and scoring system
- Player statistics and progress tracking

**Update triggers**: Game rule changes, new operations, algorithm modifications

---

### 💻 [`doxiny-development-patterns.md`]  
**Purpose**: How to code correctly for this project
**Contains**:
- Code organization principles and patterns
- UI/UX implementation guidelines
- Error handling and performance optimization
- Testing patterns and debugging approaches

**Update triggers**: New code patterns, UI changes, optimization techniques

---

### 🎨 [`doxiny-branding.md`]
**Purpose**: Brand identity and visual consistency  
**Contains**:
- Core brand identity and positioning
- Color palette and visual guidelines
- Multi-language support strategy
- Marketing and growth approach

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
- **Type**: Mathematical number puzzle PWA
- **Tech**: Vanilla JS + Vite + Tailwind CSS
- **Goal**: Transform 1 → target using 4 operations optimally
- **Operations**: REVERSE, SUM DIGITS, APPEND 1, DOUBLE
- **Validation**: BFS ensures all exercises are solvable

---

**Remember**: These context files are your development companion. Keep them updated, and they'll accelerate every development session by providing instant project knowledge.

Last Updated: March 21, 2026