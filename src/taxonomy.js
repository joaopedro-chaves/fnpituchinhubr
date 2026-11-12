/* ===================================================
   Taxonomia: FONTE ÚNICA de temas e raridades
   ===================================================
   Tudo que depende de tema/raridade (ordenação, rótulos, cores do
   card na UI e no Canvas exportado) é derivado daqui. Para adicionar
   um tema novo, basta incluir uma entrada em THEME.
   =================================================== */

export const RARITIES = {
    'Mítico': {
        order: 0,
        slug: 'mitico',
        gradient: ['#70531C', '#2E2107'],
        displayGradient: ['#f59e1d', '#a86408', '#6e3d00'],
        lowFidelityBg: '#ffa726',
        strip: {
            colors: ['#f59e0b', '#fbbf24'],
            glow: 'rgba(245, 158, 11, 0.5)',
        },
        tag: ['#80622A', '#fff1A9'],
    },
    'Lendário': {
        order: 1,
        slug: 'lendario',
        gradient: ['#743e0a', '#301702'],
        displayGradient: ['#f06d42', '#a84220', '#6e260e'],
        lowFidelityBg: '#ff7043',
        strip: {
            colors: ['#f97316', '#fb923c'],
            glow: 'rgba(249, 115, 22, 0.5)',
        },
        tag: ['#8E4122', '#FBC568'],
    },
    'Épico': {
        order: 2,
        slug: 'epico',
        gradient: ['#4d1566', '#1e052c'],
        displayGradient: ['#a844c9', '#6e2587', '#4a155e'],
        lowFidelityBg: '#ab47bc',
        strip: {
            colors: ['#9333ea', '#a855f7'],
            glow: 'rgba(168, 85, 247, 0.5)',
        },
        tag: ['#511D7F', '#ED2BFF'],
    },
    'Raro': {
        order: 3,
        slug: 'raro',
        gradient: ['#104273', '#081a35'],
        displayGradient: ['#4b79c4', '#2b4c85', '#1d3561'],
        lowFidelityBg: '#4f83cc',
        strip: {
            colors: ['#3b82f6', '#4a78b8'],
            glow: 'rgba(59, 130, 246, 0.48)',
        },
        tag: ['#004A8E', '#00FFFB'],
    },
    'Especial': {
        order: 4,
        slug: 'especial',
        gradient: null,
        displayGradient: null,
        lowFidelityBg: null,
        strip: {
            colors: ['#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#ef4444', '#f97316', '#eab308'],
            glow: 'rgba(168, 85, 247, 0.45)',
        },
        tag: ['#51f7cc', '#000000'],
    },
};

export const THEME = {
    'Básico': { order: 0, slug: 'basico', gradient: ['#1c2436', '#0c0f17'], exportLabel: 'NORMAL', tradeLabel: 'Base' },
    'Dourado': { order: 1, slug: 'dourado', gradient: ['#61460b', '#241a02'], exportLabel: 'DOURADO' },
    'Doce': { order: 2, slug: 'doce', gradient: ['#6b183f', '#260514'], exportLabel: 'DOCE' },
    'Galáctico': { order: 3, slug: 'galactico', gradient: ['#1f1145', '#080314'], exportLabel: 'GALÁCTICO' },
    'Gema': { order: 4, slug: 'gema', gradient: ['#114c47', '#041a18'], exportLabel: 'GEMA' },
    'Metálico': { order: 5, slug: 'metalico', gradient: ['#204454', '#09171f'], exportLabel: 'METÁLICO' },
    'Cubo': { order: 6, slug: 'cubo', gradient: ['#4c1d95', '#1e0b3d'], exportLabel: 'CUBO' },
    'Pato': { order: 7, slug: 'pato', gradient: ['#322554', '#12091f'], exportLabel: 'PATO' },
    'Trapaceiro': { order: 8, slug: 'trapaceiro', gradient: ['#295913', '#0f360a'], exportLabel: 'TRAPACEIRO' },
    'Hacker de Saque': { order: 9, slug: 'hacker', gradient: ['#114030', '#051b14'], exportLabel: 'HACKER' },
    'Caçador de Recompensas': { order: 10, slug: 'cacador', gradient: ['#3b1c1c', '#170606'], exportLabel: 'CAÇADOR' },
    'Doce ou Travessura': { order: 11, slug: 'doce-ou-travessura', gradient: ['#592510', '#240a02'], exportLabel: 'DOCE OU TRAVESSURA' },
    'Valioso': { order: 12, slug: 'valioso', gradient: ['#396562', '#240a02'], exportLabel: 'VALIOSO' },
    'Amaldiçoado': { order: 13, slug: 'amaldicoado', gradient: ['#114c47', '#041a18'], exportLabel: 'AMALDIÇOADO' },
};

const byOrder = table =>
    Object.entries(table)
        .sort(([, a], [, b]) => a.order - b.order)
        .map(([name]) => name);

/** Nomes dos temas na ordem de exibição. */
export const THEME_ORDER = byOrder(THEME);

/** Nomes das raridades da mais rara para a mais comum. */
export const RARITY_ORDER = byOrder(RARITIES);

export function gradientFor(sprite) {
    const rarity = RARITIES[sprite.rarity];
    if (!rarity) throw new Error(`Raridade desconhecida no sprite: ${sprite.id} | ${sprite.rarity}`);
    if (rarity.gradient) return rarity.gradient;

    const theme = THEME[sprite.theme];
    if (!theme) throw new Error(`Tema desconhecido no sprite: ${sprite.id} | ${sprite.theme}`);
    return theme.gradient;
}

export function getRarityGradient(rarity, theme) {
    const rarityInfo = RARITIES[rarity];
    if (rarityInfo?.gradient) return rarityInfo.gradient;
    // Raridade "Especial" não tem gradiente próprio: usa o do tema
    if (rarityInfo) return (THEME[theme] || THEME['Básico']).gradient;
    return RARITIES['Raro'].gradient;
}

export function getRarityDisplayGradient(rarity, theme) {
    const rarityInfo = RARITIES[rarity];
    if (rarityInfo?.displayGradient) return rarityInfo.displayGradient;
    if (rarity === 'Especial') {
        return (THEME[theme] || THEME['Básico']).gradient;
    }
    return RARITIES['Raro'].displayGradient;
}

export function getRarityStripStyle(rarity) {
    return RARITIES[rarity]?.strip || RARITIES['Raro'].strip;
}

export function getRarityTagColors(rarity) {
    return (RARITIES[rarity] || RARITIES['Raro']).tag;
}

export function getCardStyleVars(rarity, theme) {
    const rarityInfo = RARITIES[rarity] || RARITIES['Raro'];
    const colors = getRarityDisplayGradient(rarity, theme);
    const displayBg =
        colors.length >= 3
            ? `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 75%, ${colors[2]} 100%)`
            : `linear-gradient(180deg, ${colors[0]}, ${colors[1]})`;
    const vars = {
        '--card-display-bg': displayBg,
        '--card-low-fidelity-bg': rarityInfo.lowFidelityBg || colors[0],
    };
    if (rarity !== 'Especial') {
        const strip = getRarityStripStyle(rarity);
        vars['--card-strip-bg'] = `linear-gradient(90deg, ${strip.colors.join(', ')})`;
        vars['--rarity-glow'] = strip.glow;
    }
    return vars;
}
