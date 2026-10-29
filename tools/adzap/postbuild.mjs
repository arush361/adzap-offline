/**
 * Copyright (c) 2026 Arush Sharma
 *
 * @file
 * This file is part of AdZap Offline (https://github.com/arush361/adzap-offline),
 * a modified version of AdGuard Browser Extension. See NOTICE.
 *
 * AdZap Offline is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * AdZap Offline is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 */

/**
 * AdZap Offline post-build step.
 *
 * Rebrands user-visible text that comes from bundled upstream packages
 * (assistant, blocking pages, click-to-load placeholder, page titles, filter
 * display names). Filter list contents and their headers are left untouched.
 *
 * Usage: node tools/adzap/postbuild.mjs <build dir>
 */
/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';

const buildDir = process.argv[2];
if (!buildDir || !fs.existsSync(path.join(buildDir, 'manifest.json'))) {
    console.error('Usage: node tools/adzap/postbuild.mjs <build dir containing manifest.json>');
    process.exit(1);
}

const BRAND = /AdGuard/g;
// "AdGuard Base filter" -> "Base filter"; "AdGuard’s filters" -> "filters".
const BRAND_WORD = /AdGuard(?:’s|'s)?\s+/g;
// Natural-language string literals: contain whitespace or non-ASCII letters.
const STRING_LITERAL = /(['"`])((?:(?!\1)[^\\\n]|\\.)*?AdGuard(?:(?!\1)[^\\\n]|\\.)*?)\1/g;
const NON_ASCII = /[\u0080-\uFFFF]/;
const isProse = (text) => (/\s/.test(text) || NON_ASCII.test(text)) && !/https?:|@adguard|adguard\//.test(text);

let changedFiles = 0;
const rewrite = (relPath, transform) => {
    const file = path.join(buildDir, relPath);
    if (!fs.existsSync(file)) {
        console.warn(`skip (missing): ${relPath}`);
        return;
    }
    const before = fs.readFileSync(file, 'utf8');
    const after = transform(before);
    if (after !== before) {
        fs.writeFileSync(file, after);
        changedFiles += 1;
    }
};

const walk = (dir, ext) => fs.readdirSync(path.join(buildDir, dir), { withFileTypes: true })
    .flatMap((e) => {
        const rel = path.join(dir, e.name);
        if (e.isDirectory()) {
            return walk(rel, ext);
        }
        return rel.endsWith(ext) ? [rel] : [];
    });

// 1. HTML pages: titles, logo text, click-to-load placeholder strings.
[...walk('pages', '.html'), ...walk('web-accessible-resources', '.html')]
    .forEach((rel) => rewrite(rel, (s) => s.replace(BRAND, 'AdZap')));

// 2. UI scripts from upstream packages: only prose string literals.
//    Product names of other AdGuard apps (e.g. "AdGuard VPN") are dropped from
//    the UI elsewhere, so they are left as-is rather than renamed.
const proseOnly = (s) => s.replace(STRING_LITERAL, (match, quote, text) => (
    isProse(text) && !/VPN/.test(text) ? `${quote}${text.replace(BRAND, 'AdZap')}${quote}` : match
));
['pages/assistant-inject.js', ...walk('pages/blocking', '.js'), 'pages/devtools.js']
    .forEach((rel) => rewrite(rel, proseOnly));

// 3. Filter display names/descriptions shown in Settings.
rewrite('filters/filters_i18n.json', (s) => {
    const data = JSON.parse(s);
    for (const section of ['filters', 'groups', 'tags']) {
        for (const byLocale of Object.values(data[section] ?? {})) {
            for (const entry of Object.values(byLocale)) {
                for (const key of ['name', 'description']) {
                    if (typeof entry[key] === 'string') {
                        entry[key] = entry[key]
                            .replace(BRAND_WORD, '')
                            .replace(BRAND, '')
                            .replace(/\s{2,}/g, ' ')
                            .trim();
                    }
                }
            }
        }
    }
    return JSON.stringify(data);
});

console.log(`adzap postbuild: rebranded ${changedFiles} files in ${buildDir}`);
