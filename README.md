<p align="center">
  <img src="docs/images/icon-512.png" width="100" alt="AdZap Offline icon">
</p>

# AdZap Offline

An ad blocker for Chrome that doesn't talk to anyone. No telemetry, no update checks, no tracking ID. It blocks ads and trackers on your machine and that's it.

I wanted an ad blocker I could actually trust on my laptop, so I took an open-source one, ripped out everything that phoned home, and told Chrome to block any connection the extension tries to make. I checked by recording all network traffic while browsing with every sharing setting turned on — zero connections out.

<p align="center">
  <img src="docs/images/popup.png" width="280" alt="AdZap Offline popup">
</p>

## What you get

- Ads, pop-ups and trackers blocked, with the lists built in
- Allowlist for sites you trust, and a pause button for when a page breaks
- Point-and-click blocking for anything annoying
- A log showing what got blocked on each page
- Custom rules and settings import/export if you're into that

## Install

It's not on the Chrome Web Store, so it's a manual install. Takes a couple of minutes.

1. Download `AdZap-Offline-v1.0.0.zip` from [Releases](https://github.com/arush361/adzap-offline/releases/latest) and unzip it.
2. Move the `AdZap-Offline` folder somewhere permanent, like Documents. If you delete it later, the extension stops working.
3. Go to `chrome://extensions` and switch on **Developer mode** (top right).
4. Click **Load unpacked** and pick the `AdZap-Offline` folder — the one with `manifest.json` directly inside.
5. Pin it from the puzzle-piece menu so you can see it.

To update, export your settings, remove the old version, install the new one and import. To uninstall, hit Remove and delete the folder.

## Limitations

- Chrome only. Edge and Brave probably work, but I haven't tested them.
- The block lists are frozen at late August 2026 and don't update on their own. That's the price of being fully offline — grab new releases when they come out.
- No automatic security fixes either, for the same reason. Hit **Watch** on this repo if you want to know about new versions.
- Developer mode has to stay on, and Chrome will occasionally remind you about it.
- Managed work laptops may not allow it. Check with IT first.
- Like any ad blocker, it can break the odd site. Pause it or allowlist the site.
- You can't subscribe to extra filter lists by URL, since that needs the internet.
- No warranty. It's free and I maintain it in my spare time.

Want to verify it yourself? Build it from source with [docs/BUILDING.md](docs/BUILDING.md).

Found a bug? [Open an issue](https://github.com/arush361/adzap-offline/issues) with the website and what happened.

## License

GPL-3.0. AdZap Offline is a modified version of an existing open-source project — see [NOTICE](NOTICE) for the original copyright and the list of changes.
