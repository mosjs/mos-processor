'use strict'
const mosCore = require('mos-core')
const remi = require('remi')
const hook = require('magic-hook')
const VFile = require('vfile')
const getMarkdownMeta = require('./lib/get-markdown-meta')

module.exports = function mos (md, plugins) {
  plugins = plugins || []
  const defaultOpts = {
    listItemIndent: '1',
  }
  const processor = {
    inlineTokenizers: mosCore.inlineTokenizers.slice(),
    blockTokenizers: mosCore.blockTokenizers.slice(),
    visitors: Object.assign({}, mosCore.visitors),
    parse: hook(opts => {
      return mosCore.parser({
        inlineTokenizers: processor.inlineTokenizers,
        blockTokenizers: processor.blockTokenizers,
        data: mosCore.data,
      })(md.vfile, opts)
    }),
    compile: hook((ast, opts) => {
      return Promise.resolve(mosCore.compiler(processor.visitors)(ast, opts))
    }),
    process: opts => processor
      .parse(Object.assign(md, {vfile: new VFile(md.content)}), opts || defaultOpts)
      .then(ast => {
        return processor.compile(ast, opts || defaultOpts)
      }),
  }

  const register = createRegister(processor)

  return getMarkdownMeta(md.filePath)
    .then(meta => register(plugins.map(plugin => ({ register: plugin, options: Object.assign({}, md, meta) }))))
    .then(() => processor)
}

function createRegister (processor) {
  const registrator = remi(processor)
  registrator.hook(
   require('remi-runner')()
  )
  return registrator.register
}
