/**
 * Number Puzzle PWA - Main Entry Point
 * Mobile-first mathematical puzzle game
 */

import { createGameState, applyMove, resetGame, getHints, getOptimalMoves, getLevelCompletionData } from './game.js';
import { operationLabels } from './operations.js';
import './style.css';

// Game state with progressive levels
const levels = [
  { goal: 10, name: "Beginner", description: "Master the basics" },
  { goal: 25, name: "Intermediate", description: "Strategic thinking" }, 
  { goal: 128, name: "Expert", description: "Ultimate challenge" }
];

let currentLevel = 0;
let gameState = createGameState(levels[currentLevel].goal, currentLevel + 1);
let hintsUsed = 0;
let maxHints = 3;

// DOM elements
const app = document.querySelector('#app');

/**
 * Register service worker for PWA functionality
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('🔧 SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('❌ SW registration failed: ', registrationError);
        });
    });
  }
}

/**
 * Create the main game UI
 */
function createGameUI() {
  const level = levels[currentLevel];
  const optimal = getOptimalMoves(currentLevel);
  
  return `
    <!-- BEGIN: MainHeader -->
    <header class="w-full max-w-md flex flex-col items-center mb-6 pt-4" data-purpose="app-header">
      <div class="flex items-center gap-2 mb-6">
        <span class="text-3xl">🧩</span>
        <h1 class="text-2xl font-bold tracking-widest uppercase">Number Puzzle</h1>
      </div>
      
      <!-- Level Selector Segmented Control -->
      <nav class="w-full flex justify-between gap-2 mb-6" data-purpose="level-selector">
        ${levels.map((lvl, idx) => 
          `<button class="flex-1 ${idx === currentLevel ? 'bg-orange-600 border-2 border-orange-400 glow-active' : 'bg-[#2a2f3a] border border-white/10 opacity-60'} rounded-xl p-3 flex flex-col items-center transition-all active:scale-95 level-btn" 
                   data-level="${idx}" ${idx > currentLevel ? 'disabled' : ''}>
            <span class="text-xl font-bold">${idx + 1}</span>
            <span class="text-[10px] uppercase font-bold">${lvl.name}</span>
            <span class="text-[10px] opacity-80">→ ${lvl.goal}</span>
          </button>`
        ).join('')}
      </nav>
      
      <!-- Current Goal Badge -->
      <div class="flex flex-col items-center gap-1">
        <div class="bg-orange-600 px-6 py-1 rounded-full text-sm font-bold uppercase tracking-wider glow-orange border border-orange-400">
          Level ${currentLevel + 1}: ${level.name}
        </div>
        <p class="text-gray-400 text-xs mt-2">${level.description}</p>
        <p class="text-emerald-400 text-xs font-semibold">Target: ≤ ${optimal} moves</p>
      </div>
    </header>
    <!-- END: MainHeader -->
    
    <!-- BEGIN: GameBoard -->
    <main class="w-full max-w-md flex-1 flex flex-col gap-4">
      <!-- Central Number Display -->
      <section class="glass-panel rounded-3xl p-6 flex justify-center items-center mb-2" data-purpose="number-display">
        <span class="text-8xl font-black text-white tracking-tighter current-number" id="current-number">${gameState.current}</span>
      </section>
      
      <!-- Operation Buttons Grid -->
      <section class="grid grid-cols-2 gap-3" data-purpose="game-controls">
        ${Object.entries(operationLabels).map(([op, label]) => 
          `<button class="bg-[#ef4444] hover:bg-[#dc2626] text-white font-black py-5 rounded-2xl shadow-lg uppercase tracking-widest text-lg transition-transform active:scale-95 operation-btn" data-operation="${op}" aria-label="${label} operation">
            ${label}
          </button>`
        ).join('')}
      </section>
      
      <!-- Utility Row -->
      <section class="grid grid-cols-3 gap-3" data-purpose="utility-controls">
        <button class="bg-[#374151] border border-white/10 rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-bold transition-transform active:scale-95 reset-btn" id="reset-btn">
          <span>🔄</span> Reset
        </button>
        <button class="bg-[#8b5cf6] border border-[#a78bfa] rounded-2xl py-4 flex flex-col items-center justify-center text-xs font-bold transition-transform active:scale-95 hint-btn" id="hint-btn" ${hintsUsed >= maxHints ? 'disabled' : ''}>
          <span>💡 Hint</span>
          <span class="opacity-80">(${hintsUsed}/${maxHints})</span>
        </button>
        <button class="bg-[#374151] border border-white/10 rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-bold transition-transform active:scale-95 info-btn" id="info-btn">
          <span>ℹ️</span> Help
        </button>
      </section>
      
      <!-- Stats Bar -->
      <section class="border border-orange-900/50 bg-orange-900/10 rounded-xl p-3 flex justify-between items-center" data-purpose="stats-display">
        <div class="text-orange-500 font-bold">
          Moves: <span id="moves-count">${gameState.moves}</span>
        </div>
        <div class="bg-emerald-900/30 border border-emerald-500/50 rounded-full px-3 py-1 flex items-center gap-1">
          <span class="text-[10px]">🎯</span>
          <span class="text-emerald-400 text-xs font-bold">${gameState.moves <= optimal ? 'Perfect' : gameState.moves <= optimal + 2 ? 'Great' : 'Good'}</span>
        </div>
      </section>
    </main>
    <!-- END: GameBoard -->
    
    <!-- BEGIN: HistorySection -->
    <footer class="w-full max-w-md mt-6 pb-8" data-purpose="game-history">
      <h3 class="text-center text-gray-500 font-bold uppercase tracking-widest text-sm mb-3">History</h3>
      <div class="bg-[#111827] rounded-xl p-4 font-mono text-sm history-list" id="history-list">
        ${renderHistory()}
      </div>
    </footer>
    <!-- END: HistorySection -->
    
    <!-- Hint Modal -->
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm hint-modal hidden" id="hint-modal">
      <div class="bg-gradient-to-br from-[#9f7aea] to-[#805ad5] border-3 border-[#9f7aea] rounded-3xl p-8 max-w-sm w-11/12 text-center shadow-2xl">
        <h3 class="text-2xl font-bold text-white mb-4">💡 Smart Hint</h3>
        <p class="text-white/95 text-lg mb-6 leading-relaxed" id="hint-text"></p>
        <button class="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-6 py-3 rounded-xl font-bold uppercase tracking-wide transition-all transform hover:-translate-y-1 close-hint-btn" id="close-hint-btn">Got it!</button>
      </div>
    </div>
    
    <!-- Success Modal -->
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm success-modal hidden" id="success-modal">
      <div class="bg-gradient-to-br from-[#2d3748] to-[#1a1a1a] border-3 border-emerald-500 rounded-3xl p-8 max-w-sm w-11/12 text-center shadow-2xl shadow-emerald-500/30">
        <div class="text-6xl mb-4 celebration-emoji" id="celebration-emoji">🎉</div>
        <h2 class="text-3xl font-bold text-emerald-400 mb-4 drop-shadow-lg" id="success-title">Level Complete!</h2>
        <p class="text-white/90 text-xl mb-6" id="success-message">Great job!</p>
        <div class="flex gap-8 justify-center mb-8">
          <div class="flex flex-col items-center">
            <span class="text-white/70 text-sm uppercase tracking-wide font-semibold">Moves</span>
            <span class="text-emerald-400 text-2xl font-bold drop-shadow-lg" id="final-moves">0</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-white/70 text-sm uppercase tracking-wide font-semibold">Target</span>
            <span class="text-emerald-400 text-2xl font-bold drop-shadow-lg">${optimal}</span>
          </div>
        </div>
        <div class="flex gap-4 justify-center flex-wrap">
          ${currentLevel < levels.length - 1 ? '<button class="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-orange-500/30 next-level-btn" id="next-level-btn">Next Level 🚀</button>' : ''}
          <button class="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/30 play-again-btn" id="play-again-btn">Play Again</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render game history
 */
function renderHistory() {
  if (gameState.history.length === 0) {
    return `<div class="flex justify-between items-center opacity-70">
      <div>
        <span class="text-gray-600">1.</span>
        <span class="text-orange-500 font-bold ml-2">START</span>
      </div>
      <span class="text-emerald-500">[1]</span>
    </div>`;
  }
  
  return gameState.history.map((entry, index) => 
    `<div class="flex justify-between items-center opacity-70 ${index < gameState.history.length - 1 ? 'border-b border-white/10 pb-2 mb-2' : ''}">
      <div>
        <span class="text-gray-600">${index + 1}.</span>
        <span class="text-orange-500 font-bold ml-2">${entry.action}</span>
      </div>
      <span class="text-emerald-500">[${entry.value}]</span>
    </div>`
  ).join('');
}

/**
 * Update the game display
 */
function updateDisplay() {
  // Update current number with animation
  const currentEl = document.getElementById('current-number');
  if (currentEl) {
    currentEl.textContent = gameState.current;
    currentEl.classList.add('updated');
    setTimeout(() => currentEl.classList.remove('updated'), 300);
  }
  
  // Update moves counter
  const movesEl = document.getElementById('moves-count');
  if (movesEl) movesEl.textContent = gameState.moves;
  
  // Update history
  const historyEl = document.getElementById('history-list');
  if (historyEl) {
    historyEl.innerHTML = renderHistory();
    historyEl.scrollTop = historyEl.scrollHeight; // Auto-scroll to bottom
  }
  
  // Check for win condition
  if (gameState.isComplete) {
    showSuccessModal();
  }
}

/**
 * Show success modal with enhanced celebration
 */
function showSuccessModal() {
  const modal = document.getElementById('success-modal');
  const finalMoves = document.getElementById('final-moves');
  const title = document.getElementById('success-title');
  const message = document.getElementById('success-message');
  const emoji = document.getElementById('celebration-emoji');
  
  if (modal && finalMoves) {
    const completionData = getLevelCompletionData(currentLevel, gameState.moves);
    
    finalMoves.textContent = gameState.moves;
    title.textContent = completionData.title;
    message.textContent = completionData.message;
    emoji.textContent = completionData.emoji;
    
    modal.classList.remove('hidden');
    
    // Enhanced celebration effects
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
    
    // Animate celebration emoji
    setTimeout(() => {
      emoji.style.animation = 'bounce 1s ease-in-out infinite';
    }, 100);
  }
}

/**
 * Handle operation button clicks
 */
function handleOperationClick(operation) {
  if (!gameState.isComplete) {
    try {
      gameState = applyMove(gameState, operation);
      updateDisplay();
    } catch (error) {
      console.error('Error applying operation:', error);
    }
  }
}

/**
 * Handle reset button click
 */
function handleReset() {
  gameState = resetGame(levels[currentLevel].goal, currentLevel + 1);
  hintsUsed = 0;
  updateDisplay();
}

/**
 * Go to next level
 */
function handleNextLevel() {
  if (currentLevel < levels.length - 1) {
    currentLevel++;
    hintsUsed = 0;
    gameState = createGameState(levels[currentLevel].goal, currentLevel + 1);
    // Re-render entire UI for new level
    app.innerHTML = createGameUI();
  }
}

/**
 * Handle level selection
 */
function handleLevelSelect(level) {
  if (level <= currentLevel) { // Only allow selecting unlocked levels
    currentLevel = level;
    hintsUsed = 0;
    gameState = createGameState(levels[currentLevel].goal, currentLevel + 1);
    app.innerHTML = createGameUI();
  }
}

/**
 * Show hint modal
 */
function showHint() {
  if (hintsUsed >= maxHints) return;
  
  const modal = document.getElementById('hint-modal');
  const hintText = document.getElementById('hint-text');
  
  if (modal && hintText) {
    const hint = getHints(currentLevel, gameState.current);
    hintText.textContent = hint;
    modal.classList.remove('hidden');
    hintsUsed++;
    
    // Update hint button
    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
      hintBtn.textContent = `💡 Hint (${hintsUsed}/${maxHints})`;
      if (hintsUsed >= maxHints) {
        hintBtn.disabled = true;
      }
    }
  }
}

/**
 * Show info modal (rules)
 */
function showInfoModal() {
  const level = levels[currentLevel];
  const hints = {
    0: "💡 Tip: Use ×2 to grow quickly, then SUM to reduce if needed!",
    1: "💡 Strategy: Try to get to 24 or 25, then use ×2 sparingly.", 
    2: "💡 Expert level: Think about powers of 2 (64→128) and digit manipulation."
  };
  
  alert(`🧩 Number Puzzle - Level ${currentLevel + 1}\n\n• Start: 1, Goal: ${level.goal}\n• MIRROR: Reverse digits (12 → 21)\n• SUM: Add digits (123 → 6)\n• ADD 1: Append 1 (4 → 41)\n• ×2: Double the number (8 → 16)\n\n${hints[currentLevel]}\n\nOptimize for fewest moves!`);
}

/**
 * Initialize the game
 */
function init() {
  // Register service worker first
  registerServiceWorker();
  
  // Render initial UI
  app.innerHTML = createGameUI();
  
  // Add event listeners
  document.addEventListener('click', (e) => {
    if (e.target.matches('.operation-btn')) {
      const operation = e.target.dataset.operation;
      handleOperationClick(operation);
    } else if (e.target.matches('#reset-btn')) {
      handleReset();
    } else if (e.target.matches('#hint-btn')) {
      showHint();
    } else if (e.target.matches('#close-hint-btn')) {
      document.getElementById('hint-modal').classList.add('hidden');
    } else if (e.target.matches('#info-btn')) {
      showInfoModal();
    } else if (e.target.matches('#next-level-btn')) {
      document.getElementById('success-modal').classList.add('hidden');
      handleNextLevel();
    } else if (e.target.matches('#play-again-btn')) {
      document.getElementById('success-modal').classList.add('hidden');
      handleReset();
    } else if (e.target.matches('.level-btn')) {
      const level = parseInt(e.target.dataset.level);
      handleLevelSelect(level);
    }
  });
  
  // Add keyboard support
  document.addEventListener('keydown', (e) => {
    switch(e.key) {
      case '1': handleOperationClick('mirror'); break;
      case '2': handleOperationClick('sum'); break; 
      case '3': handleOperationClick('add1Right'); break;
      case '4': handleOperationClick('double'); break;
      case 'r': case 'R': handleReset(); break;
    }
  });
  
  console.log('🧮 Number Puzzle loaded! Level:', currentLevel + 1, 'Goal:', gameState.goal);
  console.log('💡 Use keys 1-4 for operations, R for reset');
}

// Start the game
init();