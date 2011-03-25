var fs = require("fs"),
	util = global.util = require("./util"),
	data = global.data = fs.readFileSync( "dict/string.txt", "utf8" ),
	Benchmark = require("./vendor/Benchmark.js/benchmark");

(new Benchmark.Suite).add("Build string", {
	setup: function() {
		var data = global.data,
			util = global.util;
	},
	fn: function() {
		util.buildStringDict( data );
	}
})
.on("cycle", function(bench) {
	console.log(String(bench));
})
.run();

while (true) { }