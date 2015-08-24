'use strict'

var rules = require('./rules')

function lint(code) {

  var result = {}
  var aggregates = {}
  var linting = true

  rules.forEach(function(rule, index) {
    aggregates[index] = rule.seed
  })

  code.split('\n').forEach(function(line, lineNumber) {

    var hasOff = line.indexOf('minilint:' + 'off') >= 0
    var hasOn = line.indexOf('minilint:' + 'on') >= 0
    if(hasOn && hasOff) {
      var error = 'Found minilint on and off in the same line: ' + lineNumber
      throw new Error(error)
    }
    if(hasOff) linting = false
    if(hasOn) linting = true
    if(!linting) return

    var lineLint = lintLine(rules, line, aggregates)
    if(lineLint.length)
      result[lineNumber] = { line: line, lint: lineLint }
  })

  return result
}

function lintLine(rules, line, aggregates) {
  var result = rules
    .filter(function(rule, index) {
      return rule.check(line, aggregates[index])
    })

  rules.forEach(function(rule, index) {
    aggregates[index] = rule.reduce && rule.reduce(line, aggregates[index])
  })

  return result
}

module.exports = lint
