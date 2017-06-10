console.log("Hello world /... not! from popup");
// get background page ref && get current tab url
var BG, TAB_URL;
chrome.runtime.getBackgroundPage(function (bg) { BG = bg; });
// Manage visuals according with whether the page is being tracked or not
console.group('Manage visuals according with tracking status of page');
// get current tab and set url var
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    TAB_URL = tabs[0].url.split('#')[0];
    console.log('tab url: ', TAB_URL);
    // check if TAB_URL is being tracked or not
    if (BG.isPageTracked(TAB_URL)) {
        console.log('Current tab is being tracked.');
        document.getElementById('untrack').style.display = 'block';
    }
    else {
        console.log('Current tab is not being tracked..');
        document.getElementById('track').style.display = 'block';
    }
});
console.groupEnd();
// Get btn 
document.getElementById('track').addEventListener('click', doPage, false);
document.getElementById('untrack').addEventListener('click', doPage, false);
/**
 * Get page info and track/untrack it
 * @param  {[type]} e  --> event object
 */
function doPage(e) {
    console.group('Buttons events');
    console.log(e.target.id);
    switch (e.target.id) {
        case 'track':
            // use track func from background page ref
            BG.trackPage(TAB_URL);
            document.getElementById('untrack').style.display = 'block';
            document.getElementById('track').style.display = 'none';
            break;
        case 'untrack':
            // send request to untrack page to background script
            BG.untrackPage(TAB_URL);
            document.getElementById('untrack').style.display = 'none';
            document.getElementById('track').style.display = 'block';
            break;
    }
    console.groupEnd();
}
