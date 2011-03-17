var fs = require("fs"),
	util = require("./util.js"),
	Benchmark = require("benchmark"),
	suite = new Benchmark.Suite;

fs.readFile( "dict/string.txt", "utf8", function( err, data ) {

	var words = data.split(" ");

	fs.readFile( "dict/string.js", "utf8", function( err, data ) {
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