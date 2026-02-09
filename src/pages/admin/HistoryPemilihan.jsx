import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import API from "../../services/api";
import { FaHistory, FaEye, FaFilePdf, FaTrash, FaCalendarAlt, FaUsers, FaClipboardList } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function HistoryPemilihan() {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/api/admin/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Gagal mengambil history:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistory = async (id) => {
    if (!window.confirm("Hapus arsip history ini secara permanen?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/api/admin/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistories((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      alert("Gagal menghapus history");
    }
  };

  const parseResultData = (data) => {
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return {
        candidates: parsed.candidates || [],
        voters: parsed.voters || []
      };
    } catch (e) {
      return { candidates: [], voters: [] };
    }
  };

  // ===== HELPER: LOAD DUAL LOGOS =====
  const loadLogos = () => {
    return new Promise((resolve) => {
      const imgLeft = new Image();
      const imgRight = new Image();
      imgLeft.src = "/gambar-bg.png";
      imgRight.src = "/logo-kampus.png";
      let loaded = 0;
      const check = () => { loaded++; if (loaded === 2) resolve({ imgLeft, imgRight }); };
      imgLeft.onload = check;
      imgRight.onload = check;
      imgLeft.onerror = check;
      imgRight.onerror = check;
    });
  };

  // ===== FUNGSI 1: CETAK REKAPITULASI HASIL =====
  const printResultPDF = async (history) => {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const { imgLeft, imgRight } = await loadLogos();
    const fullData = parseResultData(history.result_data);
    const dateFormatted = new Date(history.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });

    // --- KOP SURAT ---
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

    // --- JUDUL ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("BERITA ACARA REKAPITULASI HASIL SUARA", pageWidth / 2, 140, { align: "center" });
    doc.setFontSize(10);
    doc.text(history.title.toUpperCase(), pageWidth / 2, 155, { align: "center" });

    const tableRows = fullData.candidates.map((c, i) => [
      `0${i + 1}`,
      c.name.toUpperCase(),
      (c.vice_name || "-").toUpperCase(),
      `${c.total_votes} Suara`,
      `${c.percent}%`
    ]);

    autoTable(doc, {
      startY: 180,
      head: [["PASLON", "CALON KETUA", "CALON WAKIL", "JUMLAH SUARA", "PERSENTASE"]],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], halign: "center", fontStyle: 'bold' },
      styles: { fontSize: 9, halign: "center", cellPadding: 8 },
      columnStyles: { 1: { halign: "left" }, 2: { halign: "left" } }
    });

    const finalY = doc.lastAutoTable.finalY + 60;
    doc.setFont("helvetica", "normal");
    doc.text(`Ditetapkan di : Bandung`, pageWidth - 200, finalY);
    doc.text(`Pada Tanggal  : ${dateFormatted}`, pageWidth - 200, finalY + 15);
    
    doc.setFont("helvetica", "bold");
    doc.text("Ketua Panitia KPUM,", pageWidth - 200, finalY + 40);
    doc.text("( ____________________ )", pageWidth - 200, finalY + 100);
    doc.setFont("helvetica", "normal");
    doc.text("NIM. ...........................", pageWidth - 200, finalY + 115);

    window.open(doc.output("bloburl"), "_blank");
  };

  // ===== FUNGSI 2: CETAK DAFTAR PEMILIH (AUDIT) =====
  const printVotersPDF = async (history) => {
    const doc = new jsPDF("p", "pt", "a4"); 
    const pageWidth = doc.internal.pageSize.getWidth();
    const { imgLeft, imgRight } = await loadLogos();
    const fullData = parseResultData(history.result_data);
    const dateFormatted = new Date(history.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });

    doc.addImage(imgLeft, 'PNG', 50, 30, 60, 60);
    doc.addImage(imgRight, 'PNG', pageWidth - 110, 30, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("KOMISI PEMILIHAN UMUM MAHASISWA (KPUM)", pageWidth / 2, 50, { align: "center" });
    doc.setFontSize(16);
    doc.text("HIMPUNAN MAHASISWA INFORMATIKA", pageWidth / 2, 70, { align: "center" });
    doc.setFontSize(10);
    doc.text("DAFTAR HADIR PEMILIH TERVERIFIKASI (AUDIT)", pageWidth / 2, 85, { align: "center" });
    doc.setLineWidth(1.5);
    doc.line(40, 105, pageWidth - 40, 105);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Arsip Pemilihan: ${history.title}`, 45, 130);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Tanggal Pemilihan: ${dateFormatted}`, 45, 145); 
    doc.text(`Total Partisipan: ${history.total_voters} Mahasiswa`, 45, 160);

    const tableRows = fullData.voters.map((v, i) => {
      const chosenCandidate = fullData.candidates.find(c => c.name === v.voted_for || c.id === v.candidate_id);
      
      return [
        i + 1,
        (v.student_name || v.name || "PESERTA").toUpperCase(),
        v.nim || "-",
        chosenCandidate ? `0${fullData.candidates.indexOf(chosenCandidate) + 1}` : "-",
        (v.voted_for_name || v.voted_for || (chosenCandidate ? chosenCandidate.name : "-")).toUpperCase(),
        (v.voted_for_vice || (chosenCandidate ? chosenCandidate.vice_name : "-")).toUpperCase(),
        "SUDAH MEMILIH"
      ];
    });

    autoTable(doc, {
      startY: 180,
      head: [["NO", "NAMA MAHASISWA", "NIM", "PASLON", "PILIHAN KETUA", "PILIHAN WAKIL", "STATUS"]],
      body: tableRows.length > 0 ? tableRows : [["-", "Tidak ada data pemilih", "-", "-", "-", "-", "-"]],
      theme: "grid",
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], halign: "center" },
      styles: { fontSize: 8, cellPadding: 5, halign: "center" },
      columnStyles: { 
        1: { halign: "left" }, 
        4: { halign: "left", fontStyle: 'bold' },
        5: { halign: "left", fontStyle: 'bold' }
      }
    });

    window.open(doc.output("bloburl"), "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div 
        className={`flex-1 px-4 md:px-12 py-10 transition-all duration-300 ${
          sidebarOpen ? "md:ml-72 lg:ml-80" : "md:ml-20"
        } ml-0`}
      >
        <div className="max-w-5xl mx-auto">
          
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-4 rounded-2xl text-white shadow-xl">
              <FaHistory size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Arsip Pemilihan</h1>
              <p className="text-sm text-gray-500 font-medium">Rekaman audit hasil & partisipan</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : histories.length === 0 ? (
            <div className="bg-white p-10 md:p-20 rounded-3xl shadow-sm border border-gray-100 text-center">
              <FaHistory className="text-gray-200 mx-auto mb-4" size={50} />
              <h2 className="text-xl font-bold text-gray-700">Arsip Masih Kosong</h2>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
              {histories.map((h) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 md:p-7 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="mb-5">
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full">Archive</span>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-2">{h.title}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total Suara</p>
                      <div className="flex items-center gap-2 text-sm md:text-base text-gray-700 font-semibold">
                        <FaUsers className="text-blue-500" /> {h.total_voters}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Tanggal</p>
                      <div className="flex items-center gap-2 text-sm md:text-base text-gray-700 font-semibold">
                        <FaCalendarAlt className="text-purple-500" /> {new Date(h.created_at).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        const parsed = parseResultData(h.result_data);
                        setSelectedHistory({ 
                          ...h, 
                          display_results: parsed.candidates 
                        });
                        setShowModal(true);
                      }}
                      className="flex-[2] bg-gray-900 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
                    >
                      <FaEye /> Detail
                    </button>
                    <div className="flex gap-3 flex-1">
                      <button
                        onClick={() => printResultPDF(h)}
                        title="Cetak Hasil Suara"
                        className="flex-1 bg-purple-100 text-purple-600 py-3.5 rounded-2xl flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all"
                      >
                        <FaFilePdf size={20} />
                      </button>
                      <button
                        onClick={() => deleteHistory(h.id)}
                        className="flex-1 bg-red-50 text-red-500 py-3.5 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                      >
                        <FaTrash size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETAIL */}
      <AnimatePresence>
        {showModal && selectedHistory && (
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-[999] p-4 md:p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-[30px] md:rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="bg-gray-900 p-6 md:p-10 text-white sticky top-0 z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl md:text-3xl font-black leading-tight">{selectedHistory.title}</h2>
                    <p className="text-gray-400 mt-2 text-sm">Rekapitulasi Suara Paslon</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
              </div>
              
              <div className="p-6 md:p-10">
                <div className="rounded-3xl border border-gray-100 overflow-hidden overflow-x-auto">
                  <table className="w-full text-left min-w-[400px]">
                    <thead className="bg-gray-50 text-gray-400 text-[10px] md:text-[11px] font-black uppercase">
                      <tr>
                        <th className="py-4 px-4 text-center">Paslon</th>
                        <th className="py-4 px-2">Kandidat</th>
                        <th className="py-4 px-6 text-right">Hasil</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedHistory.display_results.map((res, idx) => (
                        <tr key={idx}>
                          <td className="py-5 px-4 text-center font-black text-purple-600 text-sm md:text-base">0{idx + 1}</td>
                          <td className="py-5 px-2">
                            <div className="font-bold text-gray-800 text-sm md:text-base">{res.name}</div>
                            <div className="text-[10px] md:text-xs text-gray-400 font-medium italic">Wakil: {res.vice_name || "-"}</div>
                          </td>
                          <td className="py-5 px-6 text-right font-black text-gray-900 text-sm md:text-base">
                            {res.total_votes} <span className="text-xs text-green-600 ml-1">{res.percent}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => printResultPDF(selectedHistory)} 
                    className="bg-purple-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all"
                  >
                    <FaFilePdf /> Hasil Suara
                  </button>
                  <button 
                    onClick={() => printVotersPDF(selectedHistory)} 
                    className="bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                  >
                    <FaClipboardList /> Daftar Pemilih
                  </button>
                </div>
                <button onClick={() => setShowModal(false)} className="w-full mt-4 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all">Tutup</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}