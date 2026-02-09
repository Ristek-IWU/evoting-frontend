import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiBarChart2,
  FiLogOut,
  FiMenu,
  FiClock,
} from "react-icons/fi";

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ===== SIDEBAR STATE DARI LOCALSTORAGE =====
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // ===== RESPONSIVE CHECK =====
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ===== SYNC STATE KE DASHBOARD =====
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
    
    // Kirim event agar Dashboard.jsx tahu sidebar berubah tanpa delay
    window.dispatchEvent(new Event("sidebarStateChange"));
    window.dispatchEvent(new Event("storage"));
    
    // Hapus manipulasi body margin yang bikin layout Dashboard rusak
    document.body.style.marginLeft = "0px";
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const menus = [
    { to: "/admin/dashboard", label: "Dashboard", Icon: FiHome },
    { to: "/admin/manage-candidates", label: "Kelola Kandidat", Icon: FiUsers },
    { to: "/admin/kelola-pemilih", label: "Kelola Pemilih", Icon: FiUserCheck },
    { to: "/admin/results", label: "Hasil Voting", Icon: FiBarChart2 },
    { to: "/admin/history", label: "History Pemilihan", Icon: FiClock },
  ];

  const MenuItem = ({ to, label, Icon, onClick }) => {
    if (!to) return null;
    const active = isActive(to);

    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300
          ${
            active
              ? "bg-white/25 text-white shadow-[0_0_20px_rgba(255,182,193,0.7)]"
              : "text-white/70 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,182,193,0.4)]"
          }`}
      >
        <Icon size={20} />
        {(sidebarOpen || isMobile) && <span className="whitespace-nowrap">{label}</span>}
      </Link>
    );
  };

  // ================= MOBILE TOP BAR =================
  if (isMobile) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <img src="/logo-kampus.png" className="w-8 h-8" alt="Logo" />
              <span className="font-bold">Admin Panel</span>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
              <motion.div
                animate={{ rotate: mobileOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiMenu size={24} />
              </motion.div>
            </button>
          </div>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ y: -400, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -400, opacity: 0 }}
              className="fixed top-[56px] left-0 right-0 z-40
                bg-gradient-to-b from-pink-500 via-purple-500 to-purple-700
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
                  bg-gradient-to-r from-rose-400 via-pink-500 to-pink-600 font-bold shadow-lg text-white"
              >
                <FiLogOut />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ================= DESKTOP SIDEBAR =================
  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col
        bg-gradient-to-b from-pink-500 via-purple-500 to-pink-400/20
        text-white shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out
        ${sidebarOpen ? "w-72" : "w-20"}`}
    >
      {/* LOGO */}
      <div className="px-4 py-6 flex flex-col items-center border-b border-white/20">
        <img
          src="/logo-kampus.png"
          className={`rounded-full shadow-lg transition-all duration-300
            ${sidebarOpen ? "w-20 h-20 mb-3" : "w-10 h-10 mb-0"}`}
          alt="Logo"
        />
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-xl font-extrabold text-center uppercase">Admin Panel</h2>
            <p className="text-sm text-white/80">Sistem E-Voting Himaif</p>
          </motion.div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="mt-4 text-white/80 hover:text-white transition-all p-2 rounded-lg hover:bg-white/10"
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FiMenu size={22} />
          </motion.div>
        </button>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-2 py-6 space-y-3 text-sm overflow-y-auto scrollbar-hide">
        {menus.map((m) => (
          <motion.div
            key={m.to}
            whileHover={{
              scale: 1.05,
              boxShadow:
                "0 0 15px rgba(255,182,193,0.5), 0 0 8px rgba(128,0,128,0.3)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <MenuItem {...m} />
          </motion.div>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="px-4 py-6 border-t border-white/20">
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 20px rgba(255,182,193,0.6), 0 0 10px rgba(128,0,128,0.3)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3
            bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500
            py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-white"
        >
          <FiLogOut size={18} />
          {sidebarOpen && <span>Logout</span>}
        </motion.button>
      </div>
    </aside>
  );
}

export default AdminSidebar;