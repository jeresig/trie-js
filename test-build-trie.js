var fs = require("fs"),
	util = require("./util.js"),
	Benchmark = require("benchmark"),
	suite = new Benchmark.Suite;

fs.readFile( "dict/suffix.js", "utf8", function( err, data ) {

	var all = [];

	suite.add('Build trie', function() {
		all.push( util.buildTrie( data ) );
	})
	.on('cycle', function(bench) {
		console.log(String(bench));
	})
	.run(true);

});