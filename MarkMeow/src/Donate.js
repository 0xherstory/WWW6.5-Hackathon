// src/Donate.js
import React, { useState } from 'react';

const Donate = ({ contract, account }) => {
  const [amount, setAmount] = useState('');

  const donate = async () => {
    await contract.methods.donate().send({ from: account, value: amount });
  };

  return (
    <div>
      <h3>捐赠资金</h3>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="输入捐赠金额 (Wei)"
      />
      <button onClick={donate}>捐赠</button>
    </div>
  );
};

export default Donate;