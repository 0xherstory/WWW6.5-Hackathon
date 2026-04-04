import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-animated">
      <Sidebar />
      <TopBar />
      <main className="ml-64 pt-20 p-6 min-h-screen">
        {children}
      </main>
    </div>
  )
}