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



// Start up && send some info about page
chrome.runtime.sendMessage(
	{
		what: "start_bot",
		scrollY: scrollY     // info about the Y distance travelled in this page

	},
	function(response) {
		console.group('Startup response');
		console.log('Response: ', response);
		console.groupEnd();

		if(response.changes){
			travelY(response.newScrollY);
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

// Handle page visibility change   
window.onbeforeunload = handlePageUnload;


//---------------------------------------------------------------------------------------------------------------------------------------------

/**
 * Scroll page vertically to determined coord
 * @param  {[integer]} y  --> new coord
 *  
 */
function travelY(y){
	console.group('TravelY - Scroll page to new Y');
	console.log('current Y: ', scrollY);
	console.log('new Y: ', y);

	scrollTo(0, y);

	console.groupEnd();
}

/**
 * send current page location to be saved
 * 
 */
function sendPageLocation(){
	chrome.runtime.sendMessage(
		{
			what: "echo_echo",
			scrollY: scrollY     // info about the Y distance travelled in this page

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