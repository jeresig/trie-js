var fs = require("fs"),
	util = require("./util.js"),
	Benchmark = require("benchmark"),
	suite = new Benchmark.Suite;

fs.readFile( "dict/string.txt", "utf8", function( err, data ) {

	var words = data.split(" ");

	fs.readFile( "dict/suffix.js", "utf8", function( err, data ) {
		util.buildTrie( data );
	
		suite.add(function() {
			for ( var i = 0, l = words.length; i < l; i++ ) {
				util.findTrieWord( words[i] );
			}
		})
		.add(function() {
			for ( var i = 0, l = words.length; i < l; i++ ) {
				util.findTrieWord( words[i] + "z" );
			}
		})
		.on('cycle', function(bench) {
			console.log(String(bench));
		})
		.run(true);

	});
});