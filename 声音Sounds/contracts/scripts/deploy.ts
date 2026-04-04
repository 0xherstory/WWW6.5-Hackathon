import { ethers } from 'hardhat'

async function main() {
  const registry = await ethers.deployContract('SoundRegistry')
  await registry.waitForDeployment()

  console.log(`SoundRegistry deployed to ${await registry.getAddress()}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
