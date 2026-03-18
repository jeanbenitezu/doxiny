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
    <div class="game-container">
      <header class="game-header">
        <h1>🧩 Number Puzzle</h1>
        
        <!-- Level Selector -->
        <div class="level-selector">
          ${levels.map((lvl, idx) => 
            `<button class="level-btn ${idx === currentLevel ? 'active' : ''} ${idx > currentLevel ? 'locked' : ''}" 
                     data-level="${idx}" ${idx > currentLevel ? 'disabled' : ''}>
              <span class="level-number">${idx + 1}</span>
              <span class="level-name">${lvl.name}</span>
              <span class="level-goal">→ ${lvl.goal}</span>
            </button>`
          ).join('')}
        </div>
        
        <div class="current-level-info">
          <div class="level-badge">Level ${currentLevel + 1}: ${level.name}</div>
          <div class="level-description">${level.description}</div>
          <div class="optimal-moves">Target: ≤ ${optimal} moves</div>
        </div>
      </header>
      
      <main class="game-main">
        <div class="current-number" id="current-number">${gameState.current}</div>
        
        <div class="game-controls">
          <div class="operations-grid">
            ${Object.entries(operationLabels).map(([op, label]) => 
              `<button class="operation-btn" data-operation="${op}" aria-label="${label} operation">
                ${label}
              </button>`
            ).join('')}
          </div>
          
          <div class="control-buttons">
            <button class="reset-btn" id="reset-btn">🔄 Reset</button>
            <button class="hint-btn" id="hint-btn" ${hintsUsed >= maxHints ? 'disabled' : ''}>
              💡 Hint (${hintsUsed}/${maxHints})
            </button>
            <button class="info-btn" id="info-btn">ℹ️ Help</button>
          </div>
        </div>
        
        <div class="game-stats">
          <span class="moves-counter">Moves: <span id="moves-count">${gameState.moves}</span></span>
          <span class="efficiency ${gameState.moves <= optimal ? 'perfect' : gameState.moves <= optimal + 2 ? 'great' : 'good'}">
            ${gameState.moves <= optimal ? '🎯 Perfect' : gameState.moves <= optimal + 2 ? '⭐ Great' : '📈 Good'}
          </span>
        </div>
      </main>
      
      <section class="history-section">
        <h2>History</h2>
        <div class="history-list" id="history-list">
          ${renderHistory()}
        </div>
      </section>
      
      <div class="hint-modal hidden" id="hint-modal">
        <div class="modal-content hint-content">
          <h3>💡 Smart Hint</h3>
          <p id="hint-text"></p>
          <button class="close-hint-btn" id="close-hint-btn">Got it!</button>
        </div>
      </div>
      
      <div class="success-modal hidden" id="success-modal">
        <div class="modal-content success-content">
          <div class="celebration-emoji" id="celebration-emoji">🎉</div>
          <h2 id="success-title">Level Complete!</h2>
          <p id="success-message">Great job!</p>
          <div class="success-stats">
            <div class="stat">
              <span class="stat-label">Moves</span>
              <span class="stat-value" id="final-moves">0</span>
            </div>
            <div class="stat">
              <span class="stat-label">Target</span>  
              <span class="stat-value">${optimal}</span>
            </div>
          </div>
          <div class="modal-buttons">
            ${currentLevel < levels.length - 1 ? '<button class="next-level-btn" id="next-level-btn">Next Level 🚀</button>' : ''}
            <button class="play-again-btn" id="play-again-btn">Play Again</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render game history
 */
function renderHistory() {
  return gameState.history.map((entry, index) => 
    `<div class="history-item">
      <span class="step-number">${index + 1}.</span>
      <span class="action">${entry.action}</span>
      <span class="value">[${entry.value}]</span>
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
  
  console.log('� Number Puzzle loaded! Level:', currentLevel + 1, 'Goal:', gameState.goal);
  console.log('💡 Use keys 1-4 for operations, R for reset');
}

// Start the game
init();