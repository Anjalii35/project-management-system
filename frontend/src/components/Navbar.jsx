import { SearchIcon, PanelLeft, MoonIcon, SunIcon, LogOut } from 'lucide-react'
import { logout } from '../services/authService'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ setIsSidebarOpen, isDark, setIsDark }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const navigate = useNavigate()

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            // Navigate to projects page with search term
            navigate(`/projects?search=${encodeURIComponent(searchTerm.trim())}`)
            setSearchTerm("")
        }
    }

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 xl:px-16 py-3 flex-shrink-0">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <button
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                        className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                        <PanelLeft size={20} />
                    </button>
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3.5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                            placeholder="Search projects..."
                            className="pl-8 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsDark(prev => !prev)}
                        className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95"
                    >
                        {isDark ? <SunIcon className="size-4 text-yellow-400" /> : <MoonIcon className="size-4 text-gray-800" />}
                    </button>
                    <img
                        src="/src/assets/image.png"
                        alt="Logo"
                        onClick={() => navigate("/")}
                        className="h-8 w-auto cursor-pointer rounded"
                    />
                </div>
            </div>
        </div>
    )
}

export default Navbar