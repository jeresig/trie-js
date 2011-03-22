var fs = require("fs"),
	util = require("./util.js");

fs.readFile( "dict/string.txt", "utf8", function( err, data ) {
	var all = [];
	
	var start = (new Date).getTime();
	
	for ( var i = 0; i < 100; i++ ) {
		all.push( util.buildHashDict( data ) );
	}
	
	console.log( (new Date).getTime() - start );
	
	while(true){}
});