/* eslint-env mocha */

import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as fs from 'fs'
import { convertText } from '../src/index'
import path from 'path'

describe('convertText', () => {
  it('works', () => {
    const converted = convertText(
      fs.readFileSync(path.resolve(__dirname, 'example.yaml'), 'utf8')
    )
    expect(converted).to.equal(
      fs.readFileSync(path.resolve(__dirname, 'example-expected.txt'), 'utf8')
    )
  })
})
