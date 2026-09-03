// DEVELOPER DATA SHEET: Add new sprites, change rarities, or toggle unreleased states here.
const baseSprites = [
    // ============================ C7T3 ============================

    { id: "water_basic", name: "Água", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T3"  },
    { id: "water_gold", name: "Água Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "water_candy", name: "Água de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "water_galaxy", name: "Água Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "water_gem", name: "Água de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "water_holofoil", name: "Água Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "water_quack", name: "Água Pato", theme: "Pato", rarity: "Especial", unreleased: false, season: "C7T3"  },
    
    { id: "earth_basic", name: "Terra", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T3"  },
    { id: "earth_gold", name: "Terra Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "earth_candy", name: "Terra de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "earth_galaxy", name: "Terra Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "earth_gem", name: "Terra de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "earth_rift", name: "Terra Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "earth_quack", name: "Terra Pato", theme: "Pato", rarity: "Especial", unreleased: false, season: "C7T3"  },
	
    { id: "fire_basic", name: "Fogo", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T3"  },
    { id: "fire_gold", name: "Fogo Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "fire_candy", name: "Fogo de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "fire_galaxy", name: "Fogo Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "fire_holofoil", name: "Fogo Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "fire_rift", name: "Fogo Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "fire_quack", name: "Fogo Pato", theme: "Pato", rarity: "Especial", unreleased: false, season: "C7T3"  },
	
    { id: "duck_basic", name: "Pato", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T3"  },
    { id: "duck_gold", name: "Pato Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "duck_candy", name: "Pato de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "duck_galaxy", name: "Pato Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "duck_gem", name: "Pato de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3"  },
	
    { id: "ghost_basic", name: "Fantasma", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T3"  },
    { id: "ghost_gold", name: "Fantasma Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "ghost_candy", name: "Fantasma de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "ghost_galaxy", name: "Fantasma Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "ghost_holofoil", name: "Fantasma Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    
    { id: "dream_basic", name: "Sonho", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T3"  },
    { id: "dream_gold", name: "Sonho Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "dream_candy", name: "Sonho de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "dream_galaxy", name: "Sonho Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "dream_rift", name: "Sonho Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3"  },

    { id: "demon_basic", name: "Demônio", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T3"  },
    { id: "demon_gold", name: "Demônio Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "demon_candy", name: "Demônio de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "demon_galaxy", name: "Demônio Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "demon_gem", name: "Demônio de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3"  },

	{ id: "punk_basic", name: "Punk", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T3"  },
    { id: "punk_gold", name: "Punk Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "punk_candy", name: "Punk de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "punk_galaxy", name: "Punk Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "punk_gem", name: "Punk de Gema", theme: "Gema", rarity: "Especial", unreleased: true, season: "C7T3"  },
    { id: "punk_rift", name: "Punk Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3"  },

	{ id: "king_basic", name: "Rei", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T3"  },
    { id: "king_gold", name: "Rei Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "king_candy", name: "Rei de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "king_galaxy", name: "Rei Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "king_holofoil", name: "Rei Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3"  },

    { id: "zeropoint_basic", name: "Ponto Zero", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3"  },
    { id: "zeropoint_gold", name: "Ponto Zero Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "zeropoint_candy", name: "Ponto Zero de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "zeropoint_galaxy", name: "Ponto Zero Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "zeropoint_gem", name: "Ponto Zero de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "zeropoint_holofoil", name: "Ponto Zero Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "zeropoint_quack", name: "Ponto Zero Pato", theme: "Pato", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "zeropoint_rift", name: "Ponto Zero Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3"  },
	
    { id: "theburntpeanut_basic", name: "Burnt Peanut", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3"  },
	
    { id: "fishy_basic", name: "Peixoto", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T3"  },
    { id: "fishy_gold", name: "Peixoto Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "fishy_candy", name: "Peixoto de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "fishy_galaxy", name: "Peixoto Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "fishy_rift", name: "Peixoto Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3"  },
	
    { id: "striker_basic", name: "Atacante", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T3"  },
    { id: "striker_gold", name: "Atacante Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "striker_candy", name: "Atacante de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "striker_galaxy", name: "Atacante Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "striker_holofoil", name: "Atacante Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3"  },

    { id: "aura_basic", name: "Aura", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T3"  },
    { id: "aura_gold", name: "Aura Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "aura_candy", name: "Aura de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "aura_galaxy", name: "Aura Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "aura_gem", name: "Aura de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3"  },

    { id: "boss_basic", name: "Chefe", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T3"  },
    { id: "boss_gold", name: "Chefe Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "boss_candy", name: "Chefe de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "boss_galaxy", name: "Chefe Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "boss_rift", name: "Chefe Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3"  },

    { id: "grim_basic", name: "Ceifador", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3"  },
    { id: "grim_gold", name: "Ceifador Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "grim_candy", name: "Ceifador de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "grim_galaxy", name: "Ceifador Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "grim_gem", name: "Ceifador de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "grim_holofoil", name: "Ceifador Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "grim_rift", name: "Ceifador Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3"  },

    { id: "air_basic", name: "Ar", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T3"  },
    { id: "air_gold", name: "Ar Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "air_candy", name: "Ar de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "air_galaxy", name: "Ar Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "air_holofoil", name: "Ar Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3"  },
	
    { id: "seven_basic", name: "Sete", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T3"  },
    { id: "seven_gold", name: "Sete Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "seven_candy", name: "Sete de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "seven_galaxy", name: "Sete Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "seven_holofoil", name: "Sete Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3"  },

	{ id: "batman_basic", name: "Batman", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3"  },
    { id: "batman_gold", name: "Batman Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "batman_candy", name: "Batman de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "batman_galaxy", name: "Batman Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "batman_holofoil", name: "Batman Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3"  },
	{ id: "batman_rift", name: "Batman Cubo", theme: "Cubo", rarity: "Especial", unreleased: false, season: "C7T3"  },

	{ id: "pollo_basic", name: "Pollo", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3"  },

	{ id: "vini_basic", name: "Vini Jr.", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3"  },

	{ id: "llama_basic", name: "Lhama", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T3"  },
	{ id: "llama_gold", name: "Lhama Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "llama_candy", name: "Lhama de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "llama_galaxy", name: "Lhama Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "llama_gem", name: "Lhama de Gema", theme: "Gema", rarity: "Especial", unreleased: false, season: "C7T3"  },
	
	{ id: "peely_basic", name: "Embananado", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T3"  },
	{ id: "peely_gold", name: "Embananado Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "peely_candy", name: "Embananado de Goma", theme: "Doce", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "peely_galaxy", name: "Embananado Galáctico", theme: "Galáctico", rarity: "Especial", unreleased: false, season: "C7T3"  },
    { id: "peely_holofoil", name: "Embananado Metálico", theme: "Metálico", rarity: "Especial", unreleased: false, season: "C7T3"  },

	{ id: "ironmouse_basic", name: "Ironmouse", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3"  },
	
	{ id: "wick_basic", name: "John Wick", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T3"  },
	
    // ============================ C7T4 ============================

    { id: "bush_basic", name: "Arbusto", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id: "bush_gold", name: "Arbusto Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "bush_cheat", name: "Arbusto Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "bush_loot", name: "Arbusto Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "jonesy_basic", name: "Jonesy", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id: "jonesy_gold", name: "Jonesy Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "jonesy_cheat", name: "Jonesy Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "jonesy_loot", name: "Jonesy Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "adventure_basic", name: "Aventureiro", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id: "adventure_gold", name: "Aventureiro Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "adventure_cheat", name: "Aventureiro Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "adventure_loot", name: "Aventureiro Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },

	{ id: "8bit_basic", name: "8-Bit", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id: "8bit_gold", name: "8-Bit Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "8bit_cheat", name: "8-Bit Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "8bit_loot", name: "8-Bit Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },
	
    { id: "stormking_basic", name: "Escoteiro da Tempestade", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id: "stormking_gold", name: "Escoteiro da Tempestade Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "stormking_cheat", name: "Escoteiro da Tempestade Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "stormking_loot", name: "Escoteiro da Tempestade Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "killswitch_basic", name: "Killswitch", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T4" },
    { id: "killswitch_gold", name: "Killswitch Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "killswitch_cheat", name: "Killswitch Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "killswitch_loot", name: "Killswitch Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },

	{ id: "sonic_basic", name: "Sonic", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T4" },
    { id: "sonic_gold", name: "Sonic Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "sonic_cheat", name: "Sonic Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "sonic_loot", name: "Sonic Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "tails_basic", name: "Tails", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T4" },
    { id: "tails_gold", name: "Tails Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "tails_cheat", name: "Tails Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "tails_loot", name: "Tails Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "shadow_basic", name: "Shadow", theme: "Básico", rarity: "Épico", unreleased: false, season: "C7T4" },
    { id: "shadow_gold", name: "Shadow Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "shadow_cheat", name: "Shadow Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "shadow_loot", name: "Shadow Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "jackrabbit_basic", name: "Jackrabbit", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T4" },
    { id: "jackrabbit_gold", name: "Jackrabbit Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "jackrabbit_cheat", name: "Jackrabbit Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "jackrabbit_loot", name: "Jackrabbit Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },
	
    { id: "klombo_basic", name: "Klimbo", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T4" },
    { id: "klombo_gold", name: "Klimbo Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "klombo_cheat", name: "Klimbo Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "klombo_loot", name: "Klimbo Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "crown_basic", name: "Coroa", theme: "Básico", rarity: "Mítico", unreleased: false, season: "C7T4" },
    { id: "crown_gold", name: "Coroa Dourada", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "crown_cheat", name: "Coroa Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
	{ id: "crown_loot", name: "Coroa Saqueador", theme: "Saque", rarity: "Especial", unreleased: false, season: "C7T4" },

	{ id: "xray_basic", name: "Raio-X", theme: "Básico", rarity: "Lendário", unreleased: false, season: "C7T4" },
    { id: "xray_gold", name: "Raio-X Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "xray_cheat", name: "Raio-X Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id: "xray_loot", name: "Raio-X Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id: "megaman_basic", name: "Mega Men", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },

    { id:"overshield_basic", name: "Escudão", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id:"overshield_gold", name: "Escudão Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id:"overshield_cheat", name: "Escudão Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id:"overshield_loot", name: "Escudão Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },

    { id:"onigiri_basic", name: "Onigiri", theme: "Básico", rarity: "Raro", unreleased: false, season: "C7T4" },
    { id:"onigiri_gold", name: "Onigiri Dourado", theme: "Dourado", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id:"onigiri_cheat", name: "Onigiri Trapaça", theme: "Trapaça", rarity: "Especial", unreleased: false, season: "C7T4" },
    { id:"onigiri_loot", name: "Onigiri Saqueador", theme: "Saque", rarity: "Especial", unreleased: true, season: "C7T4" },
];

if (typeof window !== 'undefined') {
    window.baseSprites = baseSprites;
}

