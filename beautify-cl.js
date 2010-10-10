/*jslint adsafe: false, bitwise: true, browser: true, cap: false, css: false,
  debug: false, devel: true, eqeqeq: true, es5: false, evil: true,
  forin: false, fragment: false, immed: true, laxbreak: false, newcap: true,
  nomen: false, on: false, onevar: true, passfail: false, plusplus: true,
  regexp: false, rhino: true, safe: false, strict: true, sub: false,
  undef: true, white: false, widget: false, windows: false */
/*global process: false, require: false */
"use strict";

/*

 JS Beautifier node command line script
----------------------------------------

  Ported to use node by Carlo Zottmann, <carlo@municode.de>.  Original Rhino
  version written by Patrick Hof, <patrickhof@web.de>.

  This script is to be run with node[1] on the command line.

  Usage:
    node beautify-cl.js

  You are free to use this in any way you want, in case you find this useful or working for you.

  [1] http://nodejs.org/

*/

( function() {
  
  var fs = require( "fs" ),
    sys = require( "sys" ),
    http = require( "http" ),
    url = require( "url" ),
    options,
    result = "";


  function printUsage() {
    sys.puts( [
      "Usage: node beautify-cl.js [options] [file || URL]",
      "",
      "Reads from standard input if no file or URL is specified.",
      "",
      "Options:",
      "-i NUM\tIndent size (1 for TAB)",
      "-b\tPut braces on own line (Allman / ANSI style)",
      "-a\tIndent arrays",
      "-n\tPreserve newlines",
      "-p\tJSLint-pedantic mode, currently only adds space between \"function ()\"",
      "-d\tDirectory where the js-beautify scripts are installed.",
      "",
      "-h\tPrint this help",
      "",
      "Examples:",
      "  beautify-cl.js -i 2 example.js",
      "  beautify-cl.js -i 1 http://www.example.org/example.js"
    ].join( "\n" ) );
  }


  function parseOpts(args) {
    var options = [],
      param;

    args.shift();
    args.shift();

    while (args.length > 0) {
      param = args.shift();

      if (param.substr(0, 1) === '-') {
        switch (param) {
          case "-i":
            options.indent = args.shift();
            break;

          case "-b":
            options.braces_on_own_line = true;
            break;

          case "-a":
            options.keep_array_indentation = false;
            break;

          case "-p":
            options.jslint_pedantic = true;
            break;

          case "-n":
            options.preserve_newlines = true;
            break;

          case "-d":
            options.install_dir = args.shift();
            break;

          case "-h":
            printUsage();
            process.exit();
            break;

          default:
            console.info("Unknown parameter: " + param + "\n");
            console.info("Aborting.");
            process.exit();
        }
      }
      else {
        options.source = param;
      }
    }

    return options;
  }


  function beautifySource( sourceFile ) {
    var line,
      indent_size = options.indent || 2,
      indent_char = ( indent_size === 1 ) ? "\t" : " ";

    sourceFile = sourceFile.replace( /^\s+/, "" );

    if ( sourceFile && sourceFile[0] === "<" ) {
      sys.puts( "HTML files not supported." );
      process.exit( 0 );
    }
    else {
      result = js_beautify( sourceFile, {
        indent_size: indent_size,
        indent_char: indent_char,
        preserve_newlines: !!options.preserve_newlines,
        space_after_anon_function: options.jslint_pedantic,
        keep_array_indentation: options.keep_array_indentation,
        braces_on_own_line: options.braces_on_own_line
      });
    }

    // Trying to output `result` in one go had funny side effects on OSX.
    // Writing to a file would work fine, but the raw console output (printed
    // on screen) was truncated.  Really weird.  So, line by line it is.
    
    result.split( "\n" ).forEach( function( line, index, array ) {
      sys.puts( line );
    });
  }


  function getSourceFile() {
    var req,
      sourceFile = "",
      sURL;

    if ( options.source ) {
      if ( options.source.substring( 0, 4 ) === "http" ) {
        // remote file
        sURL = url.parse( options.source );
        req = http
          .createClient( ( sURL.port || 80 ), sURL.host )
          .request( "GET", sURL.pathname + ( sURL.search || "" ), { host: sURL.hostname });
        req.end();
        req.on( "response", function( response ) {
          response.setEncoding( "utf8" );
          response
            .on( "data", function( chunk ) {
              sourceFile += chunk;
            })
            .on( "end", function() {
              beautifySource( sourceFile );
            });

          // TODO: error handling
        });
      }
      else {
        // local file
        sourceFile = fs.readFileSync( options.source, "utf-8" );
        beautifySource( sourceFile );
      }
    }
    else {
      // TODO: read STDIN
      /*
      importPackage(java.io);
      importPackage(java.lang);
      var stdin = new BufferedReader(new InputStreamReader(System['in']));
      var lines = [];

      // read stdin buffer until EOF
      while (stdin.ready()) {
        lines.push(stdin.readLine());
      }

      if (lines.length) {
        sourceFile = lines.join("\n");
      }

      if (!lines.length) {
        printUsage();
        process.exit( 1 );
      }
      */
    }
  }


  options = parseOpts( process.argv );

  if (options.install_dir) {
    eval( fs.readFileSync( options.install_dir + "/beautify.js", "utf-8" ) );
  }
  else {
    eval( fs.readFileSync("beautify.js", "utf-8") );
  }

  getSourceFile();
  
}() );
