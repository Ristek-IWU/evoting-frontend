import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import API from "../services/api"
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"

// =================== PARTICLE COMPONENT ===================
function Particle({ x, y, color }) {
  return (
    <motion.div
      initial={{ x, y, opacity: 1, scale: 1 }}
      animate={{
        y: y - Math.random() * 80 - 20,
        x: x + Math.random() * 40 - 20,
        opacity: 0,
        scale: 0.3 + Math.random() * 0.3
      }}
      transition={{ duration: 1.2 + Math.random() * 0.5, ease: "easeOut" }}
      className={`absolute w-1 h-1 rounded-full ${color} shadow-xl`}
    />
  )
}

// =================== TOAST NOTIFICATION COMPONENT ===================
function ToastNotification({ show, type = "success", message }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 30 }).map(() => ({
        id: Math.random(),
        x: Math.random() * 80 - 40,
        y: 0,
        color: type === "success" ? "bg-green-400" : "bg-red-400"
      }))
      setParticles(newParticles)
      const timer = setTimeout(() => setParticles([]), 1500)
      return () => clearTimeout(timer)
    }
  }, [show, type])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -120, opacity: 0, scale: 0.7 }}
          animate={{ y: 20, opacity: 1, scale: 1.1 }}
          exit={{ y: -120, opacity: 0, scale: 0.7 }}
          transition={{ type: "spring", stiffness: 500, damping: 25, mass: 0.6 }}
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 text-white border-2 neon-toast ${
            type === "success"
              ? "bg-gradient-to-r from-green-500 to-green-700 border-green-300"
              : "bg-gradient-to-r from-red-500 to-red-700 border-red-300"
          }`}
        >
          <div className="relative">
            {type === "success" ? (
              <motion.div
                initial={{ rotate: 0, scale: 0.9 }}
                animate={{ rotate: [0, 25, -25, 0], scale: [0.9, 1.2, 1, 1] }}
                transition={{ duration: 1 }}
              >
                <FaCheckCircle size={28} className="drop-shadow-lg neon-icon" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ rotate: 0, scale: 0.9 }}
                animate={{ rotate: [0, 15, -15, 0], scale: [0.9, 1.2, 1, 1] }}
                transition={{ duration: 1 }}
              >
                <FaTimesCircle size={28} className="drop-shadow-lg neon-icon" />
              </motion.div>
            )}

            {particles.map((p) => (
              <Particle key={p.id} x={p.x} y={p.y} color={p.color} />
            ))}
          </div>

          <span className="font-semibold text-sm sm:text-base neon-glow">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// =================== LOGIN PAGE ===================
function Login() {
  const navigate = useNavigate()
  const [nim, setNim] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [toast, setToast] = useState({ show: false, type: "success", message: "" })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!nim || !password) {
      setError("NIM dan password wajib diisi")
      return
    }

    try {
      // Backend menggunakan key 'identifier' untuk NIM/Email
      const res = await API.post("/api/auth/login", {
        identifier: nim,
        password
      })

      const { token, role } = res.data
      if (!token || !role) throw new Error("Data login tidak lengkap")

      localStorage.clear()
      localStorage.setItem("token", token)
      localStorage.setItem("role", role)

      setToast({ show: true, type: "success", message: "Login berhasil!" })

      setTimeout(() => {
        setToast({ show: false, type: "success", message: "" })
        if (role === "admin") navigate("/admin/dashboard", { replace: true })
        else navigate("/dashboard", { replace: true })
      }, 1500)
    } catch (err) {
      // Menangkap pesan error "Akun belum aktif" dari Backend (Status 403)
      const errorMsg = err.response?.data?.message || "Login gagal"
      setError(errorMsg)
      setToast({ show: true, type: "error", message: errorMsg })
      setTimeout(() => setToast({ show: false, type: "error", message: "" }), 3000)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-500 via-purple-600 to-purple-900 overflow-hidden">
      <ToastNotification
        show={toast.show}
        type={toast.type}
        message={toast.message}
      />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* ================= LEFT : LOGIN FORM ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 flex items-center justify-center px-4 sm:px-6 relative"
        >
          <div
            className="
              w-full max-w-md
              bg-white/10 backdrop-blur-xl
              rounded-[2.5rem] shadow-2xl
              p-6 sm:p-10
              border border-white/20
              relative z-10
            "
          >
            <div className="flex justify-center mb-4 sm:mb-6">
              <motion.img
                src="/logo-kampus.png"
                alt="Logo Kampus"
                className="w-14 h-14 sm:w-20 sm:h-20 object-contain"
                whileHover={{ rotate: 10, scale: 1.1 }}
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-center text-white mb-2 tracking-tight">
              Selamat Datang
            </h2>

            <p className="text-center text-white/80 text-xs sm:text-base mb-6 sm:mb-8">
              Silakan login menggunakan NIM dan Password Anda
            </p>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div className="group relative">
                <input
                  type="text"
                  placeholder="NIM / Email Admin"
                  className="
                    w-full p-3 sm:p-4
                    rounded-2xl
                    border border-white/30
                    bg-white/5
                    text-white placeholder-white/50
                    focus:ring-2 focus:ring-pink-400
                    focus:bg-white/10
                    outline-none transition-all duration-300
                    text-sm sm:text-base
                  "
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  required
                />
              </div>

              <div className="group relative">
                <input
                  type="password"
                  placeholder="Password"
                  className="
                    w-full p-3 sm:p-4
                    rounded-2xl
                    border border-white/30
                    bg-white/5
                    text-white placeholder-white/50
                    focus:ring-2 focus:ring-pink-400
                    focus:bg-white/10
                    outline-none transition-all duration-300
                    text-sm sm:text-base
                  "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-red-300 text-xs sm:text-sm text-center font-medium bg-red-500/20 py-2 rounded-lg"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: "0 0 20px rgba(236, 72, 153, 0.5)",
                  filter: "brightness(1.1)"
                }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="
                  w-full py-3 sm:py-4
                  rounded-2xl
                  font-bold text-white
                  bg-gradient-to-r from-pink-500 via-purple-500 to-purple-700
                  shadow-xl
                  relative overflow-hidden
                  transition-all duration-300
                  text-sm sm:text-base
                "
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative z-10">Login Ke Akun</span>
              </motion.button>
            </form>

            <p className="text-center text-white/70 mt-5 sm:mt-6 text-xs sm:text-sm">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-pink-300 font-bold hover:text-white transition-colors"
              >
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </motion.div>

        {/* ================= RIGHT : BRAND ================= */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex flex-1 flex-col justify-center items-center text-center px-10 text-white"
        >
          <motion.img
            src="/logo-kampus.png"
            alt="IWU"
            className="w-32 lg:w-44 mb-6 drop-shadow-2xl"
            animate={{ 
              y: [0, -15, 0],
              filter: ["drop-shadow(0px 0px 0px rgba(255,255,255,0))", "drop-shadow(0px 0px 20px rgba(255,255,255,0.3))", "drop-shadow(0px 0px 0px rgba(255,255,255,0))"]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <h1 className="text-3xl lg:text-5xl font-black mb-4 leading-tight">
            Sistem E-Voting <br/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-200">Himaif</span>
          </h1>

          <p className="max-w-xl text-base lg:text-lg text-white/80 leading-relaxed font-light">
            Tingkatkan partisipasi Anda dalam pemilihan mahasiswa secara aman,
            cepat, dan transparan.
          </p>

          <p className="mt-6 italic text-white/60 text-sm lg:text-base">
            “Satu akun, satu suara, satu masa depan.”
          </p>
        </motion.div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="px-4 sm:px-6 pb-6 sm:pb-8 shrink-0 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="
            max-w-xl mx-auto
            rounded-2xl sm:rounded-3xl
            p-3 sm:p-5
            text-center text-white text-xs sm:text-sm
            bg-white/5 backdrop-blur-md
            border border-white/10
            shadow-2xl
            flex items-center justify-center gap-2
          "
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="opacity-90 font-medium tracking-wide">© 2026 E-Voting Himaif — Secure Voting System</span>
        </motion.div>
      </footer>
    </div>
  )
}

export default Login