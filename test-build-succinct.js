var fs = require("fs"),
	util = require("./util.js");

fs.readFile( "dict/succinct.txt", "utf8", function( err, data ) {
	var all = [];
	
	var start = (new Date).getTime();
	
	for ( var i = 0; i < 100; i++ ) {
		all.push( util.buildSuccinctDict( data ) );
	}
	
	console.log( (new Date).getTime() - start );
	
	while(true){}
});