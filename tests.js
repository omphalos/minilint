'use strict'

var minilint = require('./minilint')

exports['should check strict mode'] = function(t) {
  t.ok(!lint('').contains('strict mode'))
  t.ok(!lint('\n\n\n').contains('strict mode'))
  t.ok(!lint(function() { 'use strict' }).contains('strict mode'))
  t.ok(lint(function() { 'hello' }).contains('strict mode'))
  t.done()
}

exports['should check file line count'] = function(t) {
  t.ok(!lint(nLines(500)).contains('file max'))
  t.ok(lint(nLines(501)).contains('file max'))
  t.done()
  function nLines(n) {
    return Array(n + 1).join('\n')
  }
}

exports['should check char count'] = function(t) {
  t.ok(!lint(nChars(80)).contains('char max'))
  t.ok(lint(nChars(81)).contains('char max'))
  t.done()
  function nChars(n) {
    return Array(n + 1).join('c')
  }
}

exports['should check starting whitespace limit'] = function(t) {
  t.ok(!lint('\n      x').contains('indent max'))
  t.ok(lint('\n        x').contains('indent max'))
  t.done()
}

exports['should check indentation size'] = function(t) {
  t.ok(!lint('x').contains('indent size'))
  t.ok(!lint('\n  \n    x').contains('indent size'))
  t.ok(!lint('\n  \n    x\nx').contains('indent size'))
  t.ok(lint('\n x').contains('indent size'))
  t.ok(lint('\n   x').contains('indent size'))
  t.done()
}

exports['should check tabs'] = function(t) {
  t.ok(!lint('abc').contains('tab'))
  t.ok(lint('\tabc').contains('tab'))
  t.ok(lint('tab\t').contains('tab'))
  t.done()
}

exports['should check block'] = function(t) {
  t.ok(!lint(nBlock(40)).contains('block max'))
  t.ok(lint(nBlock(41)).contains('block max'))
  t.done()
  function nBlock(n) {
    return '{\n' + Array(n + 1).join('  \n') + '}'
  }
}

exports['should check line-ending symbols'] = function(t) {
  t.ok(lint('abc&').contains('eol-&'))
  t.ok(lint('abc|').contains('eol-|'))
  t.ok(lint('abc>').contains('eol->'))
  t.ok(lint('abc<').contains('eol-<'))
  t.ok(lint('abc%').contains('eol-%'))
  t.ok(lint('abc?').contains('eol-?'))
  t.ok(lint('abc;').contains('eol-;'))
  t.ok(lint('abc=').contains('eol-='))
  t.ok(lint('abc+').contains('eol-+'))
  t.ok(lint('abc-').contains('eol--'))
  t.ok(lint('abc/').contains('eol-/'))
  t.ok(lint('abc*').contains('eol-*'))
  t.ok(lint('abc ').contains('eol- '))
  t.ok(!lint('abc').contains('eol-&'))
  t.ok(!lint('abc').contains('eol-|'))
  t.ok(!lint('abc').contains('eol->'))
  t.ok(!lint('abc').contains('eol-<'))
  t.ok(!lint('abc').contains('eol-%'))
  t.ok(!lint('abc').contains('eol-?'))
  t.ok(!lint('abc').contains('eol-:'))
  t.ok(!lint('abc').contains('eol-;'))
  t.ok(!lint('abc').contains('eol-='))
  t.ok(!lint('abc').contains('eol-+'))
  t.ok(!lint('abc').contains('eol--'))
  t.ok(!lint('abc').contains('eol-/'))
  t.ok(!lint('abc').contains('eol-*'))
  t.ok(!lint('abc').contains('eol- '))
  t.ok(!lint('abc++').contains('eol-+'))
  t.ok(!lint('abc--').contains('eol--'))
  t.ok(!lint('abc//').contains('eol-/'))
  t.ok(!lint('abc/*').contains('eol-/'))
  t.ok(!lint('abc*/').contains('eol-*'))
  t.done()
}

exports['should check line-starting symbols'] = function(t) {
  t.ok(!lint('abc').contains('sol-('))
  t.ok(!lint('abc').contains('sol-['))
  t.ok(lint('(abc').contains('sol-('))
  t.ok(lint('[abc').contains('sol-['))
  t.done()
}

exports['should check TODO'] = function(t) {
  t.ok(!lint('TODO').contains('todo'))
  t.ok(!lint('// abc').contains('TODO'))
  t.ok(lint('// ' + 'TODO').contains('todo'))
  t.ok(lint('  // ' + 'TODO').contains('todo'))
  t.done()
}

exports['should toggle minilint'] = function(t) {
  t.ok(!lint(function() {
    'minilint:off'
    (1)
    'minilint:on'
  }).contains('sol-('))
  // minilint:off
  t.ok(lint(function() {
    (1)
  }).contains('sol-('))
  // minilint:on
  t.ok(lint("'minilint:off'\n"
    + "'minilint:on'\n"
    + "(1)").contains('sol-('))
  t.done()
}

exports['should throw on invalid minilint directive'] = function(t) {
  var thrown
  var code = 'minilint:on'
  code += 'minilint:off'
  try {
    minilint(code)
  } catch(_) {
    thrown = true
  }
  t.ok(thrown)
  t.done()
}

function lint(body) {

  if(typeof body === 'function') {
    var str = body.toString()
    var from = str.indexOf('{')
    var to = str.indexOf('}')
    body = str.substring(from + 1, to - 1).trim()
  }

  var analysis = minilint(body)
  var result = []
  for(var key in analysis) {
    var types = analysis[key].lint.map(function(rule) {
      return rule.type
    })
    result.push.apply(result, types)
  }

  result.contains = function(el) {
    return this.indexOf(el) >= 0
  }

  return result
}
