import { useState, useEffect } from "react"
import AdminSidebar from "../../components/AdminSidebar"
import StatCard from "../../components/StatCard"
import API from "../../services/api"
import { motion } from "framer-motion"

// ============================
// Voting Status Card
// ============================
function VotingStatusCard({
  votingStatus,
  loading,
  schedule,
  onToggle,
  onScheduleChange,
  onClearSchedule,
}) {
  const [timeLeft, setTimeLeft] = useState(null)
  const [flash, setFlash] = useState(false)

  const parseLocalDateTime = (str) => {
    if (!str) return null
    const [date, time] = str.split("T")
    const [y, m, d] = date.split("-").map(Number)
    const [h, min] = time.split(":").map(Number)
    return new Date(y, m - 1, d, h, min, 0)
  }

  const calculateTimeLeft = () => {
    const now = new Date()
    const start = parseLocalDateTime(schedule.votingStart)
    const end = parseLocalDateTime(schedule.votingEnd)

    if (start && now < start) return Math.floor((start - now) / 1000)
    if (end && now < end && votingStatus)
      return Math.floor((end - now) / 1000)

    return null
  }

  useEffect(() => {
    const i = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
    return () => clearInterval(i)
  }, [schedule, votingStatus])

  useEffect(() => {
    if (votingStatus) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 800)
      return () => clearTimeout(t)
    }
  }, [votingStatus])

  const formatTime = (s) => {
    if (s == null) return "--:--:--"
    const h = String(Math.floor(s / 3600)).padStart(2, "0")
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0")
    const sec = String(s % 60).padStart(2, "0")
    return `${h}:${m}:${sec}`
  }

  const now = new Date()
  const start = parseLocalDateTime(schedule.votingStart)
  const end = parseLocalDateTime(schedule.votingEnd)

  let countdownText = ""
  if (start && now < start)
    countdownText = `Voting mulai ${start.toLocaleString()} ( ${formatTime(timeLeft)} )`
  else if (end && now < end && votingStatus)
    countdownText = `Voting berakhir ${end.toLocaleString()} ( ${formatTime(timeLeft)} )`
  else if (end && now >= end)
    countdownText = `Voting selesai ${end.toLocaleString()}`

  const countdownColor =
    timeLeft !== null && timeLeft <= 3600 ? "text-red-300" : "text-white"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
        rounded-2xl shadow-xl p-6 text-white"
    >
      <h3 className="text-xl font-bold mb-3">Status Voting</h3>
      <p className="text-lg mb-2">
        {votingStatus ? "Voting Terbuka 🚀" : "Voting Ditutup 🔒"}
      </p>

      {countdownText && (
        <p className={`text-sm mb-4 font-mono ${countdownColor}`}>
          {countdownText}
        </p>
      )}

      <div className="space-y-2 text-black mb-4">
        <input
          type="datetime-local"
          value={schedule.votingStart || ""}
          onChange={(e) => onScheduleChange("votingStart", e.target.value)}
          className="w-full rounded px-2 py-1"
        />
        <input
          type="datetime-local"
          value={schedule.votingEnd || ""}
          onChange={(e) => onScheduleChange("votingEnd", e.target.value)}
          className="w-full rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <motion.button
          animate={flash ? { scale: [1, 1.2, 1] } : {}}
          onClick={() => onToggle(!votingStatus)}
          disabled={loading}
          className={`flex-1 py-2 rounded-xl font-semibold
            ${votingStatus ? "bg-red-600" : "bg-green-600"}`}
        >
          {loading ? "Updating..." : votingStatus ? "Tutup Voting" : "Buka Voting"}
        </motion.button>

        <button
          onClick={() => onToggle(votingStatus, true)}
          className="flex-1 py-2 bg-yellow-400 rounded-xl font-semibold text-black"
        >
          Set Jadwal
        </button>

        <button
          onClick={onClearSchedule}
          className="flex-1 py-2 bg-gray-700 rounded-xl font-semibold"
        >
          Hapus Jadwal
        </button>
      </div>
    </motion.div>
  )
}

// ============================
// Candidate Card
// ============================
function CandidateCard({ candidate }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur rounded-2xl shadow p-5 flex gap-4"
    >
      {candidate.photo && (
        <img
          src={`${API.defaults.baseURL}${candidate.photo}`}
          className="w-20 h-20 rounded-full object-cover"
        />
      )}
      <div>
        <h4 className="font-bold">
          {candidate.name}
          {candidate.vice && ` & ${candidate.vice}`}
        </h4>
        <p className="text-sm text-gray-600">
          {candidate.description}
        </p>
      </div>
    </motion.div>
  )
}

// ============================
// ADMIN DASHBOARD
// ============================
export default function AdminDashboard() {
  const [votingStatus, setVotingStatus] = useState(false)
  const [loading, setLoading] = useState(false)
  const [schedule, setSchedule] = useState({ votingStart: "", votingEnd: "" })
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCandidates: 0,
    voted: 0,
    notVoted: 0,
  })
  const [candidates, setCandidates] = useState([])

  const fetchData = async () => {
    const voting = await API.get("/api/voting/status")
    setVotingStatus(voting.data.isOpen)

    const statsRes = await API.get("/api/admin/stats")
    setStats(statsRes.data)

    const cand = await API.get("/api/candidates")
    setCandidates(cand.data)
  }

  useEffect(() => {
    fetchData()
    const i = setInterval(fetchData, 10000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      {/* CONTENT */}
      <main
        className="
          pt-20 md:pt-10
          px-4 md:px-8
          md:ml-72
          transition-all
        "
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-8"
        >
          Dashboard Admin
        </motion.h1>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Mahasiswa" value={stats.totalStudents} glossy />
          <StatCard title="Total Kandidat" value={stats.totalCandidates} glossy />
          <StatCard title="Sudah Voting" value={stats.voted} glossy />
          <StatCard title="Belum Voting" value={stats.notVoted} glossy />
        </div>

        {/* VOTING */}
        <div className="max-w-md mx-auto mb-10">
          <VotingStatusCard
            votingStatus={votingStatus}
            loading={loading}
            schedule={schedule}
            onToggle={setVotingStatus}
            onScheduleChange={(f, v) =>
              setSchedule((p) => ({ ...p, [f]: v }))
            }
            onClearSchedule={() =>
              setSchedule({ votingStart: "", votingEnd: "" })
            }
          />
        </div>

        {/* CANDIDATES */}
        <h2 className="text-2xl font-bold text-center mb-6">
          Ringkasan Kandidat
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((c) => (
            <CandidateCard key={c.id} candidate={c} />
          ))}
        </div>
      </main>
    </div>
  )
}
