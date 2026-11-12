// @vitest-environment jsdom
import { createElement } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { CatalogPage } from './pages/CatalogPage.jsx';

function setupRenderCounter() {
    const counts = {
        spriteCard: 0,
        header: 0,
        filterBar: 0,
        controllerHud: 0,
    };
    window.__recordPerfRender = key => {
        counts[key] += 1;
    };
    return {
        counts,
        reset() {
            counts.spriteCard = 0;
            counts.header = 0;
            counts.filterBar = 0;
            counts.controllerHud = 0;
        },
    };
}

describe('Fase 4 — Contagem de re-renderizações (React.memo + estabilidade)', () => {
    let tracker;

    beforeEach(() => {
        localStorage.clear();
        tracker = setupRenderCounter();
    });

    afterEach(() => {
        delete window.__recordPerfRender;
        cleanup();
    });

    it('mover o foco entre cards re-renderiza no máximo 2 cards e nenhum componente auxiliar', () => {
        const { container } = render(createElement(CatalogPage));
        const cards = container.querySelectorAll('.card[data-id]');
        expect(cards.length).toBe(314);
        expect(tracker.counts).toEqual({
            spriteCard: 314,
            header: 1,
            filterBar: 1,
            controllerHud: 1,
        });

        tracker.reset();
        fireEvent.focus(cards[1]);

        expect(tracker.counts.spriteCard).toBe(2);
        expect(tracker.counts.header).toBe(0);
        expect(tracker.counts.filterBar).toBe(0);
        expect(tracker.counts.controllerHud).toBe(0);
    });

    it('clicar para coletar, dominar e desmarcar domínio re-renderiza apenas 1 card (sem FilterBar/ControllerHud)', () => {
        const { container } = render(createElement(CatalogPage));
        const cards = container.querySelectorAll('.card[data-id]');
        const targetCard = cards[0]; // já é o card ativo inicial (tabIndex=0)

        // 1. Marcar como coletado
        tracker.reset();
        fireEvent.click(targetCard);
        expect(tracker.counts.spriteCard).toBe(1);
        expect(tracker.counts.header).toBe(1);
        expect(tracker.counts.filterBar).toBe(0);
        expect(tracker.counts.controllerHud).toBe(0);
        expect(targetCard.classList.contains('obtained')).toBe(true);
        expect(targetCard.classList.contains('mastered')).toBe(false);

        // 2. Marcar como dominado pela coroa
        const crownBtn = targetCard.querySelector('.card-crown');
        expect(crownBtn).not.toBeNull();
        tracker.reset();
        fireEvent.click(crownBtn);
        expect(tracker.counts.spriteCard).toBe(1);
        expect(tracker.counts.header).toBe(1);
        expect(tracker.counts.filterBar).toBe(0);
        expect(tracker.counts.controllerHud).toBe(0);
        expect(targetCard.classList.contains('mastered')).toBe(true);

        // 3. Clicar no card dominado volta para apenas coletado
        tracker.reset();
        fireEvent.click(targetCard);
        expect(tracker.counts.spriteCard).toBe(1);
        expect(tracker.counts.header).toBe(1);
        expect(tracker.counts.filterBar).toBe(0);
        expect(tracker.counts.controllerHud).toBe(0);
        expect(targetCard.classList.contains('obtained')).toBe(true);
        expect(targetCard.classList.contains('mastered')).toBe(false);
    });
});
