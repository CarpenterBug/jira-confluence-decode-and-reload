import Config from './config.js';
import { getName, getOS, getLanguage, showAlert } from './utils/browser.js';
import posthog from './node_modules/posthog-js/dist/module.no-external.js';

const manifest = chrome.runtime.getManifest();
let browserData = {};
let isPageLoaded = false;

posthog.init(Config.getEnvVariable('POSTHOG_KEY'), {
    api_host: 'https://eu.i.posthog.com',
    disable_external_dependency_loading: true,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_dead_clicks: false,
    disable_surveys: true,
    disable_session_recording: true,
    enable_heatmaps: false,
});

getName().then((browser) => {
    browserData = {
        browser: browser,
        os: getOS(),
        language: getLanguage(),
    };
});

const capturePHEvent = (eventName, props = {}) => {
    posthog.capture(eventName, {
        $browser: browserData.browser,
        'Extension Short Name': manifest.short_name,
        'Extension Version': manifest.version,
        'Extension Name': manifest.name,
        ...props,
    });
};

chrome.action.onClicked.addListener((tab) => {
    // "Disable" clicks while page loads
    if (!isPageLoaded) return;

    const currentHref = new URL(tab.url).href;
    const prefixToRemove = 'https://id.atlassian.com/step-up/start?continue=';

    if (currentHref.startsWith(prefixToRemove)) {
        const encodedPart = currentHref.replace(prefixToRemove, '');
        const decodedUrl = new URL(decodeURIComponent(encodedPart));
        const newHostname = decodedUrl.hostname;

        const companyName = newHostname.includes('.atlassian.net')
            ? newHostname.replace(/www\./i, '').split('.')[0]
            : newHostname;

        capturePHEvent('ext_btn_click', {
            $current_url: newHostname,
            Company: companyName,
        });

        chrome.tabs.update(tab.id, { url: decodedUrl.href });
    } else {
        //No scripting allowed on browser settings and chrome web store pages
        !/^(?:brave|chrome|edge)|chromewebstore\.google/i.test(currentHref) &&
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: showAlert,
                args: ['URL does not match the expected pattern.'],
            });
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Reset to false on page load
    changeInfo.status === 'loading' &&
        isPageLoaded == true &&
        (isPageLoaded = false);

    changeInfo.status === 'complete' && (isPageLoaded = true);
});

chrome.runtime.onInstalled.addListener((details) => {
    // Set to true on extension install/reload/update
    isPageLoaded = true;

    capturePHEvent('ext_installed/reloaded/updated', {
        'Extension Install/Reload/Update': details,
    });
});

chrome.management.onInstalled.addListener((info) => {
    capturePHEvent('ext_installed', {
        'Extension Install Type': info.installType,
        'Extension Enabled': info.enabled,
        getSelf: info,
    });
});

chrome.management.onDisabled.addListener((info) => {
    capturePHEvent('ext_disabled', {
        'Extension Install Type': info.installType,
        'Extension Enabled': info.enabled,
        'Extension Disabled Reason': info.disabledReason,
        getSelf: info,
    });
});

chrome.management.onEnabled.addListener((info) => {
    capturePHEvent('ext_enabled', {
        'Extension Install Type': info.installType,
        'Extension Enabled': info.enabled,
        getSelf: info,
    });
});

chrome.management.onUninstalled.addListener((id) => {
    capturePHEvent('ext_uninstalled', {
        'Extension ID': id,
    });
});
