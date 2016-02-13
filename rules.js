'use strict'

function Rule(props) {
  for(var p in props)
    this[p] = props[p]
}

Rule.prototype.toString = function() {
  return this.text.replace('$', this.limit)
}

var rules = [new Rule({
  type: 'strict mode',
  text: "First line should be 'use strict'",
  seed: true,
  reduce: function(line, prev) {
    return this.isIgnorable(line) ? prev : false
  },
  isIgnorable: function(line) {
    return !line || line[0] === '#'
  },
  check: function(line, isFirstLine) {
    return !this.isIgnorable(line) && isFirstLine && line !== "'use strict'"
  }
}), new Rule({
  type: 'file max',
  text: 'Exceeded $ file lines',
  limit: 500,
  seed: 0,
  reduce: function(line, prev) { return prev + 1 },
  check: function(lines, lineCount) { return lineCount === this.limit + 1 }
}), new Rule({
  type: 'char max',
  text: 'Exceeded $ chars:',
  limit: 80,
  check: function(line) { return line.length > this.limit }
}), new Rule({
  type: 'indent max',
  text: 'Exceeded $ whitespaces at line start',
  limit: 6,
  check: function(line) {
    var result = getIndentLength(line) > this.limit
    return result
  }
}), new Rule({
  type: 'indent size',
  text: 'Indentation should be $ spaces',
  limit: 2,
  seed: 0,
  reduce: function(line, prev) {
    return line.length ? getIndentLength(line) : prev
  },
  check: function(line, lastLineIndent) {
    var indentChange = getIndentLength(line) - lastLineIndent
    var result = indentChange > 0 && indentChange !== this.limit
    return result
  }
}), new Rule({
  type: 'tab',
  text: 'Found tab character',
  check: function(line) { return line.indexOf('\t') >= 0 }
}), new Rule({
  type: 'block max',
  text: 'Exceeded $ lines in code block',
  limit: 40,
  seed: { lineNumber: 1, blockLength: 0, isBlock: false },
  reduce: function(line, prev) {

    var next = { lineNumber: prev.lineNumber + 1 }
    if(!line.length) {
      next.isBlock = prev.isBlock
      next.blockLength = prev.blockLength + (prev.isBlock ? 1 : 0)
      return next
    }

    var indent = getIndentLength(line)
    if(!indent) {
      next.isBlock = false
      next.blockLength = 0
      return next
    }

    next.isBlock = true
    next.blockLength = prev.blockLength + 1
    return next
  },
  check: function(line, accumulator) {
    return accumulator.blockLength === this.limit + 1
  }
}), new Rule({
  type: 'todo',
  text: 'Found "// ' + 'TODO"',
  check: function(line) {
    return line.indexOf('// ' + 'TODO') >= 0
  }
})]

'&|><%?;= '.split('').forEach(function(token) {
  rules.push(new Rule({
    type: 'eol-' + token,
    text: 'Found "' + token + '" at line end',
    check: function(line) {
      return line[line.length - 1] === token
    }
  }))
})

;[{ notOk: '+', ok: ['++'] },
  { notOk: '-', ok: ['--'] },
  { notOk: '*', ok: ['/*'] },
  { notOk: '/', ok: ['*/', '//'] },
].forEach(function(pattern) {
  rules.push(new Rule({
    type: 'eol-' + pattern.notOk,
    text: 'Found "' + pattern.notOk + '" at line end',
    check: function(line) {
      var trimmed = line.trim()
      var last1 = trimmed[trimmed.length - 1]
      var last2 = trimmed.substring(trimmed.length - 2)
      return last1 === pattern.notOk && pattern.ok.indexOf(last2) < 0
    }
  }))
})

'(['.split('').forEach(function(token) {
  rules.push(new Rule({
    type: 'sol-' + token,
    text: 'Found "' + token + '" line start',
    check: function(line) { return line.trim()[0] === token }
  }))
})

module.exports = rules

function getIndentLength(line) {
  return line.length - line.replace(/^\s+/, '').length
}
