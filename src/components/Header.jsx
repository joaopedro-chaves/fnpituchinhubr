import { getMascotImageUrl } from '../assets/spriteImages.js';

export function Header({ progressStats }) {
    const { total, collected, mastered } = progressStats;
    const collectionPct = total > 0 ? `${(collected / total) * 100}%` : '0%';
    const masteryPct = total > 0 ? `${(mastered / total) * 100}%` : '0%';

    return (
        <header className="header">
            <div className="brand">
                <img
                    src={getMascotImageUrl()}
                    alt=""
                    className="brand-icon"
                    width="36"
                    height="36"
                    fetchPriority="high"
                />
                <h1>Rastreador de Pituchinhos</h1>
            </div>
            <div className="progress-group">
                <div className="progress-item">
                    <div className="progress-meta">
                        <span className="progress-label">Coleção</span>
                        <span className="progress-value" id="collectionRatio">
                            {collected} / {total}
                        </span>
                    </div>
                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            id="collectionFill"
                            style={{ width: collectionPct }}
                        />
                    </div>
                </div>
                <div className="progress-item">
                    <div className="progress-meta">
                        <span className="progress-label">Dominados</span>
                        <span className="progress-value" id="masteryRatio">
                            {mastered} / {total}
                        </span>
                    </div>
                    <div className="progress-track">
                        <div
                            className="progress-fill mastery"
                            id="masteryFill"
                            style={{ width: masteryPct }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
