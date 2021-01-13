#!/usr/bin/env node

import * as fs from 'fs'
import { convertText } from '.'

const argv = process.argv.slice(2)

const files: (string | 0)[] = argv.filter(a => !/^-/.test(a))
if (!files.length) files.push(0)

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')
  process.stdout.write(convertText(text))
  process.stdout.write('\n')
}
