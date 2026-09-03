// display strings
const codeCategories = {
    cat1: "Elementais",
    cat2: "Telas e Itens do Lobby",
    cat3: "Recursos Consumíveis",
    cat4: "Efeitos Divertidos",
    cat5: "Diversos"
};

// category ordering
const CATEGORY_ORDER = ["cat1", "cat2", "cat3", "cat4", "cat5"];

// code data sheet
const baseCodes = [
    // --- cat1 - Sprites
    { code: "Born2Play", reward: "Elemental Aventura", internalreward: "adventure_cheat", category: "cat1", active: true },
    { code: "8BitBlast", reward: "Elemental 8-Bit", internalreward: "8bit_cheat", category: "cat1", active: true },
    { code: "GottaGoFast", reward: "Elemental Sonic", internalreward: "sonic_cheat", category: "cat1", active: true },
    { code: "IWannaFlyHigh", reward: "Elemental Tails", internalreward: "tails_cheat", category: "cat1", active: true },
    { code: "Play4All", reward: "Elemental Jonesy", internalreward: "jonesy_cheat", category: "cat1", active: true },
    { code: "GatherAndCraft", reward: "Elemental Arbusto", internalreward: "bush_cheat", category: "cat1", active: true },

    // --- cat2 - Loading Screens
    { code: "BeMoreAlien", reward: "Tela de Carregamento: Pronta para Sobrescrita", internalreward: null, category: "cat2", active: true },
    { code: "ReachYourImpossible", reward: "Tela de Carregamento: Festa no Bloco", internalreward: null, category: "cat2", active: true },

    // --- cat3 - Items
    { code: "OverrideXP", reward: "40,000 XP", internalreward: null, category: "cat3", active: true },
    { code: "Magilume", reward: "2,000 Pó Elemental", internalreward: null, category: "cat3", active: true },
    { code: "Chispambo", reward: "2,000 Pó Elemental", internalreward: null, category: "cat3", active: true },
    { code: "Abgestaubt", reward: "2,000 Pó Elemental", internalreward: null, category: "cat3", active: true },
    { code: "PerlimPinPin", reward: "2,000 Pó Elemental", internalreward: null, category: "cat3", active: true },
    { code: "SurviveTheNight", reward: "2 Localizadores de Código de Trapaça", internalreward: null, category: "cat3", active: true },
    { code: "FindItChat", reward: "2 Localizadores de Código de Trapaça", internalreward: null, category: "cat3", active: true },
    { code: "TakeYourHeart", reward: "2 Aceleradores de Extração", internalreward: null, category: "cat3", active: true },
    { code: "PerfectOrder", reward: "4 Tacos Picantes", internalreward: null, category: "cat3", active: true },
    { code: "O2Override", reward: "1 Drop de Suprimentos Llama & 1 Extrator Portátil", internalreward: null, category: "cat3", active: true },
    { code: "ChatWhereDoYouFindTheKey", reward: "2 Aceleradores de Extração", internalreward: null, category: "cat3", active: true },
    { code: "INVALIDCHEAT", reward: "2 Localizadores de Código de Trapaça", internalreward: null, category: "cat3", active: true },
    { code: "YourThoughtsAreMine", reward: "5,000 Pó de Sprite (Depois da missão do Geno)", internalreward: null, category: "cat3", active: true },

    // --- cat4 - Effects
    { code: "DontBlockMe", reward: "Transforma você em um Tetris.", internalreward: null, category: "cat4", active: true },
    { code: "LetsBlockAndRoll", reward: "Transforma você em um Tetris.", internalreward: null, category: "cat4", active: true }
    
    // --- cat5 - 
    //{ code: "Looper1", reward: "Unknown", internalreward: null, category: "cat5", active: false },
    //{ code: "fishstick1", reward: "Unknown", internalreward: null, category: "cat5", active: false }
];

if (typeof window !== 'undefined') {
    window.codeCategories = codeCategories;
    window.CATEGORY_ORDER = CATEGORY_ORDER;
    window.baseCodes = baseCodes;
}

