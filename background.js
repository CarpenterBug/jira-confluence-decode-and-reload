import { getName, getOS, getLanguage } from './utils/browser.js';

let browserData = {};

getName().then((browser) => {
    browserData = {
        browser: browser,
        os: getOS(),
        language: getLanguage(),
    };
});

chrome.action.onClicked.addListener((tab) => {
    const currentUrl = new URL(tab.url);
    const prefixToRemove = 'https://id.atlassian.com/step-up/start?continue=';

    if (currentUrl.href.startsWith(prefixToRemove)) {
        const encodedPart = currentUrl.href.replace(prefixToRemove, '');
        const decodedUrl = decodeURIComponent(encodedPart);

        chrome.tabs.update(tab.id, { url: decodedUrl });
    } else {
        console.log('URL does not match the expected pattern.');
    }
});
