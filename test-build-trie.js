var fs = require("fs"),
	util = require("./util.js");

fs.readFile( "dict/suffix.js", "utf8", function( err, data ) {
	var all = [];
	
	var start = (new Date).getTime();
	
	for ( var i = 0; i < 100; i++ ) {
		all.push( util.buildTrie( data ) );
	}
	
	console.log( (new Date).getTime() - start );
	
	while(true){}
});