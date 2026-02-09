import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaHome,
  FaVoteYea,
  FaChartBar,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUserCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa"
import API from "../services/api"

// ================= TOOLTIP =================
const Tooltip = ({ show, text }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className="
          absolute left-[72px] top-1/2 -translate-y-1/2
          px-3 py-1 rounded-md text-xs font-semibold
          bg-slate-900 text-white
          shadow-lg border border-white/10
          whitespace-nowrap z-50
        "
      >
        {text}
      </motion.div>
    )}
  </AnimatePresence>
)

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  // ================= COLLAPSED STATE DARI LOCALSTORAGE =================
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed")
    return saved === "true"
  })
  const [hovered, setHovered] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [votingOpen, setVotingOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState(location.pathname)

  const [user, setUser] = useState({
    name: "User",
    nim: "",
  })

  // ================= RESPONSIVE =================
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // ================= FETCH USER =================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/api/auth/me")
        setUser({
          name: res.data.name,
          nim: res.data.nim || "",
        })
      } catch {}
    }
    fetchUser()
  }, [])

  // ================= FETCH VOTING STATUS =================
  useEffect(() => {
    const fetchVotingStatus = async () => {
      try {
        const res = await API.get("/api/voting/status")
        setVotingOpen(res.data.isOpen)
      } catch {
        setVotingOpen(false)
      }
    }

    fetchVotingStatus()
    const interval = setInterval(fetchVotingStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  // ================= MENU (DINAMIS) =================
  const menus = [
    { path: "/dashboard", label: "Dashboard", icon: <FaHome /> },
    ...(votingOpen ? [{ path: "/voting", label: "Voting", icon: <FaVoteYea /> }] : []),
    { path: "/result", label: "Hasil", icon: <FaChartBar /> },
  ]

  const logout = () => {
    localStorage.clear()
    delete API.defaults.headers.common.Authorization
    navigate("/login", { replace: true })
  }

  // ================= WARNA MODE DENGAN EFEK GLOSSY & GRADASI DALAM =================
  // Mode Malam sekarang menggunakan gradasi dari Navy Deep ke Biru Oxford
  const bgGradient = votingOpen
    ? "from-sky-400/90 via-white/50 to-sky-300/90 border-sky-200/50 backdrop-blur-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]"
    : "from-[#0a192f] via-[#112240] to-[#0a192f] border-blue-400/20 backdrop-blur-2xl shadow-[inset_0_0_20px_rgba(30,58,138,0.4)]"
  
  const textColor = votingOpen ? "text-slate-900" : "text-slate-300"
  
  const hoverActiveColor = votingOpen 
    ? "bg-white/60 text-blue-800 shadow-md border border-white/70 backdrop-blur-md" 
    : "bg-blue-500/30 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/40"

  const toggleGradient = votingOpen
    ? "from-blue-500 to-sky-400"
    : "from-blue-600 to-indigo-700"
  
  const toggleIconColor = "text-white"

  // ================= MOBILE NAV =================
  if (isMobile) {
    return (
      <>
        <div className="h-16 w-full" /> 
        <div className={`
          fixed top-0 left-0 right-0 z-50
          h-16 px-4
          flex items-center justify-between
          bg-gradient-to-b ${bgGradient} border-b
        `}>
          <div className={`flex items-center gap-3 font-bold ${textColor}`}>
            <FaUserCircle className={`text-2xl ${votingOpen ? "text-blue-700" : "text-blue-400"}`} />
            <span className="truncate max-w-[150px]">{user.name}</span>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className={`${textColor} text-2xl p-2 rounded-lg active:scale-90 transition-transform`}
          >
            <FaBars />
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm"
              />

              <motion.aside
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`
                  fixed top-0 left-0 bottom-0 w-64 z-[70]
                  bg-gradient-to-br ${bgGradient}
                  p-4 flex flex-col border-r
                `}
              >
                <div className="flex justify-between items-center mb-8 px-2">
                   <div className={`font-black text-xl italic ${votingOpen ? "text-blue-800" : "text-blue-400"}`}>E-VOTE</div>
                   <button
                    onClick={() => setMobileOpen(false)}
                    className={`${textColor} text-xl p-2 rounded-full hover:bg-white/10`}
                  >
                    <FaTimes />
                  </button>
                </div>

                <nav className="space-y-3 flex-1">
                  {menus.map((m) => (
                    <motion.div key={m.path} whileTap={{ scale: 0.97 }}>
                      <Link
                        to={m.path}
                        onClick={() => {
                          setMobileOpen(false)
                          setActiveMenu(m.path)
                        }}
                        className={`
                          flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all
                          ${location.pathname === m.path ? hoverActiveColor : textColor + " hover:bg-white/10"}
                        `}
                      >
                        <span className="text-xl">{m.icon}</span>
                        {m.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <motion.button
                  onClick={logout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-red-900/30"
                >
                  <FaSignOutAlt /> Logout
                </motion.button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }

  // ================= DESKTOP SIDEBAR =================
  return (
    <>
      <motion.div 
        animate={{ width: collapsed ? 88 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-shrink-0 hidden md:block"
      />

      <motion.aside
        animate={{
          width: collapsed ? 88 : 260,
          background: votingOpen
            ? "linear-gradient(165deg, rgba(126,195,227,0.95), rgba(186,230,253,0.8), rgba(126,195,227,0.95))" 
            : "linear-gradient(165deg, #0a192f 0%, #112240 50%, #0a192f 100%)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 h-screen z-50 border-r ${votingOpen ? 'border-white/50' : 'border-blue-400/30'} backdrop-blur-2xl flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.4)]`}
      >
        {/* TOGGLE BUTTON */}
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(59,130,246,0.6)" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const newState = !collapsed
            setCollapsed(newState)
            localStorage.setItem("sidebarCollapsed", newState)
          }}
          className={`absolute -right-4 top-10 w-8 h-8 rounded-full bg-gradient-to-br ${toggleGradient} flex items-center justify-center ${toggleIconColor} shadow-xl z-[60] border border-white/20`}
        >
          {collapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
        </motion.button>

        {/* PROFILE SECTION */}
        <div className={`px-4 py-10 text-center border-b ${votingOpen ? 'border-white/30' : 'border-blue-400/20'}`}>
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="relative inline-block"
          >
            <FaUserCircle className={`text-5xl ${votingOpen ? "text-blue-800" : "text-blue-400"} mx-auto drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]`} />
            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${votingOpen ? 'border-sky-200 bg-green-500' : 'border-slate-900 bg-blue-400'}`}></div>
          </motion.div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden mt-4"
            >
              <h2 className={`font-black text-sm uppercase tracking-widest ${textColor} truncate px-2`}>{user.name}</h2>
              <p className={`text-[10px] font-bold tracking-[0.2em] ${votingOpen ? "text-blue-800/80" : "text-blue-400/80"}`}>{user.nim}</p>
            </motion.div>
          )}
        </div>

        {/* MENU SECTION */}
        <nav className="flex-1 px-3 py-8 space-y-5 overflow-y-auto no-scrollbar">
          {menus.map((m) => {
            const active = location.pathname === m.path
            return (
              <div
                key={m.path}
                className="relative"
                onMouseEnter={() => setHovered(m.label)}
                onMouseLeave={() => setHovered(null)}
              >
                <Link
                  to={m.path}
                  onClick={() => setActiveMenu(m.path)}
                  className={`
                    relative group flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-500
                    ${active ? hoverActiveColor : textColor + " hover:bg-white/10"}
                  `}
                >
                  <motion.span 
                    animate={active ? { scale: 1.25, rotate: [0, -15, 15, 0] } : {}}
                    className="text-xl z-10"
                  >
                    {m.icon}
                  </motion.span>
                  
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="whitespace-nowrap z-10 tracking-wider"
                    >
                      {m.label}
                    </motion.span>
                  )}

                  {/* GLOSS EFFECT ON ACTIVE/HOVER */}
                  {active && (
                    <motion.div 
                      layoutId="activeGlow"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-transparent pointer-events-none"
                    />
                  )}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                </Link>

                {collapsed && (
                  <Tooltip show={hovered === m.label} text={m.label} />
                )}
              </div>
            )
          })}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className={`px-4 py-8 border-t ${votingOpen ? 'border-white/30' : 'border-blue-400/20'}`}>
          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(225,29,72,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-black flex items-center justify-center gap-2 shadow-xl shadow-red-900/40 border border-white/10"
          >
            <FaSignOutAlt /> {!collapsed && <span className="tracking-[0.2em] uppercase text-[10px]">Logout</span>}
          </motion.button>
        </div>
      </motion.aside>
    </>
  )
}

export default Navbar;