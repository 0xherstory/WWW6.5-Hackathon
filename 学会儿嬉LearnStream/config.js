require('dotenv').config();
const Database = require('./db/database');

const initApp = () => {
    Database.init();
    console.log('In-memory database initialized');
};

let ipfs = null;
try {
    const { create } = require('ipfs-http-client');
    ipfs = create({ url: process.env.IPFS_URL || 'https://ipfs.infura.io:5001/api/v0' });
} catch (err) {
    console.log('IPFS client not available');
}

module.exports = { initApp, ipfs };
