minilint
========

[![Build Status](https://secure.travis-ci.org/omphalos/minilint.png)](http://travis-ci.org/omphalos/minilint)

`minilint` is a fast and small linter.
It is intended to encourage modularity.

It lints JavaScript with the following rules:

  * Max 500 lines per file
  * Max 80 chars per line
  * Max 40 lines per code block (function, array, etc)
  * Use two spaces, not tabs
  * Max six spaces at the beginning of a line
  * No end-of-line operators or semicolons
  * No opening `(` or `[` at the start of a line
  * Strict mode

I'm experimenting with using this on my projects.
Feel free to use this as well, or not.

Installation
============

    npm install -g minilint

Usage
=====

    minilint <path1> <path2> <...>

Options
=======

    --help -h: show help
    --verbose -v: enable verbose logging
    --exclude -e: exclude all paths appearing after this option

Examples
========

    minilint file.js
    minilint file.js --verbose
    minilint file1.js file2.js file3.js
    minilint "**.*.js" --exclude "node_modules/**"
    minilint "**.*.js" -v -e "node_modules/**"

License
=======

MIT
