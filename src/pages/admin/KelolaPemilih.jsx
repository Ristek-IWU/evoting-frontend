import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import API from "../../services/api";
import { FaTrash, FaPlus } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function KelolaPemilih() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("nim");
  const [sortAsc, setSortAsc] = useState(true);

  // ===== MODAL TAMBAH PEMILIH =====
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    nim: "",
    password: "",
  });

  // ===== FETCH PEMILIH =====
  const fetchVoters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/api/admin/voters", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.map((u) => ({
        id: u.id,
        nim: u.nim,
        name: u.name || "-",
        status: u.hasVoted ? "Sudah Memilih" : "Belum Memilih",
        candidate_name: u.candidate_name || "-",
        created_at: u.created_at
          ? new Date(u.created_at).toLocaleDateString("id-ID")
          : "-",
      }));

      setVoters(data);
    } catch (err) {
      setError("Gagal mengambil data pemilih");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, []);

  // ===== TAMBAH PEMILIH =====
  const handleAddVoter = async () => {
    if (!form.name || !form.nim || !form.password) {
      alert("Semua field wajib diisi");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.post("/api/admin/voters", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowModal(false);
      setForm({ name: "", nim: "", password: "" });
      fetchVoters();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambahkan pemilih");
    }
  };

  // ===== HAPUS =====
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus pemilih?")) return;

    const token = localStorage.getItem("token");
    await API.delete(`/api/admin/voters/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setVoters((prev) => prev.filter((v) => v.id !== id));
  };

  // ===== FILTER + SEARCH =====
  const filteredVoters = voters
    .filter((v) =>
      filterStatus === "all"
        ? true
        : filterStatus === "sudah"
        ? v.status === "Sudah Memilih"
        : v.status === "Belum Memilih"
    )
    .filter(
      (v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.nim.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const A = a[sortField].toLowerCase();
      const B = b[sortField].toLowerCase();
      return sortAsc ? A.localeCompare(B) : B.localeCompare(A);
    });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Content */}
      <div className="flex-1 px-4 md:px-8 py-8 md:ml-72">
        <h1 className="text-3xl font-extrabold text-center mb-6">
          Kelola Pemilih
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* SEARCH + ACTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Cari..."
              className="border px-3 py-2 rounded-lg w-full sm:w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="border px-3 py-2 rounded-lg"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua</option>
              <option value="sudah">Sudah</option>
              <option value="belum">Belum</option>
            </select>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
          >
            <FaPlus /> Tambah Pemilih
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3">NIM</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Kandidat</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : (
                filteredVoters.map((v) => (
                  <tr key={v.id} className="border-t hover:bg-blue-50">
                    <td className="px-4 py-3">{v.nim}</td>
                    <td className="px-4 py-3">{v.name}</td>
                    <td className="px-4 py-3">{v.created_at}</td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        v.status === "Sudah Memilih"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {v.status}
                    </td>
                    <td className="px-4 py-3">{v.candidate_name}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL TAMBAH PEMILIH ===== */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
            >
              <h2 className="text-xl font-bold mb-4">Tambah Pemilih</h2>

              <input
                className="border p-2 rounded w-full mb-3"
                placeholder="Nama Lengkap"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                className="border p-2 rounded w-full mb-3"
                placeholder="NIM"
                value={form.nim}
                onChange={(e) => setForm({ ...form, nim: e.target.value })}
              />

              <input
                type="password"
                className="border p-2 rounded w-full mb-4"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddVoter}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
