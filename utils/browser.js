const userAgent = navigator.userAgent;

export const getName = async () => {
    if (typeof InstallTrigger !== 'undefined') {
        // Firefox 1.0+
        return 'Firefox';
    }

    if (navigator.brave && (await navigator.brave.isBrave())) {
        return 'Brave';
    }

    const isChrome =
        !!globalThis.chrome &&
        (!!globalThis.chrome.webstore || !!globalThis.chrome.runtime);

    if (isChrome) {
        // Chrome 1 - 79
        return 'Chrome';
    }

    if (isChrome && userAgent.indexOf('Edg') != -1) {
        // Edge (based on chromium) detection
        return 'Edge';
    }

    return 'Unknown';
};

export const getOS = () => {
    const ua = userAgent.toLowerCase();

    if (ua.indexOf('win') !== -1) {
        return 'Windows';
    }

    if (ua.indexOf('mac') !== -1) {
        return 'MacOS';
    }

    if (ua.indexOf('linux') !== -1 || ua.indexOf('x11') !== -1) {
        return 'Linux';
    }

    return 'Unknown';
};

export const getLanguage = () => {
    return navigator.language;
};
