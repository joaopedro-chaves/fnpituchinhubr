import { useState } from 'react';
import { getSeasonData } from '../query.js';
import { getSpriteImageUrl } from '../assets/spriteImages.js';

function CrownIcon() {
    return (
        <svg className="crown-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M2 19h20v2H2v-2zM2 5l5 3.5L12 2l5 6.5L22 5v12H2V5z" />
        </svg>
    );
}

export function SpriteCard({
    sprite,
    obtained,
    mastered,
    viewMode = false,
    priority = false,
    onToggleObtained,
    onToggleMastery,
}) {
    const [imgError, setImgError] = useState(false);

    // Sprites "não lançados" podem ser placeholders sem tema/raridade/nome
    const rarityLabel = (sprite.rarity || '').toUpperCase();
    const displayName = sprite.name || sprite.id;
    const seasonData = getSeasonData(sprite.season);
    const themeClass = `theme-${(sprite.theme || '').replace(/\s+/g, '-')}`;

    const classes = ['card', `rarity-${sprite.rarity}`, themeClass];
    if (obtained) classes.push('obtained');
    if (mastered) classes.push('mastered');

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
            tabIndex={!viewMode ? 0 : undefined}
            role={!viewMode ? 'button' : undefined}
            aria-pressed={!viewMode ? String(obtained) : undefined}
            aria-label={
                !viewMode
                    ? `${obtained ? 'Remove' : 'Mark'} ${displayName} ${obtained ? 'from' : 'as part of'} your collection`
                    : undefined
            }
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
        >
            {/* Emblema de status do card */}
            {sprite.unreleased ? (
                <div className="card-badge unreleased-badge">Não lançado</div>
            ) : mastered ? (
                <div className="card-badge mastered-badge">Dominado</div>
            ) : obtained ? (
                <div className="card-badge collected">Coletado</div>
            ) : null}

            {/* Botão de ação para marcar como dominado (coroa) */}
            {obtained && !mastered && !viewMode && (
                <button
                    className="card-crown"
                    type="button"
                    title="Toggle mastery"
                    aria-label={`Mark ${displayName} as mastered`}
                    onClick={handleCrownClick}
                >
                    <CrownIcon />
                </button>
            )}

            <div className="card-display">
                {mastered && (
                    <div className="card-crown-display">
                        <CrownIcon />
                    </div>
                )}

                <img
                    src={getSpriteImageUrl(sprite.id)}
                    alt={displayName}
                    loading={priority ? 'eager' : 'lazy'}
                    fetchPriority={priority ? 'high' : 'auto'}
                    width="80"
                    height="80"
                    style={imgError ? { opacity: 0.2 } : undefined}
                    onError={() => setImgError(true)}
                />

                <div className="card-tags">
                    <div className="card-rarity">{rarityLabel}</div>
                    <div className="card-season">{seasonData.name}</div>
                </div>
            </div>

            <div className="card-name">
                <span>{displayName}</span>
            </div>
        </div>
    );
}
