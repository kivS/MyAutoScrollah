console.log("Hello world ... not! from content script");

// ## VISIBILITY API BROWSER CONFIG ##
// 
// Set the name of the hidden property and the change event for visibility
var hidden, visibilityChange; 
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
  hidden = "hidden";
  visibilityChange = "visibilitychange";

} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";

} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}


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
  
        case "PAGE_INFO":
            // Request current page info
           sendResponse({page_url: getPageUrl()});
        break;

    	default:
    		break;
    }

 });


// Start up && send some info about page
chrome.runtime.sendMessage(
	{
		what: "START_BOT",
		scrollY: scrollY,     // info about the Y distance travelled in this page
		url: getPageUrl()   // current page url
	},
	function(response) {
		console.group('Startup response');
		console.log('Response: ', response);
		console.groupEnd();

		if(response.changes){
			travelY(response.newScrollY, response.oldScrollY);
		}
  	}
);

// ##  If user supports visibility API let's added it right?!
// 
// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {

  console.error("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");

} else {

  // Handle page visibility change   
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
}

// Handle page unload event   
window.onbeforeunload = handlePageUnload;


//---------------------------------------------------------------------------------------------------------------------------------------------

/**
 * Scroll page vertically to determined coord
 * @param  {[integer]} y  --> new coord
 *  
 */
function travelY(y, oldY){
	console.group('TravelY - Scroll page to new Y');
	console.log('current page Y: ', window.scrollY);
	console.log('newY: ', y);
	console.log('oldY: ', oldY);

	// If oldY > 0 and newY is 0 something went down... so let's scroll to olY instead..
	var scrollY = (y == 0 && oldY > 0) ? oldY:y;
	console.log('newY or oldY: ', scrollY);

	scrollTo(0, scrollY);

	//make sure it scrolls..
	forceScroll(scrollY);

	console.groupEnd();
}

/**
 * send current page location to be saved
 * 
 */
function sendPageLocation(){
	chrome.runtime.sendMessage(
		{
			what: "ECHO_ECHO",
			scrollY: scrollY,     // info about the Y distance travelled in this page
			url: getPageUrl()	// current page url
		}
	);
}


/**
 * If user changes tab let's record his page position shall we?!
 * 
 */
function handleVisibilityChange(){
	console.group('Page visibility API');
	console.log('Page visibility: ', document.visibilityState);
	//document.title = document.visibilityState;
	console.groupEnd();

	if(document[hidden]){
		sendPageLocation();
	}
}

/**
 * If user closes page let's save latest location shall we
 * 
 */
function handlePageUnload(){
	sendPageLocation();
}

/**
 * Get current page url
 * @return {[string]} --> filtered url
 */
function getPageUrl(){
	return location.origin + location.pathname;
}

/**
 * Force page to scroll..
 * @param  {[type]} y [description]
 * @return {[type]}   [description]
 */
function forceScroll(y){
	setTimeout(() => {
		
		if(scrollY != y){
			window.scrollTo(0, y);
			console.log('I was forced to scroll yo..');
			// To the rabbit hole we go
			forceScroll(y);
		}

	}, 10);
}
