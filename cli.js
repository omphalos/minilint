#!/usr/bin/env node

'use strict'

require('colors')

var glob = require('glob')
var minilint = require('./minilint.js')
var fs = require('fs')
var result = 0
var includePaths = []
var excludePaths = []
var verbose
var excluding

if(process.argv.indexOf('--help') >= 0 || process.argv.indexOf('-h') >= 0) {
  console.log('minilint')
  console.log()
  console.log('usage:')
  console.log()
  console.log('  minilint <path1> <path2> <...>')
  console.log()
  console.log('options:')
  console.log()
  console.log('  --help -h: show this help')
  console.log('  --verbose -v: enable verbose logging')
  console.log('  --exclude -e: exclude all paths appearing after this option')
  console.log()
  console.log('examples:')
  console.log()
  console.log('  minilint file.js')
  console.log('  minilint file.js --verbose')
  console.log('  minilint file1.js file2.js file3.js')
  console.log('  minilint "**.*.js" --exclude "node_modules/**"')
  console.log('  minilint "**.*.js" -v -e "node_modules/**"')
  return process.exit(result)
}

process.argv.slice(1).forEach(function(arg) {
  if(arg === __filename) return
  if(arg === '--exclude' || arg === '-e') return excluding = true
  if(arg === '--verbose' || arg === '-v') return verbose = true
  if(excluding)
    excludePaths.push(unwrap(arg))
  else includePaths.push(unwrap(arg))
})

readSeries('glob', globAndExclude, includePaths, function(globs) {
  var fileNames = globs.reduce(function(prev, curr) {
    return prev.concat(curr.result)
  }, [])
  readSeries('open', fs.readFile.bind(fs), fileNames, onFilesRead)
})

function globAndExclude(pattern, cont) {
  glob(pattern, { ignore: excludePaths }, cont)
}

function onFilesRead(readFiles) {
  readFiles.forEach(lintAndLogFile)
  console.log(
    result ? 'fail'.red : 'pass'.green,
    process.argv.join(' ').blue)
}

function unwrap(arg) {
  var singleQuotes = arg[0] === "'" && arg[1] === "'"
  var doubleQuotes = arg[0] === '"' && arg[1] === '"'
  if(!singleQuotes && !doubleQuotes) return arg
  return arg.substring(1, arg.length - 1)
}

function lintAndLogFile(readFile) {
  var fileName = readFile.arg
  var fileContents = readFile.result.toString()
  var lint = minilint(fileContents)
  var badLineNumbers = Object.keys(lint)
  badLineNumbers.forEach(function(badLine) {
    var lineLint = lint[badLine]
    console.log(fileName.cyan, badLine + ':', lineLint.line.gray)
    lineLint.lint.forEach(function(problem) {
      console.log('> ' + problem.toString().yellow)
    })
  })
  if(badLineNumbers.length) {
    result = 1
    console.log('fail'.red, fileName.cyan)
  } else console.log('pass'.green, fileName.cyan)
}

function readSeries(label, fn, source, cont, accumulator) {
  accumulator = accumulator || []
  if(!source.length) return cont(accumulator)
  if(verbose) console.log(label.gray, source[0].cyan)
  fn(source[0], function(err, result) {
    if(err) throw err
    readSeries(label, fn, source.slice(1), cont, accumulator.concat([{
      arg: source[0],
      result: result
    }]))
  })
}
