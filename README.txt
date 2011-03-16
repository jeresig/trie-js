A Simple JavaScript Trie Generator
  By John Resig

Copyright 2011 John Resig
MIT Licensed

All code is designed to work in Node.js.

To build an optimized Trie run:

  node build-trie.js > dict/suffix.js

To dump a full dictionary of words from the Trie do:

  node dump-trie.js

A sample function for finding a word in the Trie
can be see in util.js, named findTrieWord.