import { memo, useState, useCallback } from 'react';
import { getSeasonData } from '../query.js';
import { getSpriteImageUrl } from '../assets/spriteImages.js';

const spriteMetaCache = new WeakMap();

function getSpriteStaticMeta(sprite) {
    let cached = spriteMetaCache.get(sprite);
    if (cached) return cached;

    const rarityLabel = (sprite.rarity || '').toUpperCase();
    const displayName = sprite.name || sprite.id;
    const seasonData = getSeasonData(sprite.season);
    const themeClass = `theme-${(sprite.theme || '').replace(/\s+/g, '-')}`;
    const baseClasses = ['card', `rarity-${sprite.rarity}`, themeClass];
    if (sprite.rarity === 'Especial') baseClasses.push('rarity-special');

    cached = {
        rarityLabel,
        displayName,
        seasonName: seasonData.name,
        baseClassName: baseClasses.join(' '),
        imgSrc: getSpriteImageUrl(sprite.id),
        collectLabel: `${displayName} - ${sprite.unreleased ? 'Não lançado' : 'Não coletado'} (clique para coletar)`,
        removeLabel: `${displayName} - Coletado (clique para remover da coleção)`,
        masteredCardLabel: `${displayName} - Dominado (clique para deixar apenas coletado)`,
        unmasterLabel: `Remover dominação de ${displayName}`,
        masterTitleLabel: `Marcar ${displayName} como dominado`,
    };
    spriteMetaCache.set(sprite, cached);
    return cached;
}

/*
const LONG_PRESS_DURATION_MS = 400;
const TOUCH_MOVE_TOLERANCE_PX = 10;
*/

function CrownIcon() {
    return (
        <svg className="crown-icon" viewBox="0 0 24 20" aria-hidden="true" focusable="false">
            <path d="M2 5l5 3.5L12 2l5 6.5L22 5v12H2V5z" />
        </svg>
    );
}

export const SpriteCard = memo(function SpriteCard({
    sprite,
    obtained,
    mastered,
    viewMode = false,
    priority = false,
    tabIndex = 0,
    isGamepadSelected = false,
    onCardFocus,
    onToggleObtained,
    onToggleMastery,
}) {
    if (import.meta.env.MODE === 'test' && typeof window !== 'undefined') {
        window.__recordPerfRender?.('spriteCard');
    }

    const [imgError, setImgError] = useState(false);

    /*
    // Tooltip & Long-Press (desativado temporariamente)
    const [tooltipVisible, setTooltipVisible] = useState(false);

    const longPressTimerRef = useRef(null);
    const isLongPressRef = useRef(false);
    const suppressClickRef = useRef(false);
    const touchStartCoordsRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        return () => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
            }
        };
    }, []);
    */

    // Sprites "não lançados" podem ser placeholders sem tema/raridade/nome
    const meta = getSpriteStaticMeta(sprite);

    let className = meta.baseClassName;
    if (obtained) className += ' obtained';
    if (mastered) className += ' mastered';
    if (isGamepadSelected) className += ' gamepad-selected';

    /*
    const clearLongPressTimer = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    const handlePointerEnter = e => {
        if (e.pointerType === 'mouse') {
            setTooltipVisible(true);
        }
    };

    const handlePointerLeave = e => {
        if (e.pointerType === 'mouse') {
            setTooltipVisible(false);
        }
    };

    const handleTouchStart = e => {
        const touch = e.touches?.[0];
        if (touch) {
            touchStartCoordsRef.current = { x: touch.clientX, y: touch.clientY };
        }
        isLongPressRef.current = false;
        clearLongPressTimer();
        longPressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            suppressClickRef.current = true;
            setTooltipVisible(true);
        }, LONG_PRESS_DURATION_MS);
    };

    const handleTouchMove = e => {
        if (!longPressTimerRef.current) return;
        const touch = e.touches?.[0];
        if (!touch) return;
        const dx = Math.abs(touch.clientX - touchStartCoordsRef.current.x);
        const dy = Math.abs(touch.clientY - touchStartCoordsRef.current.y);
        if (dx > TOUCH_MOVE_TOLERANCE_PX || dy > TOUCH_MOVE_TOLERANCE_PX) {
            clearLongPressTimer();
        }
    };

    const handleTouchEndOrCancel = e => {
        clearLongPressTimer();
        if (isLongPressRef.current) {
            isLongPressRef.current = false;
            setTooltipVisible(false);
            if (e.cancelable) {
                e.preventDefault();
            }
            setTimeout(() => {
                suppressClickRef.current = false;
            }, 350);
        }
    };

    const handleContextMenu = e => {
        if (isLongPressRef.current || tooltipVisible) {
            e.preventDefault();
        }
    };
    */

    const handleCardClick = useCallback(() => {
        if (!viewMode && onToggleObtained) {
            onToggleObtained(sprite.id);
        }
    }, [viewMode, onToggleObtained, sprite.id]);

    const handleKeyDown = useCallback(
        e => {
            if (viewMode) return;
            if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                if (onToggleMastery) onToggleMastery(sprite.id);
            }
        },
        [viewMode, onToggleMastery, sprite.id]
    );

    const handleCrownClick = useCallback(
        e => {
            e.stopPropagation();
            if (!viewMode && onToggleMastery) {
                onToggleMastery(sprite.id);
            }
        },
        [viewMode, onToggleMastery, sprite.id]
    );

    const handleFocus = useCallback(() => {
        if (onCardFocus) onCardFocus(sprite.id);
    }, [onCardFocus, sprite.id]);

    const handleImgError = useCallback(() => {
        setImgError(true);
    }, []);

    const cardBody = (
        <>
            {/* Faixa Superior de Status (Header Banner) */}
            {sprite.unreleased ? (
                <div
                    className="card-badge unreleased-badge"
                    aria-hidden={!viewMode ? 'true' : undefined}
                >
                    NÃO LANÇADO
                </div>
            ) : mastered ? (
                <div
                    className="card-badge mastered-badge"
                    aria-hidden={!viewMode ? 'true' : undefined}
                >
                    DOMINADO
                </div>
            ) : obtained ? (
                <div
                    className="card-badge collected"
                    aria-hidden={!viewMode ? 'true' : undefined}
                >
                    COLETADO
                </div>
            ) : null}

            <div className="card-display">
                {viewMode && mastered && (
                    <span className="card-crown-display" aria-hidden="true">
                        <CrownIcon />
                    </span>
                )}

                <img
                    src={meta.imgSrc}
                    alt={meta.displayName}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={priority ? 'high' : 'auto'}
                    width="80"
                    height="80"
                    draggable="false"
                    style={imgError ? { opacity: 0.2 } : undefined}
                    onError={handleImgError}
                />
            </div>

            <div className="card-rarity-wrap" aria-hidden={!viewMode ? 'true' : undefined}>
                <div className="card-rarity">{meta.rarityLabel}</div>
            </div>

            <div className="card-name">
                <span className="card-title">{meta.displayName}</span>
                {meta.seasonName !== 'none' && (
                    <span
                        className="card-season"
                        aria-hidden={!viewMode ? 'true' : undefined}
                    >
                        {meta.seasonName}
                    </span>
                )}
            </div>
        </>
    );

    return (
        <div
            className={className}
            data-id={sprite.id}
            data-name={meta.displayName}
            /*
            onBlur={() => setTooltipVisible(false)}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEndOrCancel}
            onTouchCancel={handleTouchEndOrCancel}
            onContextMenu={handleContextMenu}
            */
        >
            {/* M3 Plain Tooltip (Desktop Hover & Mobile Long-Press - desativado temporariamente)
            <div
                className={`m3-card-tooltip${tooltipVisible ? ' visible' : ''}`}
                role="tooltip"
                aria-hidden="true"
            >
                {meta.displayName}
            </div>
            */}

            <div className="card-inner">
                {viewMode ? (
                    cardBody
                ) : (
                    <>
                        <button
                            type="button"
                            className="card-primary"
                            tabIndex={tabIndex}
                            aria-pressed={String(obtained)}
                            aria-label={
                                mastered
                                    ? meta.masteredCardLabel
                                    : obtained
                                      ? meta.removeLabel
                                      : meta.collectLabel
                            }
                            onClick={handleCardClick}
                            onKeyDown={handleKeyDown}
                            onFocus={handleFocus}
                        >
                            {cardBody}
                        </button>

                        {/* Botão irmão para marcar/desmarcar como dominado (coroa) */}
                        {obtained && !mastered && (
                            <button
                                className="card-crown"
                                type="button"
                                tabIndex={tabIndex}
                                title="Alternar dominação"
                                aria-label={meta.masterTitleLabel}
                                onClick={handleCrownClick}
                                onKeyDown={handleKeyDown}
                                onFocus={handleFocus}
                            >
                                <CrownIcon />
                            </button>
                        )}

                        {mastered && (
                            <button
                                className="card-crown-display"
                                type="button"
                                tabIndex={tabIndex}
                                title="Remover dominação"
                                aria-label={meta.unmasterLabel}
                                onClick={handleCrownClick}
                                onKeyDown={handleKeyDown}
                                onFocus={handleFocus}
                            >
                                <CrownIcon />
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
});
