var fs = require("fs"),
	util = require("./util.js");

fs.readFile( "dict/string.txt", "utf8", function( err, data ) {
	var words = data.split(" ");

	fs.readFile( "dict/suffix.js", "utf8", function( err, data ) {
		util.buildTrie( data );
	
		var start = (new Date).getTime();

		for ( var i = 0, l = words.length; i < l; i++ ) {
			util.findTrieWord( words[i] );
		}

		console.log( (new Date).getTime() - start );

		start = (new Date).getTime();

		for ( var i = 0, l = words.length; i < l; i++ ) {
			util.findTrieWord( words[i] + "z" );
		}

		console.log( (new Date).getTime() - start );
	});
});