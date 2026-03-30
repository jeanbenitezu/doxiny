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

  // Game Modes
  gameMode: {
    en: "Game Mode",
    es: "Modo de Juego",
  },

  gameModes: {
    normal: {
      en: "Normal Game",
      es: "Juego Normal",
    },
    freeplay: {
      en: "Free Play",
      es: "Juego Libre",
    },
  },

  gameModesShort: {
    normal: {
      en: "Normal",
      es: "Normal",
    },
    freeplay: {
      en: "Full",
      es: "Libre",
    },
  },

  gameModeDescriptions: {
    normal: {
      en: "Progressive difficulty with unlock requirements",
      es: "Dificultad progresiva con requisitos de desbloqueo",
    },
    freeplay: {
      en: "All levels available, create custom exercises",
      es: "Todos los niveles disponibles, crea ejercicios personalizados",
    },
    freeplayLocked: {
      en: "Requires Master status to unlock",
      es: "Requiere estatus de Maestro para desbloquear",
    },
  },

  gameModeMessages: {
    levelLocked: {
      en: "Complete previous level with {efficiency}% efficiency to unlock",
      es: "Completa el nivel anterior con {efficiency}% de eficiencia para desbloquear",
    },
    efficiencyNotMet: {
      en: "Need {required}% efficiency to proceed",
      es: "Se necesita {required}% de eficiencia para continuar",
    },
    levelUnlocked: {
      en: "Level {level} Unlocked!",
      es: "¡Nivel {level} Desbloqueado!",
    },
    switchedToNormal: {
      en: "Switched to Normal Game mode",
      es: "Cambiado a modo Juego Normal",
    },
    switchedToFreeplay: {
      en: "Switched to Free Play mode",
      es: "Cambiado a modo Juego Libre",
    },
    tryFreePlay: {
      en: "Try Free Play",
      es: "Probar Juego Libre",
    },
    tryNormalMode: {
      en: "Try Normal Mode",
      es: "Probar Juego Normal",
    },
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
      en: "Reset",
      es: "Reiniciar",
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

  // Additional UI elements
  help: {
    en: "Help",
    es: "Ayuda",
  },

  hint: {
    en: "Hint",
    es: "Pista",
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
    es: "Siguiente",
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

  blocked: {
    en: "Blocked",
    es: "Bloqueado",
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
      en: "Beginner: Use ×2 to grow quickly, experiment with all operations!",
      es: "Principiante: Usa ×2 para crecer rápido, ¡experimenta con todas las operaciones!",
    },
    2: {
      en: "Easy: Try combining operations creatively.",
      es: "Fácil: Intenta combinar operaciones creativamente.",
    },
    3: {
      en: "Medium: Look for patterns and plan your moves.",
      es: "Medio: Busca patrones y planifica tus movimientos.",
    },
    4: {
      en: "Hard: Think strategically about operation sequences.",
      es: "Difícil: Piensa estratégicamente sobre las secuencias de operaciones.",
    },
    5: {
      en: "Expert: Master-level puzzles require creative thinking!",
      es: "Experto: ¡Los rompecabezas de nivel maestro requieren pensamiento creativo!",
    },
    6: {
      en: "Insane: The ultimate challenge!",
      es: "Extremo: ¡El desafío definitivo!",
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

  // Hint System Translations
  hints: {
    // Strategic hints (level 1)
    strategic: {
      targetLarger: {
        en: "The target ({target}) is larger than your current number ({current}). Consider operations that increase your number significantly.",
        es: "El objetivo ({target}) es mayor que tu número actual ({current}). Considera operaciones que aumenten tu número significativamente.",
      },
      tryReverse: {
        en: "Try thinking about different forms of your current number ({current}). What if the digits were in a different order?",
        es: "Intenta pensar en diferentes formas de tu número actual ({current}). ¿Qué pasaría si los dígitos estuvieran en diferente orden?",
      },
      breakDownDigits: {
        en: "Your current number has multiple digits ({current}). Consider what happens when you break it down to its components.",
        es: "Tu número actual tiene múltiples dígitos ({current}). Considera qué pasa cuando lo descompones en sus componentes.",
      },
      expandNumber: {
        en: "Sometimes expanding your number by adding digits can create new possibilities. Think about building up your number.",
        es: "A veces expandir tu número agregando dígitos puede crear nuevas posibilidades. Piensa en construir tu número.",
      },
      movesRemaining: {
        en: "You need about {moves} more moves to reach {target}. Focus on operations that move you closer to the target range.",
        es: "Necesitas aproximadamente {moves} movimientos más para llegar a {target}. Enfócate en operaciones que te acerquen al rango objetivo.",
      },
      targetMuchLarger: {
        en: "The target ({target}) is much larger than your current number ({current}). You'll likely need to increase your number significantly.",
        es: "El objetivo ({target}) es mucho mayor que tu número actual ({current}). Probablemente necesites incrementar tu número significativamente.",
      },
      targetSmaller: {
        en: "The target ({target}) is smaller than your current number ({current}). Consider operations that can reduce your number value.",
        es: "El objetivo ({target}) es menor que tu número actual ({current}). Considera operaciones que puedan reducir el valor de tu número.",
      },
      targetClose: {
        en: "The target ({target}) is close to your current number ({current}). Look for operations that make fine adjustments.",
        es: "El objetivo ({target}) está cerca de tu número actual ({current}). Busca operaciones que hagan ajustes finos.",
      },
    },
    // Tactical hints (level 2)
    tactical: {
      doubleResult: {
        en: "Doubling your current number ({current}) would give you {result}. This gets you significantly closer to {target}!",
        es: "Duplicar tu número actual ({current}) te daría {result}. ¡Esto te acerca significativamente a {target}!",
      },
      reverseResult: {
        en: "If you reverse the digits of {current}, you'll get {result}. This opens up a promising path to {target}!",
        es: "Si inviertes los dígitos de {current}, obtienes {result}. ¡Esto abre un camino prometedor hacia {target}!",
      },
      sumResult: {
        en: "Adding the digits of {current} ({digits}) equals {result}. This smaller number has strategic value!",
        es: "Sumar los dígitos de {current} ({digits}) es igual a {result}. ¡Este número más pequeño tiene valor estratégico!",
      },
      appendResult: {
        en: "Adding '1' to the end of {current} gives you {result}. This creates new opportunities for reaching {target}!",
        es: "Agregar '1' al final de {current} te da {result}. ¡Esto crea nuevas oportunidades para llegar a {target}!",
      },
      optimalTransform: {
        en: "Try the operation that transforms {current} into {result}. This puts you on the optimal path!",
        es: "Intenta la operación que transforma {current} en {result}. ¡Esto te pone en el camino óptimo!",
      },
      multiDigitOps: {
        en: "Your number has {count} digits. Try operations that work with digits: reverse them, sum them, or build upon them.",
        es: "Tu número tiene {count} dígitos. Prueba operaciones que trabajen con dígitos: invertirlos, sumarlos, o construir sobre ellos.",
      },
      singleDigitOps: {
        en: "You have a single digit ({current}). Consider operations that expand or multiply: doubling or appending.",
        es: "Tienes un solo dígito ({current}). Considera operaciones que expandan o multipliquen: duplicar o agregar.",
      },
    },
    // Direct hints (level 3)
    direct: {
      nextMove: {
        en: "Next move: Use {operation} to transform {current} → {result}. This is the optimal next step!",
        es: "Próximo movimiento: Usa {operation} para transformar {current} → {result}. ¡Este es el siguiente paso óptimo!",
      },
      challenging: {
        en: "This is a challenging puzzle! Try each operation and see which result gets you closer to {target}. Sometimes the best path isn't obvious at first.",
        es: "¡Este es un rompecabezas desafiante! Prueba cada operación y ve cuál resultado te acerca más a {target}. A veces el mejor camino no es obvio al principio.",
      },
    },
    // Operation names for hints
    operations: {
      double: {
        en: "DOUBLE",
        es: "DUPLICAR",
      },
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
    },
    // Hint UI messages
    ui: {
      hintsRemaining: {
        en: "You have {count} hint{plural} remaining for this exercise.",
        es: "Te quedan {count} pista{plural} para este ejercicio.",
      },
      finalHint: {
        en: "This was your final hint for this exercise.",
        es: "Esta fue tu última pista para este ejercicio.",
      },
      types: {
        strategic: {
          en: "Strategic",
          es: "Estratégica",
        },
        tactical: {
          en: "Tactical",
          es: "Táctica",
        },
        direct: {
          en: "Direct",
          es: "Directa",
        },
      },
    },
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

  customExerciseModal: {
    validation: {
      solvable: {
        en: "Solvable!",
        es: "¡Resoluble!",
      },
      optimalSolution: {
        en: "Optimal solution: {moves} moves",
        es: "Solución óptima: {moves} movimientos",
      },
      reachableFrom: {
        en: "This number can be reached from 1",
        es: "Este número se puede alcanzar desde 1",
      },
      unknownSolvability: {
        en: "Unknown solvability",
        es: "Resolubilidad desconocida",
      },
      notReachable: {
        en: "Not reachable with our 4 operations",
        es: "No alcanzable con nuestras 4 operaciones",
      },
      canStillTry: {
        en: "You can still try to solve it!",
        es: "¡Aún puedes intentar resolverlo!",
      },
      detectedLevel: {
        en: "Detected level: {level}",
        es: "Nivel detectado: {level}",
      },
    },
  },

  // Sharing Messages
  sharing: {
    // Share solved puzzle victory
    victoryMessage: {
      en: "🎯 I crushed {goal} in just {moves} moves with {efficiency}% efficiency! Think you can beat my score? Try Doxiny Number Puzzle:",
      es: "🎯 ¡Aplasté {goal} en solo {moves} movimientos con {efficiency}% de eficiencia! ¿Crees que puedes superar mi puntuación? Prueba Doxiny Number Puzzle:",
    },
    perfectVictoryMessage: {
      en: "🏆 PERFECT SOLUTION! I solved {goal} in the optimal {moves} moves! Can you match this masterpiece? Challenge yourself with Doxiny:",
      es: "🏆 ¡SOLUCIÓN PERFECTA! ¡Resolví {goal} en los {moves} movimientos óptimos! ¿Puedes igualar esta obra maestra? Desafíate con Doxiny:",
    },
    challengeMessage: {
      en: "💪 Can you reach {goal} faster than {moves} moves? I dare you to try! Play Doxiny Number Puzzle:",
      es: "💪 ¿Puedes llegar a {goal} más rápido que en {moves} movimientos? ¡Te reto a intentarlo! Juega Doxiny Number Puzzle:",
    },

    // Share exercise invitation
    inviteMessage: {
      en: "🧠 I challenge you to solve this brain twister: Reach {goal} starting from 1! Can you do it? Try Doxiny Number Puzzle:",
      es: "🧠 Te desafío a resolver este acertijo mental: ¡Llega a {goal} empezando desde 1! ¿Puedes hacerlo? Prueba Doxiny Number Puzzle:",
    },
    expertInviteMessage: {
      en: "🔥 Think you're smart? Try reaching {goal} in this EXPERT level challenge! Only math geniuses can solve it. Doxiny Number Puzzle:",
      es: "🔥 ¿Crees que eres inteligente? ¡Intenta llegar a {goal} en este desafío nivel EXPERTO! Solo los genios matemáticos pueden resolverlo. Doxiny Number Puzzle:",
    },

    // Button labels
    shareVictory: {
      en: "Share Victory",
      es: "Compartir Victoria",
    },
    shareChallenge: {
      en: "Challenge Friends",
      es: "Retar Amigos",
    },
    shareCurrentPuzzle: {
      en: "Share",
      es: "Compartir",
    },

    // Feedback messages
    linkCopied: {
      en: "🎉 Challenge link copied! Paste it anywhere to invite friends!",
      es: "🎉 ¡Enlace de desafío copiado! ¡Pégalo en cualquier lugar para invitar amigos!",
    },
    shareFailed: {
      en: "📋 Couldn't share automatically, but link is copied to clipboard!",
      es: "📋 ¡No se pudo compartir automáticamente, pero el enlace está copiado al portapapeles!",
    },

    // URL parameter handling
    sharedPuzzle: {
      en: "🎯 Shared Puzzle Challenge",
      es: "🎯 Desafío de Puzzle Compartido",
    },
    sharedPuzzleTitle: {
      en: "Doxiny - Reach {goal}!",
      es: "Doxiny - ¡Obtén {goal}!",
    },
    friendChallengesYou: {
      en: "A friend challenges you to reach {goal}!",
      es: "¡Un amigo te desafía a llegar a {goal}!",
    },
    friendChallengeWithMoves: {
      en: "🎯 <strong>Friend's Challenge!</strong><br>Beat their {moves} moves to reach {goal}!",
      es: "🎯 <strong>¡Desafío de Amigo!</strong><br>¡Supera sus {moves} movimientos para llegar a {goal}!",
    },
  },

  // Master Achievement
  masterAchievement: {
    title: {
      en: "Master Achieved!",
      es: "¡Maestría Alcanzada!",
    },
    message: {
      en: "You've completed all 6 levels with excellence! You are now a Doxiny Master with access to unlimited custom exercises.",
      es: "¡Has completado los 6 niveles con excelencia! Ahora eres un Maestro Doxiny con acceso a ejercicios personalizados ilimitados.",
    },
  },

  // Common UI
  common: {
    continue: {
      en: "Continue",
      es: "Continuar",
    },
    close: {
      en: "Close",
      es: "Cerrar",
    },
  },

  // Guided Tour
  tour: {
    skip: {
      en: "Skip",
      es: "Saltar",
    },
    next: {
      en: "Next",
      es: "Siguiente",
    },
    play: {
      en: "Play!",
      es: "¡Jugar!",
    },
    welcome: {
      title: {
        en: "Welcome to Doxiny!",
        es: "¡Bienvenido a Doxiny!",
      },
      message: {
        en: "Let's take a quick tour to learn how to play this number transformation puzzle.",
        es: "Hagamos un recorrido rápido para aprender cómo jugar este rompecabezas de transformación de números.",
      },
    },
    objective: {
      title: {
        en: "Your Goal",
        es: "Tu Objetivo",
      },
      message: {
        en: "Transform the number 1 into the goal number X using approximately Y moves. Try to find the most efficient path!",
        es: "Transforma el número 1 al número objetivo X usando aproximadamente Y movimientos. ¡Trata de encontrar el camino más eficiente!",
      },
    },
    currentNumber: {
      title: {
        en: "Current Number",
        es: "Número Actual",
      },
      message: {
        en: "This is your current number. It starts at 1, and you need to transform it to reach your goal.",
        es: "Este es tu número actual. Comienza en 1, y necesitas transformarlo para alcanzar tu objetivo.",
      },
    },
    firstOperation: {
      title: {
        en: "First Move: Double",
        es: "Primer Movimiento: Duplicar",
      },
      message: {
        en: "Click the DOUBLE button to multiply your current number by 2. This will transform 1 → 2.",
        es: "Haz clic en el botón DUPLICAR para multiplicar tu número actual por 2. Esto transformará 1 → 2.",
      },
    },
    secondOperation: {
      title: {
        en: "Second Move: Append 1",
        es: "Segundo Movimiento: Agregar 1",
      },
      message: {
        en: "Now click ADD 1 to append the digit '1' to the end. This will transform 2 → 21.",
        es: "Ahora haz clic en AGREGAR 1 para añadir el dígito '1' al final. Esto transformará 2 → 21.",
      },
    },
    thirdOperation: {
      title: {
        en: "Third Move: Reverse",
        es: "Tercer Movimiento: Invertir",
      },
      message: {
        en: "Click REVERSE to flip the digits. This will transform 21 → 12.",
        es: "Haz clic en INVERTIR para voltear los dígitos. Esto transformará 21 → 12.",
      },
    },
    helpButtons: {
      title: {
        en: "Help Tools",
        es: "Herramientas de Ayuda",
      },
      message: {
        en: "These buttons can help you when you're stuck. The Hint button gives you strategic guidance.",
        es: "Estos botones pueden ayudarte cuando estés atascado. El botón Pista te da orientación estratégica.",
      },
    },
    hintDemo: {
      title: {
        en: "Try Getting a Hint",
        es: "Prueba Obtener una Pista",
      },
      message: {
        en: "Click the Hint button to get help for your final move. Hints become more specific each time you ask.",
        es: "Haz clic en el botón Pista para obtener ayuda con tu movimiento final. Las pistas se vuelven más específicas cada vez que pides.",
      },
    },
    hintResult: {
      title: {
        en: "Final Move: Sum Digits",
        es: "Movimiento Final: Sumar Dígitos",
      },
      message: {
        en: "The hint showed you the way! Click SUM DIGITS to add the digits together: 1 + 2 = 3.",
        es: "¡La pista te mostró el camino! Haz clic en SUMAR DÍGITOS para sumar los dígitos: 1 + 2 = 3.",
      },
    },
    completion: {
      title: {
        en: "Congratulations! 🎉",
        es: "¡Felicitaciones! 🎉",
      },
      message: {
        en: "You've successfully completed the tutorial! You transformed 1 → 2 → 21 → 12 → 3 in 4 moves. Now master all 6 levels to earn the Master badge and unlock unlimited custom exercises (2-10,000)!",
        es: "¡Has completado exitosamente el tutorial! Transformaste 1 → 2 → 21 → 12 → 3 en 4 movimientos. ¡Ahora domina los 6 niveles para obtener la insignia de Maestro y desbloquear ejercicios personalizados ilimitados (2-10,000)!",
      },
    },
  },

  // Firebase Integration Messages
  firebase: {
    // Service Status Messages
    status: {
      initializing: {
        en: "Initializing analytics...",
        es: "Inicializando analíticas...",
      },
      initialized: {
        en: "Analytics ready",
        es: "Analíticas listas",
      },
      unavailable: {
        en: "Analytics unavailable",
        es: "Analíticas no disponibles",
      },
      offline: {
        en: "Playing offline",
        es: "Jugando sin conexión",
      },
    },

    // Error Messages
    errors: {
      configurationMissing: {
        en: "Analytics configuration not found. Game features may be limited.",
        es: "Configuración de analíticas no encontrada. Las funciones del juego pueden estar limitadas.",
      },
      initializationFailed: {
        en: "Failed to initialize analytics services. Continuing in offline mode.",
        es: "Error al inicializar servicios de analíticas. Continuando en modo sin conexión.",
      },
      analyticsError: {
        en: "Analytics tracking temporarily unavailable.",
        es: "Seguimiento de analíticas temporalmente no disponible.",
      },
      performanceError: {
        en: "Performance monitoring temporarily unavailable.",
        es: "Monitoreo de rendimiento temporalmente no disponible.",
      },
      remoteConfigError: {
        en: "Remote configuration unavailable. Using default settings.",
        es: "Configuración remota no disponible. Usando configuración por defecto.",
      },
      networkError: {
        en: "Network connection required for some features. Playing in offline mode.",
        es: "Conexión de red requerida para algunas funciones. Jugando en modo sin conexión.",
      },
    },

    // Feature Notifications
    features: {
      analyticsEnabled: {
        en: "Game analytics are active to help improve your experience.",
        es: "Las analíticas del juego están activas para ayudar a mejorar tu experiencia.",
      },
      performanceMonitoring: {
        en: "Performance monitoring is active to ensure smooth gameplay.",
        es: "El monitoreo de rendimiento está activo para asegurar un juego fluido.",
      },
      configUpdateAvailable: {
        en: "New game features are available! Restart the app to update.",
        es: "¡Nuevas funciones del juego están disponibles! Reinicia la aplicación para actualizar.",
      },
      experimentalFeature: {
        en: "You're using an experimental feature. Feedback appreciated!",
        es: "Estás usando una función experimental. ¡Agradecemos tus comentarios!",
      },
    },

    // Privacy and Data
    privacy: {
      dataCollection: {
        en: "Anonymous gameplay data is collected to improve the game experience.",
        es: "Se recopilan datos de juego anónimos para mejorar la experiencia de juego.",
      },
      noPersonalData: {
        en: "No personal information is stored or tracked.",
        es: "No se almacena ni rastrea información personal.",
      },
      optOut: {
        en: "You can disable analytics in your browser settings if preferred.",
        es: "Puedes desactivar las analíticas en la configuración de tu navegador si lo prefieres.",
      },
    },

    // Debug and Development
    debug: {
      serviceInitialized: {
        en: "Firebase service '{service}' initialized successfully",
        es: "Servicio Firebase '{service}' inicializado exitosamente",
      },
      eventTracked: {
        en: "Event tracked: {event}",
        es: "Evento rastreado: {event}",
      },
      configLoaded: {
        en: "Remote configuration loaded with {count} parameters",
        es: "Configuración remota cargada con {count} parámetros",
      },
      performanceTrace: {
        en: "Performance trace '{trace}' completed in {duration}ms",
        es: "Rastro de rendimiento '{trace}' completado en {duration}ms",
      },
    },
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
