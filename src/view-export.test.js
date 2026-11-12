import { describe, it, expect, vi, beforeEach } from 'vitest';

const { toastMock } = vi.hoisted(() => ({
    toastMock: vi.fn(),
}));

vi.mock('./dom-utils.js', async importOriginal => {
    const actual = await importOriginal();
    return {
        ...actual,
        toast: toastMock,
    };
});

import {
    getExportConfig,
    getExportCardState,
    generateTradeText,
    generateTradeGridText,
} from './view-export.js';
import { TRACKER_URL } from './share-order.js';

const sampleSprites = [
    { id: 'water_basic', name: 'Água', theme: 'Básico', rarity: 'Raro', unreleased: false, season: 'C7T3' },
    { id: 'water_gold', name: 'Água Dourado', theme: 'Dourado', rarity: 'Especial', unreleased: false, season: 'C7T3' },
    { id: 'fire_basic', name: 'Fogo', theme: 'Básico', rarity: 'Raro', unreleased: false, season: 'C7T4' },
    { id: 'soon_basic', name: 'Em breve', theme: 'Básico', rarity: 'Épico', unreleased: true, season: 'C7T4' },
];

function makeState(overrides = {}) {
    return {
        obtained: ['water_basic', 'fire_basic'],
        mastered: ['fire_basic'],
        viewMode: false,
        filters: { search: '', theme: 'all', season: 'all', status: 'all' },
        settings: { hideMastered: false, sortOrder: 'theme', showUnreleased: false },
        ...overrides,
    };
}

describe('view-export (paridade)', () => {
    beforeEach(() => {
        toastMock.mockClear();
    });

    it('getExportCardState retorna o estado exato para cada modo', () => {
        const state = makeState();
        const masteredSprite = sampleSprites[2]; // fire_basic (obtained + mastered)
        const ownedSprite = sampleSprites[0]; // water_basic (obtained only)
        const missingSprite = sampleSprites[1]; // water_gold (missing)

        expect(getExportCardState(masteredSprite, 'trade', state)).toBe('mastered');
        expect(getExportCardState(ownedSprite, 'trade', state)).toBe('owned');
        expect(getExportCardState(missingSprite, 'trade', state)).toBe('missing_gray');

        expect(getExportCardState(masteredSprite, 'collected', state)).toBe('mastered');
        expect(getExportCardState(ownedSprite, 'collected', state)).toBe('owned');
        expect(getExportCardState(missingSprite, 'collected', state)).toBe('empty');

        expect(getExportCardState(missingSprite, 'missing', state)).toBe('missing_color');
        expect(getExportCardState(ownedSprite, 'missing', state)).toBe('empty');

        expect(getExportCardState(masteredSprite, 'mastered', state)).toBe('mastered');
        expect(getExportCardState(ownedSprite, 'mastered', state)).toBe('empty');

        expect(getExportCardState(ownedSprite, 'unmastered', state)).toBe('unmastered');
        expect(getExportCardState(masteredSprite, 'unmastered', state)).toBe('empty');

        expect(getExportCardState(ownedSprite, 'desconhecido', state)).toBe('empty');
    });

    it('getExportConfig retorna configurações e itens esperados por modo', () => {
        const state = makeState();

        const collected = getExportConfig('collected', state, sampleSprites);
        expect(collected.filename).toBe('fnsprites-collection');
        expect(collected.titleL2).toBe('Minha coleção');
        expect(collected.items.map(s => s.id)).toEqual(['water_basic', 'fire_basic']);

        const missing = getExportConfig('missing', state, sampleSprites);
        expect(missing.filename).toBe('fnsprites-missing');
        expect(missing.items.map(s => s.id)).toEqual(['water_gold']);

        const unmastered = getExportConfig('unmastered', state, sampleSprites);
        expect(unmastered.filename).toBe('fnsprites-unmastered');
        expect(unmastered.items.map(s => s.id)).toEqual(['water_basic']);

        const mastered = getExportConfig('mastered', state, sampleSprites);
        expect(mastered.filename).toBe('fnsprites-mastered');
        expect(mastered.items.map(s => s.id)).toEqual(['fire_basic']);

        const trade = getExportConfig('trade', state, sampleSprites);
        expect(trade.filename).toBe('fnsprites-trade-card');
        expect(trade.items.map(s => s.id)).toEqual(['water_basic', 'water_gold', 'fire_basic']);
        expect(toastMock).not.toHaveBeenCalled();
    });

    it('getExportConfig notifica toast e retorna null quando vazio ou inválido', () => {
        const emptyState = makeState({ obtained: [], mastered: [] });
        expect(getExportConfig('collected', emptyState, sampleSprites)).toBeNull();
        expect(toastMock).toHaveBeenCalledWith('Nenhum pituchinhu para exportar!', 'error');

        toastMock.mockClear();
        expect(getExportConfig('invalido', emptyState, sampleSprites)).toBeNull();
        expect(toastMock).toHaveBeenCalledWith('Nada para exportar!', 'error');
    });

    it('generateTradeText gera o texto exato agrupado por seção e família', () => {
        const state = makeState();
        const output = generateTradeText(state, sampleSprites);

        expect(output).toBe(
            [
                '【 LOOKING FOR 】',
                '  ▸ Água ➔ Dourado',
                '',
                '【 HAVE 】',
                '  ▸ Água ➔ Base',
                '  ▸ Fogo ➔ Base',
                '',
                '【 STILL NEED TO MASTER 】',
                '  ▸ Água ➔ Base',
                '',
                'Colecionados: 2/3',
                'Dominados: 1/3',
                `Link do rastreador: ${TRACKER_URL}`,
            ].join('\n')
        );
    });

    it('generateTradeText omite seções vazias e respeita filtro de temporada', () => {
        const state = makeState({
            obtained: ['water_basic', 'water_gold'],
            mastered: ['water_basic', 'water_gold'],
            filters: { search: '', theme: 'all', season: 'C7T3', status: 'all' },
        });
        const output = generateTradeText(state, sampleSprites);

        expect(output).toBe(
            [
                '【 HAVE 】',
                '  ▸ Água ➔ Base, Dourado',
                '',
                'Colecionados: 2/2',
                'Dominados: 2/2',
                `Link do rastreador: ${TRACKER_URL}`,
            ].join('\n')
        );
    });

    it('generateTradeGridText gera exatamente a grade Markdown esperada', () => {
        const state = makeState();
        const output = generateTradeGridText(state, sampleSprites);

        expect(output).toBe(
            [
                '```',
                '✅ Tenho  👑 Dominado  ❌ Não tenho',
                '',
                '| NORMAL | DOURADO | Sprite',
                '-----------------------',
                '| ✅ | ❌ | Água',
                '| 👑 | ⬛ | Fogo',
                '',
                'Colecionados: 2/3',
                'Dominados: 1/3',
                `Link: ${TRACKER_URL}`,
                '```',
            ].join('\n')
        );
    });
});
