/*
 A Succinct Trie for Javascript - http://stevehanov.ca/blog/index.php?id=120

 By Steve Hanov
 Released to the public domain.

 This file contains functions for creating a succinctly encoded trie structure
 from a list of words. The trie is encoded to a succinct bit string using the
 method of Jacobson (1989). The bitstring is then encoded using BASE-64. 
 
 The resulting trie does not have to be decoded to be used. This file also
 contains functions for looking up a word in the BASE-64 encoded data, in
 O(mlogn) time, where m is the number of letters in the target word, and n is
 the number of nodes in the trie.

 Objects for encoding:

 TrieNode
 Trie
 BitWriter

 Objects for decoding:
 BitString
 FrozenTrie

 QUICK USAGE:

 Suppose we let data be some output of the demo encoder:

 var data = {
    "nodeCount": 37,
    "directory": "BMIg",
    "trie": "v2qqqqqqqpIUn4A5JZyBZ4ggCKh55ZZgBA5ZZd5vIEl1wx8g8A"
 };

 var frozenTrie = new FrozenTrie( Data.trie, Data.directory, Data.nodeCount);

 alert( frozenTrie.lookup( "hello" ) ); // outputs true
 alert( frozenTrie.lookup( "kwijibo" ) ); // outputs false

*/   



/**
    The width of each unit of the encoding, in bits. Here we use 6, for base-64
    encoding.
    Math.log(64)/Math.LN2
 */
var W = 6;

/**
    Fixed values for the L1 and L2 table sizes in the Rank Directory
*/
var L1 = 32*32;
var L2 = 32;

var arr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("")
  , map = {}

for(var i=0;i<64;map[arr[i]]=i++);


/**
    The BitWriter will create a stream of bytes, letting you write a certain
    number of bits at a time. This is part of the encoder, so it is not
    optimized for memory or speed.
*/
function BitWriter() {
	this.bits = []
}

BitWriter.prototype = {
  /**
  		Write some data to the bit string. The number of bits must be 32 or fewer.
  */
  write: function( data, numBits ) {
  	for( var i = numBits - 1; i >= 0; i-- ) {
  		if ( data & ( 1 << i ) ) {
  			this.bits.push(1);
  		} else {
  			this.bits.push(0);
  		}
  	}
  }

  /**
  		Get the bitstring represented as a javascript string of bytes
  */
, getData: function() {
  	var chars = [], b = 0, i = 0, j = 0

  	for ( ; j < this.bits.length; j++ ) {
  		b = ( b << 1 ) | this.bits[j];
  		i += 1;
  		if ( i === W ) {
  			chars.push( arr[b] );
  			i = b = 0;
  		}
  	}

  	if ( i ) {
  		chars.push( arr[b << ( W - i )] );
  	}

  	return chars.join("");
  }

  /**
  		Returns the bits as a human readable binary string for debugging
  */
, getDebugString: function(group) {
  	var chars = [], i = 0, j = 0

  	for( ; j < this.bits.length; j++ ) {
  		chars.push( "" + this.bits[j] );
  		i++;
  		if ( i === group ) {
  			chars.push( ' ' );
  			i = 0;
  		}
  	}

  	return chars.join("");
  }
};



/**
    Given a string of data (eg, in BASE-64), the BitString class supports
    reading or counting a number of bits from an arbitrary position in the
    string.
*/
function BitString( str ) {
	this.bytes = str.split("");
	this.length = str.length * W;
}

var BitsInByte = [ 
		0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5
	, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6
	, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6
	, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7
	, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6
	, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7
	, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7
	, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7, 4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 7, 6, 7, 7, 8 ]
var MaskTop= [ 0x3f, 0x1f, 0x0f, 0x07, 0x03, 0x01, 0x00 ]

BitString.prototype = {

	/**
			Returns a decimal number, consisting of a certain number, n, of bits
    	starting at a certain position, p.
  */
  get: function( p, n ) {
  	var mod = p % W
  	  , result = map[ this.bytes[ p / W | 0 ] ] & MaskTop[ mod ]
  	  , l = W - mod;

  	// case 1: bits lie within the given byte
  	if ( mod + n <= W ) return result >> ( l - n );

  	// case 2: bits lie incompletely in the given byte

		p += l;
		n -= l;

		while ( n >= W ) {
			result = (result << W) | map[ this.bytes[ p / W | 0 ] ];
			p += W;
			n -= W;
		}

		if ( n > 0 ) return (result << n) | ( map[ this.bytes[ p / W | 0 ] ] >> ( W - n ) );

		return result;
  }

  /**
  		Counts the number of bits set to 1 starting at position p and
  		ending at position p + n
  */
, count: function( p, n ) {
		var count = 0;
		while( n >= 8 ) {
			count += BitsInByte[ this.get( p, 8 ) ];
			p += 8;
			n -= 8;
		}

		return count + BitsInByte[ this.get( p, n ) ];
	}

	/**
			Returns the number of bits set to 1 up to and including position x.
			This is the slow implementation used for testing.
	*/
, rank: function( x ) {
		var rank = 0;
		for( var i = 0; i <= x; i++ ) {
			if ( this.get(i, 1) ) {
				rank++;
			}
		}
		return rank;
	}
};

/**
    The rank directory allows you to build an index to quickly compute the
    rank() and select() functions. The index can itself be encoded as a binary
    string.
 */
function RankDirectory( directoryData, bitData, numBits, l1Size, l2Size ) {
        this.directory = new BitString( directoryData );
        this.data = new BitString( bitData );
        this.l1Size = l1Size;
        this.l2Size = l2Size;
        this.l1Bits = Math.ceil( Math.log( numBits ) / Math.log( 2 ) );
        this.l2Bits = Math.ceil( Math.log( l1Size ) / Math.log( 2 ) );
        this.sectionBits = (l1Size / l2Size - 1) * this.l2Bits + this.l1Bits;
        this.numBits = numBits;
}

/**
    Used to build a rank directory from the given input string.

    @param data A javascript string containing the data, as readable using the
    BitString object.

    @param numBits The number of bits to index.
    
    @param l1Size The number of bits that each entry in the Level 1 table
    summarizes. This should be a multiple of l2Size.

    @param l2Size The number of bits that each entry in the Level 2 table
    summarizes.
 */
RankDirectory.Create = function( data, numBits, l1Size, l2Size ) {
    var bits = new BitString( data );
    var p = 0;
    var i = 0;
    var count1 = 0, count2 = 0;
    var l1bits = Math.ceil( Math.log( numBits ) / Math.log(2) );
    var l2bits = Math.ceil( Math.log( l1Size ) / Math.log(2) );

    var directory = new BitWriter();

    while( p + l2Size <= numBits ) {
        count2 += bits.count( p, l2Size );
        i += l2Size;
        p += l2Size;
        if ( i === l1Size ) {
            count1 += count2;
            directory.write( count1, l1bits );
            count2 = 0;
            i = 0;
        } else {
            directory.write( count2, l2bits );
        }
    }

    return new RankDirectory( directory.getData(), data, numBits, l1Size, l2Size );
};


RankDirectory.prototype = {


    /**
        Returns the string representation of the directory.
     */
    getData: function() {
        return this.directory.bytes;
    },

    /**
      Returns the number of 1 or 0 bits (depending on the "which" parameter) to
      to and including position x.
      */
    rank: function( which, x ) {

        if ( which === 0 ) return x - this.rank( 1, x ) + 1;

        var rank = 0;              
        var o = x;
        var sectionPos = 0;

        if ( o >= this.l1Size ) {
            sectionPos = ( o / this.l1Size | 0 ) * this.sectionBits;
            rank = this.directory.get( sectionPos - this.l1Bits, this.l1Bits );
            o = o % this.l1Size;
        }

        if ( o >= this.l2Size ) {
            sectionPos += ( o / this.l2Size | 0 ) * this.l2Bits;
            rank += this.directory.get( sectionPos - this.l2Bits, this.l2Bits );
        }

        rank += this.data.count( x - x % this.l2Size, x % this.l2Size + 1 );

        return rank;
    },

    /**
      Returns the position of the y'th 0 or 1 bit, depending on the "which"
      parameter.
      */
    select: function( which, y ) {
        var high = this.numBits;
        var low = -1;
        var val = -1;

        while ( high - low > 1 ) {
            var probe = ((high + low) / 2) | 0;
            var r = this.rank( which, probe );

            if ( r === y ) {
                // We have to continue searching after we have found it,
                // because we want the _first_ occurrence.
                val = probe;
                high = probe;
            } else if ( r < y ) {
                low = probe;
            } else {
                high = probe;
            }
        }
        //alert(val)

        return val;
    }
};

/**
  A Trie node, for use in building the encoding trie. This is not needed for
  the decoder.
  */
function TrieNode( letter ) {
    this.letter = letter;
    this.final = false;
    this.children = [];
}

function Trie() {
	this.previousWord = "";
	this.root = new TrieNode(' ');
	this.cache = [ this.root ];
	this.nodeCount = 1;
}

Trie.prototype = {


    /**
      Inserts a word into the trie. This function is fastest if the words are
      inserted in alphabetical order.
     */
    insert: function( word ) {      

        var commonPrefix = 0;
        for( var i = 0; i < Math.min( word.length, this.previousWord.length );
                i++ )
        {
            if ( word[i] !== this.previousWord[i] ) { break; }
            commonPrefix += 1;
        }

        this.cache.length = commonPrefix + 1;
        var node = this.cache[ this.cache.length - 1 ];

        for( i = commonPrefix; i < word.length; i++ ) {
            var next = new TrieNode( word[i] );
            this.nodeCount++;
            node.children.push( next );
            this.cache.push( next );
            node = next;
        }

        node.final = true;
        this.previousWord = word;
    },

    /**
      Apply a function to each node, traversing the trie in level order.
      */
    apply: function( fn ) {
        var level = [ this.root ];
        while( level.length > 0 ) {
            var node = level.shift();
            for( var i = 0; i < node.children.length; i++ ) {
                level.push( node.children[i] );
            }
            fn( node );
        }

    },

    /**
      Encode the trie and all of its nodes. Returns a string representing the
      encoded data.
      */
    encode: function() {
        // Write the unary encoding of the tree in level order.
        var bits = new BitWriter();
        bits.write( 0x02, 2 );
        this.apply( function( node ) {
            for( var i = 0; i < node.children.length; i++ ) {
                bits.write( 1, 1 );
            }
            bits.write( 0, 1 );
        });

        // Write the data for each node, using 6 bits for node. 1 bit stores
        // the "final" indicator. The other 5 bits store one of the 26 letters
        // of the alphabet.
        var a = ("a").charCodeAt(0);
        this.apply( function( node ) {
            var value = node.letter.charCodeAt(0) - a;
            if ( node.final ) {
                value |= 0x20;
            }

            bits.write( value, 6 );
        });

        return bits.getData();
    }
};



/**
    The FrozenTrie is used for looking up words in the encoded trie.

    @param data A string representing the encoded trie.

    @param directoryData A string representing the RankDirectory. The global L1
    and L2 constants are used to determine the L1Size and L2size.

    @param nodeCount The number of nodes in the trie.
  */

function FrozenTrie( data, directoryData, nodeCount ) {
	this.data = new BitString( data );
	this.directory = new RankDirectory( directoryData, data, nodeCount * 2 + 1, L1, L2 );

	// The position of the first bit of the data in 0th node. In non-root
	// nodes, this would contain 6-bit letters.
	this.letterStart = nodeCount * 2 + 1;
}

FrozenTrie.prototype = {

  /**
  		Look-up a word in the trie. Returns true if and only if the word exists
  		in the trie.
  */

  lookup: function( word ) {
		var t = this, mid = 0, i = 0, len = word.length, a = "a".charCodeAt(0)

		for (;i < len; i++ ) {
			var find = word.charAt(i)
			  , lo = t.directory.select( 0, mid+1 ) - mid
			  , hi = t.directory.select( 0, mid+2 ) - mid - 2;

			while ( lo <= hi ) {
				mid = ((hi + lo)/2)>>>0
				var found = String.fromCharCode( t.data.get( t.letterStart + mid * 6 + 1, 5 ) + a );
				if ( found === find ) break
				if ( found > find ) hi = mid - 1
				else lo = mid + 1
			}
			if (lo>hi) return false
		}
  	return t.data.get( t.letterStart + mid * 6, 1 ) === 1;
	}
};

/**************************************************************************************************
  DEMONSTATION APPLICATION FUNCTIONS
  *************************************************************************************************

/**
  Load a dictionary asynchronously.
  *
function loadDictionary() 
{
    var xmlHttpReq;
    try {
       xmlHttpReq = new XMLHttpRequest();
    } catch ( trymicrosoft ) {
        try {
            xmlHttpReq = new ActiveXObject("Msxml2.XMLHTTP");
        } catch(othermicrosoft) {
            try {
                xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
            } catch(failed) {
                xmlHttpReq = null;
            }
        }
    }

    strUrl = "ospd3.txt";

    xmlHttpReq.open("GET", "ospd3.txt", true);
    xmlHttpReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlHttpReq.onreadystatechange = function() {
        if (xmlHttpReq.readyState === 4) {
            if (xmlHttpReq.status === 200 ) {
                document.getElementById("input").value =
                    xmlHttpReq.responseText;
            } else if ( xmlHttpReq.message ) {
                alert( xmlHttpReq.message );
            } else {
                alert( "Network error. Check internet connection" );
            }
        }
    };

    xmlHttpReq.send("");
}

/**
  Encode the trie in the input text box.
  *
function go()
{
    // create a trie
    var trie = new Trie();

    // split the words of the input up. Sort them for faster trie insertion.
    var words = document.getElementById("input").value.split(/\s+/);
    words.sort();
    var regex = /^[a-z]+$/;
    for ( var i = 0; i < words.length; i++ ) {
        // To save space, our encoding handles only the letters a-z. Ignore
        // words that contain other characters.
        var word = words[i].toLowerCase();
        if ( word.match( /^[a-z]+$/ ) ) {
            trie.insert( word );
        }

    }

    // Encode the trie.
    var trieData = trie.encode();

    // Encode the rank directory
    var directory = RankDirectory.Create( trieData, trie.nodeCount * 2 + 1, L1, L2 );
    var output;
    
    output = '{\n    "nodeCount": ' + trie.nodeCount + ",\n";
    
    output += '    "directory": "' + directory.getData() + '",\n';
    
    output += '    "trie": "' + trieData + '"\n';
    output += "}\n";

    document.getElementById("output").value = output;

    document.getElementById("encodeStatus").innerHTML = 
        "Encoded " + document.getElementById("input").value.length + 
        " bytes to " + output.length + " bytes.";

}

/**
  Decode the data in the output textarea, and use it to check if a word exists
  in the dictionary.
  *
function lookup()
{
    var status = "";
    try 
    {
        var json = eval( '(' + document.getElementById("output").value + ")" );
        var ftrie = new FrozenTrie( json.trie, json.directory, json.nodeCount
                );
        var word = document.getElementById("lookup").value;
        if ( ftrie.lookup( document.getElementById("lookup").value ) ) {
            status = '"' + word + "' is in the dictionary.";
        } else {
            status = '"' + word + "' IS NOT in the dictionary.";
        }
    } catch ( e ) {
        status = "Error. Have you encoded the dictionary yet?";
    }

    document.getElementById("status").innerHTML = status;

}
*/


/** Tests
!function(){
	var data = {
    "nodeCount": 37,
    "directory": "BMIg",
    "trie": "v2qqqqqqqpIUn4A5JZyBZ4ggCKh55ZZgBA5ZZd5vIEl1wx8g8A"
  };
  var frozenTrie = new FrozenTrie( data.trie, data.directory, data.nodeCount);

  TestCase("Succinct Trie").compare(
    frozenTrie.lookup( "hello" )
  , true
  , frozenTrie.lookup( "hel" )
  , false
  , frozenTrie.lookup( "helloo" )
  , false
  ).done()

}()
//*/




if ( typeof exports !== "undefined" ) {
	exports.Trie = Trie;
	exports.FrozenTrie = FrozenTrie;
	exports.RankDirectory = RankDirectory;
}
