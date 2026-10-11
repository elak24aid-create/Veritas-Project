// Online API Configuration Manager for TruthLens
import axios from 'axios';

// Ensure all requests bypass any localtunnel warning interstitials
axios.defaults.headers.common['bypass-tunnel-reminder'] = 'true';
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true';

export const RENDER_API_URL = 'https://truthlens-api.onrender.com';
export const CLOUD_TUNNEL_URL = 'https://cute-lamps-itch.loca.lt';
export const LOCAL_WIFI_URL = 'http://10.48.35.23:8000';
export const EMULATOR_URL = 'http://10.0.2.2:8000';
export const LOCAL_WEB_URL = 'http://localhost:8000';

export const isHttpsOrigin = () => {
    return typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';
};

export const isRemoteWeb = () => {
    if (typeof window === 'undefined' || !window.location) return false;
    const host = window.location.hostname;
    return host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('192.168.') && !host.startsWith('10.');
};

export const getApiBaseUrl = () => {
    // 1. User custom saved server URL in settings
    const savedUrl = localStorage.getItem('truthlens_custom_api_url') || localStorage.getItem('fnds_custom_api_url');
    if (savedUrl && savedUrl.trim()) {
        return savedUrl.trim().replace(/\/$/, '');
    }

    // 2. Check environment variable (VITE_API_BASE_URL)
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL.trim().replace(/\/$/, '');
    }

    // 3. Mobile / Capacitor app
    const isMobile = !!(window.Capacitor || (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('Android')));
    if (isMobile) {
        return CLOUD_TUNNEL_URL;
    }

    // 4. Remote Web Production (e.g., Vercel https://*.vercel.app)
    if (isRemoteWeb() || isHttpsOrigin()) {
        return CLOUD_TUNNEL_URL;
    }

    // 5. Default local development web URL
    return LOCAL_WEB_URL;
};

export const setCustomApiUrl = (url) => {
    if (url && url.trim()) {
        const clean = url.trim().replace(/\/$/, '');
        localStorage.setItem('truthlens_custom_api_url', clean);
        localStorage.setItem('fnds_custom_api_url', clean);
    } else {
        localStorage.removeItem('truthlens_custom_api_url');
        localStorage.removeItem('fnds_custom_api_url');
    }
};

const filterCandidatesForEnvironment = (list) => {
    const isHttps = isHttpsOrigin();
    const isRemote = isRemoteWeb();

    return list.filter(url => {
        if (!url) return false;
        // If loaded on an HTTPS website (like Vercel), block insecure HTTP targets to prevent Mixed Content security errors
        if ((isHttps || isRemote) && url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
            return false;
        }
        return true;
    });
};

export const testServerConnection = async (specificUrl = null) => {
    if (specificUrl) {
        try {
            const target = specificUrl.replace(/\/$/, '');
            const res = await axios.get(`${target}/`, {
                timeout: 4000,
                headers: { 'bypass-tunnel-reminder': 'true' }
            });
            return res.status === 200;
        } catch (e) {
            return false;
        }
    }

    // Test candidate endpoints in order: Saved -> Cloud Tunnel -> Render Cloud -> Local Wi-Fi -> Localhost
    const saved = localStorage.getItem('truthlens_custom_api_url');
    const rawCandidates = [
        saved,
        CLOUD_TUNNEL_URL,
        RENDER_API_URL,
        LOCAL_WIFI_URL,
        LOCAL_WEB_URL,
        EMULATOR_URL
    ];

    const candidates = filterCandidatesForEnvironment(rawCandidates);

    for (const url of candidates) {
        try {
            const target = url.replace(/\/$/, '');
            const res = await axios.get(`${target}/`, {
                timeout: 3500,
                headers: { 'bypass-tunnel-reminder': 'true' }
            });
            if (res.status === 200) {
                setCustomApiUrl(target);
                return true;
            }
        } catch (e) {
            // try next candidate
        }
    }
    return false;
};

/**
 * Intelligent API Request Wrapper with Automatic Fallback
 * Tries candidates dynamically, skipping mixed-content blockers
 */
export const apiRequest = async (endpoint, options = {}) => {
    const primary = getApiBaseUrl();
    const rawCandidates = [
        primary,
        CLOUD_TUNNEL_URL,
        RENDER_API_URL,
        LOCAL_WIFI_URL,
        LOCAL_WEB_URL,
        EMULATOR_URL
    ];

    const validCandidates = filterCandidatesForEnvironment(rawCandidates);
    const bases = Array.from(new Set(validCandidates));

    let lastErr = null;
    const perAttemptTimeout = options.timeout || 12000;

    for (const base of bases) {
        try {
            const cleanBase = base.replace(/\/$/, '');
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            const fullUrl = `${cleanBase}${cleanEndpoint}`;

            const config = {
                url: fullUrl,
                timeout: perAttemptTimeout,
                headers: {
                    'bypass-tunnel-reminder': 'true',
                    ...(options.headers || {})
                },
                ...options
            };

            const response = await axios(config);
            if (base !== primary) {
                setCustomApiUrl(base);
            }
            return response;
        } catch (err) {
            lastErr = err;
            // If it's a 4xx error (like 400 Bad Request or 422), server is reachable and returned a valid response
            if (err.response && err.response.status < 500) {
                throw err;
            }
        }
    }
    throw lastErr;
};
