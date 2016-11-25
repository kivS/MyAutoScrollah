console.log("Hello world /... not! from popup");


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