import {Builder, Browser} from 'selenium-webdriver';

export const webdriver_browser = Browser.FIREFOX; // or CHROME, EDGE etc.

export const build_webdriver = async () => {
    let driver = await new Builder().withCapabilities({"acceptInsecureCerts": true}).forBrowser(webdriver_browser).build();
    return driver
}
