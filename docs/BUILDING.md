# Building AdZap Offline from source

For developers who want to verify or change the build.

## Requirements

- A recent Node.js (tested with v26)
- pnpm 10.33.4 (`npm install -g pnpm@10.33.4`)

## Build

```bash
pnpm install --frozen-lockfile
pnpm build:adzap
```

The unpacked extension ends up in `build/release/chrome-mv3/`. Load it via
`chrome://extensions` → Developer mode → Load unpacked.

`build:adzap` runs the Chrome MV3 release bundle and then
`tools/adzap/postbuild.mjs`, which rebrands user-visible text that comes from
bundled packages.

## What's different from upstream

See [NOTICE](../NOTICE) for the list. To see every change, compare against the
first commit, which is the unmodified upstream source:

```bash
git diff $(git rev-list --max-parents=0 HEAD) HEAD -- . ':!Extension/_locales'
```

Every offline change is marked with an `OFFLINE PATCH` or `AdZap Offline`
comment, and the `OFFLINE_BUILD` flag lives in `Extension/src/common/offline.ts`.

## Checking it's offline

- `build/release/chrome-mv3/manifest.json` should contain
  `"content_security_policy": {"extension_pages": "... connect-src 'self'"}`.
- In `chrome://extensions`, open the service worker's DevTools and watch the
  Network tab. Only `chrome-extension://` requests should appear.
