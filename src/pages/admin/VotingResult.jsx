import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

function VotingResult() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/votes/results");
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data hasil voting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Konten */}
      <div className="flex-1 px-4 md:px-8 py-10 md:ml-72 max-w-6xl mx-auto w-full">
        {/* Judul */}
        <motion.h1
          className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Hasil Voting
        </motion.h1>

        {error && <p className="text-red-500 mb-6 text-center">{error}</p>}

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AnimatePresence>
              {results.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <ResultCard {...r} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-6">
            Belum ada hasil voting
          </p>
        )}
      </div>
    </div>
  );
}

function ResultCard({ name, percent }) {
  return (
    <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-red-500
      rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-shadow duration-300">

      {/* Overlay gradient glossy */}
      <div className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between font-semibold mb-2">
          <span className="text-lg truncate">{name}</span>
          <span className="text-lg">{percent}%</span>
        </div>

        <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
          <motion.div
            className="bg-white h-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}

export default VotingResult;
