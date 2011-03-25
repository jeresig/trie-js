var fs = require("fs"),
	util = global.util = require("./util"),
	words = global.words = fs.readFileSync( "dict/string.txt", "utf8" ).split(" "),
	Benchmark = require("./vendor/Benchmark.js/benchmark");

Benchmark.prototype.setup = function() {
	var i,
		util = global.util,
		words = global.words,
		length = words.length;
};

util.buildHashDict( fs.readFileSync( "dict/string.txt", "utf8" ) );

(new Benchmark.Suite)
	.add("Hit", function() {
		i = length;
		while (i--) {
			util.findHashWord( words[i] );
		}
	})
	.add("Miss", function() {
		i = length;
		while (i--) {
			util.findHashWord( words[i] + "z" );
		}
	})
	.on("cycle", function(bench) {
		console.log(String(bench));
	})
	.run();