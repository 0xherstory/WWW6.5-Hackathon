import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Zap, ArrowRight, Heart, 
  Gavel, FileText, CheckCircle, ShieldAlert, AlertTriangle 
} from 'lucide-react';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="min-h-screen bg-[#FFF5F7] font-sans text-gray-800 scroll-smooth">
      {/* --- 1. Navigation --- */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-pink-100">
        <div className="flex items-center gap-2">
          <div className="bg-pink-500 p-2 rounded-xl shadow-lg shadow-pink-200">
            <Heart className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-pink-600">SOOS</span>
        </div>
        <div className="hidden md:flex gap-10 font-bold text-sm uppercase tracking-widest text-gray-500">
          <a href="#features" className="hover:text-pink-500 transition">Features</a>
          <a href="#dispute" className="hover:text-pink-500 transition">Dispute Center</a>
        </div>
        <button className="bg-gray-900 hover:bg-black text-white px-8 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 shadow-xl">
          Connect Wallet
        </button>
      </nav>

      {/* --- 2. Hero Section --- */}
      <header className="px-8 pt-24 pb-32 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-bold tracking-widest text-pink-600 uppercase bg-pink-100 rounded-full border border-pink-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
          </span>
          Web3 Female Mutual-Aid Protocol
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tight">
          Share Deals, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            Not Risks.
          </span>
        </h1>
        <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
          The first decentralized escrow platform designed for sisters. 
          Stop worrying about "who pays first" and start saving together with code-enforced trust.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <button className="bg-pink-500 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-pink-600 transition shadow-2xl shadow-pink-200">
            Create A Deal <ArrowRight size={22} />
          </button>
          <button className="bg-white border-2 border-pink-100 text-pink-600 px-10 py-5 rounded-2xl font-black text-lg hover:border-pink-300 transition">
            Verify Identity
          </button>
        </div>
      </header>

      {/* --- 3. Features Section --- */}
      <section id="features" className="bg-white py-32 px-8 rounded-[3rem] shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<ShieldCheck className="text-pink-500 w-10 h-10" />}
              title="Identity Gated"
              desc="Exclusive access for verified sisters. Built-in Polygon ID integration ensures a safe community."
            />
            <FeatureCard 
              icon={<Lock className="text-purple-500 w-10 h-10" />}
              title="Smart Escrow"
              desc="Funds are locked in the contract. Money only moves when the participant confirms receipt."
            />
            <FeatureCard 
              icon={<Zap className="text-indigo-500 w-10 h-10" />}
              title="Auto-Timeout"
              desc="If no one joins within 24h, the deal auto-cancels and funds are instantly returned."
            />
          </div>
        </div>
      </section>

      {/* --- 4. Dispute Center (NEW) --- */}
      <section id="dispute" className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="text-left">
              <h2 className="text-4xl font-black mb-4 flex items-center gap-3">
                <Gavel className="text-purple-600" /> Dispute Center
              </h2>
              <p className="text-gray-500 font-medium">Resolution powered by community & code logic.</p>
            </div>
            <div className="flex bg-pink-100/50 p-1.5 rounded-2xl border border-pink-100">
              <button onClick={() => setActiveTab('active')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'active' ? 'bg-white shadow-md text-pink-600' : 'text-gray-400'}`}>Active (2)</button>
              <button onClick={() => setActiveTab('resolved')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'resolved' ? 'bg-white shadow-md text-pink-600' : 'text-gray-400'}`}>Resolved</button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <DisputeItem 
                id="#SOOS-8821"
                title="Skincare Set BOGO Dispute"
                reason="Package received with damage. Verification of authenticity required."
                amount="0.05 ETH"
                status="Waiting for Proof"
                timeLeft="18h 42m"
              />
              <DisputeItem 
                id="#SOOS-9012"
                title="Fashion Item Multi-Buy"
                reason="Initiator failed to provide tracking number within 48h."
                amount="120 USDC"
                status="Under Review"
                timeLeft="Expired"
              />
            </div>
            <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 blur-3xl rounded-full -mr-10 -mt-10"></div>
              <ShieldAlert className="w-12 h-12 mb-8 text-pink-400" />
              <h4 className="text-2xl font-bold mb-6 text-pink-100">Arbitration Rules</h4>
              <ul className="space-y-6 text-gray-400 font-medium">
                <li className="flex gap-4">
                  <CheckCircle className="text-pink-500 shrink-0" size={20} />
                  <span>Funds are instantly locked upon dispute initiation.</span>
                </li>
                <li className="flex gap-4">
                  <CheckCircle className="text-pink-500 shrink-0" size={20} />
                  <span>Evidence must be provided within 24 hours.</span>
                </li>
                <li className="flex gap-4">
                  <CheckCircle className="text-pink-500 shrink-0" size={20} />
                  <span>Community DAO or designated arbiters decide the outcome.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-20 border-t border-pink-100 text-center">
        <p className="font-bold text-gray-400 tracking-widest text-xs uppercase mb-4">Built with Love & Solidity for HerSolidity 2026</p>
        <div className="flex justify-center gap-8 text-pink-400 font-bold text-sm">
          <a href="#" className="hover:text-pink-600 transition">Github</a>
          <a href="#" className="hover:text-pink-600 transition">Smart Contract</a>
          <a href="#" className="hover:text-pink-600 transition">Documentation</a>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group p-10 rounded-[2.5rem] bg-[#FFF5F7]/50 hover:bg-white hover:shadow-2xl hover:shadow-pink-100 transition-all border border-transparent hover:border-pink-100">
    <div className="mb-6 transform group-hover:scale-110 transition-transform">{icon}</div>
    <h4 className="text-2xl font-black mb-4">{title}</h4>
    <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

const DisputeItem = ({ id, title, reason, amount, status, timeLeft }) => (
  <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:border-pink-200 transition-all shadow-sm hover:shadow-xl group">
    <div className="flex justify-between items-start mb-6">
      <div>
        <span className="text-[10px] font-black tracking-widest uppercase text-gray-300">{id}</span>
        <h4 className="text-xl font-black text-gray-800 mt-1">{title}</h4>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-pink-600">{amount}</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Escrowed</p>
      </div>
    </div>
    <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
      <p className="text-sm font-medium text-gray-500 flex gap-3 italic">
        <FileText size={18} className="shrink-0 text-pink-300" /> "{reason}"
      </p>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${status === 'Under Review' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
          {status}
        </span>
        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
          <AlertTriangle size={12} className="text-pink-400" /> {timeLeft}
        </span>
      </div>
      <button className="text-xs font-black uppercase tracking-widest text-gray-900 group-hover:text-pink-500 flex items-center gap-2 transition">
        Case Details <ArrowRight size={14} />
      </button>
    </div>
  </div>
);

export default LandingPage;