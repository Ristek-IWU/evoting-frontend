import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiBarChart2,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi"

function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // ===== RESPONSIVE CHECK =====
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/")
  }

  const isActive = (path) => location.pathname === path

  const menus = [
    { to: "/admin/dashboard", label: "Dashboard", Icon: FiHome },
    { to: "/admin/manage-candidates", label: "Kelola Kandidat", Icon: FiUsers },
    { to: "/admin/kelola-pemilih", label: "Kelola Pemilih", Icon: FiUserCheck },
    { to: "/admin/results", label: "Hasil Voting", Icon: FiBarChart2 },
  ]

  const MenuItem = ({ to, label, Icon, onClick }) => {
    if (!to) return null
    const active = isActive(to)

    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition
          ${
            active
              ? "bg-white/25 text-white shadow-[0_0_25px_rgba(168,85,247,0.6)]"
              : "text-blue-100 hover:bg-white/15"
          }`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Link>
    )
  }

  // ================= MOBILE TOP BAR =================
  if (isMobile) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-900 text-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <img src="/logo-kampus.png" className="w-8 h-8" />
              <span className="font-bold">Admin Panel</span>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ y: -300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -300, opacity: 0 }}
              className="fixed top-[60px] left-0 right-0 z-40
                bg-gradient-to-b from-blue-800 via-blue-700 to-indigo-900
                backdrop-blur-xl shadow-2xl px-4 py-6 space-y-3"
            >
              {menus.map((m) => (
                <MenuItem
                  key={m.to}
                  {...m}
                  onClick={() => setMobileOpen(false)}
                />
              ))}

              <button
                onClick={handleLogout}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl
                  bg-gradient-to-r from-rose-500 to-pink-600 font-bold"
              >
                <FiLogOut />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // ================= DESKTOP SIDEBAR =================
  return (
    <aside
      className="fixed left-0 top-0 h-screen w-72
      bg-gradient-to-b from-blue-800 via-blue-700 to-indigo-900
      text-white shadow-2xl z-50 flex flex-col backdrop-blur-xl"
    >
      {/* LOGO */}
      <div className="px-6 py-8 text-center border-b border-white/20">
        <img
          src="/logo-kampus.png"
          className="w-20 h-20 mx-auto mb-3 rounded-full shadow-lg"
        />
        <h2 className="text-xl font-extrabold">ADMIN PANEL</h2>
        <p className="text-sm text-blue-200">Sistem E-Voting Kampus</p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-3 text-sm">
        {menus.map((m) => (
          <MenuItem key={m.to} {...m} />
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="px-6 py-4 border-t border-white/20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3
            bg-gradient-to-r from-rose-500 to-pink-600
            py-3 rounded-xl font-bold shadow-lg"
        >
          <FiLogOut size={18} />
          Logout
        </motion.button>
      </div>
    </aside>
  )
}

export default AdminSidebar
