var trie = eval( "(" + require("fs").readFileSync("dict/suffix.js", "utf8") + ")" ),
	end = trie.$,
	words = [];

delete trie.$;

dig( "", trie );

function dig( word, cur ) {
	for ( var node in cur ) {
		var val = cur[ node ];

		if ( node === "$" ) {
			words.push( word );

		} else if ( val === 0 ) {
			words.push( word + node );

		} else {
			dig( word + node, typeof val === "number" ?
				end[ val ] :
				val );
		}
	}
}

console.log( words.sort().join("\n") );
