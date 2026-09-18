// DEVELOPER DATA SHEET: Add new sprites, change rarities, or toggle unreleased states here.
const baseSprites = [
    // ============================ C7T3 ============================

    { id: "water_basic", name: "Água", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T3" },
    { id: "water_gold", name: "Água Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "water_candy", name: "Água de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "water_galaxy", name: "Água Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "water_gem", name: "Água de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "water_holofoil", name: "Água Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "water_quack", name: "Água Pato", theme: "Pato", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "earth_basic", name: "Terra", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T3" },
    { id: "earth_gold", name: "Terra Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "earth_candy", name: "Terra de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "earth_galaxy", name: "Terra Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "earth_gem", name: "Terra de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "earth_rift", name: "Terra Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "earth_quack", name: "Terra Pato", theme: "Pato", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "fire_basic", name: "Fogo", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T3" },
    { id: "fire_gold", name: "Fogo Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "fire_candy", name: "Fogo de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "fire_galaxy", name: "Fogo Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "fire_holofoil", name: "Fogo Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "fire_rift", name: "Fogo Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "fire_quack", name: "Fogo Pato", theme: "Pato", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "duck_basic", name: "Pato", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T3" },
    { id: "duck_gold", name: "Pato Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "duck_candy", name: "Pato de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "duck_galaxy", name: "Pato Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "duck_gem", name: "Pato de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "ghost_basic", name: "Fantasma", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T3" },
    { id: "ghost_gold", name: "Fantasma Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "ghost_candy", name: "Fantasma de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "ghost_galaxy", name: "Fantasma Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "ghost_holofoil", name: "Fantasma Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "dream_basic", name: "Sonho", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T3" },
    { id: "dream_gold", name: "Sonho Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "dream_candy", name: "Sonho de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "dream_galaxy", name: "Sonho Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "dream_rift", name: "Sonho Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "demon_basic", name: "Demônio", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T3" },
    { id: "demon_gold", name: "Demônio Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "demon_candy", name: "Demônio de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "demon_galaxy", name: "Demônio Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "demon_gem", name: "Demônio de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "punk_basic", name: "Punk", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T3" },
    { id: "punk_gold", name: "Punk Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "punk_candy", name: "Punk de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "punk_galaxy", name: "Punk Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "punk_gem", name: "Punk de Gema", theme: "Gema", rarity: "Especial", unreleased: true, season: "C7T3" },
    { id: "punk_rift", name: "Punk Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "king_basic", name: "Rei", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T3" },
    { id: "king_gold", name: "Rei Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "king_candy", name: "Rei de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "king_galaxy", name: "Rei Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "king_holofoil", name: "Rei Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "zeropoint_basic", name: "Ponto Zero", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3" },
    { id: "zeropoint_gold", name: "Ponto Zero Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "zeropoint_candy", name: "Ponto Zero de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "zeropoint_galaxy", name: "Ponto Zero Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "zeropoint_gem", name: "Ponto Zero de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "zeropoint_holofoil", name: "Ponto Zero Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "zeropoint_quack", name: "Ponto Zero Pato", theme: "Pato", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "zeropoint_rift", name: "Ponto Zero Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "theburntpeanut_basic", name: "Burnt Peanut", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3" },

    { id: "fishy_basic", name: "Peixoto", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T3" },
    { id: "fishy_gold", name: "Peixoto Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "fishy_candy", name: "Peixoto de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "fishy_galaxy", name: "Peixoto Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "fishy_rift", name: "Peixoto Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "striker_basic", name: "Atacante", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T3" },
    { id: "striker_gold", name: "Atacante Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "striker_candy", name: "Atacante de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "striker_galaxy", name: "Atacante Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "striker_holofoil", name: "Atacante Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "aura_basic", name: "Aura", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T3" },
    { id: "aura_gold", name: "Aura Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "aura_candy", name: "Aura de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "aura_galaxy", name: "Aura Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "aura_gem", name: "Aura de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "boss_basic", name: "Chefe", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T3" },
    { id: "boss_gold", name: "Chefe Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "boss_candy", name: "Chefe de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "boss_galaxy", name: "Chefe Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "boss_rift", name: "Chefe Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "grim_basic", name: "Ceifador", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3" },
    { id: "grim_gold", name: "Ceifador Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "grim_candy", name: "Ceifador de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "grim_galaxy", name: "Ceifador Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "grim_gem", name: "Ceifador de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "grim_holofoil", name: "Ceifador Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "grim_rift", name: "Ceifador Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "air_basic", name: "Ar", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T3" },
    { id: "air_gold", name: "Ar Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "air_candy", name: "Ar de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "air_galaxy", name: "Ar Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "air_holofoil", name: "Ar Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "seven_basic", name: "Sete", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T3" },
    { id: "seven_gold", name: "Sete Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "seven_candy", name: "Sete de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "seven_galaxy", name: "Sete Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "seven_holofoil", name: "Sete Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "batman_basic", name: "Batman", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3" },
    { id: "batman_gold", name: "Batman Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "batman_candy", name: "Batman de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "batman_galaxy", name: "Batman Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "batman_holofoil", name: "Batman Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "batman_rift", name: "Batman Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "pollo_basic", name: "Pollo", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3" },

    { id: "vini_basic", name: "Vini Jr.", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3" },

    { id: "llama_basic", name: "Lhama", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T3" },
    { id: "llama_gold", name: "Lhama Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "llama_candy", name: "Lhama de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "llama_galaxy", name: "Lhama Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "llama_gem", name: "Lhama de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "peely_basic", name: "Embananado", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T3" },
    { id: "peely_gold", name: "Embananado Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "peely_candy", name: "Embananado de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "peely_galaxy", name: "Embananado Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3" },
    { id: "peely_holofoil", name: "Embananado Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3" },

    { id: "ironmouse_basic", name: "Ironmouse", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3" },

    { id: "wick_basic", name: "John Wick", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3" },

    // ============================ C7T4 ============================ /

    { id: "bush_basic", name: "Arbusto", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id: "bush_gold", name: "Arbusto Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "bush_cheat", name: "Arbusto Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "bush_hacker", name: "Arbusto Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "bush_hunter", name: "Arbusto Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "jonesy_basic", name: "Jonesy", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id: "jonesy_gold", name: "Jonesy Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "jonesy_cheat", name: "Jonesy Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "jonesy_hacker", name: "Jonesy Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "jonesy_hunter", name: "Jonesy Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "adventure_basic", name: "Aventureiro", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id: "adventure_gold", name: "Aventureiro Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "adventure_cheat", name: "Aventureiro Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "adventure_hacker", name: "Aventureiro Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "adventure_hunter", name: "Aventureiro Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "8bit_basic", name: "8-Bit", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id: "8bit_gold", name: "8-Bit Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "8bit_cheat", name: "8-Bit Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "8bit_hacker", name: "8-Bit Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "8bit_hunter", name: "8-Bit Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "stormking_basic", name: "Escoteiro da Tempestade", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id: "stormking_gold", name: "Escoteiro da Tempestade Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "stormking_cheat", name: "Escoteiro da Tempestade Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "stormking_hacker", name: "Escoteiro da Tempestade Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "stormking_hunter", name: "Escoteiro da Tempestade Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "killswitch_basic", name: "Killswitch", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T4" },
    { id: "killswitch_gold", name: "Killswitch Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "killswitch_cheat", name: "Killswitch Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "killswitch_hacker", name: "Killswitch Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "killswitch_hunter", name: "Killswitch Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "sonic_basic", name: "Sonic", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T4" },
    { id: "sonic_gold", name: "Sonic Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "sonic_cheat", name: "Sonic Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "sonic_hacker", name: "Sonic Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "sonic_hunter", name: "Sonic Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "tails_basic", name: "Tails", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T4" },
    { id: "tails_gold", name: "Tails Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "tails_cheat", name: "Tails Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "tails_hacker", name: "Tails Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "tails_hunter", name: "Tails Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "shadow_basic", name: "Shadow", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T4" },
    { id: "shadow_gold", name: "Shadow Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "shadow_cheat", name: "Shadow Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "shadow_hacker", name: "Shadow Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "shadow_hunter", name: "Shadow Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "jackrabbit_basic", name: "Jackrabbit", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T4" },
    { id: "jackrabbit_gold", name: "Jackrabbit Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "jackrabbit_cheat", name: "Jackrabbit Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "jackrabbit_hacker", name: "Jackrabbit Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "jackrabbit_hunter", name: "Jackrabbit Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "klombo_basic", name: "Klimbo", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T4" },
    { id: "klombo_gold", name: "Klimbo Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "klombo_cheat", name: "Klimbo Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "klombo_hacker", name: "Klimbo Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "klombo_hunter", name: "Klimbo Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "crown_basic", name: "Coroa", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T4" },
    { id: "crown_gold", name: "Coroa Dourada", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "crown_cheat", name: "Coroa Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "crown_hacker", name: "Coroa Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "crown_hunter", name: "Coroa Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "xray_basic", name: "Raio-X", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T4" },
    { id: "xray_gold", name: "Raio-X Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "xray_cheat", name: "Raio-X Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "xray_hacker", name: "Raio-X Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "xray_hunter", name: "Raio-X Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "megaman_basic", name: "Mega Men", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },

    { id: "overshield_basic", name: "Escudão", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id: "overshield_gold", name: "Escudão Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "overshield_cheat", name: "Escudão Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "overshield_hacker", name: "Escudão Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "overshield_hunter", name: "Escudão Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "onigiri_basic", name: "Onigiri", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id: "onigiri_gold", name: "Onigiri Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "onigiri_cheat", name: "Onigiri Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "onigiri_hacker", name: "Onigiri Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "onigiri_hunter", name: "Onigiri Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "blinky_basic", name: "Blinky", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T4" },
    { id: "blinky_gold", name: "Blinky Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "blinky_cheat", name: "Blinky Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "blinky_hacker", name: "Blinky Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "blinky_hunter", name: "Blinky Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "crashb_basic", name: "Crash Bandicoot", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T4" },
    { id: "crashb_gold", name: "Crash Bandicoot Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "crashb_cheat", name: "Crash Bandicoot Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "crashb_hacker", name: "Crash Bandicoot Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "crashb_hunter", name: "Crash Bandicoot Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "morgana_basic", name: "Morgana", theme: "Básico", rarity: "Lendário", unreleased: true, season: "C7T4" },
    { id: "morgana_gold", name: "Morgana Dourado", theme: "Dourado", rarity: "Especial", unreleased: true, season: "C7T4" },
    { id: "morgana_cheat", name: "Morgana Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: true, season: "C7T4" },
    { id: "morgana_hacker", name: "Morgana Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: true, season: "C7T4" },
    { id: "morgana_hunter", name: "Morgana Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "pond_basic", name: "Lagoa", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id: "pond_gold", name: "Lagoa Dourada", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "pond_cheat", name: "Lagoa Trapaceira", theme: "Trapaceiro", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "pond_hacker", name: "Lagoa Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "pond_hunter", name: "Lagoa Caçadora de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "birthday_basic", name: "Aniversariante", theme: "Básico", rarity: "Épico", unreleased: true, season: "C7T4" },
    { id: "birthday_gold", name: "Aniversariante Dourado", theme: "Dourado", rarity: "Especial", unreleased: true, season: "C7T4" },
    { id: "birthday_cheat", name: "Aniversariante Trapaceiro", theme: "Trapaceiro", rarity: "Especial", unreleased: true, season: "C7T4" },
    { id: "birthday_hacker", name: "Aniversariante Hacker de Saque", theme: "Hacker de Saque", rarity: "Especial", unreleased: true, season: "C7T4" },
    { id: "birthday_hunter", name: "Aniversariante Caçador de Recompensas", theme: "Caçador de Recompensas", rarity: "Especial", unreleased: true, season: "C7T4" },
];

if (typeof window !== 'undefined') {
    window.baseSprites = baseSprites;
}