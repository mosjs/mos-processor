'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const m = require('markdownscript')
const mos = require('.')
const plugiator = require('plugiator')

describe('mos', () => {
  describe.skip('use', () => {
    it('should register mos plugin', done => {
      const processor = mos().use(md => ({ foo: 'foo' }))
      return processor.process('<!--@foo--><!--/@-->', {filePath: __filename})
        .then(newmd => {
          expect(newmd).to.eq('<!--@foo-->\nfoo\n<!--/@-->\n')
          done()
        })
        .catch(done)
    })
  })

  it.skip('should process AST', done => {
    const ast = m('markdownScript', { code: 'foo' }, [])
    const processor = mos()
    return processor
      .register([
        plugiator.anonymous(mos => mos.extendScope(md => ({ foo: 'foo' }))),
      ])
      .then(() => processor.process(ast, {filePath: __filename}))
      .then(newmd => {
        expect(newmd).to.eq('<!--@foo-->\nfoo\n<!--/@-->')
        done()
      })
      .catch(done)
  })
})
