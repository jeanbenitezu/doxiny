/**
 * Doxiny Sharing System
 * Mobile-optimized sharing with Web Share API and URL routing
 */

import { t } from "./i18n.js";

/**
 * Get current game URL with puzzle parameters for sharing
 */
export function generateShareURL(goal, difficulty = null, moves = null, solved = false) {
  const baseURL = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  
  params.set('puzzle', goal.toString());
  if (difficulty) params.set('difficulty', difficulty.toString());
  if (moves && solved) params.set('challenge_moves', moves.toString());
  if (solved) params.set('solved', '1');
  
  return `${baseURL}?${params.toString()}`;
}

/**
 * Generate gamified sharing messages based on performance
 */
export function generateShareMessage(goal, moves, efficiency, isPerfect, solved = true, currentDifficulty = 1) {
  const baseURL = generateShareURL(goal, currentDifficulty, moves, solved);
  
  if (!solved) {
    // Sharing unsolved puzzle invitation
    const isExpert = currentDifficulty >= 5;
    const messageKey = isExpert ? "sharing.expertInviteMessage" : "sharing.inviteMessage";
    return t(messageKey, { goal }) + " " + baseURL;
  }
  
  // Sharing solved puzzle victory
  if (isPerfect) {
    return t("sharing.perfectVictoryMessage", { goal, moves }) + " " + baseURL;
  } else if (efficiency >= 80) {
    return t("sharing.victoryMessage", { goal, moves, efficiency }) + " " + baseURL;
  } else {
    return t("sharing.challengeMessage", { goal, moves }) + " " + baseURL;
  }
}

/**
 * Share puzzle using Web Share API or fallback to clipboard
 */
export async function shareContent(message, title = "Doxiny Number Puzzle") {
  try {
    // Try Web Share API first (mobile-friendly)
    if (navigator.share && navigator.canShare) {
      await navigator.share({
        title: title,
        text: message,
        url: "" // URL is already included in the message 
      });
      return { success: true, method: 'native' };
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(message);
      return { success: true, method: 'clipboard' };
    }
  } catch (error) {
    console.error("Sharing failed:", error);
    try {
      // Final fallback - create temporary textarea for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return { success: true, method: 'fallback' };
    } catch (fallbackError) {
      return { success: false, error: fallbackError };
    }
  }
}

/**
 * Show user feedback after sharing attempt
 */
export function showShareFeedback(shareResult) {
  // Create temporary feedback element
  const feedback = document.createElement('div');
  feedback.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all';
  
  if (shareResult.success) {
    feedback.textContent = t("sharing.linkCopied");
    feedback.classList.add('bg-emerald-500');
  } else {
    feedback.textContent = t("sharing.shareFailed");
    feedback.classList.add('bg-orange-500');
  }
  
  document.body.appendChild(feedback);
  
  // Remove after 3 seconds
  setTimeout(() => {
    feedback.style.opacity = '0';
    feedback.style.transform = 'translate(-50%, -100%)';
    setTimeout(() => document.body.removeChild(feedback), 300);
  }, 3000);
}

/**
 * Handle sharing completed puzzle with victory stats 
 */
export async function handleShareVictory(gameState, gameManager) {
  if (!gameState.isComplete) return;
  
  const exercise = gameManager.currentExercise;
  const efficiency = Math.round((exercise.optimalMoves / gameState.moves) * 100);
  const isPerfect = gameState.moves === exercise.optimalMoves;
  
  const message = generateShareMessage(
    gameState.goal,
    gameState.moves, 
    efficiency,
    isPerfect,
    true,
    gameManager.currentDifficulty
  );
  
  const result = await shareContent(message, t("sharing.sharedPuzzle"));
  showShareFeedback(result);
}

/**
 * Handle sharing current unsolved puzzle as challenge
 */
export async function handleShareChallenge(gameState, gameManager) {
  const message = generateShareMessage(
    gameState.goal,
    null,
    null,
    false,
    false,
    gameManager.currentDifficulty
  );
  
  const result = await shareContent(message, t("sharing.sharedPuzzle"));
  showShareFeedback(result);
}

/**
 * Handle URL parameters for shared puzzles
 */
export function handleSharedPuzzleURL(gameManager, resetGame, renderCallback) {
  const urlParams = new URLSearchParams(window.location.search);
  const puzzleGoal = urlParams.get('puzzle');
  const difficulty = urlParams.get('difficulty');
  const challengeMoves = urlParams.get('challenge_moves');
  const solved = urlParams.get('solved');
  
  if (puzzleGoal) {
    const goal = parseInt(puzzleGoal);
    if (goal >= 2 && goal <= 10000) {
      // Show shared puzzle notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm text-center';
      
      if (solved === '1' && challengeMoves) {
        notification.innerHTML = `🎯 <strong>Friend's Challenge!</strong><br>Beat their ${challengeMoves} moves to reach ${goal}!`;
      } else {
        notification.textContent = t("sharing.friendChallengesYou", { goal });
      }
      
      document.body.appendChild(notification);
      
      // Load the shared puzzle
      setTimeout(() => {
        if (difficulty) {
          gameManager.currentDifficulty = parseInt(difficulty);
        }
        
        // Create custom exercise for the shared goal
        gameManager.currentExercise = {
          goal: goal,
          difficulty: difficulty ? parseInt(difficulty) : 1,
          optimalMoves: "?", // Will be calculated if needed
          isCustom: true
        };
        
        const newGameState = resetGame(1, goal);
        renderCallback(newGameState);
        
        // Remove notification
        notification.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 2000);
      
      // Clear URL parameters to avoid re-triggering 
      window.history.replaceState({}, document.title, window.location.pathname);
      return { processed: true, newGameState: null }; // Will be set in timeout
    }
  }
  return { processed: false, newGameState: null };
}