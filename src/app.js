/* ===================================================
   Rastreador de Pituchinhos - Application Entry Point
   =================================================== */

import { init } from './main.js';

export * from './share-order.js';
export * from './share-codec.js';
export * from './dom-utils.js';
export * from './query.js';
export * from './view-grid.js';
export * from './view-export.js';
export * from './main.js';

// Auto-initialize when the script is loaded
init();