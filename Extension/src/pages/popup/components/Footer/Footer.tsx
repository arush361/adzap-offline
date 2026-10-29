/**
 * Copyright (c) 2015-2026 Adguard Software Ltd.
 *
 * @file
 * This file is part of AdGuard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * AdGuard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * AdGuard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with AdGuard Browser Extension. If not, see <http://www.gnu.org/licenses/>.
 *
 * Modified 2026-10-29 by Arush Sharma for AdZap Offline (see NOTICE).
 */

import React from 'react';
import { observer } from 'mobx-react';

import './footer.pcss';

/**
 * AdZap Offline footer: a short product line instead of the upstream
 * app-store promo links.
 */
export const Footer = observer(() => (
    <div className="footer">
        <div className="footer__text" title="AdZap Offline: open source, fully offline">
            AdZap Offline · open source, fully offline
        </div>
    </div>
));
