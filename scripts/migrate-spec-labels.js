/**
 * Migration Script: Add specLabels to translations.json
 *
 * Copies existing spec labels from translations.json specs object
 * to specLabels for admin panel compatibility
 */

const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, '../data/translations.json');

function migrate() {
    console.log('Starting specLabels migration...');

    // Read translations
    const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

    let addedCount = 0;

    // Process each language
    ['tr', 'en', 'ru'].forEach(lang => {
        if (!translations[lang]) return;

        // Ensure specLabels exists
        if (!translations[lang].specLabels) {
            translations[lang].specLabels = {};
        }

        // Copy from specs to specLabels (if not already exists)
        if (translations[lang].specs) {
            Object.entries(translations[lang].specs).forEach(([key, value]) => {
                if (!translations[lang].specLabels[key]) {
                    translations[lang].specLabels[key] = value;
                    addedCount++;
                    console.log(`  [${lang}] Added specLabel: ${key} = ${value}`);
                }
            });
        }
    });

    // Write back
    fs.writeFileSync(translationsPath, JSON.stringify(translations, null, 2), 'utf8');

    console.log(`Migration complete! ${addedCount} specLabels added.`);
}

// Run migration
migrate();
