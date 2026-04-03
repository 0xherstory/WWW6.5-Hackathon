// src/CatList.js
import React, { useEffect, useState } from 'react';

const CatList = ({ contract }) => {
  const [cats, setCats] = useState([]);
  const [proofs, setProofs] = useState({});

  useEffect(() => {
    const fetchCats = async () => {
      const totalCats = await contract.methods.totalCats().call();
      const catsData = [];
      for (let i = 1; i <= totalCats; i++) {
        const cat = await contract.methods.cats(i).call();
        const proof = await contract.methods.getNeuterProof(i).call();
        catsData.push(cat);
        setProofs((prevProofs) => ({
          ...prevProofs,
          [i]: proof
        }));
      }
      setCats(catsData);
    };

    if (contract) {
      fetchCats();
    }
  }, [contract]);

  return (
    <div>
      <h2>所有猫咪</h2>
      {cats.map((cat) => (
        <div key={cat.id}>
          <p>ID: {cat.id}</p>
          <p>城市: {cat.city}</p>
          <p>性别: {cat.gender === '0' ? '公猫' : '母猫'}</p>
          <p>特征: {cat.features}</p>
          <p>是否已绝育: {cat.isNeutered ? '是' : '否'}</p>
          <p>绝育证明链接: {proofs[cat.id] ? <a href={`https://ipfs.io/ipfs/${proofs[cat.id]}`} target="_blank" rel="noopener noreferrer">查看证明</a> : '未上传'}</p>
        </div>
      ))}
    </div>
  );
};

export default CatList;