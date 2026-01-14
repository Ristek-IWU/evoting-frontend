import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "react-icons/fa";
import API from "../services/api";

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
);

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState({
    name: "User",
    nim: "",
  });

  // ================= RESPONSIVE =================
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ================= FETCH USER =================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/api/auth/me");
        setUser({
          name: res.data.name,
          nim: res.data.nim || "",
        });
      } catch {}
    };
    fetchUser();
  }, []);

  const menus = [
    { path: "/dashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/voting", label: "Voting", icon: <FaVoteYea /> },
    { path: "/result", label: "Hasil", icon: <FaChartBar /> },
  ];

  const logout = () => {
    localStorage.clear();
    delete API.defaults.headers.common.Authorization;
    navigate("/login", { replace: true });
  };

  // ================= MOBILE TOP NAV =================
  if (isMobile) {
    return (
      <>
        {/* TOP BAR */}
        <div className="
          fixed top-0 left-0 right-0 z-50
          h-16 px-4
          flex items-center justify-between
          bg-gradient-to-r from-[#050b18] via-[#0b1d3a] to-[#050b18]
          border-b border-white/10 backdrop-blur-xl
        ">
          <div className="flex items-center gap-3 text-white font-bold">
            <FaUserCircle className="text-2xl text-cyan-400" />
            {user.name}
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="text-white text-2xl"
          >
            <FaBars />
          </button>
        </div>

        {/* SLIDE MENU */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 bg-black/60 z-40"
              />

              <motion.aside
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                className="
                  fixed top-0 left-0 bottom-0 w-64 z-50
                  bg-gradient-to-b from-[#050b18] via-[#0b1d3a] to-[#050b18]
                  border-r border-white/10
                  p-4 flex flex-col
                "
              >
                <button
                  onClick={() => setMobileOpen(false)}
                  className="self-end text-white text-xl mb-6"
                >
                  <FaTimes />
                </button>

                <nav className="space-y-3 flex-1">
                  {menus.map((m) => (
                    <Link
                      key={m.path}
                      to={m.path}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex items-center gap-4 px-4 py-3 rounded-xl font-semibold
                        ${
                          location.pathname === m.path
                            ? "bg-cyan-500/20 text-cyan-400"
                            : "text-slate-300 hover:bg-white/10"
                        }
                      `}
                    >
                      <span className="text-lg">{m.icon}</span>
                      {m.label}
                    </Link>
                  ))}
                </nav>

                <button
                  onClick={logout}
                  className="
                    mt-4 py-3 rounded-xl
                    bg-gradient-to-r from-red-600 to-red-500
                    text-white font-bold
                  "
                >
                  Logout
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ================= DESKTOP SIDEBAR =================
  return (
    <motion.aside
      animate={{ width: collapsed ? 88 : 260 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="
        fixed top-0 left-0 h-screen z-50
        bg-gradient-to-b from-[#050b18] via-[#0b1d3a] to-[#050b18]
        border-r border-white/10
        backdrop-blur-xl
        flex flex-col
      "
    >
      {/* TOGGLE */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute -right-4 top-6
          w-9 h-9 rounded-full
          bg-gradient-to-br from-blue-700 to-cyan-600
          text-white flex items-center justify-center
        "
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </motion.button>

      {/* PROFILE */}
      <div className="px-4 py-8 text-center border-b border-white/10">
        <FaUserCircle className="text-4xl text-cyan-400 mx-auto" />
        {!collapsed && (
          <>
            <h2 className="mt-3 font-bold text-white">{user.name}</h2>
            <p className="text-xs text-slate-400">{user.nim}</p>
          </>
        )}
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-6 space-y-3 text-sm">
        {menus.map((m) => {
          const active = location.pathname === m.path;
          return (
            <div
              key={m.path}
              className="relative"
              onMouseEnter={() => setHovered(m.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <Link
                to={m.path}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl font-semibold
                  ${
                    active
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "text-slate-300 hover:bg-white/10"
                  }
                `}
              >
                <span className="text-lg">{m.icon}</span>
                {!collapsed && m.label}
              </Link>

              {collapsed && (
                <Tooltip show={hovered === m.label} text={m.label} />
              )}
            </div>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="px-4 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="
            w-full py-3 rounded-xl
            bg-gradient-to-r from-red-600 to-red-500
            text-white font-bold
          "
        >
          {!collapsed && "Logout"}
          {collapsed && <FaSignOutAlt />}
        </button>
      </div>
    </motion.aside>
  );
}

export default Navbar;
