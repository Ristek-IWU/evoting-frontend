import { useState, useEffect } from "react"
import AdminSidebar from "../../components/AdminSidebar"
import API from "../../services/api"
import { motion, AnimatePresence } from "framer-motion"

export default function ManageCandidate() {
  const [candidates, setCandidates] = useState([])
  const [paslon, setPaslon] = useState("")
  const [name, setName] = useState("")
  const [vice, setVice] = useState("")
  const [vision, setVision] = useState("")
  const [career, setCareer] = useState("")
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [openAdd, setOpenAdd] = useState(false)
  
  // State untuk Notifikasi Baru
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" })

  const [openDetail, setOpenDetail] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  // ===== UPDATE RESPONSIVE LAYOUT LOGIC =====
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const handleSidebarChange = () => {
      const saved = localStorage.getItem("sidebarOpen");
      setSidebarOpen(saved !== null ? JSON.parse(saved) : true);
    };

    window.addEventListener("sidebarStateChange", handleSidebarChange);
    window.addEventListener("storage", handleSidebarChange);
    return () => {
      window.removeEventListener("sidebarStateChange", handleSidebarChange);
      window.removeEventListener("storage", handleSidebarChange);
    };
  }, []);

  useEffect(() => {
    fetchCandidates()
  }, [])

  // Fungsi Helper untuk memicu Notifikasi
  const triggerNotify = (message, type = "success") => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 4000)
  }

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const res = await API.get("/api/candidates")
      const data = res.data.map(c => ({
        ...c,
        photo: c.photo ? `${API.defaults.baseURL}${c.photo}` : null,
      }))
      setCandidates(data)
    } catch {
      setError("Gagal mengambil data kandidat")
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const addCandidate = async () => {
    if (!paslon || !name || !vice || !vision) {
      setError("⚠️ Semua field wajib diisi")
      return
    }

    try {
      setError("")
      const formData = new FormData()
      formData.append("paslon", paslon)
      formData.append("name", name)
      formData.append("vice", vice)
      formData.append("description", vision)
      formData.append("career", career)
      if (photo) formData.append("photo", photo)

      const res = await API.post("/api/candidates", formData)

      setCandidates(prev => [
        ...prev,
        {
          ...res.data,
          photo: res.data.photo
            ? `${API.defaults.baseURL}${res.data.photo}`
            : null,
        },
      ])

      setOpenAdd(false)
      
      // Notifikasi Sukses Tambah
      triggerNotify(`Berhasil! Paslon ${paslon} telah terdaftar.`, "success")

      setPaslon("")
      setName("")
      setVice("")
      setVision("")
      setCareer("")
      setPhoto(null)
      setPhotoPreview(null)
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal menambahkan kandidat")
    }
  }

  const deleteCandidate = async (id, nomorPaslon) => {
    if (!window.confirm(`Yakin ingin menghapus Paslon ${nomorPaslon}?`)) return
    try {
      await API.delete(`/api/candidates/${id}`)
      setCandidates(prev => prev.filter(c => c.id !== id))
      
      // Notifikasi Sukses Hapus
      triggerNotify(`Paslon ${nomorPaslon} telah dihapus permanent.`, "delete")
    } catch (err) {
      triggerNotify("Gagal menghapus kandidat.", "error")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      <AdminSidebar />

      {/* GLOBAL TOAST NOTIFICATION */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className={`fixed top-5 left-1/2 z-[100] px-6 py-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border backdrop-blur-md flex items-center gap-3 min-w-[320px] ${
              notification.type === "success" 
                ? "bg-white/80 border-green-200 text-green-800" 
                : notification.type === "delete"
                ? "bg-white/80 border-red-200 text-red-800"
                : "bg-white/80 border-amber-200 text-amber-800"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${
              notification.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}>
              {notification.type === "success" ? "✓" : "🗑️"}
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-tight">System Notification</p>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={`flex-1 px-6 py-12 transition-all duration-300 ${
          sidebarOpen ? "md:ml-72" : "md:ml-20"
        } ml-0`}
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Kelola Kandidat
        </h1>

        <div className="flex justify-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255,182,193,0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpenAdd(true)}
            className="bg-gradient-to-r from-pink-500 via-red-500 to-purple-600 text-white px-8 py-4 rounded-full shadow-lg font-bold transition-all duration-300"
          >
            + Tambah Kandidat Baru
          </motion.button>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {candidates.map(c => (
            <CandidateCard
              key={c.id}
              candidate={c}
              onDelete={() => deleteCandidate(c.id, c.paslon)}
              onView={() => {
                setSelectedCandidate(c)
                setOpenDetail(true)
              }}
            />
          ))}
        </div>
      </div>

      {/* ================= MODAL DETAIL ================= */}
      <AnimatePresence>
        {openDetail && selectedCandidate && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl"
            >
              <button
                onClick={() => setOpenDetail(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold transition-colors"
              >
                ✕
              </button>

              <h2 className="text-2xl font-black text-center mb-2 text-gray-800">
                PASLON {selectedCandidate.paslon}
              </h2>

              <div className="text-center mb-6">
                <p className="font-bold text-lg text-indigo-600">
                  {selectedCandidate.name} & {selectedCandidate.vice}
                </p>
              </div>

              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-indigo-50 rounded-2xl p-5 mb-4 border border-indigo-100 shadow-sm">
                  <h3 className="font-black mb-2 text-indigo-700 uppercase text-xs tracking-wider">
                    Visi & Misi
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {selectedCandidate.description}
                  </p>
                </div>

                <div className="bg-pink-50 rounded-2xl p-5 border border-pink-100 shadow-sm">
                  <h3 className="font-black mb-2 text-pink-700 uppercase text-xs tracking-wider">
                    Perjalanan Karir / Prestasi
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {selectedCandidate.career || "-"}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MODAL ADD ================= */}
      <AnimatePresence>
        {openAdd && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-gradient-to-br from-pink-500 via-red-500 to-purple-600 rounded-[35px] p-8 text-white w-full max-w-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setOpenAdd(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center font-bold transition-all backdrop-blur-md"
              >
                ✕
              </button>

              <h2 className="text-3xl font-black text-center mb-8 tracking-tight">
                Daftarkan Paslon
              </h2>

              <div className="space-y-5">
                <div className="relative group">
                  <label className="text-[10px] font-black uppercase ml-1 opacity-90 tracking-widest text-white/80">Nomor Urut Pasangan</label>
                  <input
                    type="text"
                    placeholder="Contoh: 01"
                    value={paslon}
                    onChange={e => setPaslon(e.target.value)}
                    className="w-full mt-1.5 px-5 py-4 rounded-2xl text-black focus:ring-4 focus:ring-white/20 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase ml-1 opacity-90 tracking-widest text-white/80">Nama Ketua</label>
                    <input
                      type="text"
                      placeholder="Nama Lengkap"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full mt-1.5 px-5 py-4 rounded-2xl text-black focus:ring-4 focus:ring-white/20 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase ml-1 opacity-90 tracking-widest text-white/80">Nama Wakil</label>
                    <input
                      type="text"
                      placeholder="Nama Lengkap"
                      value={vice}
                      onChange={e => setVice(e.target.value)}
                      className="w-full mt-1.5 px-5 py-4 rounded-2xl text-black focus:ring-4 focus:ring-white/20 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase ml-1 opacity-90 tracking-widest text-white/80">Visi & Misi Strategis</label>
                  <textarea
                    rows="3"
                    placeholder="Apa target utama paslon ini?"
                    value={vision}
                    onChange={e => setVision(e.target.value)}
                    className="w-full mt-1.5 px-5 py-4 rounded-2xl text-black focus:ring-4 focus:ring-white/20 outline-none transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase ml-1 opacity-90 tracking-widest text-white/80">Riwayat & Karir</label>
                  <textarea
                    rows="2"
                    placeholder="Pengalaman kepemimpinan..."
                    value={career}
                    onChange={e => setCareer(e.target.value)}
                    className="w-full mt-1.5 px-5 py-4 rounded-2xl text-black focus:ring-4 focus:ring-white/20 outline-none transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase ml-1 opacity-90 tracking-widest text-white/80">Upload Foto Pasangan</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full mt-1.5 bg-black/10 p-3 rounded-2xl text-sm file:mr-4 file:py-2 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-white file:text-pink-600 hover:file:bg-pink-50 cursor-pointer shadow-inner border border-white/10"
                  />
                </div>

                {photoPreview && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 bg-black/20 p-2 rounded-2xl border border-white/20 overflow-hidden"
                  >
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-44 object-cover rounded-xl shadow-lg"
                    />
                  </motion.div>
                )}

                {error && (
                  <motion.p initial={{ x: -10 }} animate={{ x: 0 }} className="bg-white/20 backdrop-blur-md border border-white/40 text-white text-xs p-4 rounded-2xl font-bold flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </motion.p>
                )}

                <button
                  onClick={addCandidate}
                  className="w-full bg-white text-pink-600 py-5 rounded-[22px] font-black text-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all active:scale-[0.98]"
                >
                  SIMPAN DATA PASLON
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================= OPTIMIZED CANDIDATE CARD ================= */
function CandidateCard({ candidate, onDelete, onView }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[35px] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-gray-100 w-80 text-center relative hover:shadow-2xl transition-all duration-500 group"
    >
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gray-900 to-gray-700 text-white px-7 py-2 rounded-full text-[10px] font-black shadow-xl z-10 uppercase tracking-[0.2em]">
        Paslon {candidate.paslon}
      </div>

      <div className="relative mt-5 mb-5 overflow-hidden rounded-[25px] aspect-video bg-gray-50 border border-gray-100">
        {candidate.photo ? (
          <img
            src={candidate.photo}
            alt={candidate.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-xs">
            Foto tidak tersedia
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">Ketua Utama</p>
          <p className="font-bold text-gray-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{candidate.name}</p>
        </div>
        
        <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-auto"></div>

        <div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Wakil Ketua</p>
          <p className="font-bold text-gray-600 leading-tight">{candidate.vice}</p>
        </div>
      </div>

      <div className="flex gap-3 px-1">
        <button
          onClick={onView}
          className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all text-[11px] uppercase tracking-wider shadow-lg active:scale-95"
        >
          Detail Visi
        </button>

        <button
          onClick={onDelete}
          className="flex-1 bg-red-50 text-red-500 py-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-[11px] font-black uppercase shadow-sm active:scale-95"
        >
          Hapus
        </button>
      </div>
    </motion.div>
  )
}