#!/usr/bin/env node
/**
 * Lança (ou oculta) elementais em src/data/sprites-data.js com base no id.
 *
 * Uso:
 *   node scripts/release-sprites.js --ids "bush_basic, jonesy_*" [--action release|unrelease] [--dry-run]
 *
 * - IDs separados por vírgula, espaço ou quebra de linha.
 * - Suporta curinga "*" (ex.: "bush_*", "*_tricktreat").
 * - Compara com qualquer chave `id` presente na linha do sprite.
 * - Edita apenas o valor de `unreleased`, preservando a formatação do arquivo.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'sprites-data.js');

function parseArgs(argv) {
    const args = { ids: '', action: 'release', dryRun: false };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--ids') args.ids = argv[++i] || '';
        else if (arg === '--action') args.action = argv[++i] || '';
        else if (arg === '--dry-run') args.dryRun = true;
        else if (arg === '-h' || arg === '--help') {
            console.log('Uso: node scripts/release-sprites.js --ids "id1,id2,prefix_*" [--action release|unrelease] [--dry-run]');
            process.exit(0);
        } else {
            console.error(`[ERRO] Argumento desconhecido: ${arg}`);
            process.exit(1);
        }
    }
    return args;
}

function toRegex(pattern) {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
}

function writeSummary(markdown) {
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (summaryFile) fs.appendFileSync(summaryFile, markdown + '\n');
}

function setOutput(name, value) {
    const outputFile = process.env.GITHUB_OUTPUT;
    if (outputFile) fs.appendFileSync(outputFile, `${name}=${value}\n`);
}

function main() {
    const { ids, action, dryRun } = parseArgs(process.argv.slice(2));

    if (!['release', 'unrelease'].includes(action)) {
        console.error(`[ERRO] Ação inválida: "${action}". Use "release" ou "unrelease".`);
        process.exit(1);
    }

    const patterns = [...new Set(ids.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean))];
    if (patterns.length === 0) {
        console.error('[ERRO] Nenhum id informado.');
        process.exit(1);
    }

    const invalid = patterns.filter(p => !/^[A-Za-z0-9_*-]+$/.test(p));
    if (invalid.length) {
        console.error(`[ERRO] IDs com caracteres inválidos: ${invalid.join(', ')}`);
        process.exit(1);
    }

    const targetValue = action === 'release' ? 'false' : 'true';
    const matchers = patterns.map(p => ({ pattern: p, regex: toRegex(p), hits: 0 }));

    const original = fs.readFileSync(DATA_FILE, 'utf8');
    const lines = original.split('\n');

    const changed = [];
    const unchanged = [];

    const updated = lines.map(line => {
        if (!/unreleased\s*:/.test(line)) return line;

        const lineIds = [...line.matchAll(/\bid\s*:\s*["']([^"']+)["']/g)].map(m => m[1]);
        if (lineIds.length === 0) return line;

        const hit = matchers.filter(m => lineIds.some(id => m.regex.test(id)));
        if (hit.length === 0) return line;
        hit.forEach(m => m.hits++);

        const primaryId = lineIds[0];
        if (lineIds.length > 1) {
            console.warn(`[AVISO] Sprite "${primaryId}" possui chave "id" duplicada (${lineIds.join(', ')}). ` +
                'Em JS, o último valor sobrescreve o primeiro.');
        }

        const current = (line.match(/unreleased\s*:\s*(true|false)/) || [])[1];
        if (current === targetValue) {
            unchanged.push(primaryId);
            return line;
        }

        changed.push(primaryId);
        return line.replace(/unreleased\s*:\s*(true|false)/, `unreleased: ${targetValue}`);
    });

    const notFound = matchers.filter(m => m.hits === 0).map(m => m.pattern);
    const verb = action === 'release' ? 'lançado(s)' : 'marcado(s) como não lançado(s)';

    console.log(`Ação: ${action}${dryRun ? ' (dry-run)' : ''}`);
    console.log(`Alterados (${changed.length}): ${changed.join(', ') || '-'}`);
    console.log(`Já estavam no estado desejado (${unchanged.length}): ${unchanged.join(', ') || '-'}`);
    if (notFound.length) console.log(`Não encontrados (${notFound.length}): ${notFound.join(', ')}`);

    writeSummary([
        `## 🚀 Lançamento de elementais${dryRun ? ' (dry-run)' : ''}`,
        '',
        `**Ação:** \`${action}\``,
        '',
        `### ✅ ${changed.length} sprite(s) ${verb}`,
        changed.length ? changed.map(id => `- \`${id}\``).join('\n') : '_Nenhum_',
        '',
        unchanged.length ? `### ⏭️ Sem alteração (${unchanged.length})\n${unchanged.map(id => `- \`${id}\``).join('\n')}\n` : '',
        notFound.length ? `### ❌ Não encontrados (${notFound.length})\n${notFound.map(id => `- \`${id}\``).join('\n')}\n` : '',
    ].join('\n'));

    setOutput('changed_count', changed.length);
    setOutput('changed_ids', changed.join(','));

    if (notFound.length) {
        console.error('[ERRO] Alguns ids não foram encontrados. Nenhuma alteração foi gravada.');
        process.exit(1);
    }

    if (!dryRun && changed.length) {
        fs.writeFileSync(DATA_FILE, updated.join('\n'), 'utf8');
        console.log(`Arquivo atualizado: ${path.relative(process.cwd(), DATA_FILE)}`);
    }
}

main();
