import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import API from "../services/api"

function Login() {
  const navigate = useNavigate()
  const [nim, setNim] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!nim || !password) {
      setError("NIM dan password wajib diisi")
      return
    }

    try {
      const res = await API.post("/api/auth/login", {
        identifier: nim,
        password
      })

      const { token, role } = res.data
      if (!token || !role) throw new Error("Token atau role tidak ditemukan")

      localStorage.clear()
      localStorage.setItem("token", token)
      localStorage.setItem("role", role)

      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true })
      } else {
        navigate("/dashboard", { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login gagal")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 overflow-y-auto">
      <div className="flex flex-col md:flex-row min-h-screen">

        {/* ================= LEFT : LOGIN FORM ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="
            flex-1 flex items-center justify-center
            px-4 sm:px-6
          "
        >
          <div
            className="
              w-full max-w-md
              bg-white/10 backdrop-blur-xl
              rounded-3xl shadow-2xl
              p-6 sm:p-8
            "
          >
            <div className="flex justify-center mb-5">
              <img
                src="/logo-kampus.png"
                alt="Logo Kampus"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-center text-white mb-2">
              Selamat Datang
            </h2>

            <p className="text-center text-white/80 text-sm sm:text-base mb-6">
              Silakan login menggunakan NIM dan Password Anda
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="NIM / Email Admin"
                className="
                  w-full p-3
                  rounded-xl
                  border border-white/30
                  bg-white/10
                  text-white placeholder-white/70
                  focus:ring-2 focus:ring-blue-500
                  outline-none transition
                "
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="
                  w-full p-3
                  rounded-xl
                  border border-white/30
                  bg-white/10
                  text-white placeholder-white/70
                  focus:ring-2 focus:ring-blue-500
                  outline-none transition
                "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <p className="text-red-400 text-sm text-center">
                  {error}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                className="
                  w-full py-3
                  rounded-xl
                  font-bold text-white
                  bg-gradient-to-r from-blue-600 to-blue-900
                  shadow-lg
                "
              >
                Login
              </motion.button>
            </form>

            <p className="text-center text-white/70 mt-4 text-sm">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-blue-300 font-semibold hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </motion.div>

        {/* ================= RIGHT : BRAND (HIDDEN ON MOBILE) ================= */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="
            hidden md:flex
            flex-1 flex-col
            justify-center items-center
            text-center px-10
            text-white
          "
        >
          <motion.img
            src="/logo-kampus.png"
            alt="IWU"
            className="w-40 mb-6 drop-shadow-2xl"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <h1 className="text-4xl font-black mb-4">
            Sistem E-Voting Kampus
          </h1>

          <p className="max-w-xl text-lg text-white/90 leading-relaxed">
            Tingkatkan partisipasi Anda dalam pemilihan mahasiswa secara aman,
            cepat, dan transparan.
          </p>

          <p className="mt-4 italic text-white/80">
            “Satu akun, satu suara, satu masa depan.”
          </p>
        </motion.div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="px-4 sm:px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="
            max-w-3xl mx-auto
            rounded-3xl
            p-4 sm:p-6
            text-center text-white text-sm
            bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900
            shadow-2xl
          "
        >
          © 2026 E-Voting Himaif
        </motion.div>
      </footer>
    </div>
  )
}

export default Login
