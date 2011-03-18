var fs = require("fs"),
	util = require("./util.js"),
	Benchmark = require("./vendor/Benchmark.js/benchmark.js"),
	suite = new Benchmark.Suite;

fs.readFile( "dict/string.txt", "utf8", function( err, data ) {

	var all = [];

	suite.add('Build string', function() {
		all.push( util.buildStringDict( data ) );
	})
	.on('cycle', function(bench) {
		console.log(String(bench));
	})
	.on('complete', function() {
		while(true){}
	})
	.run(true);

});