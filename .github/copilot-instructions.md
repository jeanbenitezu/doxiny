# Doxiny Number Puzzle - Project Instructions

This is a mathematical puzzle game built with Vanilla JS + Vite.

## Project Overview
- **Game Type**: Number manipulation puzzle
- **Tech Stack**: Vanilla JS, Vite, CSS
- **Target**: Mobile-first, dev-friendly design
- **Core Concept**: Transform numbers using 4 operations to reach goal

## Game Mechanics
- Start with number 1, reach goal (e.g., 128)
- Operations: REVERSE, SUM DIGITS, APPEND 1, DOUBLE
- Track movement history and optimize for fewest steps

## Development Focus
- Clean, modular code structure
- Mobile-optimized UI with large touch targets
- Performance-focused for smooth animations
- Easy to understand and extend

## Coding Guidelines
- Use ES6+ features and modules
- Follow functional programming patterns where possible
- Keep operations pure functions
- Prioritize readability and maintainability

## 🌍 Translation Requirements
**MANDATORY RULE**: Always translate app UI copies and make new entries in the i18n file.
- **All UI text** must use `translate()` function from `src/i18n.js`
- **Console logs** can remain in English for development purposes
- **New UI strings** must be added to both English and Spanish in `src/i18n.js` translations object
- **No hardcoded strings** in UI components - use translation keys instead

## 📋 CRITICAL: Context Documentation Maintenance

**MANDATORY RULE**: After ANY code change, IMMEDIATELY update the relevant context documentation files in `docs/`:

### Context Files to Maintain:
- **`docs/doxiny-context-index.md`** - Overview and navigation of all context files
- **`docs/doxiny-architecture.md`** - Technical structure, file organization, build system
- **`docs/doxiny-game-mechanics.md`** - Game rules, algorithms, BFS validation, operations
- **`docs/doxiny-development-patterns.md`** - Code patterns, UI/UX guidelines, best practices
- **`docs/doxiny-branding.md`** - Brand identity, colors, messaging, visual consistency

### Update Rules:
1. **Before development**: Read relevant context files for current state understanding
2. **After ANY change**: Update affected context files with new information
3. **Remove outdated**: Delete obsolete information that no longer applies
4. **Add examples**: Include code examples for new patterns discovered
5. **Update timestamps**: Change "Last Updated" date on all modified context files

### Which Files to Update Based on Change Type:
- **File structure/dependencies** → `docs/doxiny-architecture.md`
- **Game logic/operations** → `docs/doxiny-game-mechanics.md` 
- **Code patterns/UI changes** → `docs/doxiny-development-patterns.md`
- **Visual/branding changes** → `docs/doxiny-branding.md`
- **Process improvements** → `docs/doxiny-context-rules.md`

**Failure to maintain context files will result in outdated development guidance and inconsistent project evolution.**