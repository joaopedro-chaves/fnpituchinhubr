import { useState } from 'react';
import { getSeasonData } from '../query.js';
import { getSpriteImageUrl } from '../assets/spriteImages.js';

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

export function SpriteCard({
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
    const rarityLabel = (sprite.rarity || '').toUpperCase();
    const displayName = sprite.name || sprite.id;
    const seasonData = getSeasonData(sprite.season);
    const themeClass = `theme-${(sprite.theme || '').replace(/\s+/g, '-')}`;

    const classes = ['card', `rarity-${sprite.rarity}`, themeClass];
    if (sprite.rarity === 'Especial') classes.push('rarity-special');
    if (obtained) classes.push('obtained');
    if (mastered) classes.push('mastered');
    if (isGamepadSelected) classes.push('gamepad-selected');

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

    const handleCardClick = () => {
        if (!viewMode && onToggleObtained) {
            onToggleObtained(sprite.id);
        }
    };

    const handleKeyDown = e => {
        if (viewMode) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onToggleObtained) onToggleObtained(sprite.id);
        } else if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            if (onToggleMastery) onToggleMastery(sprite.id);
        }
    };

    const handleCrownClick = e => {
        e.stopPropagation();
        if (!viewMode && onToggleMastery) {
            onToggleMastery(sprite.id);
        }
    };

    return (
        <div
            className={classes.join(' ')}
            data-id={sprite.id}
            data-name={displayName}
            tabIndex={!viewMode ? tabIndex : undefined}
            role={!viewMode ? 'button' : undefined}
            aria-pressed={!viewMode ? String(obtained) : undefined}
            aria-label={
                !viewMode
                    ? mastered
                        ? `Remover dominação de ${displayName}`
                        : `${obtained ? 'Remove' : 'Mark'} ${displayName} ${obtained ? 'from' : 'as part of'} your collection`
                    : undefined
            }
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            onFocus={() => {
                if (onCardFocus) onCardFocus(sprite.id);
            }}
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
                {displayName}
            </div>
            */}

            <div className="card-inner">
                {/* Faixa Superior de Status (Header Banner) */}
                {sprite.unreleased ? (
                    <div className="card-badge unreleased-badge">NÃO LANÇADO</div>
                ) : mastered ? (
                    <div className="card-badge mastered-badge">DOMINADO</div>
                ) : obtained ? (
                    <div className="card-badge collected">COLETADO</div>
                ) : null}

                {/* Botão de ação para marcar/desmarcar como dominado (coroa) */}
                {obtained && !mastered && !viewMode && (
                    <button
                        className="card-crown"
                        type="button"
                        title="Alternar dominação"
                        aria-label={`Marcar ${displayName} como dominado`}
                        onClick={handleCrownClick}
                    >
                        <CrownIcon />
                    </button>
                )}

                <div className="card-display">
                    {mastered && (
                        <button
                            className="card-crown-display"
                            type="button"
                            title={!viewMode ? 'Remover dominação' : undefined}
                            aria-label={!viewMode ? `Remover dominação de ${displayName}` : undefined}
                            disabled={viewMode}
                            onClick={handleCrownClick}
                        >
                            <CrownIcon />
                        </button>
                    )}

                    <img
                        src={getSpriteImageUrl(sprite.id)}
                        alt={displayName}
                        loading={priority ? 'eager' : 'lazy'}
                        fetchPriority={priority ? 'high' : 'auto'}
                        width="80"
                        height="80"
                        draggable="false"
                        style={imgError ? { opacity: 0.2 } : undefined}
                        onError={() => setImgError(true)}
                    />
                </div>

                <div className="card-rarity-wrap">
                    <div className="card-rarity">{rarityLabel}</div>
                </div>

                <div className="card-name">
                    <span className="card-title">{displayName}</span>
                    {seasonData.name !== 'none' && (
                        <span className="card-season">{seasonData.name}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
