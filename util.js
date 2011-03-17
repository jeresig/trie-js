var dict;

exports.buildTrie = function( txt ) {
	return (dict = eval( "(" + txt + ")" ));
};

exports.buildStringDict = function( txt ) {
	return (dict = " " + txt + " ");
};

exports.buildHashDict = function( txt ) {
	var words = txt.split(" "),
		tmp = {};
	
	for ( var i = 0, l = words.length; i < l; i++ ) {
		tmp[ words[i] ] = true;
	}

	return (dict = tmp);
};

exports.findTrieWord = function findTrieWord( word, cur ) {
	cur = cur || dict;

	for ( var node in cur ) {
		if ( word.indexOf( node ) === 0 ) {
			var val = typeof cur[ node ] === "number" && cur[ node ] ?
				dict.$[ cur[ node ] ] :
				cur[ node ];

			if ( node.length === word.length ) {
				return val === 0 || val.$ === 0;

			} else {
				return findTrieWord( word.slice( node.length ), val );
			}
		}
	}

	return false;
};

exports.findStringWord = function( word ) {
	return dict.indexOf( " " + word + " " ) > -1;
};

exports.findHashWord = function( word ) {
	return !!dict[ word ];
};