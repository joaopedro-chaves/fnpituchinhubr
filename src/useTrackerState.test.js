// @vitest-environment jsdom
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import { CatalogPage } from './pages/CatalogPage.jsx';
import { KEYS } from './share-order.js';

describe('useTrackerState (persistência incremental, debounce e tema claro/escuro)', () => {
    beforeEach(() => {
        localStorage.clear();
        delete document.documentElement.dataset.theme;
    });

    afterEach(() => {
        vi.useRealTimers();
        delete document.documentElement.dataset.theme;
        cleanup();
    });

    it('não grava no localStorage na montagem inicial e grava apenas a chave modificada', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        const { container } = render(createElement(CatalogPage));

        expect(setItemSpy).not.toHaveBeenCalled();

        const firstCard = container.querySelector('.card[data-id]');
        fireEvent.click(firstCard);

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
        const themeSwitch = await waitFor(() => {
            const el = container.querySelector('#lightTheme');
            expect(el).not.toBeNull();
            return el;
        });

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
});

