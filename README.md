# 🧮 Number Puzzle PWA

A minimalist mathematical puzzle game where you transform numbers using 4 operations to reach your goal.

## 🎮 How to Play

- **Goal**: Transform numbers using 4 operations to reach the target
- **Progressive Levels**:
  - **Level 1 (Beginner)**: 1 → 10
  - **Level 2 (Intermediate)**: 1 → 25  
  - **Level 3 (Expert)**: 1 → 128
- **Operations**:
  - **MIRROR**: Reverse all digits (12 → 21)
  - **SUM**: Add all digits (128 → 11)
  - **ADD 1**: Append 1 to the end (4 → 41)
  - **×2**: Double the number (8 → 16)

## ✨ Features

- 📱 **Mobile-first design** with touch-optimized controls
- 🌐 **Progressive Web App (PWA)** - works offline
- 📊 **Move history tracking** for learning patterns
- ⌨️ **Keyboard shortcuts** (1-4 for operations, R for reset)
- 🎯 **Multiple goals** and difficulty levels
- 🏆 **Optimized for fewest moves**

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
- **PWA** - Service Worker for offline support
- **Web Manifest** - App-like experience

### Project Structure

```
├── src/
│   ├── main.js       # Main entry point & UI
│   ├── game.js       # Game engine & state management  
│   ├── operations.js # Mathematical operations
│   └── style.css     # Mobile-first styles
├── public/
│   ├── manifest.json # PWA manifest
│   ├── sw.js         # Service worker
│   └── icon-*.png    # App icons
└── index.html        # App shell
```

## 🎯 Game Strategy Tips

Spoiler-free hints for getting started:

- Experiment with combinations - operations interact in interesting ways
- The SHIFT operation creates cycles that can be very useful
- SUM is great for reducing large numbers
- MIRROR can create surprising new patterns
- Track your best solutions and try to optimize!

## 🔧 Customization

Easy to modify:

- **Goal number**: Change the target in `main.js`
- **New operations**: Add to `operations.js`
- **Styling**: Modify `style.css` for different themes
- **Game rules**: Extend `game.js` for variants

## 📱 Installation

As a PWA, this game can be installed on your device:

1. Open in a modern browser
2. Look for "Add to Home Screen" or "Install App"
3. Enjoy offline play!

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
