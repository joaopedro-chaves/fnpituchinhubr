import { describe, it, expect } from 'vitest';
import {
    filterSprites,
    sortSprites,
    getReleasedSprites,
    getCollectionCounts,
    getActiveThemes,
    getExportThemeLabel,
    getTradeThemeLabel,
    getSpriteDataIssues,
    getFamilyKey,
} from './query.js';
import { baseSprites } from './data/sprites-data.js';

const sprites = [
    { id: 'water_basic', name: 'Água', theme: 'Básico', rarity: 'Raro', unreleased: false, season: 'C7T3' },
    { id: 'water_gold', name: 'Água Dourado', theme: 'Dourado', rarity: 'Especial', unreleased: false, season: 'C7T3' },
    { id: 'fire_basic', name: 'Fogo', theme: 'Básico', rarity: 'Raro', unreleased: false, season: 'C7T4' },
    { id: 'onewish_basic', name: 'Desejo', theme: 'Básico', rarity: 'Mítico', unreleased: false, season: 'C7T4' },
    { id: 'soon_basic', name: 'Em breve', theme: 'Básico', rarity: 'Épico', unreleased: true, season: 'C7T4' },
];

function makeState(overrides = {}) {
    return {
        obtained: [],
        mastered: [],
        viewMode: false,
        filters: { search: '', theme: 'all', season: 'all', status: 'all' },
        settings: { hideMastered: false, sortOrder: 'theme', showUnreleased: false },
        ...overrides,
    };
}

describe('filterSprites', () => {
    it('oculta não lançados por padrão e mostra quando habilitado', () => {
        expect(filterSprites(sprites, makeState())).toHaveLength(4);
        const withUnreleased = makeState({
            settings: { hideMastered: false, sortOrder: 'theme', showUnreleased: true },
        });
        expect(filterSprites(sprites, withUnreleased)).toHaveLength(5);
    });

    it('busca por nome ignorando maiúsculas e espaços nas pontas', () => {
        const state = makeState({ filters: { search: '  ÁGUA ', theme: 'all', season: 'all', status: 'all' } });
        expect(filterSprites(sprites, state).map(s => s.id)).toEqual(['water_basic', 'water_gold']);
    });

    it('filtra por tema e temporada', () => {
        const state = makeState({ filters: { search: '', theme: 'Básico', season: 'C7T4', status: 'all' } });
        expect(filterSprites(sprites, state).map(s => s.id)).toEqual(['fire_basic', 'onewish_basic']);
    });

    it('filtra por status coletado/faltando', () => {
        const owned = makeState({
            obtained: ['water_basic'],
            filters: { search: '', theme: 'all', season: 'all', status: 'owned' },
        });
        expect(filterSprites(sprites, owned).map(s => s.id)).toEqual(['water_basic']);

        const missing = { ...owned, filters: { ...owned.filters, status: 'missing' } };
        expect(filterSprites(sprites, missing)).toHaveLength(3);
    });

    it('oculta dominados quando configurado', () => {
        const state = makeState({
            obtained: ['water_basic'],
            mastered: ['water_basic'],
            settings: { hideMastered: true, sortOrder: 'theme', showUnreleased: false },
        });
        expect(filterSprites(sprites, state).map(s => s.id)).not.toContain('water_basic');
    });

    it('em modo somente leitura mostra apenas coletados', () => {
        const state = makeState({ viewMode: true, obtained: ['fire_basic'] });
        expect(filterSprites(sprites, state).map(s => s.id)).toEqual(['fire_basic']);
    });
});

describe('sortSprites', () => {
    it('ordena por raridade (mais rara primeiro) e depois por nome', () => {
        const ids = sortSprites(sprites, 'rarity').map(s => s.id);
        expect(ids.slice(0, 2)).toEqual(['onewish_basic', 'soon_basic']);
        expect(ids.at(-1)).toBe('water_gold');
    });

    it('ordena por tema seguindo a taxonomia', () => {
        const ids = sortSprites(sprites, 'theme').map(s => s.theme);
        expect(ids.at(-1)).toBe('Dourado');
    });

    it('ordena por nome e não muta o array original', () => {
        const copy = [...sprites];
        const names = sortSprites(sprites, 'name').map(s => s.name);
        expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
        expect(sprites).toEqual(copy);
    });
});

describe('contagens e temas', () => {
    it('getReleasedSprites ignora não lançados e respeita a temporada', () => {
        expect(getReleasedSprites(sprites)).toHaveLength(4);
        expect(getReleasedSprites(sprites, 'C7T3')).toHaveLength(2);
    });

    it('getCollectionCounts conta coletados e dominados', () => {
        const state = makeState({ obtained: ['water_basic', 'fire_basic'], mastered: ['fire_basic'] });
        expect(getCollectionCounts(getReleasedSprites(sprites), state)).toEqual({
            total: 4,
            collected: 2,
            mastered: 1,
        });
    });

    it('getActiveThemes devolve temas únicos na ordem da taxonomia', () => {
        expect(getActiveThemes(sprites)).toEqual(['Básico', 'Dourado']);
    });

    it('getFamilyKey usa o prefixo do id', () => {
        expect(getFamilyKey({ id: 'water_basic' })).toBe('water');
    });

    it('rótulos de exportação e troca vêm da taxonomia', () => {
        expect(getExportThemeLabel('Básico')).toBe('NORMAL');
        expect(getExportThemeLabel('Galáctico')).toBe('GALÁCTICO');
        expect(getTradeThemeLabel('Básico')).toBe('Base');
        expect(getTradeThemeLabel('Gema')).toBe('Gema');
        expect(getExportThemeLabel('Desconhecido')).toBe('DESCONHECIDO');
    });
});

describe('integridade dos dados reais (sprites-data.js)', () => {
    it('todos os sprites lançados têm nome, tema e raridade válidos e ids únicos', () => {
        expect(getSpriteDataIssues(baseSprites)).toEqual([]);
    });

    it('detecta problemas em sprites lançados incompletos', () => {
        const issues = getSpriteDataIssues([
            { id: 'a_basic', name: '', theme: 'Inexistente', rarity: 'Raro', unreleased: false },
            { id: 'a_basic', name: 'X', theme: 'Básico', rarity: 'Raro', unreleased: false },
            { id: 'placeholder', name: '', theme: '', rarity: '', unreleased: true },
        ]);
        expect(issues).toEqual([
            'a_basic: nome vazio',
            'a_basic: tema desconhecido "Inexistente"',
            'a_basic: id duplicado',
        ]);
    });
});
