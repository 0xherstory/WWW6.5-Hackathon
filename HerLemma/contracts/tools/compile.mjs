import fs from 'node:fs'
import path from 'node:path'
import solc from 'solc'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const SRC_DIR = path.join(ROOT, 'src')
const ARTIFACTS_DIR = path.join(ROOT, 'artifacts')

function findSolFiles(dir) {
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.sol'))
    .map((name) => path.join(dir, name))
}

function makeInput() {
  const sources = {}
  for (const filePath of findSolFiles(SRC_DIR)) {
    const relative = path.relative(ROOT, filePath).replaceAll(path.sep, '/')
    sources[relative] = { content: fs.readFileSync(filePath, 'utf8') }
  }

  return {
    language: 'Solidity',
    sources,
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object']
        }
      }
    }
  }
}

function compile() {
  const input = makeInput()
  const output = JSON.parse(solc.compile(JSON.stringify(input)))

  if (output.errors?.length) {
    const fatal = output.errors.filter((entry) => entry.severity === 'error')
    for (const issue of output.errors) {
      const line = `${issue.severity.toUpperCase()}: ${issue.formattedMessage}`
      process[issue.severity === 'error' ? 'stderr' : 'stdout'].write(`${line}\n`)
    }
    if (fatal.length) {
      process.exit(1)
    }
  }

  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true })

  for (const [sourceName, contracts] of Object.entries(output.contracts || {})) {
    for (const [contractName, artifact] of Object.entries(contracts)) {
      const filePath = path.join(ARTIFACTS_DIR, `${contractName}.json`)
      fs.writeFileSync(
        filePath,
        JSON.stringify(
          {
            contractName,
            sourceName,
            abi: artifact.abi,
            bytecode: artifact.evm?.bytecode?.object || '',
            deployedBytecode: artifact.evm?.deployedBytecode?.object || '',
          },
          null,
          2
        )
      )
      process.stdout.write(`wrote ${filePath}\n`)
    }
  }
}

compile()
