import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constants";
import "./App.css";

function App() {
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState("explore"); // explore 或 mailbox
  
  // 核心状态
  const [currentBottle, setCurrentBottle] = useState(null); 
  const [myBottles, setMyBottles] = useState([]);
  const [replies, setReplies] = useState([]);
  const [bottleContent, setBottleContent] = useState("");
  const [replyText, setReplyText] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) return alert("请安装 MetaMask");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWallet(accounts[0]);
  };

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  };

  // --- 功能：捞瓶子 ---
  const openBottle = async () => {
    try {
      const contract = await getContract();
      const res = await contract.getRandomBottle();
      setCurrentBottle({ id: res[0].toString(), content: res[1], creator: res[2] });
      // 获取该瓶子的回复
      const r = await contract.getAllReplies(res[0]);
      setReplies(r);
    } catch (e) { alert("海里空空的..."); }
  };

  // --- 功能：回复瓶子 ---
  const handleReply = async (id) => {
    if (!replyText) return;
    const contract = await getContract();
    const tx = await contract.replyBottle(id, replyText);
    await tx.wait();
    alert("回信已寄出！");
    setReplyText("");
    openBottle(); // 刷新显示
  };

  // --- 功能：我的信箱（查看自己发出的瓶子收到的回信） ---
  const loadMyMailbox = async () => {
    if (!wallet) return;
    const contract = await getContract();
    const ids = await contract.getUserBottles(wallet);
    const list = [];
    for (let id of ids) {
        const b = await contract.bottles(id);
        const r = await contract.getAllReplies(id);
        list.push({ id: id.toString(), content: b.contentHash, replies: r });
    }
    setMyBottles(list);
  };

  // --- 功能：打赏（通用） ---
  const handleTip = async (toAddress) => {
    const contract = await getContract();
    const tx = await contract.tip(toAddress, { value: ethers.parseEther("0.01") });
    await tx.wait();
    alert("打赏成功！");
  };

  return (
    <div className="ocean">
      <div style={{ maxWidth: "600px", margin: "auto" }}>
        <header style={{ textAlign: "center" }}>
          <h1>🌊 Drifting Bottle</h1>
          {!wallet ? <button onClick={connectWallet} className="glass-card">连接钱包</button> : <p>账户: {wallet.substring(0,6)}...</p>}
        </header>

        {/* 浮动的瓶子图标 (你可以换成真实的图片URL) */}
        <div className="floating-bottle" style={{fontSize: "60px", textAlign:"center"}}>🍾</div>

        <nav style={{ textAlign: "center", marginBottom: "30px" }}>
          <button className={`tab-button ${activeTab === "explore" ? "active" : ""}`} onClick={() => setActiveTab("explore")}>探索大海</button>
          <button className={`tab-button ${activeTab === "mailbox" ? "active" : ""}`} onClick={() => { setActiveTab("mailbox"); loadMyMailbox(); }}>我的信箱</button>
        </nav>

        {activeTab === "explore" ? (
          <div className="explore-section">
            <div className="glass-card">
              <h3>扔一个瓶子</h3>
              <textarea placeholder="写下你想说的话..." value={bottleContent} onChange={(e) => setBottleContent(e.target.value)} />
              <button onClick={async () => {
                const contract = await getContract();
                const tx = await contract.createBottle(bottleContent);
                await tx.wait();
                setBottleContent("");
                alert("已扔向远方");
              }}>扔进大海</button>
            </div>

            <button className="glass-card" style={{width: "100%", fontSize: "1.2rem"}} onClick={openBottle}>🎲 随机捞一个瓶子</button>

            {currentBottle && (
              <div className="glass-card">
                <h4>来自陌生的瓶子 #{currentBottle.id}</h4>
                <p>"{currentBottle.content}"</p>
                <button onClick={() => handleTip(currentBottle.creator)}>💰 打赏作者</button>
                <hr />
                <h5>回信记录:</h5>
                {replies.map((r, i) => <p key={i}><small>{r.replier.substring(0,6)}:</small> {r.contentHash}</p>)}
                <input placeholder="写回信..." value={replyText} onChange={(e)=>setReplyText(e.target.value)} />
                <button onClick={() => handleReply(currentBottle.id)}>寄出回信</button>
              </div>
            )}
          </div>
        ) : (
          <div className="mailbox-section">
            <h3>📬 我的瓶子收到的回信</h3>
            {myBottles.map((b, i) => (
              <div key={i} className="glass-card">
                <p><strong>我的瓶子:</strong> {b.content}</p>
                <div style={{ marginLeft: "20px", borderLeft: "2px solid #fff", paddingLeft: "10px" }}>
                  {b.replies.length === 0 ? <p>暂无回信</p> : b.replies.map((r, idx) => (
                    <div key={idx} style={{marginBottom: "10px"}}>
                      <p>📩 {r.contentHash}</p>
                      <button size="small" onClick={() => handleTip(r.replier)}>💰 打赏这位回信者</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;