let Web3 = null;
let web3 = null;

const getTokenBalance = async (address) => {
    if (!web3) {
        console.log('Web3 not available');
        return 0;
    }
    try {
        const balance = await web3.eth.getBalance(address);
        return web3.utils.fromWei(balance, 'ether');
    } catch (error) {
        console.error('Error getting balance:', error);
        return 0;
    }
};

const mintTokens = async (recipient, amount) => {
    if (!web3) {
        console.log('Web3 not available');
        return false;
    }
    try {
        const tx = {
            from: recipient,
            to: recipient,
            value: web3.utils.toWei(amount.toString(), 'ether')
        };
        console.log('Minting tokens:', tx);
        return true;
    } catch (error) {
        console.error('Error minting tokens:', error);
        return false;
    }
};

module.exports = { getTokenBalance, mintTokens };
