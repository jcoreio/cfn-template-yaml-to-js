import * as t from '@babel/types'
import generate from '@babel/generator'
import YAML from 'yaml'
import * as y from 'yaml/types'

function convertPrimitive(
  value: string | number | boolean
): t.StringLiteral | t.NumericLiteral | t.BooleanLiteral {
  switch (typeof value) {
    case 'string':
      return t.stringLiteral(value)
    case 'number':
      return t.numericLiteral(value)
    case 'boolean':
      return t.booleanLiteral(value)
  }
}

function convertKey(
  key: y.Scalar
): t.Identifier | t.StringLiteral | t.NumericLiteral | t.BooleanLiteral {
  const { value } = key
  if (/^[_a-z][_a-z0-9]*$/i.test(value)) {
    return t.identifier(value)
  }
  return convertPrimitive(value)
}

function convertTag(tag: string): t.Identifier | t.StringLiteral {
  switch (tag) {
    case '!Ref':
      return t.identifier('Ref')
    default:
      return t.stringLiteral(tag.replace(/^!/, 'Fn::'))
  }
}

type ConvertOptions = {
  indentation?: number
}

/* eslint-disable @typescript-eslint/no-use-before-define */

export function convertYamlNodeToBabelNodeInner(
  yaml: y.Scalar,
  options?: ConvertOptions
): t.StringLiteral | t.NumericLiteral | t.BooleanLiteral | t.ObjectExpression
export function convertYamlNodeToBabelNodeInner(
  yaml: y.Pair,
  options?: ConvertOptions
): t.ObjectProperty
export function convertYamlNodeToBabelNodeInner(
  yaml: y.YAMLMap,
  options?: ConvertOptions
): t.ObjectExpression
export function convertYamlNodeToBabelNodeInner(
  yaml: y.YAMLSeq,
  options?: ConvertOptions
): t.ArrayExpression
export function convertYamlNodeToBabelNodeInner(
  yaml: y.Node,
  { indentation = 0 }: ConvertOptions = {}
): t.Node {
  switch (yaml.type) {
    case 'PLAIN':
    case 'QUOTE_SINGLE':
    case 'QUOTE_DOUBLE': {
      const { tag, value } = yaml as y.Scalar
      if (tag) {
        return t.objectExpression([
          t.objectProperty(convertTag(tag), convertPrimitive(value)),
        ])
      } else {
        return convertPrimitive(value)
      }
    }
    case 'BLOCK_LITERAL': {
      const { tag, value } = yaml as y.Scalar
      const converted = t.taggedTemplateExpression(
        t.identifier('dedent'),
        t.templateLiteral(
          [
            t.templateElement({
              raw: ('\n' + value)
                .replace(
                  /\n/gm,
                  (match, offset) =>
                    '\n' +
                    '  '.repeat(
                      indentation +
                        (tag ? 2 : 0) +
                        (offset === value.length ? -1 : 0)
                    )
                )
                .replace(/\$\{/g, '\\${'),
            }),
          ],
          []
        )
      )
      return tag
        ? t.objectExpression([t.objectProperty(convertTag(tag), converted)])
        : converted
    }
    case 'MAP': {
      const { items } = yaml as y.YAMLMap
      return t.objectExpression(
        items.map(item =>
          convertYamlNodeToBabelNode(item, { indentation: indentation + 1 })
        )
      )
    }
    case 'SEQ': {
      const { items } = yaml as y.YAMLSeq
      return t.arrayExpression(
        items.map(item =>
          convertYamlNodeToBabelNode(item, { indentation: indentation + 1 })
        )
      )
    }
    case 'PAIR': {
      const { key, value } = yaml as y.Pair
      return t.objectProperty(
        convertKey(key),
        convertYamlNodeToBabelNode(value, { indentation })
      )
    }
  }

  throw new Error(`unsupported YAML node type: ${yaml.type}`)
}

export function convertYamlNodeToBabelNode(
  yaml: y.Scalar,
  options?: ConvertOptions
): t.StringLiteral | t.NumericLiteral | t.BooleanLiteral | t.ObjectExpression
export function convertYamlNodeToBabelNode(
  yaml: y.Pair,
  options?: ConvertOptions
): t.ObjectProperty
export function convertYamlNodeToBabelNode(
  yaml: y.YAMLMap,
  options?: ConvertOptions
): t.ObjectExpression
export function convertYamlNodeToBabelNode(
  yaml: y.YAMLSeq,
  options?: ConvertOptions
): t.ArrayExpression
export function convertYamlNodeToBabelNode(
  yaml: y.Node,
  options?: ConvertOptions
): t.Node {
  const converted = convertYamlNodeToBabelNodeInner(yaml as any, options)
  const { comment, commentBefore } = yaml
  if (comment) {
    for (const line of comment.split(/\r\n?|\n/gm)) {
      t.addComment(converted, 'trailing', line, true)
    }
  }
  if (commentBefore) {
    for (const line of commentBefore.split(/\r\n?|\n/gm).reverse()) {
      t.addComment(converted, 'leading', line, true)
    }
  }
  return converted
}

export function convertText(yaml: string): string {
  const { contents } = YAML.parseDocument(yaml)
  if (!contents) throw new Error('failed to get contents of parsed document')
  const ast = convertYamlNodeToBabelNode(contents as any)
  return generate(ast as any).code
}
