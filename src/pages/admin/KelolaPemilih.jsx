import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import API from "../../services/api";
import { FaTrash, FaPlus, FaFileCsv, FaFilePdf, FaCheckCircle, FaEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function KelolaPemilih() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("nim");
  const [sortAsc, setSortAsc] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", nim: "", password: "" });

  // State untuk Notifikasi Keren
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

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

  const triggerNotify = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 4000);
  };

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/api/admin/voters", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // --- LOG UNTUK DEBUGGING MENDALAM ---
      console.log("=== DEBUG DATA DARI BACKEND ===");
      console.table(res.data); 
      
      if (res.data.length > 0) {
        console.log("Struktur Kolom Asli:", Object.keys(res.data[0]));
        console.log("Sampel Data Baris 1:", res.data[0]);
      }
      // ------------------------------------

      const data = res.data.map((u) => {
        // Deteksi berbagai kemungkinan nama kolom status verifikasi
        const verifiedValue = 
            u.isVerified !== undefined ? u.isVerified : 
            u.isverified !== undefined ? u.isverified : 
            u.is_verified !== undefined ? u.is_verified : 
            u.status_verified !== undefined ? u.status_verified : 0;

        return {
          id: u.id,
          nim: u.nim,
          name: u.name || "-",
          isVerified: Number(verifiedValue), // Paksa ke Number (1 = Aktif, 0 = Pending)
          status: Number(u.hasVoted) === 1 ? "Sudah Memilih" : "Belum Memilih",
          candidate_name: u.candidate_name || "-",
          created_at: u.created_at
            ? new Date(u.created_at).toLocaleDateString("id-ID")
            : "-",
        };
      });

      setVoters(data);
    } catch (err) {
      console.error("Error fetching voters:", err);
      setError("Gagal mengambil data pemilih");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, []);

  const handleAddVoter = async () => {
    // Password hanya wajib diisi jika tambah baru, jika edit boleh kosong
    if (!form.name || !form.nim || (!isEdit && !form.password)) {
      triggerNotify("Field Nama dan NIM wajib diisi!", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      if (isEdit) {
        // Logika Update (PUT) mengarah ke router.put("/:id") di voterRoutes.js
        await API.put(`/api/admin/voters/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        triggerNotify(`Berhasil memperbarui pemilih: ${form.name}`, "success");
      } else {
        // Logika Tambah Baru
        await API.post("/api/admin/voters", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        triggerNotify(`Berhasil menambah pemilih: ${form.name}`, "success");
      }

      closeModal();
      fetchVoters();
    } catch (err) {
      triggerNotify(err.response?.data?.message || "Gagal menyimpan data pemilih", "error");
    }
  };

  const handleEdit = (voter) => {
    setIsEdit(true);
    setEditId(voter.id);
    setForm({
      name: voter.name,
      nim: voter.nim,
      password: "" // Kosongkan password saat edit demi keamanan
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setEditId(null);
    setForm({ name: "", nim: "", password: "" });
  };

  const handleVerify = async (id, name) => {
    try {
      const token = localStorage.getItem("token");
      await API.patch(`/api/admin/voters/verify/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      triggerNotify(`Akun ${name} telah diaktifkan!`, "success");
      fetchVoters();
    } catch (err) {
      triggerNotify("Gagal mengaktifkan akun", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin hapus pemilih ${name}?`)) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/api/admin/voters/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVoters((prev) => prev.filter((v) => v.id !== id));
      triggerNotify(`Data pemilih ${name} berhasil dihapus`, "delete");
    } catch (err) {
      triggerNotify("Gagal menghapus data", "error");
    }
  };

  const filteredVoters = voters
    .filter((v) => {
      if (filterStatus === "all") return true;
      if (filterStatus === "sudah") return v.status === "Sudah Memilih";
      if (filterStatus === "belum") return v.status === "Belum Memilih";
      if (filterStatus === "pending") return Number(v.isVerified) === 0;
      return true;
    })
    .filter(
      (v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.nim.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const A = String(a[sortField]).toLowerCase();
      const B = String(b[sortField]).toLowerCase();
      return sortAsc ? A.localeCompare(B) : B.localeCompare(A);
    });

  const exportCSV = () => {
    const data = voters.map((v) => ({
      NIM: v.nim,
      Nama: v.name,
      Tanggal: v.created_at,
      Akses: Number(v.isVerified) === 1 ? "Aktif" : "Pending",
      Status: v.status,
      Kandidat: v.candidate_name,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wsCols = [
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 20 },
    ];
    ws["!cols"] = wsCols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Pemilih");
    XLSX.writeFile(wb, "daftar_pemilih.xlsx");
  };

  const exportPDF = () => {
    if (!voters || voters.length === 0)
      return alert("Tidak ada data untuk dicetak!");

    const doc = new jsPDF();
    const dateNow = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const loadImages = () => {
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

    loadImages().then(({ imgLeft, imgRight }) => {
      // Kop Surat dengan Logo Kiri & Kanan
      doc.addImage(imgLeft, 'PNG', 14, 10, 22, 22);
      doc.addImage(imgRight, 'PNG', 174, 10, 22, 22);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("KOMISI PEMILIHAN UMUM MAHASISWA (KPUM)", 105, 18, { align: "center" });
      doc.setFontSize(16);
      doc.text("HIMPUNAN MAHASISWA INFORMATIKA", 105, 25, { align: "center" });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Sistem Informasi E-Voting Berbasis Real-Time Data Terintegrasi", 105, 30, { align: "center" });
      
      doc.setLineWidth(0.8);
      doc.line(14, 35, 196, 35);
      doc.setLineWidth(0.2);
      doc.line(14, 36, 196, 36);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("BERITA ACARA LAPORAN PARTISIPASI PEMILIH", 105, 48, { align: "center" });
  
      const tableColumn = ["No", "NIM", "Nama Pemilih", "Akses", "Status", "Kandidat"];
      const tableRows = filteredVoters.map((v, index) => [
        index + 1,
        v.nim,
        v.name.toUpperCase(),
        Number(v.isVerified) === 1 ? "AKTIF" : "PENDING",
        v.status.toUpperCase(),
        v.candidate_name.toUpperCase(),
      ]);

      autoTable(doc, {
        startY: 62,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: { 
          fillColor: [30, 58, 138], // Header Navy
          halign: 'center',
          fontStyle: 'bold' 
        },
        styles: { fontSize: 8, cellPadding: 2.5 },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 }
        }
      });

      const finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Dicetak di Tempat, ${dateNow}`, 140, finalY);
      doc.setFont("helvetica", "bold");
      doc.text("Ketua Panitia KPUM,", 140, finalY + 7);
      doc.setFont("helvetica", "normal");
      doc.text("( __________________________ )", 138, finalY + 30);
      doc.text("NIM. .....................................", 140, finalY + 35);

      const pdfData = doc.output("bloburl");
      window.open(pdfData, "_blank");
    });
  };

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
              {notification.type === "success" ? <FaCheckCircle /> : "🗑️"}
            </div>
            <div>
              <p className="font-black text-[10px] uppercase tracking-wider">System Update</p>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={`flex-1 px-4 md:px-8 py-8 transition-all duration-300 ${
          sidebarOpen ? "md:ml-72" : "md:ml-20"
        } ml-0`}
      >
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">Kelola Pemilih</h1>
        
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-center mb-4 bg-red-50 py-2 rounded-lg border border-red-100 uppercase text-xs font-bold">
            {error}
          </motion.p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3 flex-wrap">
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Cari NIM atau Nama..."
              className="border px-4 py-2.5 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-pink-300 outline-none transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="border px-4 py-2.5 rounded-xl w-full sm:w-auto focus:ring-2 focus:ring-pink-300 outline-none shadow-sm cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Verifikasi ⚠️</option>
              <option value="sudah">Sudah Memilih</option>
              <option value="belum">Belum Memilih</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <button
              onClick={() => { setIsEdit(false); setShowModal(true); }}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 via-red-500 to-purple-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-transform w-full sm:w-auto justify-center font-bold"
            >
              <FaPlus /> Tambah Pemilih
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-white text-blue-600 border border-blue-100 px-5 py-2.5 rounded-xl shadow-sm hover:bg-blue-50 transition-all w-full sm:w-auto justify-center font-bold"
            >
              <FaFileCsv /> Export Excel
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 bg-white text-purple-600 border border-purple-100 px-5 py-2.5 rounded-xl shadow-sm hover:bg-purple-50 transition-all w-full sm:w-auto justify-center font-bold"
            >
              <FaFilePdf /> Import PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">NIM</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Nama Mahasiswa</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Akses Akun</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Status Vote</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Pilihan</th>
                  <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 italic">Memuat data pemilih...</td>
                  </tr>
                ) : filteredVoters.length > 0 ? (
                  filteredVoters.map((v) => (
                    <tr key={v.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 font-bold text-gray-700">{v.nim}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{v.name}</td>
                      <td className="px-6 py-4">
                        {Number(v.isVerified) === 1 ? (
                          <span className="flex items-center gap-1 text-blue-600 font-bold text-[10px] uppercase">
                            <FaCheckCircle size={10} /> Aktif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-500 font-bold text-[10px] uppercase animate-pulse">
                            ⚠️ Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          v.status === "Sudah Memilih" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm italic">{v.candidate_name}</td>
                      <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                        {Number(v.isVerified) === 0 && (
                          <button 
                            onClick={() => handleVerify(v.id, v.name)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-md"
                          >
                            Setujui
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(v)} 
                          className="bg-blue-50 hover:bg-blue-500 text-blue-500 hover:text-white p-2.5 rounded-xl transition-all shadow-sm"
                          title="Edit Data"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(v.id, v.name)} 
                          className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-xl transition-all shadow-sm"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">Data pemilih tidak ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH/EDIT PEMILIH */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-red-500 to-purple-600"></div>
              
              <h2 className="text-2xl font-black mb-6 text-gray-800 tracking-tight">
                {isEdit ? "Update Data Pemilih" : "Tambah Pemilih Baru"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nama Lengkap</label>
                  <input 
                    className="border border-gray-200 p-4 rounded-2xl w-full mt-1 focus:ring-2 focus:ring-pink-200 outline-none transition-all" 
                    placeholder="Masukkan nama..." 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nomor Induk Mahasiswa (NIM)</label>
                  <input 
                    className="border border-gray-200 p-4 rounded-2xl w-full mt-1 focus:ring-2 focus:ring-pink-200 outline-none transition-all" 
                    placeholder="Masukkan NIM..." 
                    value={form.nim} 
                    onChange={(e) => setForm({ ...form, nim: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                    Password Akses {isEdit && "(Kosongkan jika tidak ingin ganti)"}
                  </label>
                  <input 
                    type="password" 
                    className="border border-gray-200 p-4 rounded-2xl w-full mt-1 focus:ring-2 focus:ring-pink-200 outline-none transition-all" 
                    placeholder={isEdit ? "••••••••" : "Minimal 6 karakter..."} 
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                <button 
                  onClick={closeModal} 
                  className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-all w-full sm:w-auto"
                >
                  Batal
                </button>
                <button 
                  onClick={handleAddVoter} 
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-red-500 to-purple-600 text-white font-black shadow-lg hover:shadow-pink-200 transition-all w-full sm:w-auto"
                >
                  {isEdit ? "Simpan Perubahan" : "Simpan Data"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}