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

import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { OFFLINE_BUILD } from '../../../Extension/src/common/offline';
import { TelemetryApi } from '../../../Extension/src/background/api';
import { network } from '../../../Extension/src/background/api/network';
import {
    BackendUpdateChecker,
} from '../../../Extension/src/background/services/extension-update/backend-update-checker';
import { UpdateCheckStatus } from '../../../Extension/src/background/services/extension-update/types';
import { type TelemetryApiEventData } from '../../../Extension/src/background/services';
import { chromeMv3Manifest } from '../../../tools/bundle/chrome-mv3/manifest.chrome.mv3';
import { commonManifest } from '../../../tools/bundle/manifest.common';
import {
    DesktopAppPromo,
} from '../../../Extension/src/pages/options/components/General/DesktopAppPromo/DesktopAppPromo';
import { RateNotification } from '../../../Extension/src/pages/options/components/RateNotification/RateNotification';

describe('AdZap Offline: no outbound network calls', () => {
    let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

    beforeEach(() => {
        fetchMock = vi.fn<typeof fetch>();
        global.fetch = fetchMock;
    });

    it('has the offline build flag on', () => {
        expect(OFFLINE_BUILD).toBe(true);
    });

    it('never sends telemetry events', async () => {
        await TelemetryApi.sendEvent({} as TelemetryApiEventData);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('never contacts the A/B test service', async () => {
        const result = await TelemetryApi.sendSessionStart({} as Parameters<typeof TelemetryApi.sendSessionStart>[0]);
        expect(result).toEqual({ versions: {} });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('never pings the update backend', async () => {
        const result = await BackendUpdateChecker.checkUpdate();
        expect(result).toEqual({ status: UpdateCheckStatus.NoContent });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('never sends filter hit stats', async () => {
        await network.sendHitStats({ filters: { 2: { '||ads.example^': 3 } } });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('refuses remote JSON requests (Safe Browsing lookups)', async () => {
        await expect(network.lookupSafebrowsing(['abcd'])).rejects.toThrow('Offline build: blocked request');
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe('AdZap Offline: manifest hardening', () => {
    it('blocks all outbound connections via CSP', () => {
        const csp = chromeMv3Manifest.content_security_policy.extension_pages;
        expect(csp).toContain("connect-src 'self'");
        expect(csp).toContain("script-src 'self'");
    });

    it('does not inject scripts into upstream websites', () => {
        const matches = commonManifest.content_scripts.flatMap((script) => script.matches);
        expect(matches.some((m) => /adguard/i.test(m))).toBe(false);
    });

    it('is authored as AdZap Offline', () => {
        expect(commonManifest.author).toBe('Arush Sharma');
    });
});

describe('AdZap Offline: promos are not rendered', () => {
    it('renders no desktop app promo', () => {
        expect(DesktopAppPromo()).toBeNull();
    });

    it('renders no rating prompt', () => {
        expect(RateNotification()).toBeNull();
    });
});
