import Config from './config.js';
import { getName, getOS, getLanguage, showAlert } from './utils/browser.js';
import posthog from './node_modules/posthog-js/dist/module.js';

const manifest = chrome.runtime.getManifest();
let browserData = {};

posthog.init(Config.getEnvVariable('POSTHOG_KEY'), {
    api_host: 'https://eu.i.posthog.com',
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
        $lib: manifest.short_name,
        $lib_version: manifest.version,
        'Library name': manifest.name,
        ...props,
    });
};

chrome.action.onClicked.addListener((tab) => {
    const currentUrl = new URL(tab.url);
    const prefixToRemove = 'https://id.atlassian.com/step-up/start?continue=';

    if (currentUrl.href.startsWith(prefixToRemove)) {
        const encodedPart = currentUrl.href.replace(prefixToRemove, '');
        const decodedUrl = new URL(decodeURIComponent(encodedPart));
        const newHostname = decodedUrl.hostname;

        const companyName = newHostname.includes('.atlassian.net')
            ? newHostname.replace(/www\./i, '').split('.')[0]
            : newHostname;

        capturePHEvent('ext_btn_click', {
            $current_url: newHostname,
            'Company name': companyName,
        });

        chrome.tabs.update(tab.id, { url: decodedUrl.href });
    } else {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showAlert,
            args: ['URL does not match the expected pattern.'],
        });
    }
});

chrome.management.onInstalled.addListener(() => {
    chrome.management.getSelf().then((params) => {
        capturePHEvent('ext_installed', {
            'Library Install Type': params.installType,
            'Library enabled': params.enabled,
            getSelf: params,
        });
    });
});

chrome.management.onDisabled.addListener(() => {
    chrome.management.getSelf().then((params) => {
        capturePHEvent('ext_disabled', {
            'Library Install Type': params.installType,
            'Library enabled': params.enabled,
            'Library Disabled Reason': params.disabledReason,
            getSelf: params,
        });
    });
});

chrome.management.onEnabled.addListener(() => {
    chrome.management.getSelf().then((params) => {
        capturePHEvent('ext_enabled', {
            'Library Install Type': params.installType,
            'Library enabled': params.enabled,
            getSelf: params,
        });
    });
});

chrome.management.onUninstalled.addListener(() => {
    chrome.management.getSelf().then(() => {
        capturePHEvent('ext_uninstalled');
    });
});
