console.log("hey there from background.js");


// DB INIT
var $locations;
var $db = new loki('db.json',{
    env: 'BROWSER',
    verbose: true,
    autosave: true,
    autoload: true,
    autoloadCallback : function(){

        // If Collections are not present initialize them
       $locations = $db.getCollection('locations');
       $tracked_pages = $db.getCollection('tracked_pages');

       if(!$locations) $locations = $db.addCollection('locations');
       if(!$tracked_pages) $tracked_pages = $db.addCollection('tracked_pages');

    },
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
    	case "start_bot":
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
                });
                break;
            }
            sendResponse({changes: false});
    	break;

        case "echo_echo":
            // Get page location when user leaves tab or closes the page and save it..
            console.group('Page location to be saved');
            console.log('URL: ', request.url);
            console.log('ScrollY: ', request.scrollY);
            console.groupEnd();

            savePageLocation(request.url, request.scrollY);

        break;

        case "track_page":
            trackPage(request.url);
        break;

        case "untrack_page":
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
       query.scrollY = newScrollY;
       $locations.update(query);
    }

    // If it's a new page let's save it
    if(!query){
        console.log('A new entry it is. INSERT NEW');
        $locations.insertOne({url:url, scrollY: newScrollY});
    }


   
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
    console.group('Untrack page');
    console.log('untracked: ', url);
    console.groupEnd();
}