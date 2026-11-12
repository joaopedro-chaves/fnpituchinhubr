// @vitest-environment jsdom
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import { CatalogPage } from './pages/CatalogPage.jsx';
import { useTrackerState } from './hooks/useTrackerState.js';
import { baseSprites } from './data/sprites-data.js';
import { KEYS } from './share-order.js';
import { toast, copyText } from './dom-utils.js';

describe('useTrackerState (persistência incremental, debounce e tema claro/escuro)', () => {
    beforeEach(() => {
        localStorage.clear();
        window.history.replaceState({}, '', '/');
        delete document.documentElement.dataset.theme;
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        window.history.replaceState({}, '', '/');
        document.getElementById('toastContainer')?.remove();
        delete document.documentElement.dataset.theme;
        cleanup();
    });

    it('não grava no localStorage na montagem inicial e grava apenas a chave modificada', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        const { container } = render(createElement(CatalogPage));

        expect(setItemSpy).not.toHaveBeenCalled();

        const firstCard = /** @type {HTMLElement} */ (container.querySelector('.card[data-id]'));
        fireEvent.click(firstCard.querySelector('.card-primary'));

        expect(setItemSpy).toHaveBeenCalledTimes(1);
        expect(setItemSpy).toHaveBeenCalledWith(KEYS.obtained, JSON.stringify([firstCard.dataset.id]));

        setItemSpy.mockClear();
        const crownBtn = firstCard.querySelector('.card-crown');
        fireEvent.click(crownBtn);

        expect(setItemSpy).toHaveBeenCalledTimes(1);
        expect(setItemSpy).toHaveBeenCalledWith(KEYS.mastered, JSON.stringify([firstCard.dataset.id]));

        setItemSpy.mockRestore();
    });

    it('faz debounce de ~200ms na busca e faz flush imediato em pagehide sem perder dados', () => {
        vi.useFakeTimers();
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        const { container } = render(createElement(CatalogPage));

        const searchInput = container.querySelector('#searchInput');
        fireEvent.change(searchInput, { target: { value: 'fogo' } });

        // Antes dos 200ms ainda não persistiu
        expect(setItemSpy).not.toHaveBeenCalledWith(KEYS.search, 'fogo');

        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(setItemSpy).toHaveBeenCalledWith(KEYS.search, 'fogo');

        // Digitação seguida de pagehide imediato (<200ms) deve persistir na hora
        setItemSpy.mockClear();
        fireEvent.change(searchInput, { target: { value: 'agua' } });
        expect(setItemSpy).not.toHaveBeenCalled();

        act(() => {
            window.dispatchEvent(new Event('pagehide'));
        });
        expect(setItemSpy).toHaveBeenCalledTimes(1);
        expect(setItemSpy).toHaveBeenCalledWith(KEYS.search, 'agua');

        setItemSpy.mockRestore();
    });

    it('usa tema escuro por padrão e alterna para tema claro pelo switch nas configurações', async () => {
        const { container } = render(createElement(CatalogPage));
        expect(document.documentElement.dataset.theme).toBeUndefined();

        fireEvent.click(container.querySelector('#settingsToggle'));
        const themeSwitch = /** @type {HTMLInputElement} */ (
            await waitFor(() => {
                const el = container.querySelector('#lightTheme');
                expect(el).not.toBeNull();
                return el;
            })
        );

        expect(themeSwitch.checked).toBe(false);

        fireEvent.click(themeSwitch);
        expect(themeSwitch.checked).toBe(true);
        expect(document.documentElement.dataset.theme).toBe('light');
        expect(localStorage.getItem(KEYS.lightTheme)).toBe('true');

        fireEvent.click(themeSwitch);
        expect(themeSwitch.checked).toBe(false);
        expect(document.documentElement.dataset.theme).toBeUndefined();
        expect(localStorage.getItem(KEYS.lightTheme)).toBe('false');
    });

    it('sinaliza erro amigável em ?c= vazio sem sobrescrever coleção local', () => {
        const saved = JSON.stringify(['water_basic']);
        localStorage.setItem(KEYS.obtained, saved);
        window.history.replaceState({}, '', '/?c=');

        const { container } = render(createElement(CatalogPage));
        const banner = container.querySelector('#viewBanner');
        expect(banner).not.toBeNull();
        expect(banner.textContent).toContain('Link de compartilhamento inválido ou vazio');
        expect(container.querySelectorAll('.card[data-id]').length).toBe(0);
        expect(localStorage.getItem(KEYS.obtained)).toBe(saved);

        fireEvent.click(banner.querySelector('a'));
        expect(container.querySelector('#viewBanner')).toBeNull();
        expect(window.location.search).toBe('');
        expect(localStorage.getItem(KEYS.obtained)).toBe(saved);
    });

    it('sinaliza erro amigável em ?c=2.invalido e ?c=!!! sem quebrar o app ou perder dados locais', async () => {
        const saved = JSON.stringify(['water_basic']);
        localStorage.setItem(KEYS.obtained, saved);
        window.history.replaceState({}, '', '/?c=2.invalido');

        const { container } = render(createElement(CatalogPage));
        await waitFor(() => {
            const banner = container.querySelector('#viewBanner');
            expect(banner).not.toBeNull();
            expect(banner.textContent).toContain('Link de compartilhamento inválido ou vazio');
        });
        expect(localStorage.getItem(KEYS.obtained)).toBe(saved);
        cleanup();

        window.history.replaceState({}, '', '/?c=!!!');
        const secondRender = render(createElement(CatalogPage));
        await waitFor(() => {
            const banner = secondRender.container.querySelector('#viewBanner');
            expect(banner).not.toBeNull();
            expect(banner.textContent).toContain('Link de compartilhamento inválido ou vazio');
        });
        expect(localStorage.getItem(KEYS.obtained)).toBe(saved);
    });

    it('valida backup JSON sem perder dados quando 0 IDs são reconhecidos e permite Desfazer após importação válida', async () => {
        localStorage.setItem(KEYS.obtained, JSON.stringify(['water_basic']));
        const { container } = render(createElement(CatalogPage));

        const importInput = container.querySelector('#importInput');
        expect(importInput).not.toBeNull();

        // 1. JSON só com IDs desconhecidos não sobrescreve coleção atual
        const invalidIdsFile = new File(
            [JSON.stringify({ obtained: ['id_nao_existe'], mastered: [] })],
            'invalid.json',
            { type: 'application/json' }
        );
        fireEvent.change(importInput, { target: { files: [invalidIdsFile] } });

        await waitFor(() => {
            const errToast = document.querySelector('#toastContainer .toast-error');
            expect(errToast).not.toBeNull();
            expect(errToast.textContent).toContain('Nenhum pituchinho válido encontrado');
        });
        expect(JSON.parse(localStorage.getItem(KEYS.obtained))).toEqual(['water_basic']);

        // 2. Importação parcial oferece botão Desfazer e restaura estado anterior ao clicar
        const validBackupFile = new File(
            [
                JSON.stringify({
                    obtained: ['water_gold', 'water_holofoil', 'id_desconhecido'],
                    mastered: ['water_gold'],
                }),
            ],
            'valid.json',
            { type: 'application/json' }
        );
        fireEvent.change(importInput, { target: { files: [validBackupFile] } });

        await waitFor(() => {
            expect(JSON.parse(localStorage.getItem(KEYS.obtained))).toEqual([
                'water_gold',
                'water_holofoil',
            ]);
        });

        const undoBtn = await waitFor(() => {
            const toastEl = document.querySelector('#toastContainer .toast-success');
            expect(toastEl).not.toBeNull();
            expect(toastEl.textContent).toContain('2 pituchinho(s) importado(s)');
            expect(toastEl.textContent).toContain('1 item(ns) desconhecido(s) ignorado(s)');
            const btn = toastEl.querySelector('.toast-action');
            expect(btn).not.toBeNull();
            expect(btn.textContent).toBe('Desfazer');
            return btn;
        });

        fireEvent.click(undoBtn);
        await waitFor(() => {
            expect(JSON.parse(localStorage.getItem(KEYS.obtained))).toEqual(['water_basic']);
        });
    });

    it('empilha notificações em #toastContainer e usa fallback de cópia quando navigator.clipboard não está disponível', () => {
        toast('Primeiro aviso', 'info');
        toast('Segundo aviso', 'success');

        const region = document.getElementById('toastContainer');
        expect(region).not.toBeNull();
        expect(region.getAttribute('role')).toBe('region');
        expect(region.querySelectorAll('.toast').length).toBe(2);

        // Fallback legado para contextos HTTP / sem navigator.clipboard
        const originalClipboard = navigator.clipboard;
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: undefined,
        });
        document.execCommand = vi.fn(() => true);

        copyText('texto teste', 'Copiado no HTTP!', 'Erro ao copiar');
        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(region.textContent).toContain('Copiado no HTTP!');

        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: originalClipboard,
        });
        delete document.execCommand;
    });

    it('preserva referência de visibleSprites ao marcar cards na visão padrão e recalcula sob status/hideMastered', () => {
        /** @type {ReturnType<typeof useTrackerState> | null} */
        let latest = null;
        function Probe() {
            latest = useTrackerState(baseSprites);
            return null;
        }
        const readState = () => {
            if (!latest) throw new Error('Expected tracker state snapshot');
            return latest;
        };

        render(createElement(Probe));
        const initialVisible = readState().visibleSprites;
        const firstId = initialVisible[0].id;

        act(() => {
            readState().toggleObtained(firstId);
            readState().toggleMastery(firstId);
            readState().updateSetting('lightTheme', true);
            readState().updateSetting('lowFidelity', true);
        });
        expect(readState().visibleSprites).toBe(initialVisible);

        act(() => {
            readState().updateFilter('status', 'owned');
        });
        const ownedVisible = readState().visibleSprites;
        expect(ownedVisible).not.toBe(initialVisible);
        expect(ownedVisible.map(s => s.id)).toEqual([firstId]);

        act(() => {
            readState().updateFilter('status', 'all');
            readState().updateSetting('hideMastered', true);
        });
        expect(readState().visibleSprites.some(s => s.id === firstId)).toBe(false);
    });
});

