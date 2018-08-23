#!/usr/bin/env node

import { buildClientSchema } from 'graphql/utilities/buildClientSchema'
import { introspectionQuery } from 'graphql/utilities/introspectionQuery'
import { printSchema } from 'graphql/utilities/schemaPrinter'
import fs from 'fs'
import minimist from 'minimist'

const { version } = require('../package.json')

const usage = `Usage: graphql-introspection-json-to-sdl schema.json > schema.graphql

Prints the GraphQL schema SDL from a GraphQL schema JSON introspection.

Options:
  --version, -v  Print version of graphql-introspection-json-to-sdl`

async function main () {
  const argv = minimist(process.argv.slice(2))

  if (argv['version'] || argv['v']) {
    console.error(version)
    process.exit(0)
  }

  if (argv._.length < 1) {
    console.log(usage)
    process.exit(1)
  }

  const rawdata = fs.readFileSync(argv._[0], {encoding: 'utf8'})
  const rawjson = JSON.parse(rawdata)

  if (typeof rawjson === 'object') {
    if (typeof rawjson['__schema'] === 'object') {
      const data = rawjson
      const schema = buildClientSchema(data)
      console.log(printSchema(schema))
    } else if (typeof rawjson['data'] === 'object' && typeof rawjson['errors'] === 'undefined') {
      const data = rawjson['data']
      const schema = buildClientSchema(data)
      console.log(printSchema(schema))
    } else if (typeof rawjson['errors'] === 'object') {
      throw new Error(JSON.stringify(rawjson['errors'], null, 2))
    } else {
      throw new Error('No "data" key found in JSON object')
    }
  } else {
    throw new Error('Invalid JSON object')
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
