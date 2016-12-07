console.log("Hello world /... not! from popup");

// get background page ref
var BG;
chrome.runtime.getBackgroundPage(bg => { BG = bg });



// Manage visuals according with whether the page is being tracked or not
console.group('Manage visuals according with tracking status of page');
// get current tab and set url var
chrome.tabs.query({active: true, currentWindow: true}, tabs => {
	var tab_url = tabs[0].url;
	console.log('tab url: ', tab_url);

	// check if tab_url is being tracked or not
	if(BG.isPageTracked(tab_url)){
		console.log('Current tab is being tracked.');
		document.getElementById('untrack').style.display = 'block';
	}else{
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
function doPage(e){
	console.group('Buttons events');
	console.log(e.target.id);
	console.groupEnd();

	// Get page info from content script && procede to do bussiness
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  chrome.tabs.sendMessage(tabs[0].id, {what: "PAGE_INFO"}, function(response) {
	    console.group('Requesting page info from content script');
	    console.log(response);
	    console.groupEnd();

	    switch(e.target.id){
	    	case 'track':
	    		// send request to track page to background script
	    		chrome.runtime.sendMessage(
	    			{
	    				what: "TRACK_PAGE",
	    				url: response.page_url
	    				
	    			}
	    		);
	    	break;

	    	case 'untrack':
	    		// send request to untrack page to background script
	    		chrome.runtime.sendMessage(
	    			{
	    				what: "UNTRACK_PAGE",
	    				url: response.page_url
	    				
	    			}
	    		);
	    	break;
	    }

	  });
	});
}