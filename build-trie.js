var txt = require("fs").readFileSync("dict/string.txt", "utf8"),
	words = txt.replace(/\n/g, "").split(" "),
	trie = {},
	end = {},
	keepEnd = {},
	endings = [ 0 ];

// Build a simple Trie structure
for ( var i = 0, l = words.length; i < l; i++ ) {
	var word = words[i], letters = word.split(""), cur = trie;

	for ( var j = 0; j < letters.length; j++ ) {
		var letter = letters[j], pos = cur[ letter ];

		if ( pos == null ) {
			cur = cur[ letter ] = j === letters.length - 1 ? 0 : {};

		} else if ( pos === 0 ) {
			cur = cur[ letter ] = { $: 0 };

		} else {
			cur = cur[ letter ];
		}
	}
}

/*
// Optimize the structure
optimize( trie );

// Figure out common suffixes
suffixes( trie, end );

for ( var key in end ) {
	if ( end[ key ].count > 10 ) {
		keepEnd[ key ] = endings.length;
		endings.push( end[ key ].obj );
	}
}

// And extract the suffixes
finishSuffixes( trie, keepEnd, end );

trie.$ = endings;
*/

var ret = JSON.stringify( trie ).replace(/"/g, "");

var reserved = [ "abstract", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with" ];

for ( var i = 0; i < reserved.length; i++ ) {
	ret = ret.replace( new RegExp("([{,])(" + reserved[i] + "):", "g"), "$1'$2':" );
}

console.log( ret );

function optimize( cur ) {
	var num = 0, last;

	for ( var node in cur ) {
		if ( typeof cur[ node ] === "object" ) {
			var ret = optimize( cur[ node ] );

			if ( ret ) {
				delete cur[ node ];
				cur[ node + ret.name ] = ret.value;
				node = node + ret.name;
			}
		}

		last = node;
		num++;
	}

	if ( num === 1 ) {
		return { name: last, value: cur[ last ] };
	}
}

function suffixes( cur, end ) {
	var hasObject = false, key = "";

	for ( var node in cur ) {
		if ( typeof cur[ node ] === "object" ) {
			hasObject = true;

			var ret = suffixes( cur[ node ], end );

			if ( ret ) {
				cur[ node ] = ret;
			}
		}

		key += "," + node;
	}

	if ( !hasObject ) {
		if ( end[ key ] ) {
			end[ key ].count++;

		} else {
			end[ key ] = { obj: cur, count: 1 };
		}

		return key;
	}
}

function finishSuffixes( cur, keepEnd, end ) {
	for ( var node in cur ) {
		var val = cur[ node ];

		if ( typeof val === "object" ) {
			finishSuffixes( val, keepEnd, end );

		} else if ( typeof val === "string" ) {
			cur[ node ] = keepEnd[ val ] || end[ val ].obj;
		}
	}
}
