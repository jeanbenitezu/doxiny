/**
 * Doxiny Sharing System
 * Mobile-optimized sharing with Web Share API and URL routing
 */

import { t } from "./i18n.js";

/**
 * Get current game URL with puzzle parameters for sharing
 */
export function generateShareURL(goal, moves = null, solved = false) {
  const baseURL = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();

  // Combine all parameters into single encoded string: puzzle_moves_solved
  const movesStr = (moves && solved) ? moves.toString() : "";
  const solvedStr = solved ? "1" : "";
  const combinedData = `${goal}_${movesStr}_${solvedStr}`;
  
  // Encode the combined data to prevent manipulation
  params.set("d", btoa(combinedData));

  const url = `${baseURL}?${params.toString()}`;

  console.log("Generated share URL:", url);

  return url;
}

/**
 * Generate gamified sharing messages based on performance
 */
export function generateShareMessage(
  goal,
  level,
  moves = null,
  efficiency = null,
  isPerfect = false,
  solved = false,
) {
  const baseURL = generateShareURL(goal, moves, solved);
  let message = "";

  if (!solved) {
    const messageKey = level >= 4 // Expert level gets a different message
      ? "sharing.expertInviteMessage"
      : "sharing.inviteMessage";
    message = t(messageKey, { goal });
  } else if (isPerfect) {
    message = t("sharing.perfectVictoryMessage", { goal, moves });
  } else if (efficiency >= 80) {
    message = t("sharing.victoryMessage", { goal, moves, efficiency });
  } else {
    message = t("sharing.challengeMessage", { goal, moves });
  }

  return { message: message, url: baseURL };
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
        text: message.message,
        url: message.url
      });
      return { success: true, method: "native" };
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(message.message + " " + message.url);
      return { success: true, method: "clipboard" };
    }
  } catch (error) {
    console.error("Sharing failed:", error);
    try {
      // Final fallback - create temporary textarea for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = message.message + " " + message.url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return { success: true, method: "fallback" };
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
  const feedback = document.createElement("div");
  feedback.className =
    "fixed top-4 left-1/2 transform -translate-x-1/2 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all";

  if (shareResult.success) {
    feedback.textContent = t("sharing.linkCopied");
    feedback.classList.add("bg-emerald-500");
  } else {
    feedback.textContent = t("sharing.shareFailed");
    feedback.classList.add("bg-orange-500");
  }

  document.body.appendChild(feedback);

  // Remove after 3 seconds
  setTimeout(() => {
    feedback.style.opacity = "0";
    feedback.style.transform = "translate(-50%, -100%)";
    setTimeout(() => document.body.removeChild(feedback), 300);
  }, 3000);
}

/**
 * Handle sharing completed puzzle with victory stats
 */
export async function handleShareVictory(gameState, gameManager) {
  if (!gameState.isComplete) return;

  const exercise = gameManager.currentExercise;
  const efficiency = Math.round(
    (exercise.optimalMoves / gameState.moves) * 100,
  );
  const isPerfect = gameState.moves === exercise.optimalMoves;

  const message = generateShareMessage(
    gameState.goal,
    gameState.level,
    gameState.moves,
    efficiency,
    isPerfect,
    true,
  );

  const result = await shareContent(message, t("sharing.sharedPuzzle"));
  showShareFeedback(result);
}

/**
 * Handle sharing current unsolved puzzle as challenge
 */
export async function handleShareChallenge(gameState) {
  const message = generateShareMessage(
    gameState.goal,
    gameState.level,
  );

  const result = await shareContent(message, t("sharing.sharedPuzzle"));
  showShareFeedback(result);
}

/**
 * Handle URL parameters for shared puzzles
 */
export function handleSharedPuzzleURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const dataParam = urlParams.get("d");

  if (dataParam) {
    try {
      // Decode and split the combined data: puzzle_moves_solved
      const decodedData = atob(dataParam);
      const [goalStr, movesStr, solvedStr] = decodedData.split("_");
      
      const goal = parseInt(goalStr);
      const challengeMoves = movesStr ? parseInt(movesStr) : null;
      const solved = solvedStr || null;
      
      if (goal >= 2 && goal <= 10000) {
        // Update document title for social media previews
        document.title = t("sharing.sharedPuzzleTitle", { goal });
        
        // Show shared puzzle notification
        const notification = document.createElement("div");
        notification.className =
          "fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm text-center";

        if (solved === "1" && challengeMoves) {
          notification.innerHTML = t("sharing.friendChallengeWithMoves", { 
            moves: challengeMoves, 
            goal 
          });
        } else {
          notification.textContent = t("sharing.friendChallengesYou", { goal });
        }

        document.body.appendChild(notification);

        setTimeout(() => {
          // Remove notification
          notification.style.opacity = "0";
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 300);
        }, 5000);

        // Clear URL parameters to avoid re-triggering
        window.history.replaceState({}, document.title, window.location.pathname);
        return { processed: true, goal };
      }
    } catch (error) {
      // Invalid base64 or malformed data - ignore silently
      console.warn("Invalid shared puzzle URL parameters", error);
    }
  }
  return { processed: false, goal: null };
}
