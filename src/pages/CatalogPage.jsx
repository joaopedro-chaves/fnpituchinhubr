import { useMemo, useCallback, useRef, useEffect } from 'react';
import { baseSprites } from '../data/sprites-data.js';
import { useTrackerState } from '../hooks/useTrackerState.js';
import { useGamepadAndSpatialNav } from '../hooks/useGamepadAndSpatialNav.js';
import { Header } from '../components/Header.jsx';
import { FilterBar } from '../components/FilterBar.jsx';
import { SpriteCard } from '../components/SpriteCard.jsx';
import { ControllerHud } from '../components/ControllerHud.jsx';
import { compressCollection } from '../share-codec.js';
import { toast, copyText } from '../dom-utils.js';

let viewExportModule = null;
let viewExportPromise = null;

function loadViewExport() {
    if (viewExportModule) return Promise.resolve(viewExportModule);
    if (!viewExportPromise) {
        viewExportPromise = import('../view-export.js')
            .then(mod => {
                viewExportModule = mod;
                return mod;
            })
            .catch(err => {
                viewExportPromise = null;
                throw err;
            });
    }
    return viewExportPromise;
}

// Quantidade de cards "acima da dobra" que carregam a imagem com prioridade alta
const PRIORITY_CARDS = 24;

export function CatalogPage() {

    const {
        obtained,
        mastered,
        viewMode,
        loadingShared,
        filters,
        settings,
        trackerState,
        activeThemes,
        visibleSprites,
        progressStats,
        toggleObtained,
        toggleMastery,
        updateFilter,
        updateSetting,
        importCollection,
        exitViewMode,
    } = useTrackerState(baseSprites);

    // Conjuntos O(1) para verificar rapidamente se cada card foi coletado/dominado
    const obtainedSet = useMemo(() => new Set(obtained), [obtained]);
    const masteredSet = useMemo(() => new Set(mastered), [mastered]);

    const gridRef = useRef(null);
    const {
        activeCardId,
        gamepadInfo,
        inputMode,
        handleGridKeyDown,
        handleCardFocus,
        handleCardKeyNavigate,
    } = useGamepadAndSpatialNav({
        gridRef,
        visibleSprites,
        viewMode,
        onToggleObtained: toggleObtained,
        onToggleMastery: toggleMastery,
    });

    const trackerStateRef = useRef(trackerState);
    useEffect(() => {
        trackerStateRef.current = trackerState;
    }, [trackerState]);

    const handlePrepareExport = useCallback(() => {
        void loadViewExport().catch(() => {});
    }, []);

    const handleExportImage = useCallback(mode => {
        const currentState = trackerStateRef.current;
        if (viewExportModule) {
            viewExportModule.exportImage(mode, currentState, baseSprites);
            return;
        }
        loadViewExport()
            .then(mod => mod.exportImage(mode, currentState, baseSprites))
            .catch(() => toast('Erro ao carregar módulo de exportação!', 'error'));
    }, []);

    const handleCopyTradeText = useCallback(() => {
        const currentState = trackerStateRef.current;
        if (viewExportModule) {
            copyText(
                viewExportModule.generateTradeText(currentState, baseSprites),
                'Lista de trocas copiada para a área de transferência!',
                'Falha ao copiar lista de trocas'
            );
            return;
        }
        loadViewExport()
            .then(mod => {
                copyText(
                    mod.generateTradeText(currentState, baseSprites),
                    'Lista de trocas copiada para a área de transferência!',
                    'Falha ao copiar lista de trocas'
                );
            })
            .catch(() => toast('Falha ao copiar lista de trocas', 'error'));
    }, []);

    const handleCopyTradeGrid = useCallback(() => {
        const currentState = trackerStateRef.current;
        if (viewExportModule) {
            copyText(
                viewExportModule.generateTradeGridText(currentState, baseSprites),
                'Grelha de trocas copiada para a área de transferência!',
                'Falha ao copiar grelha de trocas'
            );
            return;
        }
        loadViewExport()
            .then(mod => {
                copyText(
                    mod.generateTradeGridText(currentState, baseSprites),
                    'Grelha de trocas copiada para a área de transferência!',
                    'Falha ao copiar grelha de trocas'
                );
            })
            .catch(() => toast('Falha ao copiar grelha de trocas', 'error'));
    }, []);

    const handleExportBackup = useCallback(() => {
        const current = trackerStateRef.current;
        const data = { obtained: current.obtained, mastered: current.mastered };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'fnsprites-backup.json';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast('Backup exportado com sucesso!', 'success');
    }, []);

    const handleImportBackupFile = useCallback(
        file => {
            if (viewMode) {
                toast('Não é possível importar no modo somente leitura!', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (!data || !Array.isArray(data.obtained) || !Array.isArray(data.mastered)) {
                        throw new Error('Invalid backup file format');
                    }
                    importCollection(data.obtained, data.mastered);
                    toast('Coleção importada com sucesso!', 'success');
                } catch (err) {
                    toast('Falha ao importar: formato JSON inválido', 'error');
                    console.error(err);
                }
            };
            reader.readAsText(file);
        },
        [viewMode, importCollection]
    );

    const handleShare = useCallback(async () => {
        const current = trackerStateRef.current;
        const code = await compressCollection(current.obtained, current.mastered);
        const url = `${window.location.origin}${window.location.pathname}?c=${code}`;
        copyText(url, 'Link compartilhado!', 'Falha ao compartilhar');
    }, []);

    const handleMainKeyDown = useCallback(
        e => {
            if (e.key === 'Enter' || e.key === 'd' || e.key === 'D') {
                handleCardKeyNavigate();
            }
            handleGridKeyDown(e);
        },
        [handleCardKeyNavigate, handleGridKeyDown]
    );

    return (
        <>
            {viewMode && (
                <div className="banner" id="viewBanner">
                    <span>
                        Visualizando uma coleção compartilhada - exibindo apenas pituchinhos
                        coletados.
                    </span>
                    <a
                        href="./"
                        onClick={e => {
                            e.preventDefault();
                            exitViewMode();
                        }}
                    >
                        Ir para meu rastreador
                    </a>
                </div>
            )}

            <div className="app">
                <Header progressStats={progressStats} />

                <FilterBar
                    filters={filters}
                    settings={settings}
                    activeThemes={activeThemes}
                    viewMode={viewMode}
                    onFilterChange={updateFilter}
                    onSettingChange={updateSetting}
                    onPrepareExport={handlePrepareExport}
                    onExportImage={handleExportImage}
                    onCopyTradeText={handleCopyTradeText}
                    onCopyTradeGrid={handleCopyTradeGrid}
                    onExportBackup={handleExportBackup}
                    onImportBackupFile={handleImportBackupFile}
                    onShare={handleShare}
                />

                <main
                    ref={gridRef}
                    className="grid"
                    id="spriteGrid"
                    role="grid"
                    aria-label="Coleção de pituchinhos"
                    aria-busy={loadingShared}
                    onKeyDown={handleMainKeyDown}
                >
                    {visibleSprites.map((sprite, index) => {
                        const isActiveCard = activeCardId
                            ? activeCardId === sprite.id
                            : index === 0;
                        return (
                            <SpriteCard
                                key={sprite.id}
                                sprite={sprite}
                                obtained={obtainedSet.has(sprite.id)}
                                mastered={masteredSet.has(sprite.id)}
                                viewMode={viewMode}
                                priority={index < PRIORITY_CARDS}
                                tabIndex={isActiveCard ? 0 : -1}
                                isGamepadSelected={
                                    Boolean(gamepadInfo.connected) && isActiveCard
                                }
                                onCardFocus={handleCardFocus}
                                onToggleObtained={toggleObtained}
                                onToggleMastery={toggleMastery}
                            />
                        );
                    })}
                </main>
            </div>

            <ControllerHud
                gamepadInfo={gamepadInfo}
                inputMode={inputMode}
                viewMode={viewMode}
            />

            <footer className="footer">
                <p>
                    Fortnite and its materials (Sprites and Data) are trademarks and copyrights of
                    Epic Games, Inc. This website is not endorsed or affilliated with Epic Games,
                    Inc..
                </p>
            </footer>
        </>
    );
}
