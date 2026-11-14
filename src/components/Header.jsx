import { memo } from 'react';
import { getMascotImageUrl } from '../assets/spriteImages.js';

const RING_RADIUS = 17;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * @param {{ ratio: number, variant?: string }} props
 */
function CircularProgress({ ratio, variant = '' }) {
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const dashOffset = RING_CIRCUMFERENCE * (1 - clampedRatio);

    return (
        <svg
            className={`progress-ring${variant ? ` ${variant}` : ''}`}
            width="44"
            height="44"
            viewBox="0 0 44 44"
            aria-hidden="true"
        >
            <circle
                className="progress-ring-track"
                cx="22"
                cy="22"
                r={RING_RADIUS}
                fill="none"
                strokeWidth="5.5"
            />
            <circle
                className="progress-ring-fill"
                cx="22"
                cy="22"
                r={RING_RADIUS}
                fill="none"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
            />
        </svg>
    );
}

export const Header = memo(
    /**
     * @param {{ progressStats: { collected: number, mastered: number, total: number } }} props
     */
    function Header({ progressStats }) {
    if (import.meta.env.MODE === 'test' && typeof window !== 'undefined') {
        window.__recordPerfRender?.('header');
    }

    const { total, collected, mastered } = progressStats;
    const collectionRatio = total > 0 ? collected / total : 0;
    const masteryRatio = total > 0 ? mastered / total : 0;

    return (
        <header className="header">
            <div className="brand">
                <img
                    src={getMascotImageUrl()}
                    alt=""
                    className="brand-icon"
                    width="36"
                    height="36"
                />
                <h1>Rastreador de Pituchinhus</h1>
            </div>
            <div className="progress-group">
                <div className="progress-item">
                    <div className="progress-meta">
                        <span className="progress-label">Coleção</span>
                        <span className="progress-value" id="collectionRatio">
                            <strong>{collected}</strong>
                            <span className="progress-total">/{total}</span>
                        </span>
                    </div>
                    <CircularProgress ratio={collectionRatio} />
                </div>
                <div className="progress-item">
                    <div className="progress-meta">
                        <span className="progress-label">Dominados</span>
                        <span className="progress-value" id="masteryRatio">
                            <strong>{mastered}</strong>
                            <span className="progress-total">/{total}</span>
                        </span>
                    </div>
                    <CircularProgress ratio={masteryRatio} variant="mastery" />
                </div>
            </div>
        </header>
    );
});
