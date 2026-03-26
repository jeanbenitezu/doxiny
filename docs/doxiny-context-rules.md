# Doxiny - Context Maintenance Rules

## 🚨 CRITICAL RULE: Update Documentation on All Changes

**Every time ANY change is made to Doxiny through prompts, these context files MUST be updated to reflect the current state.**

## Automatic Update Triggers

### When to Update Context Files:

#### 🏗️ Architecture Changes (`doxiny-architecture.md`)
- **Adding/removing files** → Update file structure section
- **New dependencies** → Update the dependencies section  
- **Build process changes** → Update build & deployment section
- **New patterns/technologies** → Add to architecture patterns

#### 🎮 Game Mechanics Changes (`doxiny-game-mechanics.md`) 
- **New operations** → Add to operations section with examples
- **Algorithm modifications** → Update BFS or generation logic
- **Difficulty adjustments** → Update progression table
- **New game modes** → Add complete mechanics documentation

#### 💻 Development Updates (`doxiny-development-patterns.md`)
- **New code patterns** → Document the pattern with examples  
- **UI/UX changes** → Update styling patterns and components
- **Performance optimizations** → Add to optimization section
- **New testing cases** → Update testing patterns and edge cases

#### 🎨 Branding Updates (`doxiny-branding.md`)
- **Visual changes** → Update color palette or styling
- **Copy/messaging changes** → Update brand voice section
- **New marketing features** → Add to positioning section

## Update Process Workflow

### 1. Immediate Updates (During Development)
```
Prompt Request → Code Changes → IMMEDIATELY Update Context Files
```

### 2. What to Update in Each File

#### After Adding New Features:
- [ ] `doxiny-architecture.md` - Add file changes, new patterns
- [ ] `doxiny-game-mechanics.md` - Document game logic changes  
- [ ] `doxiny-development-patterns.md` - Add new code patterns
- [ ] Add "Last Updated" timestamp to all modified files

#### After Bug Fixes:
- [ ] `doxiny-development-patterns.md` - Add debugging insights
- [ ] Update edge cases or testing patterns if relevant

#### After UI/UX Changes:
- [ ] `doxiny-development-patterns.md` - Update UI patterns
- [ ] `doxiny-branding.md` - Update if visual identity changed

### 3. Context File Cross-References

When updating one file, check if these related files need updates:

**Architecture ↔ Development Patterns**
- New files = new patterns to document
- Build changes = new workflow patterns

**Game Mechanics ↔ Development Patterns** 
- Algorithm changes = new code patterns
- New operations = new testing cases

**Branding ↔ Development Patterns**
- UI changes = new styling patterns
- Theme updates = new CSS patterns

## Validation Checklist

### After Any Change Session:
- [ ] All context files reflect current codebase state
- [ ] No outdated information remains
- [ ] New patterns are documented with examples
- [ ] Dependencies and file structure are accurate
- [ ] "Last Updated" timestamps are current

### Monthly Context Review:
- [ ] Remove obsolete sections
- [ ] Consolidate similar patterns
- [ ] Verify all examples still work
- [ ] Update based on lessons learned

## Context File Purposes

### Primary Functions:
1. **Onboarding**: New development sessions start with complete context
2. **Consistency**: Maintain consistent patterns across changes
3. **Knowledge Base**: Preserve decisions and rationale
4. **Quality Control**: Ensure changes align with established patterns

### Secondary Benefits:
- Faster development (no need to re-explore codebase)
- Better decision-making (understand existing patterns)  
- Reduced bugs (follow established best practices)
- Team communication (shared understanding of codebase)

## File-Specific Update Rules

### `doxiny-architecture.md`
❗ **Update when**: File structure changes, new dependencies, build system changes
🎯 **Focus on**: Technical structure, not game mechanics

### `doxiny-game-mechanics.md` 
❗ **Update when**: Game rules change, new operations, algorithm modifications
🎯 **Focus on**: How the game works, not how it's coded

### `doxiny-development-patterns.md`
❗ **Update when**: New code patterns, UI changes, performance optimizations  
🎯 **Focus on**: How to code correctly for this project

### `doxiny-branding.md`
❗ **Update when**: Visual changes, messaging updates, marketing features
🎯 **Focus on**: Brand consistency and visual identity

## Emergency Recovery

If context files become out of sync:
1. **Stop development** until context is restored
2. **Re-explore codebase** using exploration tools
3. **Update all files** based on current state  
4. **Validate** by checking examples still work
5. **Resume development** with accurate context

---

## ⚡ QUICK REFERENCE

**Before ANY code change**: Check which context files will be affected
**After ANY code change**: Update affected context files IMMEDIATELY  
**Weekly habit**: Review context files for accuracy and completeness
