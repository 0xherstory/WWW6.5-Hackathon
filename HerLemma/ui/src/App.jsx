import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import KnowledgeTree from './pages/KnowledgeTree'
import TranslationDetail from './pages/TranslationDetail'
import Create from './pages/Create'
import Profile from './pages/Profile'

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#0a0612] bg-mesh text-[#f0eef5]">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
          className="min-h-[calc(100vh-3.5rem)] pt-14"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/tree" element={<KnowledgeTree />} />
            <Route path="/translation/:id" element={<TranslationDetail />} />
            <Route path="/create" element={<Create />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
