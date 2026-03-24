# 🔢 Doxiny - Do X in Y moves

> *"The elegance is in efficiency"*

A minimalist mathematical puzzle game where you transform numbers using 4 operations to reach your goal in the fewest moves possible.

**DOXINY** = **"Do X in Y moves"** - Transform number X into target Y with optimal strategy.

## 🎮 Game Modes

### 🎯 Normal Mode
- **Progression System**: Unlock levels through efficient completion (80-90% efficiency required)
- **Visual Theme**: Focused blue-purple gradient background with structured animations
- **Master Path**: Complete all 6 levels to achieve Master status
- **Success Modal**: "Next Level" button (or "Try Free Play" for Masters)

### 🔓 Free Play Mode  
- **Open Access**: All difficulty levels available immediately
- **Visual Theme**: Creative green-teal gradient background with organic animations
- **Custom Exercises**: Masters can create and share custom puzzles
- **Success Modal**: "Try Normal Mode" button to invite structured gameplay

### 🏆 Master Achievement
- **Recognition**: Crown indicator (👑) with completion counter badge (1-9, then ∞)
- **Exclusive Features**: Custom exercise creation in Free Play mode
- **Prestige System**: Completion counter tracks how many times you've mastered all levels
- **Replayable Progression**: Levels automatically reset to 1 after each mastery for endless challenge
- **Cross-Mode Flow**: Special "Try Free Play" invitation after achieving Master status

## 🎨 Visual Experience

Doxiny features a sophisticated visual system that adapts to your gameplay mode:

- **Dynamic Backgrounds**: Animated gradient patterns that reflect your current game mode
- **Smooth Transitions**: 0.8-second CSS transitions with pulse overlay effects when switching modes
- **Mode Indicators**: Enhanced button styling with distinctive colors and glowing effects
- **Visual Continuity**: Consistent design language across all UI elements

## 🎮 How to Play

- **Goal**: Transform numbers using 4 operations to reach the target
- **Challenge**: Do it in the **minimum moves possible**  
- **Strategy**: Think ahead, plan your path, optimize your solution

### The 4 Operations:
- 🔄 **REVERSE**: Reverse all digits (12 → 21)
- ➕ **SUM DIGITS**: Add all digits (128 → 11) 
- 1️⃣ **APPEND 1**: Append 1 to the end (4 → 41)
- ✖️ **DOUBLE**: Double the number (8 → 16)

## 🌍 Multi-Language Support

Doxiny supports multiple languages with a simple language switcher:

- **🇺🇸 English** - "Do X in Y moves" 
- **🇪🇸 Español** - "Haz X en Y movimientos"

The game automatically detects your browser language and provides seamless translation of all interface elements, operation labels, and instructions.

## ✨ Features

- 🎨 **Animated Game Mode Backgrounds** - Dynamic visual themes for Normal and Free Play modes
- 🔄 **Smooth Mode Transitions** - Elegant 0.8s transitions with pulse overlay effects  
- 🎯 **Cross-Mode Invitations** - Smart success modal buttons guide players between game modes
- 🌍 **Multi-language Support** - English and Spanish localization
- 📱 **Mobile-first design** with touch-optimized controls
- ⚡ **Always Latest** - No caching, ensures fresh content on every visit
- 📊 **Move history tracking** for learning patterns
- ⌨️ **Keyboard shortcuts** (1-4 for operations, R for reset)
- 🏆 **Master Achievement System** - Unlock Free Play mode and custom exercises
- 💫 **Enhanced Visual Feedback** - Mode-specific styling and hover animations
- 🎨 **Doxiny Blue color scheme** with visual consistency

## 🚀 Development

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Tech Stack

- **Vanilla JavaScript** - Pure ES6+ modules
- **Vite** - Fast build tool and dev server
- **CSS3** - Mobile-first responsive design
- **No Caching** - Always serves latest version for instant updates

### Project Structure

```
├── src/
│   ├── main.js       # Main entry point & UI
│   ├── game.js       # Game engine & state management
│   ├── operations.js # Mathematical operations
│   └── style.css     # Mobile-first styles
├── public/
│   └── sw.js         # Cleanup service worker (removes caching)
└── index.html        # App shell
```

## 🎯 Game Strategy Tips

Spoiler-free hints for getting started:

- Experiment with combinations - operations interact in interesting ways
- DOUBLE operation can help reach larger targets quickly
- SUM DIGITS is great for reducing large numbers
- REVERSE can create surprising new patterns
- Track your best solutions and try to optimize!

## 🔧 Customization

Easy to modify:

- **Goal number**: Change the target in `main.js`
- **New operations**: Add to `operations.js`
- **Styling**: Modify `style.css` for different themes
- **Game rules**: Extend `game.js` for variants

## 🏗️ Contributing

This is a learning project built with clean, readable code. Ideas for enhancements:

- [ ] Multiple difficulty levels
- [ ] Daily challenges
- [ ] Score sharing
- [ ] Sound effects
- [ ] More operations
- [ ] Tutorials/hints

## 📄 License

MIT License - Feel free to use and modify!

---

🧮 **Happy puzzling!** Try to reach 128 in under 8 moves.
