import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEFAULT_BROADCAST = path.resolve(__dirname, '../broadcast/DeployHerLemma.s.sol/43113/run-latest.json')
const DEFAULT_DEPLOYMENT = path.resolve(__dirname, '../deployments/fuji.json')
const DEFAULT_TARGET = path.resolve(__dirname, '../../ui/.env.local')
const DEFAULT_EXAMPLE = path.resolve(__dirname, '../../ui/.env.example')
const DEFAULT_RPC = 'https://api.avax-test.network/ext/bc/C/rpc'

const REQUIRED_CONTRACTS = {
  ExplanationManager: 'VITE_EXPLANATION_MANAGER_ADDRESS',
  ProveToken: 'VITE_PROVE_TOKEN_ADDRESS',
  STEMIndex: 'VITE_STEM_INDEX_ADDRESS',
  HerLemmaCredential: 'VITE_CREDENTIAL_ADDRESS',
}

function parseArgs(argv) {
  const args = { broadcast: DEFAULT_BROADCAST, deployment: DEFAULT_DEPLOYMENT, target: DEFAULT_TARGET }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--broadcast' && argv[i + 1]) {
      args.broadcast = path.resolve(process.cwd(), argv[++i])
    } else if (arg === '--deployment' && argv[i + 1]) {
      args.deployment = path.resolve(process.cwd(), argv[++i])
    } else if (arg === '--target' && argv[i + 1]) {
      args.target = path.resolve(process.cwd(), argv[++i])
    }
  }
  return args
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const raw = fs.readFileSync(filePath, 'utf8')
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .reduce((acc, line) => {
      const splitIndex = line.indexOf('=')
      const key = line.slice(0, splitIndex)
      const value = line.slice(splitIndex + 1)
      acc[key] = value
      return acc
    }, {})
}

function stringifyEnv(envObject) {
  return Object.entries(envObject)
    .map(([key, value]) => `${key}=${value ?? ''}`)
    .join('\n') + '\n'
}

function readDeployContracts(broadcastPath) {
  if (!fs.existsSync(broadcastPath)) {
    throw new Error(`找不到 Foundry 部署结果文件: ${broadcastPath}`)
  }

  const raw = fs.readFileSync(broadcastPath, 'utf8')
  const json = JSON.parse(raw)
  const transactions = Array.isArray(json.transactions) ? json.transactions : []

  const contracts = {}
  for (const tx of transactions) {
    if (tx?.contractName && tx?.contractAddress) {
      contracts[tx.contractName] = tx.contractAddress
    }
  }

  for (const name of Object.keys(REQUIRED_CONTRACTS)) {
    if (!contracts[name]) {
      throw new Error(`部署结果里缺少 ${name} 地址`)
    }
  }

  return contracts
}

function readNodeDeployment(deploymentPath) {
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`找不到 Node 部署结果文件: ${deploymentPath}`)
  }

  const raw = fs.readFileSync(deploymentPath, 'utf8')
  const json = JSON.parse(raw)
  const contracts = json.contracts || {}

  for (const name of Object.keys(REQUIRED_CONTRACTS)) {
    if (!contracts[name]) {
      throw new Error(`Node 部署结果里缺少 ${name} 地址`)
    }
  }

  return contracts
}

function main() {
  const { broadcast, deployment, target } = parseArgs(process.argv.slice(2))
  let contracts

  if (fs.existsSync(broadcast)) {
    contracts = readDeployContracts(broadcast)
  } else {
    contracts = readNodeDeployment(deployment)
  }

  const baseEnv = fs.existsSync(target)
    ? readEnvFile(target)
    : readEnvFile(DEFAULT_EXAMPLE)

  const nextEnv = {
    ...baseEnv,
    VITE_AVALANCHE_FUJI_RPC: baseEnv.VITE_AVALANCHE_FUJI_RPC || DEFAULT_RPC,
  }

  for (const [contractName, envKey] of Object.entries(REQUIRED_CONTRACTS)) {
    nextEnv[envKey] = contracts[contractName]
  }

  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, stringifyEnv(nextEnv), 'utf8')

  process.stdout.write(`已写入 ${target}\n`)
  for (const [contractName, envKey] of Object.entries(REQUIRED_CONTRACTS)) {
    process.stdout.write(`${envKey}=${contracts[contractName]}\n`)
  }
}

try {
  main()
} catch (error) {
  process.stderr.write(`${error.message}\n`)
  process.exit(1)
}
