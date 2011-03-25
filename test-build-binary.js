var fs = require("fs"),
	sys = require("sys"),
	util = global.util = require("./util"),
	data = global.data = fs.readFileSync( "dict/binary.txt", "utf8" ),
	Benchmark = require("./vendor/Benchmark.js/benchmark");

(new Benchmark.Suite).add("Build binary", {
	setup: function() {
		var data = global.data,
			util = global.util;
	},
	fn: function() {
		util.buildBinaryDict( data );
	}
})
.on("cycle", sys.puts)
.run();

while (true) { }