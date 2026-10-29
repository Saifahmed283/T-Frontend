/*
 * Security check: fail the build if any console.* call exists in frontend
 * source. Console output can leak data to the browser console and is a
 * security risk in production.
 */

import { readdir } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = join(process.cwd(), 'src')

const CONSOLE_PATTERN = /\bconsole\.(log|error|warn|debug|info|dir|table|group|groupEnd|trace|assert|count|time|timeEnd)\b/

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full)))
    } else if (entry.isFile() && /\.[jt]sx?$/.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

async function main() {
  const files = await walk(ROOT)
  let leaked = 0

  for (const file of files) {
    const content = await readFile(file, 'utf8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (CONSOLE_PATTERN.test(lines[i])) {
        console.error(`SECURITY: console.* found in ${file}:${i + 1}`)
        leaked++
      }
    }
  }

  if (leaked > 0) {
    console.error(`\n${leaked} console.* call(s) found. Remove them before deploying.`)
    process.exit(1)
  }

  console.log('SECURITY: no console.* calls found in frontend source.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
