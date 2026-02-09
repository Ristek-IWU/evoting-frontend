import { useState, useEffect, useRef, memo } from "react"
import AdminSidebar from "../../components/AdminSidebar"
import API from "../../services/api"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FaUsers, FaUserTie, FaVoteYea, FaUserClock, 
  FaCalendarAlt, FaPlay, FaStop, FaClock,
  FaCheckCircle, FaExclamationTriangle, FaChartLine,
  FaShieldAlt, FaTrophy, FaTrashAlt, FaRobot
} from "react-icons/fa"

/* ============================
    HELPERS (LOGIC TETAP AMAN) 
============================ */
const formatToInput = (v) => (v ? v.replace(" ", "T").slice(0, 16) : "")
const toWIBString = (v) => (v ? v.replace("T", " ") + ":00" : null)

const ultraParseDate = (v) => {
  if (!v) return null
  if (v.includes('/')) {
    try {
      const [datePart, timePart] = v.split(', ')
      const [d, m, y] = datePart.split('/')
      const fullTime = timePart.replaceAll('.', ':')
      return new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${fullTime}`)
    } catch (e) { console.error("Parse Error", e) }
  }
  const d = new Date(v.includes('Z') ? v : v.replace(" ", "T") + "+07:00")
  return isNaN(d.getTime()) ? null : d
}

const formatTime = (s) => {
  if (s == null || s <= 0) return "00:00:00"
  const h = String(Math.floor(s / 3600)).padStart(2, "0")
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0")
  const sec = String(s % 60).padStart(2, "0")
  return `${h}:${m}:${sec}`
}

/* ============================
    ISOLATED TIMER (LOGIC AMAN)
============================ */
const IsolatedTimer = memo(({ schedule, votingStatus, serverTime }) => {
  const [display, setDisplay] = useState({ text: "SINKRONISASI...", color: "from-slate-800 to-slate-900" })
  const localClockRef = useRef(new Date())

  useEffect(() => {
    if (serverTime) {
      const parsedServer = ultraParseDate(serverTime)
      if (parsedServer) localClockRef.current = parsedServer
    }
  }, [serverTime])

  useEffect(() => {
    const ticker = setInterval(() => {
      localClockRef.current = new Date(localClockRef.current.getTime() + 1000)
      const now = localClockRef.current
      const start = ultraParseDate(schedule.votingStart || schedule.voting_start)
      const end = ultraParseDate(schedule.votingEnd || schedule.voting_end)

      if (!start || !end) {
        setDisplay({
          text: votingStatus ? "VOTING SEDANG BERJALAN" : "SISTEM NONAKTIF",
          color: votingStatus ? "from-emerald-500 to-teal-600" : "from-rose-500 to-pink-600"
        })
        return
      }

      const toStart = Math.floor((start - now) / 1000)
      const toEnd = Math.floor((end - now) / 1000)

      if (toStart > 0) {
        setDisplay({ text: `MULAI DALAM: ${formatTime(toStart)}`, color: "from-amber-500 to-orange-600" })
      } else if (toEnd > 0) {
        setDisplay({ text: `SISA WAKTU: ${formatTime(toEnd)}`, color: "from-indigo-500 to-blue-600" })
      } else {
        setDisplay({ text: "PEMILIHAN SELESAI", color: "from-purple-600 to-indigo-700" })
      }
    }, 1000)
    return () => clearInterval(ticker)
  }, [schedule, votingStatus])

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`flex items-center gap-4 bg-gradient-to-r ${display.color} px-10 py-5 rounded-full shadow-2xl border border-white/20 backdrop-blur-xl`}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-3 h-3 bg-white rounded-full animate-ping absolute opacity-50" />
        <div className="w-2 h-2 bg-white rounded-full relative" />
      </div>
      <p className="text-white text-xs md:text-sm font-black tracking-[0.15em] whitespace-nowrap">
        {display.text}
      </p>
    </motion.div>
  )
})

/* ============================
    ADMIN DASHBOARD (PREMIUM UI)
============================ */
export default function AdminDashboard() {
  const [votingStatus, setVotingStatus] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverTime, setServerTime] = useState(null)
  const [stats, setStats] = useState({ voted: 0, notVoted: 0, totalStudents: 0, totalCandidates: 0, results: [] })
  const [candidates, setCandidates] = useState([])
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [toast, setToast] = useState(null)
  const blockSync = useRef(false)

  // Responsive & Layout State
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("sidebarOpen");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  })

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem("himaif_v_final_fixed")
    return saved ? JSON.parse(saved) : { votingStart: "", votingEnd: "" }
  });

  // Check if automation is active
  const isAutoMode = schedule.votingStart && schedule.votingEnd;

  // Update Layout secara Instan saat Sidebar berubah
  useEffect(() => {
    const checkResize = () => setIsMobile(window.innerWidth < 768);
    
    // Fungsi untuk menangkap perubahan localStorage dari Sidebar
    const handleSidebarChange = () => {
      const saved = localStorage.getItem("sidebarOpen");
      setSidebarOpen(saved !== null ? JSON.parse(saved) : true);
    };

    checkResize();
    window.addEventListener("resize", checkResize);
    // Listener untuk custom event atau storage agar sync seketika
    window.addEventListener("sidebarStateChange", handleSidebarChange);
    window.addEventListener("storage", handleSidebarChange);

    // Tetap gunakan interval kecil sebagai backup jika event gagal
    const interval = setInterval(handleSidebarChange, 300);

    return () => {
      window.removeEventListener("resize", checkResize);
      window.removeEventListener("sidebarStateChange", handleSidebarChange);
      window.removeEventListener("storage", handleSidebarChange);
      clearInterval(interval);
    };
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = async () => {
    if (isEditingSchedule || blockSync.current) return
    try {
      const { data: statusData } = await API.get("/api/voting/status")
      setVotingStatus(statusData.isOpen || statusData.is_open === 1)
      setServerTime(statusData.serverTime)
      
      const incoming = { 
        votingStart: statusData.votingStart || statusData.voting_start || "", 
        votingEnd: statusData.votingEnd || statusData.voting_end || "" 
      }

      if (incoming.votingStart && incoming.votingEnd) {
        if (JSON.stringify(incoming) !== JSON.stringify(schedule)) {
          setSchedule(incoming)
          localStorage.setItem("himaif_v_final_fixed", JSON.stringify(incoming))
        }
      }

      const { data: statsData } = await API.get("/api/admin/stats")
      setStats(statsData)

      const { data: candData } = await API.get("/api/candidates")
      setCandidates(candData)

    } catch (e) { console.error("Fetch Error:", e) }
  }

  useEffect(() => {
    fetchData()
    const i = setInterval(fetchData, 5000)
    return () => clearInterval(i)
  }, [isEditingSchedule])

  const handleSaveSchedule = async () => {
    if(!schedule.votingStart || !schedule.votingEnd) return showToast("Mohon isi semua waktu!", "error")
    setLoading(true)
    blockSync.current = true 
    try {
      const s = toWIBString(schedule.votingStart)
      const e = toWIBString(schedule.votingEnd)
      await API.post("/api/voting/schedule", {
        votingStart: s, votingEnd: e,
        voting_start: s, voting_end: e
      })
      localStorage.setItem("himaif_v_final_fixed", JSON.stringify(schedule))
      setIsEditingSchedule(false)
      showToast("Jadwal Berhasil Diperbarui!")
      setTimeout(() => { blockSync.current = false; fetchData() }, 2000)
    } catch (err) {
      blockSync.current = false
      showToast("Gagal menyimpan jadwal!", "error")
    } finally { setLoading(false) }
  }

  const handleClearSchedule = async () => {
    if (!window.confirm("Hapus semua jadwal voting?")) return
    setLoading(true)
    try {
      await API.post("/api/voting/clear-schedule")
      const reset = { votingStart: "", votingEnd: "" }
      setSchedule(reset)
      localStorage.removeItem("himaif_v_final_fixed")
      showToast("Jadwal Berhasil Dihapus!", "success")
      await fetchData()
    } catch (e) {
      showToast("Gagal menghapus jadwal!", "error")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 overflow-x-hidden">
      <AdminSidebar />
      
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-6 right-6 z-[10000] w-[calc(100%-3rem)] md:w-auto"
          >
            <div className={`flex items-center gap-4 px-6 py-4 bg-white rounded-3xl border shadow-2xl ${toast.type === 'success' ? 'border-emerald-100' : 'border-rose-100'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {toast.type === "success" ? <FaCheckCircle size={24}/> : <FaExclamationTriangle size={24}/>}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Sistem Notifikasi</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{toast.msg}</p>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main 
        className={`transition-all duration-300 ease-in-out px-4 md:px-14 pb-24
          ${isMobile ? "pt-24 ml-0" : sidebarOpen ? "pt-16 ml-72" : "pt-16 ml-20"}`}
      >
        
        <header className="mb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 leading-tight">
              Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Admin</span>
            </h1>
            <p className="mt-4 text-slate-500 font-bold text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Pantau perolehan suara secara langsung dan kelola parameter sistem pemilihan dengan presisi tinggi.
            </p>
          </motion.div>
        </header>

        <div className="flex justify-center mb-16">
          <IsolatedTimer schedule={schedule} votingStatus={votingStatus} serverTime={serverTime} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
          {[
            { t: "Suara Masuk", v: stats.voted, i: <FaVoteYea />, g: "from-emerald-400 to-teal-500" },
            { t: "Belum Memilih", v: stats.notVoted, i: <FaUserClock />, g: "from-rose-400 to-pink-500" },
            { t: "Total Mahasiswa", v: stats.totalStudents, i: <FaUsers />, g: "from-blue-500 to-indigo-600" },
            { t: "Total Paslon", v: stats.totalCandidates, i: <FaUserTie />, g: "from-violet-500 to-purple-600" },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -12, scale: 1.05, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
              transition={{ type: "spring", stiffness: 300 }}
              className="group relative bg-white p-7 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden transition-all duration-300"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.g} opacity-5 -mr-8 -mt-8 rounded-full group-hover:scale-[2] transition-transform duration-700`} />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${item.g} flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform`}>
                  {item.i}
                </div>
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Data Realtime</div>
              </div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-1">{item.v ?? 0}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.t}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mt-16 -mr-16 blur-3xl" />
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-black mb-8 flex items-center gap-4 uppercase tracking-tighter">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                    Manajemen Sesi
                  </h3>
                  <div className="space-y-4">
                    {/* BUTTON BUKA/TUTUP DENGAN KONDISI AUTO MODE */}
                    <button 
                      disabled={isAutoMode}
                      onClick={() => API.post(votingStatus ? "/api/voting/close" : "/api/voting/open").then(fetchData)}
                      className={`group w-full py-6 rounded-3xl font-black flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl 
                        ${isAutoMode 
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 cursor-not-allowed" 
                          : votingStatus 
                            ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 text-white" 
                            : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 text-white"
                        }`}
                    >
                      {isAutoMode ? (
                        <>
                          <FaRobot className="animate-bounce" /> AUTO CONTROLLED
                        </>
                      ) : (
                        <>
                          {votingStatus ? <FaStop className="animate-pulse" /> : <FaPlay />} 
                          {votingStatus ? "TUTUP VOTING" : "BUKA VOTING"}
                        </>
                      )}
                    </button>

                    <button 
                      onClick={() => setIsEditingSchedule(true)}
                      className="w-full py-6 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-3xl font-black flex items-center justify-center gap-4 transition-all active:scale-95 backdrop-blur-md"
                    >
                      <FaCalendarAlt className="text-indigo-400" /> {isAutoMode ? "UBAH JADWAL" : "ATUR JADWAL"}
                    </button>
                    <div className="pt-6 border-t border-white/5 mt-4">
                      <button 
                        onClick={handleClearSchedule}
                        className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 uppercase tracking-[0.2em] transition-all active:scale-95"
                      >
                        <FaTrashAlt size={12} /> Reset Jadwal Sistem
                      </button>
                    </div>
                  </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[3rem] md:rounded-[4rem] p-6 md:p-12 border border-white shadow-2xl shadow-slate-200/60">
              <div className="flex items-center gap-5 mb-12">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg rotate-3">
                  <FaChartLine size={24} />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Ringkasan Kandidat</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Data Perolehan Suara Paslon</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {candidates.map((c, i) => {
                  const votes = c.votes || 0;
                  const percentage = stats.voted > 0 ? ((votes / stats.voted) * 100).toFixed(1) : 0;
                  
                  return (
                    <motion.div 
                      key={c.id}
                      whileHover={{ y: -5 }}
                      className="p-8 md:p-10 rounded-[3.5rem] bg-slate-50/50 border border-slate-100 relative overflow-hidden group"
                    >
                      <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                        <div className="relative shrink-0">
                          <div className="relative p-1.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[2.5rem] shadow-2xl">
                             <img 
                               src={`${API.defaults.baseURL}${c.photo}`} 
                               className="w-32 h-32 md:w-40 md:h-40 rounded-[2.2rem] object-cover border-4 border-white" 
                               alt={c.name} 
                             />
                          </div>
                          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-slate-900 text-white rounded-2xl text-[11px] font-black shadow-xl border border-white/10 uppercase tracking-widest whitespace-nowrap">
                            PASLON 0{c.paslon || i+1}
                          </div>
                        </div>

                        <div className="flex-1 w-full">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                            <div>
                              <h4 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                                {c.name} {c.vice ? `& ${c.vice}` : ''}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                                  Ketua: {c.name}
                                </span>
                                {c.vice && (
                                  <span className="px-4 py-1.5 bg-purple-100 text-purple-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                                    Wakil: {c.vice}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="bg-white px-8 py-4 rounded-[2rem] shadow-sm border border-slate-100 text-center min-w-[120px]">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Suara</p>
                               <div className="flex items-center justify-center gap-2">
                                  <FaTrophy className={votes > 0 ? "text-amber-400" : "text-slate-200"} size={20} />
                                  <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">{votes}</span>
                               </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                             <div className="flex justify-between items-end">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Persentase Kemenangan</span>
                               <span className="text-xl font-black text-indigo-600 tracking-tighter">{percentage}%</span>
                             </div>
                             <div className="h-4 w-full bg-slate-200/50 rounded-full overflow-hidden p-1">
                               <motion.div 
                                 initial={{ width: 0 }} 
                                 animate={{ width: `${percentage}%` }} 
                                 transition={{ duration: 1.5, ease: "circOut" }}
                                 className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg" 
                               />
                             </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isEditingSchedule && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 w-full max-w-lg shadow-2xl"
            >
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3"><FaClock size={32} /></div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Atur Jadwal</h3>
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Otomatisasi Aktivasi Voting</p>
              </div>
              <div className="space-y-8 mb-10">
                <div className="relative group">
                  <label className="absolute -top-2.5 left-6 bg-white px-3 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-10 border border-indigo-50 rounded-full">Waktu Mulai</label>
                  <input type="datetime-local" value={formatToInput(schedule.votingStart)} onChange={(e) => setSchedule(p => ({ ...p, votingStart: e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-600 focus:bg-white rounded-[1.8rem] px-8 py-5 transition-all outline-none font-black text-slate-800" />
                </div>
                <div className="relative group">
                  <label className="absolute -top-2.5 left-6 bg-white px-3 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-10 border border-indigo-50 rounded-full">Waktu Selesai</label>
                  <input type="datetime-local" value={formatToInput(schedule.votingEnd)} onChange={(e) => setSchedule(p => ({ ...p, votingEnd: e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-600 focus:bg-white rounded-[1.8rem] px-8 py-5 transition-all outline-none font-black text-slate-800" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={handleSaveSchedule} disabled={loading} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50">
                  {loading ? "MENYIMPAN..." : "SIMPAN JADWAL BARU"}
                </button>
                <button onClick={() => setIsEditingSchedule(false)} className="w-full py-3 text-slate-400 font-black uppercase text-[9px] tracking-widest hover:text-rose-500 transition-colors">Batalkan</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}