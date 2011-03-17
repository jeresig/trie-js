var fs = require("fs"),
	util = require("./util.js"),
	Benchmark = require("benchmark"),
	suite = new Benchmark.Suite;

fs.readFile( "dict/string.txt", "utf8", function( err, data ) {

	var all = [];

	suite.add('Build string', function() {
		all.push( util.buildStringDict( data ) );
	})
	.on('cycle', function(bench) {
		console.log(String(bench));
	})
	.run(true);

});