import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/Navbar"
import API from "../services/api"
import jwtDecode from "jwt-decode"
import { useNavigate } from "react-router-dom"

function Voting() {
  const navigate = useNavigate()

  const [candidates, setCandidates] = useState([])
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [voteSuccess, setVoteSuccess] = useState(false)

  const BASE_URL = API.defaults.baseURL || "http://localhost:5000"

  // ================= AUTH + DATA =================
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return navigate("/login")

    try {
      jwtDecode(token)
      API.defaults.headers.common.Authorization = `Bearer ${token}`

      const fetchAll = async () => {
        const status = await API.get("/api/voting/status")
        if (!status.data.isOpen) return navigate("/dashboard")

        const res = await API.get("/api/candidates")
        const candidateList = res.data || []
        setCandidates(candidateList)

        try {
          const myVote = await API.get("/api/votes/me")
          if (myVote.data?.candidateId) {
            const votedCandidate = candidateList.find(
              (c) => c.id === myVote.data.candidateId
            )
            if (votedCandidate) {
              setSelected(votedCandidate)
              setVoteSuccess(true)
            }
          }
        } catch {}
      }

      fetchAll().finally(() => setLoading(false))
    } catch {
      localStorage.clear()
      navigate("/login")
    }
  }, [navigate])

  // ================= SUBMIT =================
  const submitVote = async () => {
    if (!selected || submitting || voteSuccess) return
    setSubmitting(true)

    try {
      await API.post("/api/votes", { candidateId: selected.id })
      setVoteSuccess(true)
      setTimeout(() => navigate("/dashboard"), 2500)
    } catch (err) {
      alert(err?.response?.data?.message || "❌ Gagal voting")
    } finally {
      setSubmitting(false)
    }
  }

  // ================= TEXT FORMAT =================
  const renderParagraph = (text) => {
    if (!text) {
      return <p className="text-sm text-slate-400 italic">Tidak tersedia</p>
    }

    return (
      <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line text-justify">
        {text}
      </p>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-800 flex flex-col md:flex-row">
      <Navbar />

      {/* Main Content Area: Sejajar dengan Navbar */}
      <main className="flex-1 relative z-10 w-full">
        
        {/* ===== BACKGROUND ===== */}
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
          style={{
            background:
              "linear-gradient(120deg, #f8fafc, #e0f2fe, #e0e7ff, #f8fafc)",
            backgroundSize: "300% 300%",
          }}
        />

        <div className="pt-24 pb-28 max-w-6xl mx-auto px-4 sm:px-6">

          {/* ===== HEADER ===== */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-14 bg-blue-200/80 backdrop-blur-lg rounded-3xl shadow-lg border border-blue-300 p-6 sm:p-8 text-center mx-auto max-w-2xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-800">
              Pemilihan Kandidat
            </h1>
            <p className="mt-2 text-base sm:text-lg text-blue-900">
              Kenali visi, misi, dan perjalanan karir kandidat
            </p>
          </motion.div>

          {/* ===== GRID ===== */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
               <p className="text-center font-bold text-blue-800 animate-pulse">Memuat kandidat...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {candidates.map((c, index) => {
                const active = selected?.id === c.id

                return (
                  <motion.div
                    key={c.id}
                    whileHover={!voteSuccess ? { y: -6, scale: 1.02 } : {}}
                    onClick={() => !voteSuccess && setSelected(c)}
                    className={`relative rounded-[32px] overflow-hidden transition cursor-pointer
                      ${active
                        ? "border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.4)]"
                        : "border-slate-800"}
                      bg-slate-900 text-white border-2`}
                  >
                    {/* Label Paslon */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-black/60 backdrop-blur-md text-cyan-400 text-[10px] font-black tracking-[0.2em] px-3 py-1.5 rounded-full border border-cyan-400/30">
                        PASLON {c.number || index + 1}
                      </span>
                    </div>

                    {active && voteSuccess && (
                      <span className="absolute top-4 right-4 z-10 text-[10px] bg-green-500 text-white px-3 py-1.5 rounded-full font-black shadow-lg">
                        ✔ TERPILIH
                      </span>
                    )}

                    {/* Foto Kandidat */}
                    <div className="w-full h-64 overflow-hidden bg-slate-800 relative group">
                      <img
                        src={c.photo ? `${BASE_URL}${c.photo}` : "/candidate-default.png"}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                        alt={c.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                    </div>

                    <div className="p-6">
                      <div className="space-y-1 mb-6">
                          <h3 className="text-xl font-black text-white truncate uppercase tracking-tight">{c.name}</h3>
                          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest opacity-80">Calon Ketua</p>
                      </div>

                      <div className="space-y-1 mb-8">
                          <h3 className="text-lg font-bold text-slate-200 truncate">{c.vice}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calon Wakil Ketua</p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreview(c)
                          }}
                          className="flex-1 py-3 text-[10px] md:text-xs font-bold rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                        >
                          👁 Detail Visi Misi
                        </button>

                        <div
                          className={`px-4 md:px-6 py-3 text-[10px] md:text-xs rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center
                            ${active ? "bg-cyan-400 text-slate-900 shadow-[0_0_20px_rgba(34,211,238,0.5)]" : "bg-slate-800 text-slate-500 border border-slate-700"}`}
                        >
                          {active ? "Dipilih" : "Pilih"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* ===== SUBMIT ===== */}
          <div className="mt-20 flex justify-center">
            <button
              disabled={!selected || submitting || voteSuccess}
              onClick={submitVote}
              className={`px-10 md:px-16 py-4 md:py-5 rounded-[24px] font-black tracking-widest uppercase text-xs md:text-sm transition-all shadow-2xl
                ${!voteSuccess && selected
                  ? "bg-gradient-to-r from-cyan-400 to-indigo-500 text-white hover:scale-105 active:scale-95 shadow-cyan-500/20"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"}`}
            >
              {voteSuccess
                ? "Voting Selesai"
                : submitting
                ? "Mengirim Suara..."
                : "Konfirmasi Pilihan"}
            </button>
          </div>
        </div>
      </main>

      {/* ===== SUCCESS NOTIFICATION ===== */}
      <AnimatePresence>
        {voteSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[100] w-[92%] max-w-md"
          >
            <div className="bg-white/90 backdrop-blur-2xl border border-green-200 text-green-800 px-6 py-5 rounded-[28px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg shadow-green-200 mb-1">
                ✓
              </div>
              <h4 className="text-lg font-black tracking-tight">Voting Berhasil!</h4>
              <p className="text-sm font-medium opacity-75">Terima kasih atas partisipasi Anda dalam pemilihan ini.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PREVIEW MODAL ===== */}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto relative shadow-2xl"
            >
              <button
                onClick={() => setPreview(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                ✕
              </button>

              <div className="mb-8">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">Profil Lengkap</p>
                <h3 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
                  {preview.name} <br/> <span className="text-slate-400">&</span> {preview.vice}
                </h3>
              </div>

              <div className="space-y-6 md:space-y-8">
                <section className="bg-slate-50 p-5 md:p-6 rounded-3xl border border-slate-100">
                  <h4 className="font-black text-xs md:text-sm uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-indigo-500 rounded-full"></span> 🧭 Perjalanan Karir
                  </h4>
                  {renderParagraph(preview.career)}
                </section>

                <section className="bg-slate-50 p-5 md:p-6 rounded-3xl border border-slate-100">
                  <h4 className="font-black text-xs md:text-sm uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-cyan-400 rounded-full"></span> 🎯 Visi & Misi
                  </h4>
                  {renderParagraph(preview.description)}
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Voting