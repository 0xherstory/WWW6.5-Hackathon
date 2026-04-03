// Deployment script: PawToken → PawLedgerV1 (impl) → ERC1967Proxy → setMinter
//
// Changed from original deploy.js:
//   - PawLedger is now deployed as two contracts: an implementation and a proxy.
//   - The proxy address is what users (and config.js) interact with.
//   - PawToken.setMinter() points at the proxy address (stable across upgrades).
//   - Future upgrades: deploy a new V2 implementation, then call
//       proxy.upgradeToAndCall(v2ImplAddr, "0x") from the owner wallet.
//
// Usage: npx hardhat run deploy.js --network fuji

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "AVAX"
  );

  // ─── 1. Deploy PawToken (unchanged — stays non-upgradeable) ───────────────
  console.log("\n[1/4] Deploying PawToken...");
  const PawToken = await ethers.getContractFactory("PawToken");
  const pawToken = await PawToken.deploy(deployer.address);
  await pawToken.waitForDeployment();
  const pawTokenAddr = await pawToken.getAddress();
  console.log("    PawToken deployed:", pawTokenAddr);

  // ─── 2. Deploy PawLedgerV1 implementation ────────────────────────────────
  //
  // This is the bare logic contract. Do NOT use this address in config.js or
  // call functions on it directly — it has no state and _disableInitializers()
  // prevents initialize() from being called on it.
  console.log("\n[2/4] Deploying PawLedgerV1 implementation...");
  const PawLedgerV1 = await ethers.getContractFactory("PawLedgerV1");
  const impl = await PawLedgerV1.deploy();
  await impl.waitForDeployment();
  const implAddr = await impl.getAddress();
  console.log("    PawLedgerV1 implementation deployed:", implAddr);

  // ─── 3. Deploy ERC1967Proxy ───────────────────────────────────────────────
  //
  // The proxy is the permanent address users interact with.
  // Its constructor takes (implAddr, initCalldata):
  //   - implAddr:      where to delegate all calls
  //   - initCalldata:  the ABI-encoded initialize() call, executed atomically
  //                    so the contract is initialized in the same transaction.
  console.log("\n[3/4] Deploying ERC1967Proxy (PawLedger proxy)...");

  // Encode initialize(pawTokenAddr, reviewerThreshold, requiredApprovals)
  const initData = PawLedgerV1.interface.encodeFunctionData("initialize", [
    pawTokenAddr,
    ethers.parseEther("0.1"), // reviewerThreshold = 0.1 AVAX
    1,                        // requiredApprovals
  ]);

  const ERC1967Proxy = await ethers.getContractFactory("ERC1967Proxy");
  const proxy = await ERC1967Proxy.deploy(implAddr, initData);
  await proxy.waitForDeployment();
  const proxyAddr = await proxy.getAddress();
  console.log("    ERC1967Proxy (PawLedger) deployed:", proxyAddr);

  // Attach the V1 ABI to the proxy so we can make sanity-check calls below
  const pawLedger = PawLedgerV1.attach(proxyAddr);

  // ─── 4. Transfer minting rights to the proxy (not the implementation) ─────
  //
  // The proxy address never changes across upgrades, so this setMinter call
  // does not need to be repeated when deploying V2, V3, etc.
  console.log("\n[4/4] Setting PawLedger proxy as PawToken minter...");
  const tx = await pawToken.setMinter(proxyAddr);
  await tx.wait();
  console.log("    Minter set. Tx:", tx.hash);

  // ─── Sanity checks ────────────────────────────────────────────────────────
  console.log("\n── Sanity checks ──");
  const owner       = await pawLedger.owner();
  const threshold   = await pawLedger.reviewerThreshold();
  const minterAddr  = await pawToken.minter();
  const isReviewer  = await pawLedger.isReviewer(deployer.address);

  console.log("  proxy.owner()            :", owner);
  console.log("  proxy.reviewerThreshold():", ethers.formatEther(threshold), "AVAX");
  console.log("  pawToken.minter()        :", minterAddr);
  console.log("  deployer isReviewer      :", isReviewer);

  const ownerOk    = owner === deployer.address;
  const minterOk   = minterAddr === proxyAddr;
  const reviewerOk = isReviewer;
  console.log("\n  owner correct      :", ownerOk   ? "✓" : "✗ FAIL");
  console.log("  minter == proxy    :", minterOk   ? "✓" : "✗ FAIL");
  console.log("  deployer=reviewer  :", reviewerOk ? "✓" : "✗ FAIL");

  if (!ownerOk || !minterOk || !reviewerOk) {
    throw new Error("Sanity check failed — do not use these addresses.");
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────────────────────");
  console.log("Deployment complete!");
  console.log("  PawToken              :", pawTokenAddr);
  console.log("  PawLedgerV1 (impl)    :", implAddr, "  ← do NOT use in config.js");
  console.log("  PawLedger (proxy)     :", proxyAddr, "  ← use this in config.js");
  console.log("─────────────────────────────────────────────────────────");
  console.log("\nNext step: copy PawToken and PawLedger (proxy) into src/ui/src/config.js");
  console.log("\nTo upgrade later:");
  console.log("  1. Deploy new implementation: npx hardhat run scripts/deployV2.js");
  console.log("  2. Call from owner wallet: proxy.upgradeToAndCall(newImplAddr, '0x')");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
