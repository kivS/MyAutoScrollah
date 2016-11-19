console.log("Hello world /... not! from popup");


// Get btn 
var el = document.getElementById('btn');
el.addEventListener('click', function(e){
	
	chrome.runtime.sendMessage(
		{
			greeting: "hello",
			type: "anotha biatch"

		},
		function(response) {
	  		console.log(response);
	  	}
	);

}, false);