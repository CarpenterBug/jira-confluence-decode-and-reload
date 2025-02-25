const userAgent = navigator.userAgent;

export const getName = async () => {
    if (typeof InstallTrigger !== 'undefined') {
        // Firefox 1.0+
        return 'Firefox';
    }

    // Safari 3.0+ "[object HTMLElementConstructor]"
    const isSafari =
        /constructor/i.test(globalThis.HTMLElement) ||
        (function (p) {
            return p.toString() === '[object SafariRemoteNotification]';
        })(
            !globalThis['safari'] ||
                (typeof safari !== 'undefined' &&
                    globalThis['safari'].pushNotification)
        );

    if (isSafari) {
        return 'Safari';
    }

    // TODO - Check if navigator works. Originally "!!document.documentMode"
    const isIE = /*@cc_on!@*/ false || !!navigator.documentMode;
    if (isIE) {
        // Internet Explorer 6-11
        return 'Internet Explorer';
    }

    if (!isIE && !!globalThis.StyleMedia) {
        // Edge 20+
        return 'Edge';
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
