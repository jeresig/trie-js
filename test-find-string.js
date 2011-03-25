var fs = require("fs"),
	sys = require("sys"),
	util = global.util = require("./util"),
	words = global.words = fs.readFileSync( "dict/string.txt", "utf8" ).split(" "),
	Benchmark = require("./vendor/Benchmark.js/benchmark");

Benchmark.extend(Benchmark.prototype, {
	INIT_RUN_COUNT: 1,
	MIN_SAMPLE_SIZE: 1,
	setup: function() {
		var i,
			util = global.util,
			words = global.words,
			length = words.length;
	}
});

util.buildStringDict( fs.readFileSync( "dict/string.txt", "utf8" ) );

(new Benchmark.Suite)
	.add("Hit", function() {
		i = length;
		while (i--) {
			util.findStringWord( words[i] );
		}
	})
	.add("Miss", function() {
		i = length;
		while (i--) {
			util.findStringWord( words[i] + "z" );
		}
	})
	.on("cycle", sys.puts)
	.run();