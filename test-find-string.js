var fs = require("fs"),
	util = require("./util.js"),
	Benchmark = require("./vendor/Benchmark.js/benchmark.js"),
	suite = new Benchmark.Suite;

fs.readFile( "dict/string.txt", "utf8", function( err, data ) {

	var words = data.split(" ");

	fs.readFile( "dict/simple.js", "utf8", function( err, data ) {

		util.buildStringDict( data );

		suite.add(function() {
			for ( var i = 0, l = words.length; i < l; i++ ) {
				util.findStringWord( words[i] );
			}
		})
		.add(function() {
			for ( var i = 0, l = words.length; i < l; i++ ) {
				util.findStringWord( words[i] + "z" );
			}
		})
		.on('cycle', function(bench) {
			console.log(String(bench));
		})
		.run(true);

	});

});