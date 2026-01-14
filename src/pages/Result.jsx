import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import API from "../services/api"
import { motion } from "framer-motion"

function Result() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const res = await API.get("/api/votes/results")
      setResults(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      setError("Gagal mengambil hasil voting")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-800">
      {/* ===== BACKGROUND ===== */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
        style={{
          background:
            "linear-gradient(120deg, #f8fafc, #e0f2fe, #e0e7ff, #f8fafc)",
          backgroundSize: "300% 300%"
        }}
      />

      {/* ORBS */}
      <motion.div
        className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-cyan-400/20 rounded-full blur-3xl -z-10"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-200px] right-[-200px] w-[520px] h-[520px] bg-indigo-400/20 rounded-full blur-3xl -z-10"
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      <Navbar />

      {/* ===== CONTENT ===== */}
      <div
        className="
          pt-20 pb-28
          px-4 sm:px-6
          md:ml-[300px] md:px-10
          max-w-6xl
        "
      >
        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1
            className="
              text-3xl sm:text-4xl md:text-5xl
              font-extrabold tracking-tight
              bg-gradient-to-r from-slate-900 via-indigo-700 to-cyan-600
              bg-clip-text text-transparent
            "
          >
            Hasil Voting
          </h1>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-600">
            Persentase suara setiap kandidat secara real-time
          </p>
        </motion.div>

        {/* ===== STATE ===== */}
        {loading && (
          <p className="text-center text-slate-500">
            Memuat hasil voting...
          </p>
        )}

        {error && (
          <p className="text-center text-red-500">
            {error}
          </p>
        )}

        {!loading && !error && results.length === 0 && (
          <p className="text-center text-slate-500">
            Belum ada hasil voting
          </p>
        )}

        {/* ===== RESULT LIST ===== */}
        {!loading && !error && results.length > 0 && (
          <div className="space-y-6 sm:space-y-8">
            {results.map((item, idx) => (
              <ResultCard
                key={item.id}
                index={idx}
                name={item.name}
                percent={item.percent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ===== RESULT CARD ===== */
function ResultCard({ name, percent, index }) {
  const medals = ["🥇", "🥈", "🥉"]

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 25px 45px rgba(15,23,42,0.35)"
      }}
      className="
        relative rounded-3xl
        px-5 sm:px-7 py-6
        bg-slate-900 text-white
        border border-slate-700
        overflow-hidden
      "
    >
      {/* GLOW */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-indigo-400/10 pointer-events-none" />

      {/* HEADER */}
      <div className="relative z-10 flex justify-between items-center mb-4 gap-3">
        <h3 className="text-sm sm:text-lg font-bold flex items-center gap-2">
          {medals[index] && <span>{medals[index]}</span>}
          <span className="line-clamp-1">{name}</span>
        </h3>
        <span className="text-sm sm:text-lg font-bold text-cyan-300 shrink-0">
          {percent}%
        </span>
      </div>

      {/* BAR */}
      <div className="relative z-10 w-full h-4 sm:h-5 rounded-full bg-slate-700 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{
            duration: 1.4,
            ease: "easeInOut",
            delay: index * 0.2
          }}
        />
      </div>
    </motion.div>
  )
}

export default Result
