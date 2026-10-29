/**
 * @file
 * AdZap Offline post-build step (part of AdZap Offline, a modified version of
 * AdGuard Browser Extension; see NOTICE). Licensed under GPL-3.0-or-later.
 *
 * Rebrands user-visible text that comes from bundled upstream packages
 * (assistant, blocking pages, click-to-load placeholder, page titles, filter
 * display names). Filter list contents and their headers are left untouched.
 *
 * Usage: node tools/adzap/postbuild.mjs <build dir>
 */
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
const isProse = (text) => /\s|[^\x00-\x7F]/.test(text) && !/https?:|@adguard|adguard\//.test(text);

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
        if (e.isDirectory()) return walk(rel, ext);
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
                        entry[key] = entry[key].replace(BRAND_WORD, '').replace(BRAND, '').replace(/\s{2,}/g, ' ').trim();
                    }
                }
            }
        }
    }
    return JSON.stringify(data);
});

console.log(`adzap postbuild: rebranded ${changedFiles} files in ${buildDir}`);
