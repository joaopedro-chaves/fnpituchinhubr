import { describe, it, expect } from 'vitest';
import { compressCollection, decompressCollection, encodeBits } from './share-codec.js';
import { baseSprites } from './data/sprites-data.js';
import { LEGACY_SHARE_ORDER } from './share-legacy-order.js';

describe('share-codec v2', () => {
    it('faz o round-trip de coleção e dominados', async () => {
        const obtained = ['water_basic', 'water_gold', 'fire_basic', 'bush_cheat'];
        const mastered = ['water_gold'];

        const code = await compressCollection(obtained, mastered);
        expect(code.startsWith('2.')).toBe(true);

        const decoded = await decompressCollection(baseSprites, code);
        expect([...decoded.obtained].sort()).toEqual([...obtained].sort());
        expect(decoded.mastered).toEqual(mastered);
    });

    it('coleção vazia gera código vazio e decodifica como vazio', async () => {
        expect(await compressCollection([], [])).toBe('');
        expect(await decompressCollection(baseSprites, '')).toEqual({ obtained: [], mastered: [] });
    });

    it('descarta ids desconhecidos ao decodificar', async () => {
        const code = await compressCollection(['water_basic', 'nao_existe_basic'], []);
        const decoded = await decompressCollection(baseSprites, code);
        expect(decoded.obtained).toEqual(['water_basic']);
    });

    it('decodifica o formato sem compressão (2r.)', async () => {
        const payload = Buffer.from('water:basic*,gold').toString('base64url');
        const decoded = await decompressCollection(baseSprites, `2r.${payload}`);
        expect(decoded.obtained).toEqual(['water_basic', 'water_gold']);
        expect(decoded.mastered).toEqual(['water_basic']);
    });

    it('rejeita códigos malformados sem lançar erro', async () => {
        const empty = { obtained: [], mastered: [] };
        expect(await decompressCollection(baseSprites, '2.@@@invalido')).toEqual(empty);
        expect(await decompressCollection(baseSprites, '2.AAAA')).toEqual(empty);
        expect(await decompressCollection(baseSprites, 'a~b~c')).toEqual(empty);
    });
});

describe('share-codec v1 (legado)', () => {
    it('decodifica o bitmap por posição usando a ordem congelada', async () => {
        // posições 0 e 2 coletadas; posição 0 dominada
        const code = `${encodeBits('101')}~${encodeBits('1')}`;
        const decoded = await decompressCollection(baseSprites, code);

        expect(decoded.obtained).toEqual([LEGACY_SHARE_ORDER[0], LEGACY_SHARE_ORDER[2]]);
        expect(decoded.mastered).toEqual([LEGACY_SHARE_ORDER[0]]);
    });

    it('todos os ids da ordem legada ainda existem nos dados atuais', () => {
        const known = new Set(baseSprites.map(s => s.id));
        const missing = LEGACY_SHARE_ORDER.filter(id => !known.has(id));
        expect(missing).toEqual([]);
    });
});
