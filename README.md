# 🔢 Doxiny - Do X in Y moves

> *"The elegance is in efficiency"*

A minimalist mathematical puzzle game where you transform numbers using 4 operations to reach your goal in the fewest moves possible.

**DOXINY** = **"Do X in Y moves"** - Transform number X into target Y with optimal strategy.

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

- � **Doxiny Branding** - "Do X in Y moves" with elegant visual identity
- 🌍 **Multi-language Support** - English and Spanish localization
- 📱 **Mobile-first design** with touch-optimized controls
- ⚡ **Always Latest** - No caching, ensures fresh content on every visit
- 📊 **Move history tracking** for learning patterns
- ⌨️ **Keyboard shortcuts** (1-4 for operations, R for reset)
- 🎯 **Multiple goals** and difficulty levels
- 🏆 **Optimized for fewest moves**
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
