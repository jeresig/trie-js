var fs = require("fs"),
	util = require("./util.js"),
	Benchmark = require("./vendor/Benchmark.js/benchmark.js"),
	suite = new Benchmark.Suite;

fs.readFile( "dict/string.txt", "utf8", function( err, data ) {

	while(true){}

});