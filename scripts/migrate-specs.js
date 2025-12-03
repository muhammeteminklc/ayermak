/**
 * Migration Script: Convert old spec format to new multi-language format
 *
 * Old format:
 * specs: { workingWidth: { value: "3.0", unit: "M" } }
 *
 * New format:
 * specs: {
 *   workingWidth: {
 *     icon: "move-horizontal",
 *     values: {
 *       tr: { value: "3.0", unit: "m" },
 *       en: { value: "3.0", unit: "m" },
 *       ru: { value: "3.0", unit: "м" }
 *     }
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

// Load default specs for icon mapping
const defaultSpecsPath = path.join(__dirname, '../data/defaultSpecs.json');
const productsPath = path.join(__dirname, '../data/products.json');

// Icon mapping based on common spec keys
const iconMap = {
    'workingWidth': 'move-horizontal',
    'workingDepth': 'arrow-down',
    'legCount': 'anchor',
    'weight': 'weight',
    'discCount': 'disc',
    'discDiameter': 'circle',
    'capacity': 'box',
    'volume': 'box',
    'axleCount': 'git-commit-horizontal',
    'tireSize': 'circle-dot',
    'tipping': 'arrow-up',
    'tineCount': 'anchor'
};

// Unit translations
const unitTranslations = {
    'M': { tr: 'm', en: 'm', ru: 'м' },
    'm': { tr: 'm', en: 'm', ru: 'м' },
    'CM': { tr: 'cm', en: 'cm', ru: 'см' },
    'cm': { tr: 'cm', en: 'cm', ru: 'см' },
    'MM': { tr: 'mm', en: 'mm', ru: 'мм' },
    'mm': { tr: 'mm', en: 'mm', ru: 'мм' },
    'KG': { tr: 'kg', en: 'kg', ru: 'кг' },
    'kg': { tr: 'kg', en: 'kg', ru: 'кг' },
    'TON': { tr: 'ton', en: 'ton', ru: 'т' },
    'ton': { tr: 'ton', en: 'ton', ru: 'т' },
    'ADET': { tr: 'adet', en: 'pcs', ru: 'шт' },
    'adet': { tr: 'adet', en: 'pcs', ru: 'шт' },
    'HP': { tr: 'HP', en: 'HP', ru: 'л.с.' },
    'HPs': { tr: 'HP', en: 'HP', ru: 'л.с.' },
    'M³': { tr: 'm³', en: 'm³', ru: 'м³' },
    'm³': { tr: 'm³', en: 'm³', ru: 'м³' },
    'YÖN': { tr: 'yön', en: 'dir', ru: 'напр.' },
    '': { tr: '', en: '', ru: '' }
};

function migrateSpecs(specs) {
    const newSpecs = {};

    for (const [key, spec] of Object.entries(specs)) {
        // Skip if already in new format
        if (spec.values) {
            newSpecs[key] = spec;
            continue;
        }

        // Get icon
        const icon = iconMap[key] || 'tag';

        // Get unit translations
        const unit = spec.unit || '';
        const unitTrans = unitTranslations[unit] || { tr: unit, en: unit, ru: unit };

        // Create new format
        newSpecs[key] = {
            icon: icon,
            values: {
                tr: { value: spec.value || '', unit: unitTrans.tr },
                en: { value: spec.value || '', unit: unitTrans.en },
                ru: { value: spec.value || '', unit: unitTrans.ru }
            }
        };
    }

    return newSpecs;
}

function migrate() {
    console.log('Starting migration...');

    // Read products
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

    let migrated = 0;

    for (const product of productsData.products) {
        if (product.specs && Object.keys(product.specs).length > 0) {
            // Check if any spec needs migration
            const needsMigration = Object.values(product.specs).some(spec => !spec.values);

            if (needsMigration) {
                console.log(`Migrating specs for product: ${product.id}`);
                product.specs = migrateSpecs(product.specs);
                migrated++;
            } else {
                console.log(`Product ${product.id} already migrated, skipping.`);
            }
        }
    }

    // Write back
    fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2), 'utf8');

    console.log(`Migration complete! ${migrated} products migrated.`);
}

// Run migration
migrate();
