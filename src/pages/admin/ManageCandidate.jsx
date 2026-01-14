import { useState, useEffect } from "react"
import AdminSidebar from "../../components/AdminSidebar"
import API from "../../services/api"
import { motion, AnimatePresence } from "framer-motion"

export default function ManageCandidate() {
  const [candidates, setCandidates] = useState([])
  const [name, setName] = useState("")
  const [vice, setVice] = useState("")
  const [vision, setVision] = useState("")
  const [career, setCareer] = useState("")
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await API.get("/api/candidates")
      const candidatesWithFullPhoto = res.data.map(c => ({
        ...c,
        photo: c.photo ? `${API.defaults.baseURL}${c.photo}` : null,
      }))
      setCandidates(Array.isArray(candidatesWithFullPhoto) ? candidatesWithFullPhoto : [])
    } catch (err) {
      console.error(err)
      setError("Gagal mengambil data kandidat")
    } finally {
      setLoading(false)
    }
  }

  const addCandidate = async () => {
    if (!name || !vice || !vision) return

    try {
      setError("")
      const formData = new FormData()
      formData.append("name", name)
      formData.append("vice", vice)
      formData.append("description", vision)
      formData.append("career", career)
      if (photo) formData.append("photo", photo)

      const res = await API.post("/api/candidates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const newCandidate = {
        ...res.data,
        photo: res.data.photo ? `${API.defaults.baseURL}${res.data.photo}` : null,
      }

      setCandidates(prev => [...prev, newCandidate])
      setName("")
      setVice("")
      setVision("")
      setCareer("")
      setPhoto(null)
    } catch (err) {
      console.error(err)
      setError("Gagal menambahkan kandidat")
    }
  }

  const deleteCandidate = async (id) => {
    try {
      setError("")
      await API.delete(`/api/candidates/${id}`)
      setCandidates(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error(err)
      setError("Gagal menghapus kandidat")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <AdminSidebar />

      <div className="flex-1 px-4 md:px-8 py-12 max-w-7xl mx-auto md:ml-72">
        <h1 className="text-3xl font-bold text-center mb-10">Kelola Kandidat</h1>

        {error && <p className="text-red-500 text-center mb-6">{error}</p>}

        {/* FORM */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl mb-12 max-w-xl mx-auto">
          <h2 className="text-xl font-semibold mb-5 text-center">Tambah Kandidat</h2>

          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nama Ketua"
            className="w-full mb-3 px-4 py-2 rounded-xl text-gray-800"
          />

          <input
            value={vice}
            onChange={e => setVice(e.target.value)}
            placeholder="Nama Wakil Ketua"
            className="w-full mb-3 px-4 py-2 rounded-xl text-gray-800"
          />

          <textarea
            value={vision}
            onChange={e => setVision(e.target.value)}
            placeholder="Visi & Misi"
            className="w-full mb-3 px-4 py-2 rounded-xl text-gray-800"
          />

          <textarea
            value={career}
            onChange={e => setCareer(e.target.value)}
            placeholder="Perjalanan Karir / Prestasi"
            className="w-full mb-3 px-4 py-2 rounded-xl text-gray-800"
          />

          <input
            type="file"
            onChange={e => setPhoto(e.target.files[0])}
            className="w-full mb-4 text-gray-800"
          />

          <button
            onClick={addCandidate}
            className="bg-white text-blue-700 font-semibold px-6 py-2 rounded-full block mx-auto"
          >
            + Tambah Kandidat
          </button>
        </div>

        {/* LIST */}
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {candidates.map(c => (
              <CandidateCard key={c.id} candidate={c} onDelete={() => deleteCandidate(c.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ================= CARD ================= */
function CandidateCard({ candidate, onDelete }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="bg-white rounded-3xl p-6 shadow-lg w-72 text-center flex flex-col items-center">
        {candidate.photo && (
          <img
            src={candidate.photo}
            alt={candidate.name}
            className="w-28 h-28 rounded-full mb-3 object-cover"
          />
        )}

        <h3 className="font-bold text-lg mb-1">
          {candidate.name} & {candidate.vice}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {candidate.description}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={onDelete}
            className="bg-red-500 text-white px-4 py-1 rounded-full"
          >
            Hapus
          </button>
          <button
            onClick={() => setOpen(true)}
            className="bg-purple-500 text-white px-4 py-1 rounded-full"
          >
            Lihat
          </button>
        </div>
      </div>

      {/* MODAL DETAIL */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto relative"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-4 text-xl font-bold"
              >
                ✕
              </button>

              <h3 className="text-xl font-bold mb-4">
                {candidate.name} & {candidate.vice}
              </h3>

              {candidate.career && (
                <div className="mb-6">
                  <h4 className="font-semibold text-purple-600 mb-1">
                    Perjalanan Karir
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line">{candidate.career}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-blue-600 mb-1">Visi & Misi</h4>
                <p className="text-gray-700 whitespace-pre-line">{candidate.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
