// src/RegisterCat.js
import React, { useState } from 'react';

const RegisterCat = ({ contract, account }) => {
  const [city, setCity] = useState('');
  const [gender, setGender] = useState(0);
  const [features, setFeatures] = useState('');
  const [isNeutered, setIsNeutered] = useState(false);

  const registerCat = async () => {
    await contract.methods.registerCat(city, gender, features, isNeutered).send({ from: account });
  };

  return (
    <div>
      <h3>注册猫咪</h3>
      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="城市" />
      <input type="text" value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="外貌特征" />
      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="0">公猫</option>
        <option value="1">母猫</option>
      </select>
      <label>
        已绝育
        <input type="checkbox" checked={isNeutered} onChange={() => setIsNeutered(!isNeutered)} />
      </label>
      <button onClick={registerCat}>注册</button>
    </div>
  );
};

export default RegisterCat;