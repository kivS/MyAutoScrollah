// DB INIT
let $sites;

declare var loki: any;
const $db = new loki('db.json',{
    env: 'BROWSER',
    verbose: true,
    autosave: true,
    autoload: true,
    autoloadCallback : function(){
        
       $sites = $db.getCollection('sites');

       // If Collections are not present initialize them
       if(!$sites) $sites = $db.addCollection('sites');
    },
});

// Show visual cue  to users when they change to current tab
chrome.tabs.onActivated.addListener(r => {

    // Get current tab's url   
    chrome.tabs.query({active:true}, t => {

        // get cleaned url
        const currentTabUrl = getCleanUrl(t[0].url);

        if(isPageTracked(currentTabUrl)){
            console.log(`On tab activated - Page [${currentTabUrl}] is being tracked...`);
            setBadgeOn();

        }else{
            console.log(`On tab activated - Page [${currentTabUrl}] not tracked...`);
            setBadgeOff();
        }
    });

    console.groupEnd();
});


// Message station - alllll aboard!
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	//
    console.group("BG: Incoming messages");
    console.log('Request: ', request);
    console.log('Sender: ', sender);
    console.groupEnd();
    //
   
    // 
    switch(request.what){
    	case "START_BOT":
    		// check If page is already saved
            const query = $sites.findOne({url: request.url});  
            if(query){
                console.log('START_BOT - query result: ', query);

                // Send back info to be scrolled
                sendResponse({
                    changes: true,
                    newScrollY: query.scrollY,
                    oldScrollY: query.lastScrollY
                });


                setBadgeOn();
                break;
            }
            
            sendResponse({changes: false});
    	break;

        case "ECHO_ECHO":
            // Get page location when user leaves tab or closes the page and save it..
            console.group('ECHO_ECHO - save location of site:');
            console.log('URL: ', request.url);
            console.log('ScrollY: ', request.scrollY);
            console.groupEnd();

            savePageLocation(request.url, request.scrollY);

        break;

    	default:
    		sendResponse({changes: false});
    }

 });


//--------------------------------------------------------------------------------------------------------------------------------------



/**
 * Saves pages location to the DB
 * 
 */
function savePageLocation(url: string, newScrollY: number){
    console.group('Save page location');
   
    let query = $sites.findOne({url: url});

     // check If page is already saved
    if(query && newScrollY != query.scrollY){
       console.log('url exists and location is diferent. UPDATE');
       query.lastScrollY = query.scrollY;
       query.scrollY = newScrollY;
       $sites.update(query);
    }

    // If it's a new page && it's being tracked then let's save it
    // 
    const isPageBeingTracked = isPageTracked(url);

    if(!query && isPageBeingTracked){
        console.log('A new entry it is. INSERT NEW');
        $sites.insertOne({url:url, scrollY: newScrollY, lastScrollY: 0});
    }

    console.log('isPageBeingTracked: ', isPageBeingTracked);
   
    console.groupEnd();  
}

/**
 * Ads page's url to tracked_pages DB
 * @param  {[string]} url 
 */
function trackPage(url){
    $sites.insertOne({'url': url});
    console.log('tracking: ', url);
    setBadgeOn();
    
}

/**
 * Removes page's url from tracked_pages DB
 * @param  {[url]} url 
 */
function untrackPage(url){
    $sites.removeWhere({'url': url});
    console.log('untracked: ', url);
    setBadgeOff();

}

/**
 * Checks $tracked_pages DB to assert if page's being tracked
 * @param  {[url]}  url 
 * @return {Boolean}     
 */
function isPageTracked(url: string): boolean{
    const query = $sites.findOne({'url': url});
    if(query) return true;

    // If page is not being tracked
    return false;
}


/**
 * Get a clean and static url
 */
function getCleanUrl(url: string): string {

    return url.split('#')[0];
}


/**
 * Changes badge's text to ON && color to green
 */
function setBadgeOn(){
    chrome.browserAction.setBadgeText({text: 'ON'});
    chrome.browserAction.setBadgeBackgroundColor({color: '#2E7D32'});

}

/**
 * Changes badge's text to OFF && color to red
 */
function setBadgeOff(){
    chrome.browserAction.setBadgeText({text: 'OFF'});
    chrome.browserAction.setBadgeBackgroundColor({color: '#E53935'});
}