// src/App.jsx
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { MarkMeowABI, MarkMeowAddress } from './config';
import CatList from './CatList';  // 展示猫咪信息
import Donate from './Donate';    // 处理捐赠
import RegisterCat from './RegisterCat';  // 注册猫咪
import NeuterUpdate from './NeuterUpdate'; // 更新绝育状态
import DonationHistory from './DonationHistory'; // 显示捐赠历史

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);

        const contractInstance = new web3Instance.eth.Contract(MarkMeowABI, MarkMeowAddress);
        setContract(contractInstance);
      }
    };
    loadWeb3();
  }, []);

  // 只显示钱包地址的前6个字符和后4个字符
  const shortenedAccount = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : null;

  return (
    <div>
      <h1>MarkMeow 项目</h1>
      {shortenedAccount ? <p>当前账户: {shortenedAccount}</p> : <p>请连接MetaMask钱包</p>}

      <CatList contract={contract} />
      <Donate contract={contract} account={account} />
      <RegisterCat contract={contract} account={account} />
      <NeuterUpdate contract={contract} account={account} />
      <DonationHistory contract={contract} account={account} />
    </div>
  );
};

export default App;