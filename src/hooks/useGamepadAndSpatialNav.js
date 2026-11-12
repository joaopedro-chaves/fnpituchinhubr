import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from '../dom-utils.js';

const STICK_DEADZONE = 0.55;
const INITIAL_REPEAT_DELAY_MS = 260;
const REPEAT_INTERVAL_MS = 125;
const EDGE_TOLERANCE_PX = 6;
const FALLBACK_WEIGHT = 2.5;

export function detectControllerType(idString = '') {
    const id = idString.toLowerCase();
    if (
        id.includes('nintendo') ||
        id.includes('switch') ||
        id.includes('joy-con') ||
        id.includes('pro controller') ||
        id.includes('057e')
    ) {
        return 'switch';
    }
    if (
        id.includes('playstation') ||
        id.includes('dualshock') ||
        id.includes('dualsense') ||
        id.includes('ps5') ||
        id.includes('ps4') ||
        id.includes('ps3') ||
        id.includes('sony') ||
        id.includes('054c')
    ) {
        return 'playstation';
    }
    return 'xbox';
}

export function getControllerLabel(type) {
    if (type === 'switch') return 'Switch';
    if (type === 'playstation') return 'PlayStation';
    return 'Xbox';
}

/**
 * Seleciona o próximo card candidato em uma direção ('up' | 'down' | 'left' | 'right')
 * usando a geometria real na tela (getBoundingClientRect + checkVisibility).
 */
export function findSpatialCandidate(container, currentElement, direction) {
    if (!container || !currentElement) return null;

    const allCards = Array.from(container.querySelectorAll('.card[data-id]'));
    const candidates = allCards.filter(el => {
        if (el === currentElement) return false;
        if (typeof el.checkVisibility === 'function') {
            return el.checkVisibility();
        }
        return el.offsetParent !== null;
    });

    if (!candidates.length) return null;

    const currentRect = currentElement.getBoundingClientRect();
    const currentCenterX = (currentRect.left + currentRect.right) / 2;
    const currentCenterY = (currentRect.top + currentRect.bottom) / 2;

    const directionalCandidates = [];

    for (const candidate of candidates) {
        const rect = candidate.getBoundingClientRect();
        let inDirection = false;
        let gap = 0;
        let overlapsPerpendicular = false;
        let perpendicularOffset = 0;

        if (direction === 'right') {
            inDirection = rect.left >= currentRect.right - EDGE_TOLERANCE_PX;
            gap = Math.max(0, rect.left - currentRect.right);
            overlapsPerpendicular =
                Math.min(rect.bottom, currentRect.bottom) > Math.max(rect.top, currentRect.top);
            perpendicularOffset = Math.abs((rect.top + rect.bottom) / 2 - currentCenterY);
        } else if (direction === 'left') {
            inDirection = rect.right <= currentRect.left + EDGE_TOLERANCE_PX;
            gap = Math.max(0, currentRect.left - rect.right);
            overlapsPerpendicular =
                Math.min(rect.bottom, currentRect.bottom) > Math.max(rect.top, currentRect.top);
            perpendicularOffset = Math.abs((rect.top + rect.bottom) / 2 - currentCenterY);
        } else if (direction === 'down') {
            inDirection = rect.top >= currentRect.bottom - EDGE_TOLERANCE_PX;
            gap = Math.max(0, rect.top - currentRect.bottom);
            overlapsPerpendicular =
                Math.min(rect.right, currentRect.right) > Math.max(rect.left, currentRect.left);
            perpendicularOffset = Math.abs((rect.left + rect.right) / 2 - currentCenterX);
        } else if (direction === 'up') {
            inDirection = rect.bottom <= currentRect.top + EDGE_TOLERANCE_PX;
            gap = Math.max(0, currentRect.top - rect.bottom);
            overlapsPerpendicular =
                Math.min(rect.right, currentRect.right) > Math.max(rect.left, currentRect.left);
            perpendicularOffset = Math.abs((rect.left + rect.right) / 2 - currentCenterX);
        }

        if (inDirection) {
            directionalCandidates.push({
                element: candidate,
                gap,
                overlapsPerpendicular,
                perpendicularOffset,
            });
        }
    }

    if (!directionalCandidates.length) return null;

    // 1. Prioriza candidatos que se sobrepõem no eixo perpendicular
    const aligned = directionalCandidates.filter(c => c.overlapsPerpendicular);
    if (aligned.length > 0) {
        aligned.sort((a, b) => {
            if (Math.abs(a.gap - b.gap) > 1) return a.gap - b.gap;
            return a.perpendicularOffset - b.perpendicularOffset;
        });
        return aligned[0].element;
    }

    // 2. Fallback ponderado quando não há sobreposição perpendicular exata
    directionalCandidates.sort((a, b) => {
        const scoreA = a.gap + FALLBACK_WEIGHT * a.perpendicularOffset;
        const scoreB = b.gap + FALLBACK_WEIGHT * b.perpendicularOffset;
        return scoreA - scoreB;
    });

    return directionalCandidates[0].element;
}

export function useGamepadAndSpatialNav({
    gridRef,
    visibleSprites,
    viewMode,
    onToggleObtained,
    onToggleMastery,
}) {
    const [activeCardId, setActiveCardId] = useState(() => visibleSprites[0]?.id || null);
    const [gamepadInfo, setGamepadInfo] = useState({
        connected: false,
        type: 'xbox',
    });
    const [inputMode, setInputMode] = useState(null); // 'gamepad' | 'keyboard' | null

    const activeCardIdRef = useRef(activeCardId);
    const visibleSpritesRef = useRef(visibleSprites);
    const viewModeRef = useRef(viewMode);
    const onToggleObtainedRef = useRef(onToggleObtained);
    const onToggleMasteryRef = useRef(onToggleMastery);

    useEffect(() => {
        activeCardIdRef.current = activeCardId;
    }, [activeCardId]);

    useEffect(() => {
        visibleSpritesRef.current = visibleSprites;
        if (
            visibleSprites.length > 0 &&
            (!activeCardIdRef.current ||
                !visibleSprites.some(s => s.id === activeCardIdRef.current))
        ) {
            setActiveCardId(visibleSprites[0].id);
        }
    }, [visibleSprites]);

    useEffect(() => {
        viewModeRef.current = viewMode;
    }, [viewMode]);

    useEffect(() => {
        onToggleObtainedRef.current = onToggleObtained;
        onToggleMasteryRef.current = onToggleMastery;
    }, [onToggleObtained, onToggleMastery]);

    const focusCardElement = useCallback(cardEl => {
        if (!cardEl) return false;
        const nextId = cardEl.getAttribute('data-id');
        if (nextId) {
            activeCardIdRef.current = nextId;
            setActiveCardId(nextId);
        }
        cardEl.focus({ preventScroll: true });
        if (typeof cardEl.scrollIntoView === 'function') {
            cardEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
        return true;
    }, []);

    const moveFocusInDirection = useCallback(
        direction => {
            const container = gridRef.current;
            if (!container) return false;

            const currentId = activeCardIdRef.current;
            let currentEl = currentId
                ? container.querySelector(`.card[data-id="${CSS.escape(currentId)}"]`)
                : null;

            if (!currentEl) {
                const firstCard = container.querySelector('.card[data-id]');
                if (firstCard) {
                    return focusCardElement(firstCard);
                }
                return false;
            }

            // Se o card atual ainda não está focado no DOM, foca nele primeiro ou move a partir dele
            const nextEl = findSpatialCandidate(container, currentEl, direction);
            if (!nextEl) return false;

            return focusCardElement(nextEl);
        },
        [gridRef, focusCardElement]
    );

    // Eventos de teclado no container da grade (Spatial Navigation + Atalhos)
    const handleGridKeyDown = useCallback(
        e => {
            if (e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return;

            const rawTarget = e.composedPath?.()?.[0] || e.target;
            if (
                rawTarget &&
                typeof rawTarget.matches === 'function' &&
                rawTarget.matches(':read-write, select, input, textarea, [role="slider"]')
            ) {
                return;
            }

            const keyToDir = {
                ArrowUp: 'up',
                ArrowDown: 'down',
                ArrowLeft: 'left',
                ArrowRight: 'right',
            };

            const direction = keyToDir[e.key];
            if (!direction) return;

            const container = gridRef.current;
            if (!container) return;

            const activeEl = document.activeElement;
            if (!activeEl || !activeEl.classList?.contains('card')) return;

            const nextCandidate = findSpatialCandidate(container, activeEl, direction);
            if (nextCandidate) {
                e.preventDefault();
                setInputMode(prev => (prev === 'gamepad' ? 'gamepad' : 'keyboard'));
                focusCardElement(nextCandidate);
            }
            // Quando não há candidato na direção pressionada, não chama preventDefault()
            // preservando a rolagem nativa da página (WCAG 1.4.10).
        },
        [gridRef, focusCardElement]
    );

    // Conexão / Desconexão de controles via Gamepad API + Polling
    useEffect(() => {
        if (typeof window === 'undefined' || !('getGamepads' in navigator)) return;

        let rafId = null;
        const prevButtonsRef = { collect: false, master: false };
        const navStateRef = {
            lastDirection: null,
            nextRepeatTime: 0,
        };

        const syncConnectedGamepads = () => {
            const pads = Array.from(navigator.getGamepads?.() || []).filter(Boolean);
            if (pads.length > 0) {
                const pad = pads[0];
                const type = detectControllerType(pad.id);
                setGamepadInfo({ connected: true, type });
                setInputMode('gamepad');
                return true;
            }
            setGamepadInfo(prev => (prev.connected ? { ...prev, connected: false } : prev));
            return false;
        };

        const handleGamepadConnected = e => {
            const type = detectControllerType(e.gamepad?.id || '');
            const label = getControllerLabel(type);
            setGamepadInfo({ connected: true, type });
            setInputMode('gamepad');
            toast(`Controle ${label} reconhecido`, 'gamepad');
        };

        const handleGamepadDisconnected = e => {
            const type = detectControllerType(e.gamepad?.id || '');
            const label = getControllerLabel(type);
            toast(`Controle ${label} desconectado`, 'info');
            const stillHasPad = syncConnectedGamepads();
            if (!stillHasPad) {
                setInputMode(null);
            }
        };

        window.addEventListener('gamepadconnected', handleGamepadConnected);
        window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

        syncConnectedGamepads();

        const pollGamepad = timestamp => {
            const pads = Array.from(navigator.getGamepads?.() || []).filter(Boolean);
            if (pads.length > 0) {
                const pad = pads[0];
                const detectedType = detectControllerType(pad.id);

                // Direções via D-Pad (buttons 12..15) ou Analógico Esquerdo (axes 0..1)
                const upPressed =
                    Boolean(pad.buttons?.[12]?.pressed) || (pad.axes?.[1] ?? 0) < -STICK_DEADZONE;
                const downPressed =
                    Boolean(pad.buttons?.[13]?.pressed) || (pad.axes?.[1] ?? 0) > STICK_DEADZONE;
                const leftPressed =
                    Boolean(pad.buttons?.[14]?.pressed) || (pad.axes?.[0] ?? 0) < -STICK_DEADZONE;
                const rightPressed =
                    Boolean(pad.buttons?.[15]?.pressed) || (pad.axes?.[0] ?? 0) > STICK_DEADZONE;

                let activeDir = null;
                if (upPressed) activeDir = 'up';
                else if (downPressed) activeDir = 'down';
                else if (leftPressed) activeDir = 'left';
                else if (rightPressed) activeDir = 'right';

                if (activeDir) {
                    setInputMode('gamepad');
                    setGamepadInfo(prev =>
                        prev.connected && prev.type === detectedType
                            ? prev
                            : { connected: true, type: detectedType }
                    );

                    if (navStateRef.lastDirection !== activeDir) {
                        navStateRef.lastDirection = activeDir;
                        navStateRef.nextRepeatTime = timestamp + INITIAL_REPEAT_DELAY_MS;
                        moveFocusInDirection(activeDir);
                    } else if (timestamp >= navStateRef.nextRepeatTime) {
                        navStateRef.nextRepeatTime = timestamp + REPEAT_INTERVAL_MS;
                        moveFocusInDirection(activeDir);
                    }
                } else {
                    navStateRef.lastDirection = null;
                }

                // Ações:
                // Coletar: Switch A | PlayStation Círculo (○) | Xbox B -> buttons[1] no mapeamento padrão
                // Dominar: Switch X | PlayStation Triângulo (△) | Xbox Y -> buttons[3] no mapeamento padrão
                const collectPressed = Boolean(pad.buttons?.[1]?.pressed);
                const masterPressed = Boolean(pad.buttons?.[3]?.pressed);

                if (collectPressed && !prevButtonsRef.collect) {
                    setInputMode('gamepad');
                    if (!viewModeRef.current && activeCardIdRef.current && onToggleObtainedRef.current) {
                        onToggleObtainedRef.current(activeCardIdRef.current);
                    }
                }

                if (masterPressed && !prevButtonsRef.master) {
                    setInputMode('gamepad');
                    if (!viewModeRef.current && activeCardIdRef.current && onToggleMasteryRef.current) {
                        onToggleMasteryRef.current(activeCardIdRef.current);
                    }
                }

                prevButtonsRef.collect = collectPressed;
                prevButtonsRef.master = masterPressed;
            }

            rafId = requestAnimationFrame(pollGamepad);
        };

        rafId = requestAnimationFrame(pollGamepad);

        return () => {
            window.removeEventListener('gamepadconnected', handleGamepadConnected);
            window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [moveFocusInDirection]);

    const handleCardFocus = useCallback(id => {
        activeCardIdRef.current = id;
        setActiveCardId(id);
    }, []);

    const handleCardKeyNavigate = useCallback(() => {
        setInputMode(prev => (prev === 'gamepad' ? 'gamepad' : 'keyboard'));
    }, []);

    return {
        activeCardId,
        gamepadInfo,
        inputMode,
        handleGridKeyDown,
        handleCardFocus,
        handleCardKeyNavigate,
    };
}

