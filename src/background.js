console.log("hey there from background.js");
// DB INIT
var $sites;
var $db = new loki('db.json', {
    env: 'BROWSER',
    verbose: true,
    autosave: true,
    autoload: true,
    autoloadCallback: function () {
        $sites = $db.getCollection('sites');
        // If Collections are not present initialize them
        if (!$sites)
            $sites = $db.addCollection('sites');
    }
});
// Show visual cue  to users when they change to current tab
chrome.tabs.onActivated.addListener(function (r) {
    // Get current tab's url
    console.group('Visual Cues');
    chrome.tabs.query({ active: true }, function (t) {
        var currentTabUrl = t[0].url;
        // clean url
        currentTabUrl = currentTabUrl.split('#')[0];
        console.log('Current Tab url: ', currentTabUrl);
        if (isPageTracked(currentTabUrl)) {
            console.log('Page is being tracked...');
            setBadgeOn();
        }
        else {
            console.log('Page not tracked...');
            setBadgeOff();
        }
    });
    console.groupEnd();
});
// Message station - alllll aboard!
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //
    console.group("Incoming messages");
    console.log('Request: ', request);
    console.log('Sender: ', sender);
    console.groupEnd();
    //
    // 
    switch (request.what) {
        case "START_BOT":
            // check If page is already saved
            var query = $sites.findOne({ url: request.url });
            if (query) {
                console.group('Saved page query result');
                console.log('Query: ', query);
                console.groupEnd();
                // Send back info to be scrolled
                sendResponse({
                    changes: true,
                    newScrollY: query.scrollY,
                    oldScrollY: query.lastScrollY
                });
                setBadgeOn();
                break;
            }
            sendResponse({ changes: false });
            break;
        case "ECHO_ECHO":
            // Get page location when user leaves tab or closes the page and save it..
            console.group('Page location to be saved');
            console.log('URL: ', request.url);
            console.log('ScrollY: ', request.scrollY);
            console.groupEnd();
            savePageLocation(request.url, request.scrollY);
            break;
        default:
            sendResponse({ changes: false });
    }
});
//--------------------------------------------------------------------------------------------------------------------------------------
/**
 * Saves pages location to the DB
 * @param  {[type]} url        --> url of page
 * @param  {[type]} newScrollY --> new page Y location
 *
 */
function savePageLocation(url, newScrollY) {
    console.group('Save page location');
    // check If page is already saved
    var query = $sites.findOne({ url: url });
    if (query && newScrollY != query.scrollY) {
        console.log('url exists and location is diferent. UPDATE');
        query.lastScrollY = query.scrollY;
        query.scrollY = newScrollY;
        $sites.update(query);
    }
    // If it's a new page && it's being tracked then let's save it
    // 
    var isPageBeingTracked = isPageTracked(url);
    if (!query && isPageBeingTracked) {
        console.log('A new entry it is. INSERT NEW');
        $sites.insertOne({ url: url, scrollY: newScrollY, lastScrollY: 0 });
    }
    console.log('isPageBeingTracked: ', isPageBeingTracked);
    console.groupEnd();
}
/**
 * Ads page's url to tracked_pages DB
 * @param  {[string]} url
 */
function trackPage(url) {
    $sites.insertOne({ 'url': url });
    console.group('Track page');
    console.log('tracking: ', url);
    console.groupEnd();
    setBadgeOn();
}
/**
 * Removes page's url from tracked_pages DB
 * @param  {[url]} url
 */
function untrackPage(url) {
    $sites.removeWhere({ 'url': url });
    console.group('Untrack page');
    console.log('untracked: ', url);
    console.groupEnd();
    setBadgeOff();
}
/**
 * Checks $tracked_pages DB to assert if page's being tracked
 * @param  {[url]}  url
 * @return {Boolean}
 */
function isPageTracked(url) {
    var query = $sites.findOne({ 'url': url });
    if (query)
        return true;
    // If page is not being tracked
    return false;
}
/**
 * Changes badge's text to ON && color to green
 */
function setBadgeOn() {
    chrome.browserAction.setBadgeText({ text: 'ON' });
    chrome.browserAction.setBadgeBackgroundColor({ color: '#2E7D32' });
}
/**
 * Changes badge's text to OFF && color to red
 */
function setBadgeOff() {
    chrome.browserAction.setBadgeText({ text: 'OFF' });
    chrome.browserAction.setBadgeBackgroundColor({ color: '#E53935' });
}
