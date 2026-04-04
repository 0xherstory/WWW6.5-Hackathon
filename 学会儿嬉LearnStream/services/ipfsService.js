const { ipfs } = require('../config');

const uploadToIPFS = async (data) => {
    if (!ipfs) {
        console.log('IPFS not available');
        return null;
    }
    try {
        const { path } = await ipfs.add(JSON.stringify(data));
        return path;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        return null;
    }
};

const getFromIPFS = async (hash) => {
    if (!ipfs) {
        console.log('IPFS not available');
        return null;
    }
    try {
        const chunks = [];
        for await (const chunk of ipfs.cat(hash)) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks).toString();
    } catch (error) {
        console.error('Error getting from IPFS:', error);
        return null;
    }
};

module.exports = { uploadToIPFS, getFromIPFS };
