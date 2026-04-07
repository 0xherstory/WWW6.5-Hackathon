import fs from 'node:fs'
import path from 'node:path'
import { ethers } from 'ethers'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const ARTIFACTS_DIR = path.join(ROOT, 'artifacts')
const DEPLOYMENTS_DIR = path.join(ROOT, 'deployments')
const ENV_PATH = path.join(ROOT, '.env')
const DEFAULT_RPC = 'https://api.avax-test.network/ext/bc/C/rpc'

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`找不到环境变量文件: ${filePath}`)
  }

  const env = {}
  const raw = fs.readFileSync(filePath, 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const splitIndex = trimmed.indexOf('=')
    env[trimmed.slice(0, splitIndex)] = trimmed.slice(splitIndex + 1)
  }
  return env
}

function readArtifact(name) {
  const filePath = path.join(ARTIFACTS_DIR, `${name}.json`)
  if (!fs.existsSync(filePath)) {
    throw new Error(`缺少编译产物: ${filePath}，先运行 npm run compile:node`)
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

async function deployContract(wallet, artifactName, args = []) {
  const artifact = readArtifact(artifactName)
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet)
  const contract = await factory.deploy(...args)
  await contract.waitForDeployment()
  const address = await contract.getAddress()
  process.stdout.write(`${artifactName} deployed at ${address}\n`)
  return new ethers.Contract(address, artifact.abi, wallet)
}

async function main() {
  const env = loadEnv(ENV_PATH)
  const privateKey = env.PRIVATE_KEY
  const rpcUrl = env.AVALANCHE_FUJI_RPC || DEFAULT_RPC
  const treasury = env.TREASURY
  const badgeBaseURI = env.BADGE_BASE_URI

  if (!privateKey || !treasury || !badgeBaseURI) {
    throw new Error('缺少必要环境变量：PRIVATE_KEY / TREASURY / BADGE_BASE_URI')
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)
  const deployer = wallet.address

  const proveToken = await deployContract(wallet, 'ProveToken', [deployer])
  const credential = await deployContract(wallet, 'HerLemmaCredential', [deployer, 'HerLemma Credential', 'HLC'])
  const stemIndex = await deployContract(wallet, 'STEMIndex', [deployer])
  const manager = await deployContract(wallet, 'ExplanationManager', [
    deployer,
    treasury,
    await proveToken.getAddress(),
    await credential.getAddress(),
    await stemIndex.getAddress(),
  ])

  await (await proveToken.setMinter(await manager.getAddress(), true)).wait()
  await (await credential.setMinter(await manager.getAddress(), true)).wait()
  await (await stemIndex.setManager(await manager.getAddress())).wait()

  const badges = [
    [1, 'First Voice', 'first-voice.json'],
    [2, 'First Earning', 'first-earning.json'],
    [3, 'Math Translator', 'math-translator.json'],
    [4, 'Trusted Reviewer', 'trusted-reviewer.json'],
    [5, 'Viral Explainer', 'viral-explainer.json'],
    [6, 'Brand Pick', 'brand-pick.json'],
  ]

  for (const [id, name, file] of badges) {
    await (await credential.defineBadge(id, name, `${badgeBaseURI}${file}`)).wait()
  }

  const deployment = {
    network: 'avalanche-fuji',
    chainId: 43113,
    rpcUrl,
    deployedAt: new Date().toISOString(),
    deployer,
    contracts: {
      ProveToken: await proveToken.getAddress(),
      HerLemmaCredential: await credential.getAddress(),
      STEMIndex: await stemIndex.getAddress(),
      ExplanationManager: await manager.getAddress(),
    }
  }

  fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true })
  const outFile = path.join(DEPLOYMENTS_DIR, 'fuji.json')
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2), 'utf8')
  process.stdout.write(`wrote ${outFile}\n`)
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`)
  process.exit(1)
})
