module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost
      port: 8545,            // Local Ethereum node
      network_id: "*",       // Match any network id
    },
  },
  compilers: {
    solc: {
      version: "^0.8.19",     // Specify the Solidity compiler version
    },
  },
};