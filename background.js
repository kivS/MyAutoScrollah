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

       if(!$locations) $locations = $db.addCollection('locations');

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