import './echo.js';
import './modules/theme.js';
import './modules/confirm.js';
import { initInteractions } from './modules/interactions.js';
import { initPlayerFilters } from './modules/filters.js';
import { initUploader } from './modules/uploader.js';
import { initChat } from './modules/chat.js';
import { initCsvImport } from './modules/csv-import.js';

document.addEventListener('DOMContentLoaded', () => {
    initInteractions();
    initPlayerFilters();
    initUploader();
    initChat();
    initCsvImport();
});
