const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Real charity wallet addresses (update these with actual addresses)
const CHARITIES = {
  rbg: [
    {
      address: "0x1234567890123456789012345678901234567890", // Replace with real NAACP Legal Defense Fund
      name: "NAACP Legal Defense Fund",
      type: "legal_aid",
    },
    {
      address: "0x0987654321098765432109876543210987654321", // Replace with real Women's Fund
      name: "Women's Fund",
      type: "education",
    },
  ],
  hillary: [
    {
      address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", // Replace with real Clinton Foundation
      name: "Clinton Foundation",
      type: "health",
    },
    {
      address: "0xfedcbafedcbafedcbafedcbafedcbafedcbafedcb", // Replace with real Girls Up
      name: "Girls Up",
      type: "education",
    },
  ],
};

async function main() {
  const addressesFile = path.join(__dirname, "../deployments/fuji-addresses.json");

  if (!fs.existsSync(addressesFile)) {
    console.error("Deployment addresses not found. Run deploy script first.");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync(addressesFile, "utf8"));
  const nftAddress = addresses.nft;

  console.log("Updating charity wallets for HerPathNFT at:", nftAddress);

  const nftContract = await hre.ethers.getContractAt("HerPathNFT", nftAddress);

  // Update RBG charities
  console.log("\nUpdating RBG charities...");
  for (const charity of CHARITIES.rbg) {
    try {
      console.log(`Adding: ${charity.name}`);
      const tx = await nftContract.addCharityWallet(
        "rbg",
        charity.address,
        charity.name,
        charity.type
      );
      await tx.wait();
      console.log(`✓ Added ${charity.name}`);
    } catch (error) {
      console.error(`✗ Failed to add ${charity.name}:`, error.message);
    }
  }

  // Update Hillary charities
  console.log("\nUpdating Hillary charities...");
  for (const charity of CHARITIES.hillary) {
    try {
      console.log(`Adding: ${charity.name}`);
      const tx = await nftContract.addCharityWallet(
        "hillary",
        charity.address,
        charity.name,
        charity.type
      );
      await tx.wait();
      console.log(`✓ Added ${charity.name}`);
    } catch (error) {
      console.error(`✗ Failed to add ${charity.name}:`, error.message);
    }
  }

  console.log("\n✓ Charity wallet update complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
