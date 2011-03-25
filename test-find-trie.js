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

util.buildTrie( fs.readFileSync( "dict/suffix.js", "utf8" ) );

(new Benchmark.Suite)
	.add("Hit", function() {
		i = length;
		while (i--) {
			util.findTrieWord( words[i] );
		}
	})
	.add("Miss", function() {
		i = length;
		while (i--) {
			util.findTrieWord( words[i] + "z" );
		}
	})
	.on("cycle", sys.puts)
	.run();