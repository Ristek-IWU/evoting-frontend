import { useState, useEffect, useRef } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import VoteChart from "../../components/VoteChart";
import { FaFileCsv, FaFilePdf, FaArchive, FaCheckCircle, FaExclamationCircle, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE_URL = API.defaults.baseURL;

function VotingResult() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chartRef = useRef(null);

  // State Notifikasi Custom
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // State Modal Custom (Update Baru)
  const [archiveModal, setArchiveModal] = useState({ show: false, step: 1, title: "" });

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

  const showNotify = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const resVotes = await API.get("/api/votes/results");
      const votesData = Array.isArray(resVotes.data) ? resVotes.data : [];

      const resCand = await API.get("/api/candidates");
      const candData = Array.isArray(resCand.data) ? resCand.data : [];

      const enrichedResults = votesData.map(v => {
        const match = candData.find(c => c.name.toLowerCase() === v.name.toLowerCase());
        return {
          ...v,
          vice: match ? match.vice : "" 
        };
      });

      setResults(enrichedResults);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data hasil voting");
    } finally {
      setLoading(false);
    }
  };

  // ===== FUNGSI ARSIP & RESET (DIPANGGIL DARI MODAL) =====
  const handleFinalArchive = async () => {
    if (!archiveModal.title.trim()) {
        return showNotify("Judul arsip wajib diisi!", "error");
    }

    try {
      setLoading(true);
      setArchiveModal({ ...archiveModal, show: false }); // Tutup modal dulu
      const token = localStorage.getItem("token");

      const resCand = await API.get("/api/candidates", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allCandidates = resCand.data;

      const resVoters = await API.get("/api/admin/voters", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const votedUsers = resVoters.data
        .filter(v => v.hasVoted === true || v.hasVoted === 1 || v.hasVoted === "1")
        .map(v => ({ name: v.name, nim: v.nim }));

      const dataToArchive = results.map(res => {
        const match = allCandidates.find(c => c.name.toLowerCase() === res.name.toLowerCase());
        return {
          ...res,
          vice_name: match ? match.vice : "Tidak Ada Wakil" 
        };
      });
      
      const totalVoters = results.reduce((acc, curr) => acc + curr.total_votes, 0);

      const response = await API.post("/api/admin/archive-and-reset", {
        title: archiveModal.title,
        total_voters: totalVoters,
        result_data: dataToArchive,
        voters_audit: votedUsers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showNotify(response.data.message || "Pemilihan berhasil diarsipkan!");
      
      setTimeout(() => {
        window.location.href = "/admin/history";
      }, 2000);

    } catch (err) {
      console.error(err);
      showNotify(err.response?.data?.message || "Gagal mengarsipkan data.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== EXPORT CSV =====
  const exportCSV = () => {
    if (!results || results.length === 0) return showNotify("Tidak ada data untuk di-export!", "error");

    const data = results.map((r, i) => ({
      "Paslon": i + 1,
      "Nama Ketua": r.name,
      "Nama Wakil": r.vice || "-",
      "Jumlah Suara": r.total_votes,
      "Persentase (%)": r.percent,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hasil Voting");
    XLSX.writeFile(wb, "hasil_voting.xlsx");
    showNotify("Data Excel berhasil diunduh!");
  };

  // ===== EXPORT PDF (FIXED HEADER BLACK ISSUE) =====
  const exportPDF = async () => {
    if (!results || results.length === 0) return showNotify("Tidak ada data untuk di-import!", "error");
    
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const dateNow = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const imgLeft = new Image();
    imgLeft.src = "/gambar-bg.png"; 
    const imgRight = new Image();
    imgRight.src = "/logo-kampus.png";

    let imagesLoaded = 0;
    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        generatePDFContent();
      }
    };

    imgLeft.onload = onImageLoad;
    imgRight.onload = onImageLoad;
    imgLeft.onerror = () => { showNotify("Gagal memuat gambar-bg.png!", "error"); onImageLoad(); };
    imgRight.onerror = () => { showNotify("Gagal memuat logo-kampus.png!", "error"); onImageLoad(); };

    const generatePDFContent = () => {
      doc.addImage(imgLeft, 'PNG', 50, 30, 60, 60);
      doc.addImage(imgRight, 'PNG', pageWidth - 110, 30, 60, 60);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("KOMISI PEMILIHAN UMUM MAHASISWA (KPUM)", pageWidth / 2, 50, { align: "center" });
      doc.setFontSize(16);
      doc.text("HIMPUNAN MAHASISWA INFORMATIKA", pageWidth / 2, 70, { align: "center" });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("INTERNATIONAL WOMEN UNIVERSITY", pageWidth / 2, 85, { align: "center" });
      
      doc.setLineWidth(1.5);
      doc.line(40, 105, pageWidth - 40, 105); 
      doc.setLineWidth(0.5);
      doc.line(40, 108, pageWidth - 40, 108);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("BERITA ACARA HASIL PEROLEHAN SUARA", pageWidth / 2, 135, { align: "center" });
      doc.setFontSize(11);
      doc.text("TAHUN AKADEMIK 2025/2026", pageWidth / 2, 150, { align: "center" });
      
      const chartCanvas = chartRef.current.querySelector("canvas");
      if (chartCanvas) {
        const chartImage = chartCanvas.toDataURL("image/png", 1.0);
        doc.addImage(chartImage, "PNG", 80, 170, 430, 200);
      }

      const tableColumn = ["Paslon", "Calon Ketua", "Calon Wakil", "Jumlah Suara", "Persentase"];
      const tableRows = results.map((r, i) => [
        `0${i + 1}`, 
        r.name.toUpperCase(), 
        (r.vice || "-").toUpperCase(), 
        `${r.total_votes} Suara`, 
        `${r.percent}%`
      ]);

      autoTable(doc, {
        startY: 390,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: { 
            fillColor: [30, 58, 138], 
            textColor: [255, 255, 255], 
            halign: "center", 
            fontStyle: 'bold', 
            fontSize: 10 
        },
        styles: { 
            halign: "center", 
            fontSize: 9, 
            cellPadding: 8, 
            textColor: [40, 40, 40], 
            lineColor: [200, 200, 200] 
        },
        columnStyles: {
          1: { halign: 'left' },
          2: { halign: 'left' }
        }
      });

      const finalY = doc.lastAutoTable.finalY + 50;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Ditetapkan di: Bandung`, pageWidth - 200, finalY);
      doc.text(`Pada Tanggal: ${dateNow}`, pageWidth - 200, finalY + 15);
      
      doc.setFont("helvetica", "bold");
      doc.text("Ketua Panitia KPUM,", pageWidth - 200, finalY + 40);
      
      doc.text("( __________________________ )", pageWidth - 200, finalY + 100);
      doc.setFont("helvetica", "normal");
      doc.text("NIM. .....................................", pageWidth - 200, finalY + 115);

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Dokumen ini dihasilkan secara otomatis oleh Sistem E-Voting HIMAIF", 40, doc.internal.pageSize.getHeight() - 20);

      const pdfData = doc.output("bloburl");
      window.open(pdfData, "_blank");
      showNotify("Berita Acara PDF berhasil dibuat!");
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />

      {/* NOTIFIKASI SYSTEM */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-5 left-1/2 z-[9999] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-4 min-w-[300px] ${
              notification.type === "success" 
                ? "bg-white/80 border-green-200 text-green-800" 
                : "bg-white/80 border-red-200 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <FaCheckCircle className="text-green-500 text-2xl" />
            ) : (
              <FaExclamationCircle className="text-red-500 text-2xl" />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-50">System Info</p>
              <p className="font-bold text-sm">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL ARSIP CUSTOM (PENGGANTI PROMPT & CONFIRM) */}
      <AnimatePresence>
        {archiveModal.show && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setArchiveModal({ ...archiveModal, show: false })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
            >
              {archiveModal.step === 1 ? (
                <div className="p-8">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto text-3xl">
                    <FaArchive />
                  </div>
                  <h3 className="text-2xl font-black text-center text-gray-800 mb-2">Arsip Pemilihan</h3>
                  <p className="text-gray-500 text-center text-sm mb-6">Silakan masukkan judul arsip untuk disimpan ke dalam history sistem.</p>
                  
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Contoh: Pemilihan Ketua HIMAIF 2026"
                      value={archiveModal.title}
                      onChange={(e) => setArchiveModal({ ...archiveModal, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                    />
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => setArchiveModal({ ...archiveModal, show: false })}
                        className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={() => {
                          if(!archiveModal.title.trim()) return showNotify("Judul tidak boleh kosong", "error");
                          setArchiveModal({ ...archiveModal, step: 2 });
                        }}
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                      >
                        Lanjutkan
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto text-3xl animate-pulse">
                    <FaExclamationTriangle />
                  </div>
                  <h3 className="text-2xl font-black text-center text-gray-800 mb-2">Peringatan Krusial!</h3>
                  <div className="bg-red-50 p-4 rounded-xl text-xs text-red-700 space-y-2 mb-6 border border-red-100">
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Data hasil voting dipindahkan ke Arsip.</p>
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Seluruh data <b>KANDIDAT</b> akan DIHAPUS.</p>
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Seluruh data <b>PEMILIH</b> akan DIHAPUS.</p>
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Status voting otomatis menjadi "Tutup".</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setArchiveModal({ ...archiveModal, step: 1 })}
                      className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      Kembali
                    </button>
                    <button 
                      onClick={handleFinalArchive}
                      className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                    >
                      Ya, Selesaikan
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div 
        className={`flex-1 py-10 transition-all duration-300 ${
          sidebarOpen ? "md:ml-72" : "md:ml-20"
        } ml-0`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Hasil Voting
          </motion.h1>

          <div className="flex justify-center gap-3 mb-10 flex-wrap">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition-transform"
            >
              <FaFileCsv /> Export CSV
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition-transform"
            >
              <FaFilePdf /> Cetak Berita Acara
            </button>
            <button
              onClick={() => {
                if (!results || results.length === 0) {
                    return showNotify("Tidak ada data hasil voting yang bisa diarsipkan!", "error");
                }
                setArchiveModal({ show: true, step: 1, title: "" });
              }}
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 hover:scale-105 transition-all disabled:bg-gray-400"
            >
              <FaArchive /> {loading ? "Memproses..." : "Selesaikan & Arsipkan"}
            </button>
          </div>

          {error && <p className="text-red-500 mb-6 text-center">{error}</p>}

          {loading && results.length === 0 ? (
            <p className="text-gray-500 text-center">Loading data...</p>
          ) : results.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-14">
                <AnimatePresence>
                  {results.map((r, i) => (
                    <motion.div
                      key={r.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <ResultCard {...r} index={i + 1} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.div
                ref={chartRef}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  Grafik Perolehan Suara
                </h2>
                <VoteChart data={results} />
              </motion.div>
            </>
          ) : (
            <div className="bg-white p-10 rounded-2xl shadow text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 italic font-medium">Belum ada hasil voting atau data telah diarsipkan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ name, vice, percent, photo, total_votes, index }) {
  const imageUrl = photo
    ? photo.startsWith("http")
      ? photo
      : `${BASE_URL}${photo}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=9333ea&color=fff&size=256`;

  return (
    <div
      className="
        relative
        bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500
        rounded-3xl
        p-6
        text-white
        shadow-xl
        hover:shadow-2xl
        transition-all
        duration-300
        overflow-hidden
      "
    >
      <span className="
        absolute
        -top-1
        right-6
        px-4
        py-2
        text-[10px]
        font-black
        tracking-[0.2em]
        rounded-b-xl
        bg-yellow-400
        text-black
        shadow-md
        z-20
      ">
        PASLON 0{index}
      </span>

      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/40 shadow-inner shrink-0 bg-white/20">
            <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
            />
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black truncate leading-tight tracking-tight uppercase">
                    {name}
                </h4>
                <div className="h-[1px] w-10 bg-white/30 my-1" />
                <h5 className="text-[10px] font-medium text-white/90 truncate uppercase italic tracking-wide">
                    {vice ? `Wakil: ${vice}` : "Tanpa Wakil"}
                </h5>
            </div>
        </div>

        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold opacity-70 uppercase tracking-widest">Total Suara</span>
                    <span className="text-lg font-black leading-none">{total_votes}</span>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black italic">{percent}%</span>
                </div>
            </div>

            <div className="w-full bg-black/20 rounded-full h-2.5 p-[2px] backdrop-blur-sm">
                <motion.div
                className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                />
            </div>
        </div>
        
        <p className="text-[8px] text-center text-white/60 uppercase font-bold tracking-[0.3em] pt-1 border-t border-white/10">
            Realtime Election Result
        </p>
      </div>
    </div>
  );
}

export default VotingResult;