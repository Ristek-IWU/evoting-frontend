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
        setCandidates(res.data || [])
      }

      fetchAll().finally(() => setLoading(false))
    } catch {
      localStorage.clear()
      navigate("/login")
    }
  }, [navigate])

  // ================= SUBMIT =================
  const submitVote = async () => {
    if (!selected || submitting) return
    setSubmitting(true)

    try {
      await API.post("/api/votes", { candidateId: selected.id })
      setVoteSuccess(true)

      setTimeout(() => navigate("/dashboard"), 2200)
    } catch (err) {
      alert(err?.response?.data?.message || "❌ Gagal voting")
    } finally {
      setSubmitting(false)
    }
  }

  // ================= TEXT FORMAT =================
  const renderParagraph = (text) => {
    if (!text) {
      return (
        <p className="text-sm text-slate-400 italic">
          Tidak tersedia
        </p>
      )
    }

    return (
      <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line text-justify">
        {text}
      </p>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-800">
      <Navbar />

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

      {/* ===== CONTAINER ===== */}
      <div className="pt-20 pb-28 max-w-7xl mx-auto px-4 sm:px-6 md:ml-[280px] md:pl-10 md:pr-16">
        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 text-center"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-800 to-cyan-600 bg-clip-text text-transparent">
            Pemilihan Kandidat
          </h1>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-600">
            Kenali visi, misi, dan perjalanan karir kandidat
          </p>
        </motion.div>

        {/* ===== GRID KANDIDAT ===== */}
        {loading ? (
          <p className="text-center">Memuat kandidat...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-10">
            {candidates.map((c) => {
              const active = selected?.id === c.id
              return (
                <motion.div
                  key={c.id}
                  whileHover={{ y: -6, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelected(c)}
                  className={`rounded-3xl px-6 sm:px-7 pt-9 pb-8 cursor-pointer transition
                  ${active
                    ? "border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)]"
                    : "border-slate-700"
                  }
                  bg-slate-900 text-white border`}
                >
                  <img
                    src={c.photo ? `${BASE_URL}${c.photo}` : "/candidate-default.png"}
                    className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full border-4 border-slate-700 object-cover"
                    alt={c.name}
                  />

                  <h3 className="mt-5 text-base sm:text-lg font-bold text-center">
                    {c.name}
                  </h3>
                  <p className="text-xs text-center text-slate-400">
                    Wakil: {c.vice}
                  </p>

                  <div className="flex justify-center gap-3 mt-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreview(c)
                      }}
                      className="px-4 py-1.5 text-xs sm:text-sm rounded-full bg-slate-700 hover:bg-slate-600 transition"
                    >
                      👁 Lihat
                    </button>

                    <span
                      className={`px-4 sm:px-5 py-1.5 text-xs sm:text-sm rounded-full font-semibold
                      ${active
                        ? "bg-cyan-400 text-slate-900"
                        : "bg-indigo-500 text-white"}`}
                    >
                      {active ? "Dipilih" : "Pilih"}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* ===== SUBMIT ===== */}
        <div className="mt-20 text-center">
          <button
            disabled={!selected || submitting}
            onClick={submitVote}
            className={`px-10 sm:px-14 py-4 rounded-2xl font-bold text-base sm:text-lg transition
            ${selected
              ? "bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-900 hover:scale-105"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {submitting ? "Mengirim..." : "Kirim Suara"}
          </button>
        </div>
      </div>

      {/* ===== SUCCESS ===== */}
      <AnimatePresence>
        {voteSuccess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl px-8 py-10 text-center shadow-2xl w-full max-w-sm"
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 flex items-center justify-center text-white text-3xl">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Voting Berhasil
              </h3>
              <p className="text-slate-600 text-sm">
                Suara kamu telah berhasil direkam
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PREVIEW MODAL ===== */}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center px-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 40, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              className="bg-white rounded-3xl p-5 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setPreview(null)}
                className="absolute top-4 right-4 text-lg text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>

              <img
                src={preview.photo ? `${BASE_URL}${preview.photo}` : "/candidate-default.png"}
                className="w-20 h-20 rounded-full mx-auto mb-4"
                alt={preview.name}
              />

              <h3 className="text-lg sm:text-xl font-bold text-center mb-8">
                {preview.name} & {preview.vice}
              </h3>

              <div className="space-y-10">
                <section>
                  <h4 className="font-semibold text-slate-900 mb-2">
                    🧭 Perjalanan Karir
                  </h4>
                  {renderParagraph(preview.career)}
                </section>

                <section>
                  <h4 className="font-semibold text-slate-900 mb-2">
                    🎯 Visi & Misi
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
