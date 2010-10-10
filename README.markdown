# JS Beautifier, node.js version

A fork of
[github.com/einars/js-beautify](http://github.com/einars/js-beautify) to make
it fit into my node.js setup while removing all the things I don't need
(YMMV).


### Usage

Beautify from the command line:

    node beautify-node.js [options] [file || URL || STDIN]


### Requirements

* node.js


### Acknowledgements

The original [JS Beautifier](http://github.com/einars/js-beautify) is written by [Einar Lielmanis](mailto:einar@jsbeautifier.org).  The core file `beautify.js` is virtually unchanged; I've only cleaned it up so I could lint it with my default JSLint settings should I decide to enhance it.

I threw out pretty much everything else as I don't need it.


### License

MIT-License, see `LICENSE.txt`.
