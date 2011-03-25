var fs = require("fs"),
	sys = require("sys"),
	util = global.util = require("./util"),
	words = global.words = fs.readFileSync( "dict/string.txt", "utf8" ).split(" "),
	Benchmark = require("./vendor/Benchmark.js/benchmark");

Benchmark.prototype.setup = function() {
	var i,
		util = global.util,
		words = global.words,
		length = words.length;
};

util.buildBinaryDict( fs.readFileSync( "dict/binary.txt", "utf8" ) );

(new Benchmark.Suite)
	.add("Hit", function() {
		i = length;
		while (i--) {
			util.findBinaryWord( words[i] );
		}
	})
	.add("Miss", function() {
		i = length;
		while (i--) {
			util.findBinaryWord( words[i] + "z" );
		}
	})
	.on("cycle", sys.puts)
	.run();