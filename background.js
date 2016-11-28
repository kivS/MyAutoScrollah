console.log("hey there from background.js");


// DB INIT
var $locations;
var $db = new loki('db.json',{
    env: 'BROWSER',
    verbose: true,
    autosave: true,
    autoload: true,
    autoloadCallback : function(){

        
       $locations = $db.getCollection('locations');
       $tracked_pages = $db.getCollection('tracked_pages');

       // If Collections are not present initialize them
       if(!$locations) $locations = $db.addCollection('locations');
       if(!$tracked_pages) $tracked_pages = $db.addCollection('tracked_pages');

    },
});

// Show visual cue  to users
chrome.tabs.onActivated.addListener(r => {
    // Get current tab's url
    console.group('Visual Cues');
   
    chrome.tabs.query({active:true}, t => {
        var currentTabUrl = t[0].url;
        // clean url
        currentTabUrl = currentTabUrl.split('#')[0];
        console.log('Current Tab url: ', currentTabUrl);

        if(isPageTracked(currentTabUrl)){
            console.log('Page is being tracked...');
            setBadgeOn();

        }else{
            console.log('Page not tracked...');
            setBadgeOff();
        }
    });

    console.groupEnd();
});


// Message station - alllll aboard!
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	//
    console.group("Incoming messages");
    console.log('Request: ', request);
    console.log('Sender: ', sender);
    console.groupEnd();
    //
   
    // 
    switch(request.what){
    	case "START_BOT":
    		// check If page is already saved
            var query = $locations.findOne({url: request.url});  
            if(query){
                
                console.group('Saved page query result');
                console.log('Query: ', query);
                console.groupEnd();

                // Send back info to be scrolled
                sendResponse({
                    changes: true,
                    newScrollY: query.scrollY,
                    oldScrollY: query.lastScrollY
                });
                break;
            }
            
            sendResponse({changes: false});
    	break;

        case "ECHO_ECHO":
            // Get page location when user leaves tab or closes the page and save it..
            console.group('Page location to be saved');
            console.log('URL: ', request.url);
            console.log('ScrollY: ', request.scrollY);
            console.groupEnd();

            savePageLocation(request.url, request.scrollY);

        break;

        case "TRACK_PAGE":
            trackPage(request.url);
        break;

        case "UNTRACK_PAGE":
            untrackPage(request.url);
        break;

    	default:
    		sendResponse({changes: false});
    }

 });


//--------------------------------------------------------------------------------------------------------------------------------------



/**
 * Saves pages location to the DB
 * @param  {[type]} url        --> url of page
 * @param  {[type]} newScrollY --> new page Y location
 * 
 */
function savePageLocation(url, newScrollY){
    console.group('Save page location');
    // check If page is already saved
    var query = $locations.findOne({url: url});
    if(query && newScrollY != query.scrollY){

       console.log('url exists and location is diferent. UPDATE');
       query.lastScrollY = query.scrollY;
       query.scrollY = newScrollY;
       $locations.update(query);
    }

    // If it's a new page && it's being tracked then let's save it
    // 
    var isPageBeingTracked = isPageTracked(url);
    if(!query && isPageBeingTracked){
        console.log('A new entry it is. INSERT NEW');
        $locations.insertOne({url:url, scrollY: newScrollY, lastScrollY: 0});
    }

    console.log('isPageBeingTracked: ', isPageBeingTracked);
   
    console.groupEnd();  
}

/**
 * Ads page's url to tracked_pages DB
 * @param  {[string]} url 
 */
function trackPage(url){
    $tracked_pages.insertOne({page_url: url});
    console.group('Track page');
    console.log('tracking: ', url);
    console.groupEnd();
    
}

/**
 * Removes page's url from tracked_pages DB
 * @param  {[url]} url 
 */
function untrackPage(url){
    $tracked_pages.removeWhere({page_url: url});
    $locations.removeWhere({url: url});
    console.group('Untrack page');
    console.log('untracked: ', url);
    console.groupEnd();

}

/**
 * Checks $tracked_pages DB to assert if page's being tracked
 * @param  {[url]}  url 
 * @return {Boolean}     
 */
function isPageTracked(url){
    var query = $tracked_pages.findOne({page_url: url});
    if(query) return true;

    // If page is not being tracked
    return false;
}

/**
 * Changes badge's text to ON && color to green
 */
function setBadgeOn(){
    chrome.browserAction.setBadgeText({text: 'ON'});
    chrome.browserAction.setBadgeBackgroundColor({color: 'green'});

}

/**
 * Changes badge's text to OFF && color to red
 */
function setBadgeOff(){
    chrome.browserAction.setBadgeText({text: 'OFF'});
    chrome.browserAction.setBadgeBackgroundColor({color: 'red'});
}