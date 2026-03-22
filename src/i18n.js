// Multi-language configuration for Doxiny
// "Do X in Y moves" - Universal mathematical puzzle game

export const languages = {
  en: {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    direction: "ltr",
  },
  es: {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
    direction: "ltr",
  },
};

export const translations = {
  // App Branding
  appName: {
    en: "Doxiny",
    es: "Doxiny",
  },

  subtitle: {
    en: "The elegance is in efficiency",
    es: "La elegancia está en la eficiencia",
  },

  // Game Interface
  currentNumber: {
    en: "Current",
    es: "Actual",
  },

  targetNumber: {
    en: "Goal",
    es: "Objetivo",
  },

  moves: {
    en: "Moves",
    es: "Movimientos",
  },

  // Operations
  operations: {
    reverse: {
      en: "REVERSE",
      es: "INVERTIR",
    },
    sumDigits: {
      en: "SUM DIGITS",
      es: "SUMAR DÍGITOS",
    },
    append1: {
      en: "APPEND 1",
      es: "AGREGAR 1",
    },
    double: {
      en: "DOUBLE",
      es: "DUPLICAR",
    },
  },

  // Operation Descriptions (for tooltips/help)
  operationDescriptions: {
    reverse: {
      en: "Reverse all digits",
      es: "Invierte todos los dígitos",
    },
    sumDigits: {
      en: "Add all digits together",
      es: "Suma todos los dígitos",
    },
    append1: {
      en: "Add 1 to the end",
      es: "Agrega 1 al final",
    },
    double: {
      en: "Multiply by 2",
      es: "Multiplica por 2",
    },
  },

  // Game States
  gameStates: {
    won: {
      en: "🎉 Goal Reached!",
      es: "🎉 ¡Objetivo Alcanzado!",
    },
    reset: {
      en: "↻ Reset",
      es: "↻ Reiniciar",
    },
    newGame: {
      en: "New",
      es: "Nuevo",
    },
  },

  // History & Stats
  history: {
    en: "Move History",
    es: "Historial de Movimientos",
  },

  bestSolution: {
    en: "Best: {count} moves",
    es: "Mejor: {count} movimientos",
  },

  // Instructions & Help
  howToPlay: {
    en: "How to Play",
    es: "Cómo Jugar",
  },

  instructions: {
    en: "Transform the current number into the goal number using the 4 operations. Try to do it in the fewest moves possible!",
    es: "¡Transforma el número actual al número objetivo usando las 4 operaciones. Trata de hacerlo en la menor cantidad de movimientos!",
  },

  // Keyboard shortcuts
  keyboardShortcuts: {
    en: "Keyboard: 1-4 for operations, R to reset",
    es: "Teclado: 1-4 para operaciones, R para reiniciar",
  },

  // Additional UI elements
  help: {
    en: "Help",
    es: "Ayuda",
  },

  close: {
    en: "Close",
    es: "Cerrar",
  },

  levelComplete: {
    en: "Level Complete!",
    es: "¡Nivel Completado!",
  },

  nextLevel: {
    en: "Next Level",
    es: "Siguiente Nivel",
  },

  language: {
    en: "Language",
    es: "Idioma",
  },

  optimal: {
    en: "Optimal!",
    es: "¡Óptimo!",
  },

  canImprove: {
    en: "Can improve",
    es: "Se puede mejorar",
  },

  noMovesYet: {
    en: "No moves yet",
    es: "Sin movimientos aún",
  },

  // Level Progression Messages
  levelProgression: {
    advancedToLevel: {
      en: "Advanced to Level {level}!",
      es: "¡Avanzaste al Nivel {level}!",
    },
    masteredAllLevels: {
      en: "🏆 You've mastered all levels!",
      es: "🏆 ¡Has dominado todos los niveles!",
    },
  },

  // Difficulty Levels
  difficultyLevels: {
    beginner: {
      en: "New",
      es: "Nuevo",
    },
    easy: {
      en: "Easy",
      es: "Fácil",
    },
    medium: {
      en: "Medium",
      es: "Medio",
    },
    hard: {
      en: "Hard",
      es: "Difícil",
    },
    expert: {
      en: "Expert",
      es: "Experto",
    },
    insane: {
      en: "Insane",
      es: "Extremo",
    },
  },

  // Difficulty Descriptions
  difficultyDescriptions: {
    beginner: {
      en: "Learn the basics",
      es: "Aprende lo básico",
    },
    easy: {
      en: "Building confidence",
      es: "Ganando confianza",
    },
    medium: {
      en: "Strategic thinking",
      es: "Pensamiento estratégico",
    },
    hard: {
      en: "Advanced tactics",
      es: "Tácticas avanzadas",
    },
    expert: {
      en: "Master level",
      es: "Nivel maestro",
    },
    insane: {
      en: "Ultimate challenge",
      es: "Desafío definitivo",
    },
  },

  // Game Actions
  reach: {
    en: "Reach",
    es: "Obtén",
  },

  transformInto: {
    en: "Transform 1 into",
    es: "Transforma 1 en",
  },

  retry: {
    en: "Retry",
    es: "Reintentar",
  },

  // Performance Grades
  performanceGrades: {
    perfect: {
      en: "Perfect",
      es: "Perfecto",
    },
    excellent: {
      en: "Excellent",
      es: "Excelente",
    },
    great: {
      en: "Great",
      es: "Genial",
    },
    good: {
      en: "Good",
      es: "Bien",
    },
    keepTrying: {
      en: "Keep trying",
      es: "Sigue intentando",
    },
  },

  // Performance Descriptions
  performanceDescriptions: {
    optimalSolution: {
      en: "Optimal solution!",
      es: "¡Solución óptima!",
    },
    amazingEfficiency: {
      en: "Amazing efficiency!",
      es: "¡Eficiencia increíble!",
    },
    wellDone: {
      en: "Well done!",
      es: "¡Bien hecho!",
    },
    niceJob: {
      en: "Nice job!",
      es: "¡Buen trabajo!",
    },
    youCanDoBetter: {
      en: "You can do better!",
      es: "¡Puedes hacerlo mejor!",
    },
  },

  // Difficulty Tips
  difficultyTips: {
    1: {
      en: "💡 Beginner: Use ×2 to grow quickly, experiment with all operations!",
      es: "💡 Principiante: Usa ×2 para crecer rápido, ¡experimenta con todas las operaciones!",
    },
    2: {
      en: "💡 Easy: Try combining operations creatively.",
      es: "💡 Fácil: Intenta combinar operaciones creativamente.",
    },
    3: {
      en: "💡 Medium: Look for patterns and plan your moves.",
      es: "💡 Medio: Busca patrones y planifica tus movimientos.",
    },
    4: {
      en: "💡 Hard: Think strategically about operation sequences.",
      es: "💡 Difícil: Piensa estratégicamente sobre las secuencias de operaciones.",
    },
    5: {
      en: "💡 Expert: Master-level puzzles require creative thinking!",
      es: "💡 Experto: ¡Los rompecabezas de nivel maestro requieren pensamiento creativo!",
    },
    6: {
      en: "💡 Insane: The ultimate challenge!",
      es: "💡 Extremo: ¡El desafío definitivo!",
    },
  },

  // Custom Exercise Modal
  custom: {
    en: "Custom",
    es: "Crear",
  },

  customExercise: {
    en: "Custom Exercise",
    es: "Ejercicio Personalizado",
  },

  customExerciseDescription: {
    en: "Enter any target number between 2-10,000. We'll show if it's solvable, but you can load any number to try!",
    es: "Ingresa cualquier número objetivo entre 2-10,000. Te mostraremos si es resoluble, ¡pero puedes cargar cualquier número para intentar!",
  },

  loadExercise: {
    en: "Load Exercise",
    es: "Cargar Ejercicio",
  },

  // Success Modal
  congratulations: {
    en: "Great job!",
    es: "¡Buen trabajo!",
  },

  efficiency: {
    en: "Efficiency",
    es: "Eficiencia",
  },

  // Update Banner
  newVersionAvailable: {
    en: "🚀 New version available!",
    es: "🚀 ¡Nueva versión disponible!",
  },

  updateNow: {
    en: "Update Now",
    es: "Actualizar Ahora",
  },

  // Preview Toggle
  preview: {
    en: "Preview",
    es: "Vista Previa",
  },

  // Custom Exercise Validation
  invalidNumberAlert: {
    en: "Please enter a number between 2 and 10,000",
    es: "Por favor ingresa un número entre 2 y 10,000",
  },
};

// Utility functions for i18n
export function getCurrentLanguage() {
  // Check localStorage first, then browser language, fallback to English
  const saved = localStorage.getItem("doxiny-language");
  if (saved && languages[saved]) return saved;

  const browserLang = navigator.language.split("-")[0];
  if (languages[browserLang]) return browserLang;

  return "en"; // default fallback
}

export function setLanguage(langCode) {
  if (languages[langCode]) {
    localStorage.setItem("doxiny-language", langCode);
    // Trigger a custom event to notify the app of language change
    window.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: { language: langCode },
      }),
    );
    return true;
  }
  return false;
}

export function translate(key, langCode = null) {
  const lang = langCode || getCurrentLanguage();
  const keys = key.split(".");
  let current = translations;

  for (const k of keys) {
    current = current[k];
    if (!current) return key; // fallback to key if not found
  }

  return current[lang] || current.en || key; // fallback chain
}

// Template helper for string interpolation
export function t(key, variables = {}, langCode = null) {
  let text = translate(key, langCode);

  // Replace {variable} with actual values
  Object.keys(variables).forEach((variable) => {
    text = text.replace(new RegExp(`{${variable}}`, "g"), variables[variable]);
  });

  return text;
}
