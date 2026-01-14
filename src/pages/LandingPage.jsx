import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { 
  FaLock, FaBolt, FaEye, FaInstagram,
  FaEnvelope, FaMapMarkerAlt, FaPhone, FaGlobe 
} from "react-icons/fa";

const character1 = "/characters/character1.png";
const character2 = "/characters/character2.png";

function LandingPage() {
  const particlesInit = async (main) => await loadFull(main);
  const [activeSection, setActiveSection] = useState("home");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const homeHeight = window.innerHeight;
      const featuresOffset = document.getElementById("features")?.offsetTop || 0;
      const motivationOffset = document.getElementById("motivation")?.offsetTop || 0;
      const guideOffset = document.getElementById("guide")?.offsetTop || 0;
      const contactOffset = document.getElementById("contact")?.offsetTop || 0;

      if (scrollY < featuresOffset - homeHeight / 2) setActiveSection("home");
      else if (scrollY < motivationOffset - homeHeight / 2) setActiveSection("features");
      else if (scrollY < guideOffset - homeHeight / 2) setActiveSection("motivation");
      else if (scrollY < contactOffset - homeHeight / 2) setActiveSection("guide");
      else setActiveSection("contact");
    };

    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const features = [
    { title: "Aman & Terpercaya", desc: "Semua data pemilih dan hasil voting tersimpan aman dengan sistem enkripsi.", icon: <FaLock size={40} className="mx-auto mb-4" />, color: "from-green-400 to-green-600" },
    { title: "Cepat & Efisien", desc: "Proses pemilihan berjalan cepat tanpa antre, langsung dari akun masing-masing.", icon: <FaBolt size={40} className="mx-auto mb-4" />, color: "from-yellow-400 to-yellow-600" },
    { title: "Transparan & Akuntabel", desc: "Hasil voting dapat dilihat langsung, memastikan transparansi dan keadilan.", icon: <FaEye size={40} className="mx-auto mb-4" />, color: "from-blue-400 to-blue-600" },
  ];

  const contacts = [
    { icon: <FaMapMarkerAlt />, label: "Alamat", value: "Jl. Pasir Kaliki No. 179 A, Kota Bandung, 40173" },
    { icon: <FaEnvelope />, label: "Email", value: "ristekhimaif@gmail.com" },
    { icon: <FaInstagram />, label: "Instagram", value: "@himaif.iwu" },
    { icon: <FaGlobe />, label: "Website", value: "Sistem E-Voting Himaif" },
  ];

  return (
    <div className="relative">

      {/* HOME */}
      <section id="home" className="relative h-screen overflow-hidden">
        {/* Full screen animated background */}
        <motion.div 
          className="absolute inset-0 bg-[url('/gambar-bg.png')] bg-cover bg-center pointer-events-none opacity-80"
          animate={{ x: [0, -20, 0], y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        />

        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false },
            particles: {
              number: { value: 80 },
              color: { value: ["#ffffff", "#00f0ff", "#ff00ff"] },
              shape: { type: "circle" },
              opacity: { value: 0.6 },
              size: { value: { min: 1, max: 3 } },
              move: { enable: true, speed: 1.2 },
              links: { enable: true, distance: 120, color: "#ffffff", opacity: 0.3 },
            },
            interactivity: { events: { onHover: { enable: true, mode: "repulse" } } },
          }}
          className="absolute inset-0 z-0"
        />

        <nav className="fixed top-0 w-full z-20 px-4 sm:px-6 py-4 flex flex-wrap justify-end gap-2 sm:gap-4 bg-black/30 backdrop-blur-md">
          {["home","features","motivation","guide","contact"].map(section=>(
            <button key={section} onClick={()=>scrollToSection(section)}
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-xl font-semibold text-sm sm:text-base transition ${activeSection===section?"bg-white text-blue-800":"text-white/70 hover:text-white"}`}>
              {section.charAt(0).toUpperCase()+section.slice(1)}
            </button>
          ))}
          <Link to="/login" className="px-4 py-1 sm:px-5 sm:py-2 rounded-xl font-bold bg-white text-blue-800 shadow-lg hover:scale-105 transition-transform text-sm sm:text-base">Login</Link>
          <Link to="/register" className="px-4 py-1 sm:px-5 sm:py-2 rounded-xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg hover:scale-105 transition-transform text-sm sm:text-base">Register</Link>
        </nav>

        <div className="relative z-10 flex flex-col justify-center items-center text-center h-full px-4 sm:px-6">
          <motion.div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl w-full max-w-md sm:max-w-2xl"
            initial={{ opacity: 0, y: 50 }} animate={{ opacity:1, y:0 }} transition={{ duration:1 }}>
            <motion.h1 className="text-3xl sm:text-5xl font-black text-white mb-3 sm:mb-4">Sistem E-Voting Kampus</motion.h1>
            <motion.p className="text-sm sm:text-lg text-white/90 leading-relaxed">
              Tingkatkan partisipasi mahasiswa dalam pemilihan secara aman, cepat, dan transparan.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 sm:py-20 bg-blue-900/30 text-white relative overflow-hidden">
        <motion.img src={character1} alt="Character 1" className="absolute w-24 sm:w-40"
          style={{ left: mousePos.x / 50, top: mousePos.y / 50 }}
          animate={{ y: [0,-15,0] }} transition={{ repeat: Infinity, duration: 4 }} />
        <motion.img src={character2} alt="Character 2" className="absolute w-24 sm:w-40"
          style={{ right: 10 + mousePos.x / 60, top: 80 + mousePos.y / 60 }}
          animate={{ y: [0,-20,0] }} transition={{ repeat: Infinity, duration: 4 }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Fitur Sistem E-Voting</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
            {features.map((item,idx)=>(
              <motion.div key={idx} className={`bg-gradient-to-r ${item.color} rounded-2xl p-6 sm:p-8 text-center shadow-lg`}
                initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{once:true}} transition={{delay:idx*0.2}}
                whileHover={{ scale: 1.05 }}>
                <motion.div whileHover={{ rotate: 360 }} className="inline-block">{item.icon}</motion.div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-white/90 text-sm sm:text-base">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MOTIVATION */}
      <section id="motivation" className="py-16 sm:py-20 bg-blue-900 text-white text-center">
        <motion.h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">“Satu akun, satu suara, satu masa depan.”</motion.h2>
        <motion.p className="text-sm sm:text-lg text-white/80 max-w-md sm:max-w-2xl mx-auto leading-relaxed">
          Pastikan partisipasi Anda dalam setiap pemilihan melalui akun yang valid. Hasil pemungutan suara dapat dipantau secara transparan.
        </motion.p>
      </section>

      {/* GUIDE */}
      <section id="guide" className="py-16 sm:py-20 bg-blue-800 text-white text-center">
        <motion.h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">Panduan Pemilih</motion.h2>
        <motion.div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[{
              step: "Buat & Verifikasi Akun",
              desc: "Daftar menggunakan NIM aktif, lalu verifikasi akun melalui email resmi universitas."
            },
            {
              step: "Login ke Sistem",
              desc: "Masuk menggunakan NIM dan password yang telah terdaftar untuk mengakses halaman pemilihan."
            },
            {
              step: "Pilih Kandidat & Konfirmasi",
              desc: "Tinjau setiap kandidat dengan cermat, pilih sesuai preferensi, lalu konfirmasi suara Anda secara final."
          }].map((item,i)=>(
            <motion.div key={i} className="bg-white/10 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow hover:scale-105"
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.5)" }}>
              <h3 className="font-bold text-lg sm:text-xl mb-1 sm:mb-2">{item.step}</h3>
              <p className="text-white/80 text-sm sm:text-base">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-16 sm:py-20 bg-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Hubungi Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {contacts.map((c,i)=>(
              <motion.div key={i} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white/10 rounded-2xl shadow-lg relative overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.05 }}>
                <motion.div className="text-3xl sm:text-4xl text-blue-400 neon-glow">{c.icon}</motion.div>
                <div className="text-left">
                  <p className="font-semibold text-sm sm:text-base">{c.label}</p>
                  <p className="text-xs sm:text-sm">{c.value}</p>
                </div>
                <motion.span className="absolute inset-0 bg-white/10 rounded-2xl opacity-0"
                  whileHover={{ opacity: 0.3, scale: 1.2 }} transition={{ duration: 0.4 }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-4 sm:py-6 text-center text-sm sm:text-base">
        © 2026 E-Voting Himaif
      </footer>
    </div>
  );
}

export default LandingPage;
