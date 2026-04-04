import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MyPlants from './pages/MyPlants'
import PlantDetail from './pages/PlantDetail'
import Marketplace from './pages/Marketplace'
import Community from './pages/Community'
import DAO from './pages/DAO'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/my-plants" element={<MyPlants />} />
        <Route path="/plant/local/:id" element={<PlantDetail />} />
        <Route path="/plant/:id" element={<PlantDetail />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/community" element={<Community />} />
        <Route path="/dao" element={<DAO />} />
      </Routes>
    </Layout>
  )
}
