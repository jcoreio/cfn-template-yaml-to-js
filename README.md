# cfn-template-yaml-to-js

[![CircleCI](https://circleci.com/gh/jcoreio/cfn-template-yaml-to-js.svg?style=svg)](https://circleci.com/gh/jcoreio/cfn-template-yaml-to-js)
[![Coverage Status](https://codecov.io/gh/jcoreio/cfn-template-yaml-to-js/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/cfn-template-yaml-to-js)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/cfn-template-yaml-to-js.svg)](https://badge.fury.io/js/cfn-template-yaml-to-js)

Converts AWS CloudFormation templates written in yaml directly to JS object expressions.

Note: block literals will be converted to `` dedent`...` `` tagged template literals; you will need to
import `dedent` or `dedent-js` into the file using them.

# Disclaimer

I wrote this package hastily, so it's possible it won't work on some templates. Feel free to open an issue
if you run into any problems.

# Usage

```
npm i -g cfn-template-yaml-to-js

## CLI

```

# read from file, print to stdout

cfn-template-yaml-to-js template.yaml

# read from file, output to file

cfn-template-yaml-to-js template.yaml > file.js

# read from stdin, print to stdout

cat template.yaml | cfn-template-yaml-to-js

```

```
