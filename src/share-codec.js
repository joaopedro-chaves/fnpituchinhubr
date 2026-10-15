/* ===================================================
   Share Encoding / Decoding
   ===================================================
   Formato v2 (atual) — independente da posição:
     "2." + base64url(deflate-raw(texto))      (com CompressionStream)
     "2r." + base64url(texto)                  (fallback sem compressão)

   O texto agrupa os ids pelo prefixo (personagem) e é ordenado,
   então a ordem do array em sprites-data.js não importa:
     "8bit:basic*,gold;water:basic,quack"
   "*" no fim do sufixo = dominado (mastered).

   Formato v1 (legado) — bitmap por posição, decodificado com a
   ordem congelada em share-legacy-order.js.
   =================================================== */

import { LEGACY_SHARE_ORDER } from './share-legacy-order.js';

export const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const V2_PREFIX = '2.';
const V2_RAW_PREFIX = '2r.';
const EMPTY = Object.freeze({ obtained: [], mastered: [] });

/* ---------- v1 (legado) ---------- */

export function encodeBits(bits) {
    while (bits.length % 6 !== 0) {
        bits += '0';
    }
    let code = '';
    for (let i = 0; i < bits.length; i += 6) {
        const val = parseInt(bits.substring(i, i + 6), 2);
        code += B64_CHARS[val];
    }
    return code.replace(/A+$/, '');
}

export function decodeBits(code) {
    if (!code) return '';
    let bits = '';
    for (let i = 0; i < code.length; i++) {
        const val = B64_CHARS.indexOf(code[i]);
        if (val === -1) return '';
        bits += val.toString(2).padStart(6, '0');
    }
    return bits;
}

function decompressLegacy(code) {
    const parts = code.split('~');
    if (parts.length > 2) return EMPTY;

    const obtainedCode = parts[0];
    const masteredCode = parts[1] || '';

    if (!/^[A-Za-z0-9\-_]*$/.test(obtainedCode) || !/^[A-Za-z0-9\-_]*$/.test(masteredCode)) {
        return EMPTY;
    }

    const obtainedBits = decodeBits(obtainedCode);
    const masteredBits = decodeBits(masteredCode);

    const obtained = [];
    const mastered = [];

    LEGACY_SHARE_ORDER.forEach((id, idx) => {
        if (obtainedBits[idx] !== '1') return;
        obtained.push(id);
        if (masteredBits[idx] === '1') mastered.push(id);
    });

    return { obtained, mastered };
}

/* ---------- base64url / compressão ---------- */

function bytesToBase64Url(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(str) {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

const hasCompression = typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

async function pipeBytes(bytes, stream) {
    const buffer = await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer();
    return new Uint8Array(buffer);
}

/* ---------- v2 (por id) ---------- */

function splitId(id) {
    const idx = id.indexOf('_');
    return idx === -1 ? [id, ''] : [id.slice(0, idx), id.slice(idx + 1)];
}

function joinId(prefix, suffix) {
    return suffix ? `${prefix}_${suffix}` : prefix;
}

function serialize(obtained, mastered) {
    const masteredSet = new Set(mastered);
    const groups = new Map();

    [...new Set(obtained)].sort().forEach(id => {
        const [prefix, suffix] = splitId(id);
        if (!groups.has(prefix)) groups.set(prefix, []);
        groups.get(prefix).push(suffix + (masteredSet.has(id) ? '*' : ''));
    });

    return [...groups].map(([prefix, suffixes]) => `${prefix}:${suffixes.join(',')}`).join(';');
}

function deserialize(text, knownIds) {
    const obtained = [];
    const mastered = [];

    text.split(';').filter(Boolean).forEach(group => {
        const sep = group.indexOf(':');
        if (sep === -1) return;
        const prefix = group.slice(0, sep);

        group.slice(sep + 1).split(',').forEach(rawSuffix => {
            const isMastered = rawSuffix.endsWith('*');
            const id = joinId(prefix, isMastered ? rawSuffix.slice(0, -1) : rawSuffix);
            if (knownIds && !knownIds.has(id)) return;
            obtained.push(id);
            if (isMastered) mastered.push(id);
        });
    });

    return { obtained, mastered };
}

/* ---------- API pública ---------- */

export async function compressCollection(obtained, mastered) {
    if (!obtained || obtained.length === 0) return '';

    const bytes = new TextEncoder().encode(serialize(obtained, mastered));

    if (hasCompression) {
        try {
            const deflated = await pipeBytes(bytes, new CompressionStream('deflate-raw'));
            return V2_PREFIX + bytesToBase64Url(deflated);
        } catch {
            /* cai no fallback abaixo */
        }
    }
    return V2_RAW_PREFIX + bytesToBase64Url(bytes);
}

export async function decompressCollection(sprites, code) {
    if (!code) return EMPTY;

    const knownIds = sprites && sprites.length ? new Set(sprites.map(s => s.id)) : null;

    try {
        if (code.startsWith(V2_PREFIX) || code.startsWith(V2_RAW_PREFIX)) {
            const isRaw = code.startsWith(V2_RAW_PREFIX);
            const payload = code.slice(isRaw ? V2_RAW_PREFIX.length : V2_PREFIX.length);
            if (!/^[A-Za-z0-9\-_]*$/.test(payload)) return EMPTY;

            let bytes = base64UrlToBytes(payload);
            if (!isRaw) {
                if (!hasCompression) return EMPTY;
                bytes = await pipeBytes(bytes, new DecompressionStream('deflate-raw'));
            }
            return deserialize(new TextDecoder().decode(bytes), knownIds);
        }

        const legacy = decompressLegacy(code);
        if (!knownIds) return legacy;
        return {
            obtained: legacy.obtained.filter(id => knownIds.has(id)),
            mastered: legacy.mastered.filter(id => knownIds.has(id)),
        };
    } catch {
        return EMPTY;
    }
}
