import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [votingStatus, setVotingStatus] = useState(false);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingStart, setVotingStart] = useState(null);
  const [votingEnd, setVotingEnd] = useState(null);
  const [countdown, setCountdown] = useState("");

  const [showTooltip, setShowTooltip] = useState(true);

  // ================= AUTH =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login", { replace: true });

    try {
      setUser(jwt_decode(token));
    } catch {
      localStorage.clear();
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ================= FETCH DATA =================
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [statusRes, candidatesRes, voteRes] = await Promise.all([
          API.get("/api/voting/status"),
          API.get("/api/candidates"),
          API.get(`/api/votes/me?userId=${user.id}`),
        ]);

        setVotingStatus(statusRes.data.isOpen);
        setTotalCandidates(candidatesRes.data.length);
        setHasVoted(voteRes.data.hasVoted);

        setVotingStart(
          statusRes.data.votingStart
            ? new Date(statusRes.data.votingStart)
            : null
        );
        setVotingEnd(
          statusRes.data.votingEnd
            ? new Date(statusRes.data.votingEnd)
            : null
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // ================= COUNTDOWN =================
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let timeLeft = "";

      if (votingStart && !votingStatus) {
        const diff = votingStart - now;
        if (diff > 0) {
          const h = Math.floor(diff / 1000 / 60 / 60);
          const m = Math.floor((diff / 1000 / 60) % 60);
          const s = Math.floor((diff / 1000) % 60);
          timeLeft = `Voting dibuka dalam ${h} jam ${m} menit ${s} detik`;
        }
      } else if (votingEnd && votingStatus) {
        const diff = votingEnd - now;
        if (diff > 0) {
          const h = Math.floor(diff / 1000 / 60 / 60);
          const m = Math.floor((diff / 1000 / 60) % 60);
          const s = Math.floor((diff / 1000) % 60);
          timeLeft = `Voting ditutup dalam ${h} jam ${m} menit ${s} detik`;
        }
      }

      setCountdown(timeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [votingStart, votingEnd, votingStatus]);

  // ================= STARS =================
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2.5 + 1.5,
        duration: Math.random() * 6 + 4,
        delay: Math.random() * 6,
      })),
    []
  );

  if (loading || !user) return null;

  const tooltipText = hasVoted
    ? "✅ Terima kasih sudah voting!"
    : countdown || "🗳️ Kamu belum voting nih!";

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <Navbar />

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[length:400%_400%] bg-gradient-to-br from-fuchsia-700/30 via-indigo-800/30 to-slate-900"
        />
        <div className="absolute -top-48 -left-48 w-[650px] h-[650px] bg-fuchsia-500/25 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-indigo-500/25 rounded-full blur-[160px]" />

        <motion.div
          animate={{
            y: [0, 18, 0],
            boxShadow: [
              "0 0 60px rgba(255,255,255,0.6)",
              "0 0 140px rgba(255,255,255,0.9)",
              "0 0 60px rgba(255,255,255,0.6)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-16 right-24 w-32 h-32 rounded-full bg-gradient-to-br from-white via-slate-100 to-slate-200"
        />

        {stars.map((s, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], y: [0, -6, 0] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity }}
            className="absolute rounded-full bg-white"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              boxShadow: "0 0 8px rgba(255,255,255,0.9)",
            }}
          />
        ))}
      </div>

      {/* ================= HEADER ================= */}
      <div className="relative z-10 pt-20 text-center px-6">
        <motion.img
          src="/logo-kampus.png"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto w-20 h-20 mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
        />
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Dashboard E-Voting
        </h1>
        <p className="mt-3 max-w-xl mx-auto text-white/80">
          Sistem pemilihan digital modern yang aman, transparan, dan terpercaya.
        </p>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
        {[
          {
            title: "Status Voting",
            value: votingStatus ? "DIBUKA" : "DITUTUP",
            timer: countdown,
            bg: votingStatus
              ? "bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 border-emerald-400/40"
              : "bg-gradient-to-br from-rose-500/20 to-rose-700/20 border-rose-400/40",
          },
          {
            title: "Total Kandidat",
            value: totalCandidates,
            bg: "bg-gradient-to-br from-indigo-500/20 to-indigo-700/20 border-indigo-400/40",
          },
          {
            title: "Partisipasi",
            value: hasVoted ? "SUDAH VOTING" : "BELUM VOTING",
            bg: hasVoted
              ? "bg-gradient-to-br from-teal-500/20 to-teal-700/20 border-teal-400/40"
              : "bg-gradient-to-br from-amber-500/20 to-amber-700/20 border-amber-400/40",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8, scale: 1.05 }}
            className={`${item.bg} backdrop-blur-xl border rounded-2xl p-6`}
          >
            <h3 className="uppercase text-sm tracking-wide text-white/70">
              {item.title}
            </h3>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
            {item.timer && (
              <p className="mt-1 text-sm text-white/60">{item.timer}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* ================= PANDUAN PEMILIHAN ================= */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-extrabold text-center mb-14 bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent"
        >
          Panduan Mengikuti Pemilihan
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative flex justify-center">
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-16 px-4 py-2 rounded-xl border border-white/20 text-sm font-medium text-white"
                >
                  {tooltipText}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              onClick={() => setShowTooltip(!showTooltip)}
              animate={{
                y: [0, -18, 0],
                rotate: [-2, 2, -2],
                boxShadow: [
                  "0 0 30px rgba(56,189,248,0.3)",
                  "0 0 70px rgba(168,85,247,0.7)",
                  "0 0 30px rgba(56,189,248,0.3)",
                ],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="w-56 h-56 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 flex items-center justify-center text-7xl cursor-pointer select-none"
            >
              🧑‍🚀
            </motion.div>
          </div>

          <div className="space-y-6">
            {[
              { step: "01", title: "Login & Cek Status", desc: "Pastikan kamu sudah login dan voting sedang dibuka." },
              { step: "02", title: "Masuk Menu Voting", desc: "Buka menu Voting untuk melihat kandidat." },
              { step: "03", title: "Pilih Kandidat", desc: "Pilih kandidat sesuai pilihanmu." },
              { step: "04", title: "Submit & Selesai", desc: "Kirim suara dan tunggu hasil diumumkan." },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03, x: 6 }}
                className="bg-white/10 border border-white/20 rounded-2xl p-5 flex gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-400 text-slate-900 font-black flex items-center justify-center">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-white/75">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
