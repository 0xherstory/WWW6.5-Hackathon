// src/DonationHistory.js
import React, { useState, useEffect } from 'react';

const DonationHistory = ({ contract, account }) => {
  const [history, setHistory] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await contract.methods.getDonationHistory(account).call();
      setHistory(history);
    };

    if (contract) {
      fetchHistory();
    }
  }, [contract, account]);

  return (
    <div>
      <h3>捐赠历史</h3>
      <p>你总共捐赠了: {history} Wei</p>
    </div>
  );
};

export default DonationHistory;