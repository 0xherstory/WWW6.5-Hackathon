// src/NeuterUpdate.js
import React, { useState } from 'react';

const NeuterUpdate = ({ contract, account }) => {
  const [catId, setCatId] = useState('');
  const [isNeutered, setIsNeutered] = useState(false);
  const [ipfsHash, setIpfsHash] = useState('');

  const updateNeuterStatus = async () => {
    await contract.methods.updateNeuterStatus(catId, isNeutered).send({ from: account });
  };

  const uploadProof = async () => {
    if (!ipfsHash) {
      alert('请提供IPFS哈希');
      return;
    }
    await contract.methods.uploadNeuterProof(catId, ipfsHash).send({ from: account });
    alert('绝育证明上传成功');
  };

  return (
    <div>
      <h3>更新绝育状态</h3>
      <input
        type="number"
        value={catId}
        onChange={(e) => setCatId(e.target.value)}
        placeholder="猫咪ID"
      />
      <label>
        已绝育
        <input
          type="checkbox"
          checked={isNeutered}
          onChange={() => setIsNeutered(!isNeutered)}
        />
      </label>
      <button onClick={updateNeuterStatus}>更新</button>

      <h3>上传绝育证明</h3>
      <input
        type="text"
        value={ipfsHash}
        onChange={(e) => setIpfsHash(e.target.value)}
        placeholder="输入IPFS哈希"
      />
      <button onClick={uploadProof}>上传证明</button>
    </div>
  );
};

export default NeuterUpdate;