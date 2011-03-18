var fs = require("fs"),
	util = require("./util.js"),
	Benchmark = require("./vendor/Benchmark.js/benchmark.js"),
	suite = new Benchmark.Suite;

fs.readFile( "dict/suffix.js", "utf8", function( err, data ) {

	var all = [];

	suite.add('Build trie', function() {
		all.push( util.buildTrie( data ) );
	})
	.on('cycle', function(bench) {
		console.log(String(bench));
	})
	.on('complete', function() {
		while(true){}
	})
	.run(true);

});