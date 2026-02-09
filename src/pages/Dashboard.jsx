import { useEffect, useState, useMemo, useRef } from "react";
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
  const [isDay, setIsDay] = useState(false);
  const intervalRef = useRef(null);

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
  const fetchVotingData = async () => {
    if (!user) return;
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
        statusRes.data.votingStart ? new Date(statusRes.data.votingStart) : null
      );
      setVotingEnd(
        statusRes.data.votingEnd ? new Date(statusRes.data.votingEnd) : null
      );

      setIsDay(statusRes.data.isOpen);
    } catch (err) {
      console.error("FetchVotingData error:", err);
    }
  };

  useEffect(() => {
    fetchVotingData();
    intervalRef.current = setInterval(fetchVotingData, 2000);
    return () => clearInterval(intervalRef.current);
  }, [user]);

  // ================= COUNTDOWN =================
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let timeLeft = "";

      if (votingStart && now < votingStart) {
        const diff = votingStart - now;
        const h = Math.floor(diff / 1000 / 60 / 60);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        timeLeft = `Voting dibuka dalam ${h} jam ${m} menit ${s} detik`;
      } else if (votingStatus && votingEnd && now < votingEnd) {
        const diff = votingEnd - now;
        const h = Math.floor(diff / 1000 / 60 / 60);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        timeLeft = `Voting ditutup dalam ${h} jam ${m} menit ${s} detik`;
      } else if (!votingStatus && votingEnd && now >= votingEnd) {
        timeLeft = "🛑 Voting telah selesai dan ditutup";
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

  // ================= RENDER ICON =================
  const renderHeroIcon = () => {
    if (hasVoted) {
      return (
        <motion.div 
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full" />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-32 h-32 text-white drop-shadow-2xl"
          >
            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 014.554 1.353 4.49 4.49 0 011.353 4.554A4.49 4.49 0 0122.5 12c0 1.357-.6 2.573-1.549 3.397a4.49 4.49 0 01-1.353 4.554 4.49 4.49 0 01-4.554 1.353A4.49 4.49 0 0112 22.5c-1.357 0-2.573-.6-3.397-1.549a4.49 4.49 0 01-4.554-1.353 4.49 4.49 0 01-1.353-4.554A4.49 4.49 0 011.5 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.353-4.554a4.49 4.49 0 014.554-1.353zM16.03 9.47a.75.75 0 00-1.06-1.06l-4.72 4.72-1.47-1.47a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l5.25-5.25z" clipRule="evenodd" />
          </svg>
        </motion.div>
      );
    }
    // ICON BARU: Kotak Suara / Inboxes icon yang keren
    return (
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1.5} 
          stroke="currentColor" 
          className="w-32 h-32 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
        </svg>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-x-hidden flex flex-col md:flex-row">
      <Navbar />

      <main className="flex-1 relative z-10 w-full">
        
        {/* ================= BACKGROUND ================= */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-[length:400%_400%] bg-gradient-to-br from-fuchsia-700/30 via-indigo-800/30 to-slate-900"
          />
          <div className="absolute -top-48 -left-48 w-[650px] h-[650px] bg-fuchsia-500/25 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-indigo-500/25 rounded-full blur-[160px]" />

          {/* BULAN / BINTANG MALAM */}
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

          {/* MODE SIANG DINAMIS */}
          <AnimatePresence>
            {isDay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-cyan-300 to-sky-200" />
                <motion.div
                  animate={{ x: [0, 30, 0], y: [20, 40, 20] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-32 h-32 top-12 right-12 rounded-full bg-yellow-400 shadow-[0_0_80px_rgba(255,223,0,0.8)]"
                />
                
                <motion.svg
                  viewBox="0 0 200 60"
                  className="absolute top-24 left-10 w-80 h-24"
                  animate={{ x: [-100, 400] }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                >
                  <ellipse cx="40" cy="30" rx="40" ry="20" fill="white" fillOpacity="0.8" />
                  <ellipse cx="80" cy="30" rx="50" ry="25" fill="white" fillOpacity="0.7" />
                  <ellipse cx="130" cy="30" rx="45" ry="22" fill="white" fillOpacity="0.6" />
                </motion.svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ================= HEADER ================= */}
        <div className="relative z-10 pt-20 text-center px-6">
          <motion.img
            src="/logo-kampus.png"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto w-20 h-20 mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
          />
          <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent px-2">
            Dashboard E-Voting
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-white/80 text-sm md:text-base">
            Sistem pemilihan digital modern yang aman, transparan, dan terpercaya.
          </p>
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-10 md:mt-14">
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
              whileHover={{ y: -5, scale: 1.02 }}
              className={`${item.bg} backdrop-blur-xl border rounded-2xl p-5 md:p-6 shadow-lg`}
            >
              <h3 className="uppercase text-xs md:text-sm tracking-wide text-white/70">{item.title}</h3>
              <p className="mt-2 text-2xl md:text-3xl font-bold">{item.value}</p>
              {item.timer && <p className="mt-1 text-xs md:text-sm text-white/60">{item.timer}</p>}
            </motion.div>
          ))}
        </div>

        {/* ================= PANDUAN PEMILIHAN ================= */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-32">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-extrabold text-center mb-10 md:mb-14 bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent"
          >
            Panduan Mengikuti Pemilihan
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
            <div className="relative flex justify-center">
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-16 px-4 py-2 rounded-xl border border-white/20 text-xs md:text-sm font-medium text-white shadow-lg bg-slate-900/80 backdrop-blur-md z-20"
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
                className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 flex items-center justify-center cursor-pointer select-none shadow-2xl"
              >
                {renderHeroIcon()}
              </motion.div>
            </div>

            <div className="space-y-4 md:space-y-6">
              {[
                { step: "01", title: "Login & Cek Status", desc: "Pastikan kamu sudah login dan voting sedang dibuka." },
                { step: "02", title: "Masuk Menu Voting", desc: "Buka menu Voting untuk melihat kandidat." },
                { step: "03", title: "Pilih Kandidat", desc: "Pilih kandidat sesuai pilihanmu." },
                { step: "04", title: "Submit & Selesai", desc: "Kirim suara dan tunggu hasil diumumkan." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="bg-white/10 border border-white/20 rounded-2xl p-4 md:p-5 flex gap-4 md:gap-5 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-400 text-slate-900 font-black flex items-center justify-center shadow-inner text-sm md:text-base">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg">{item.title}</h3>
                    <p className="text-xs md:text-sm text-white/75 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;