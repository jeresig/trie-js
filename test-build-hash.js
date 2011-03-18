var fs = require("fs"),
	util = require("./util.js"),
	Benchmark = require("./vendor/Benchmark.js/benchmark.js"),
	suite = new Benchmark.Suite;

fs.readFile( "dict/string.txt", "utf8", function( err, data ) {

	var all = [];

	suite.add('Build hash', function() {
		all.push( util.buildHashDict( data ) );
	})
	.on('cycle', function(bench) {
		console.log(String(bench));
	})
	.on('complete', function() {
		while(true){}
	})
	.run(true);

});