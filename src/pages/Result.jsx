import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import API from "../services/api"
import { motion } from "framer-motion"
import VoteChart from "../components/VoteChart"

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
      // 1. Ambil data hasil voting (biasanya hanya nama ketua & total)
      const resVotes = await API.get("/api/votes/results")
      const votesData = Array.isArray(resVotes.data) ? resVotes.data : []

      // 2. Ambil data lengkap kandidat (untuk ambil field 'vice')
      const resCand = await API.get("/api/candidates")
      const candData = Array.isArray(resCand.data) ? resCand.data : []

      // 3. Gabungkan data: Cari 'vice' berdasarkan nama ketua yang cocok
      const enrichedResults = votesData.map(v => {
        const match = candData.find(c => 
          c.name.toLowerCase().trim() === v.name.toLowerCase().trim()
        )
        return {
          ...v,
          vice: match ? match.vice : "" 
        }
      })

      setResults(enrichedResults)
    } catch (err) {
      console.error(err)
      setError("Gagal mengambil hasil voting")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-800 flex flex-col md:flex-row">
      <Navbar />

      <main className="flex-1 relative z-10 w-full">
        
        {/* BACKGROUND ANIMASI */}
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

        <div className="pt-24 pb-28 px-4 sm:px-6 md:px-10 flex flex-col items-center">
          
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.01 }}
            className="
              mb-12
              bg-blue-100/80 backdrop-blur-lg
              rounded-3xl shadow-lg border border-blue-200/50
              p-6 sm:p-8 text-center w-full max-w-4xl
            "
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-blue-800">
              Hasil Voting
            </h1>
            <p className="mt-3 text-slate-700 font-medium">
              Persentase suara setiap kandidat secara real-time
            </p>
          </motion.div>

          {/* STATE HANDLING */}
          {loading && (
            <div className="py-20">
              <p className="text-center text-blue-600 font-bold animate-pulse">
                Memuat hasil voting...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl">
              <p className="text-center text-red-500 font-semibold">
                {error}
              </p>
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="py-20 text-center">
              <span className="text-5xl block mb-4">🗳️</span>
              <p className="text-slate-500 font-medium">
                Belum ada hasil voting yang masuk.
              </p>
            </div>
          )}

          {/* KONTEN UTAMA HASIL */}
          {!loading && !error && results.length > 0 && (
            <div className="w-full max-w-4xl flex flex-col items-center">
              
              {/* LIST CARD KANDIDAT */}
              <div className="space-y-6 mb-16 w-full">
                {results.map((item, idx) => (
                  <ResultCard
                    key={item.id || idx}
                    index={idx}
                    name={item.name}
                    vice={item.vice}
                    photo={item.photo}
                    percent={item.percent}
                  />
                ))}
              </div>

              {/* KOMPONEN GRAFIK */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white/90 backdrop-blur rounded-[32px] shadow-2xl border border-slate-200 p-6 sm:p-10 w-full mb-10"
              >
                <h2 className="text-2xl font-black text-center text-slate-800 mb-8 uppercase tracking-tight">
                  Grafik Perolehan Suara
                </h2>

                <div className="w-full overflow-x-auto">
                   <VoteChart data={results} />
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

/* ===============================
    RESULT CARD COMPONENT
================================ */
function ResultCard({ name, vice, photo, percent, index }) {
  const medals = ["🥇", "🥈", "🥉"]

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative rounded-[32px] bg-slate-900 text-white border border-slate-700/50 overflow-hidden shadow-2xl group"
    >
      {/* PASLON BADGE */}
      <div className="absolute top-4 right-4 z-20">
        <span className="px-4 py-1.5 text-[10px] font-black tracking-widest rounded-full bg-black/60 backdrop-blur-md border border-white/10 uppercase">
          Paslon {index + 1}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-stretch">
        {/* CONTAINER FOTO */}
        <div className="relative w-full md:w-56 h-56 md:h-auto shrink-0 bg-slate-800 border-b md:border-b-0 md:border-r border-slate-700/50 overflow-hidden">
          <img
            src={`${API.defaults.baseURL}${photo}`}
            alt={name}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent to-slate-900/30" />
        </div>

        {/* DATA KANDIDAT */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-2">Peringkat Sementara</p>
              <h3 className="font-black text-2xl sm:text-3xl flex items-center gap-3 leading-tight truncate">
                <span className="shrink-0">{medals[index] || "👤"}</span>
                <span className="truncate uppercase">{name}</span>
              </h3>
              
              {/* NAMA WAKIL */}
              <p className="text-xs font-medium text-slate-400 mt-1 uppercase italic tracking-wide">
                {vice ? `Wakil: ${vice}` : "Tanpa Wakil"}
              </p>
            </div>
            
            <div className="shrink-0 bg-slate-800/80 px-6 py-3 rounded-[20px] border border-white/5 text-center shadow-inner">
              <span className="block text-4xl font-black text-cyan-400 tabular-nums">
                {percent}%
              </span>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Suara</p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                Progres Suara
              </span>
              <span className="text-slate-400">{percent}% / 100%</span>
            </div>
            <div className="w-full h-4 rounded-full bg-slate-800/50 border border-white/5 p-1 overflow-hidden shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 2, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Result;