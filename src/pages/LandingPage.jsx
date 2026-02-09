import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { loadFull } from "tsparticles";
import { Particles } from "react-tsparticles";
import { 
  FaLock, FaBolt, FaEye, FaInstagram,
  FaEnvelope, FaMapMarkerAlt, FaGlobe, FaChevronDown 
} from "react-icons/fa";

const character1 = "/characters/character1.png";
const character2 = "/characters/character2.png";

function LandingPage() {
  const particlesInit = async (main) => await loadFull(main);
  const [activeSection, setActiveSection] = useState("home");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [footerVisible, setFooterVisible] = useState(false);
  const [showScrollPrompt, setShowScrollPrompt] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const homeHeight = window.innerHeight;
      
      if (scrollY > 100) setShowScrollPrompt(false);
      else setShowScrollPrompt(true);

      const featuresOffset = document.getElementById("features")?.offsetTop || 0;
      const motivationOffset = document.getElementById("motivation")?.offsetTop || 0;
      const guideOffset = document.getElementById("guide")?.offsetTop || 0;
      const contactOffset = document.getElementById("contact")?.offsetTop || 0;

      if (scrollY < featuresOffset - homeHeight / 2) setActiveSection("home");
      else if (scrollY < motivationOffset - homeHeight / 2) setActiveSection("features");
      else if (scrollY < guideOffset - homeHeight / 2) setActiveSection("motivation");
      else if (scrollY < contactOffset - homeHeight / 2) setActiveSection("guide");
      else setActiveSection("contact");

      const scrollBottom = window.scrollY + window.innerHeight;
      const pageHeight = document.body.offsetHeight;
      if (scrollBottom > pageHeight - 200) setFooterVisible(true);
      else setFooterVisible(false);
    };

    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    { title: "Aman & Terpercaya", desc: "Semua data pemilih dan hasil voting tersimpan aman dengan sistem enkripsi.", icon: <FaLock size={40} className="mx-auto mb-4" />, color: "from-pink-400 to-purple-600" },
    { title: "Cepat & Efisien", desc: "Proses pemilihan berjalan cepat tanpa antre, langsung dari akun masing-masing.", icon: <FaBolt size={40} className="mx-auto mb-4" />, color: "from-yellow-400 to-pink-600" },
    { title: "Transparan & Akuntabel", desc: "Hasil voting dapat dilihat langsung, memastikan transparansi dan keadilan.", icon: <FaEye size={40} className="mx-auto mb-4" />, color: "from-purple-400 to-pink-500" },
  ];

  const contacts = [
    { icon: <FaMapMarkerAlt />, label: "Alamat", value: "Jl. Pasir Kaliki No. 179 A, Kota Bandung, 40173", link: "#" },
    { icon: <FaEnvelope />, label: "Email", value: "ristekhimaif@gmail.com", link: "mailto:ristekhimaif@gmail.com" },
    { icon: <FaInstagram />, label: "Instagram", value: "@himaif.iwu", link: "https://www.instagram.com/himaif.iwu/" },
    { icon: <FaGlobe />, label: "Website", value: "Sistem E-Voting Himaif", link: "#" },
  ];

  return (
    <div className="relative bg-[#0f0c29] overflow-x-hidden selection:bg-pink-500 selection:text-white">

      {/* ================= SCROLL INDICATOR NOTIF (PRECISE CENTER) ================= */}
      <AnimatePresence>
        {showScrollPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-30 flex flex-col items-center pointer-events-none"
          >
            <motion.p 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-2 text-center"
            >
              Scroll Ke Bawah
            </motion.p>
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-white text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            >
              <FaChevronDown />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= HOME SECTION ================= */}
      <section id="home" className="relative h-screen overflow-hidden flex items-center justify-center">
        {/* UPDATED BACKGROUND LOGIC FOR PRECISION */}
        <motion.div 
          className="absolute inset-0 bg-[url('/gambar-bg.png')] bg-contain bg-no-repeat bg-center pointer-events-none opacity-40"
          style={{ backgroundSize: '80% auto' }} // Menjaga gambar tetap proporsional dan tidak terpotong
          animate={{ 
            x: [0, -10, 0], 
            y: [0, -5, 0],
            scale: [1, 1.05, 1] // Scale diperkecil agar tidak blur/zoom parah
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f0c29] z-0" />

        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false },
            particles: {
              number: { value: 60 },
              color: { value: ["#ffffff", "#ec4899", "#8b5cf6"] },
              shape: { type: "circle" },
              opacity: { value: 0.4 },
              size: { value: { min: 1, max: 2 } },
              move: { enable: true, speed: 0.8 },
              links: { enable: true, distance: 150, color: "#ffffff", opacity: 0.1 },
            },
            interactivity: { events: { onHover: { enable: true, mode: "grab" } } },
          }}
          className="absolute inset-0 z-0"
        />

        {/* GLOSSY NAV */}
        <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-5xl z-50 px-3 sm:px-4 py-3 flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="hidden md:block font-black text-white tracking-tighter text-xl ml-2">HIMAIF <span className="text-pink-500">VOTE</span></div>
          <div className="flex gap-1 sm:gap-4 overflow-x-auto no-scrollbar mx-2">
            {["home","features","motivation","guide","contact"].map(section=>(
              <motion.button key={section} onClick={()=>scrollToSection(section)}
                className={`whitespace-nowrap px-2 sm:px-3 py-1.5 rounded-xl font-bold text-[9px] sm:text-xs uppercase tracking-wider transition-all duration-300 ${activeSection===section?"bg-white text-pink-700 shadow-lg shadow-white/10":"text-white/60 hover:text-white hover:bg-white/5"}`}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {section}
              </motion.button>
            ))}
          </div>
          <div className="flex gap-1 sm:gap-2">
            <Link to="/login" className="px-3 sm:px-4 py-2 rounded-xl font-bold bg-white text-pink-700 shadow-lg text-[10px] sm:text-xs hover:brightness-110 transition-all">Login</Link>
            <Link to="/register" className="hidden sm:block px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-700 text-white shadow-lg text-xs hover:brightness-110 transition-all">Register</Link>
          </div>
        </nav>

        <div className="relative z-10 text-center px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="bg-white/5 backdrop-blur-lg rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-16 border border-white/10 shadow-2xl inline-block"
          >
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl sm:text-7xl font-black text-white mb-6 leading-tight"
            >
              Sistem E-Voting <br/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-300 to-purple-500">Himaif</span>
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Transformasi demokrasi digital. Satu suara Anda menentukan arah masa depan organisasi yang lebih baik.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section id="features" className="py-24 bg-[#0f0c29] text-white relative overflow-hidden">
        <motion.img src={character1} alt="Character 1" className="absolute w-24 sm:w-40 opacity-40 blur-[1px] pointer-events-none"
          style={{ left: 50 + mousePos.x / 40, top: 100 + mousePos.y / 40 }}
          animate={{ y: [0,-20,0] }} transition={{ repeat: Infinity, duration: 5 }} />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tighter">Fitur Unggulan</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((item,idx)=>(
              <motion.div key={idx} 
                className={`relative group bg-gradient-to-br ${item.color} rounded-[2.5rem] p-8 text-center shadow-2xl overflow-hidden cursor-pointer`}
                initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{once:true}} transition={{delay:idx*0.2}}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.div 
                  whileHover={{ rotateY: 180 }} 
                  transition={{ duration: 0.6 }}
                  className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-xl font-black mb-3 relative z-10">{item.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed relative z-10 font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MOTIVATION ================= */}
      <section id="motivation" className="py-24 bg-gradient-to-b from-[#0f0c29] to-pink-500/20 text-white text-center px-4">
        <motion.div 
          initial={{ opacity:0, scale: 0.8 }}
          whileInView={{ opacity:1, scale: 1 }}
          viewport={{once:true}}
          className="max-w-4xl mx-auto border-y border-white/10 py-16"
        >
          <h2 className="text-2xl sm:text-5xl font-black mb-8 italic tracking-tight">
            “Satu Akun, Satu Suara, <br className="sm:hidden" /> Satu Masa Depan.”
          </h2>
          <p className="text-sm sm:text-lg text-white/60 max-w-2xl mx-auto font-light leading-relaxed px-4">
            Keamanan data adalah prioritas utama kami. Sistem menggunakan enkripsi tingkat lanjut untuk memastikan pilihan Anda tetap rahasia.
          </p>
        </motion.div>
      </section>

      {/* ================= GUIDE SECTION ================= */}
      <section id="guide" className="py-24 bg-gradient-to-b from-pink-500/10 to-pink-500/20 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl sm:text-5xl font-black text-center mb-16 tracking-tighter text-pink-100">Alur Pemilihan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative">
            {[{
                step: "01",
                title: "Registrasi",
                desc: "Daftar menggunakan NIM aktif dan verifikasi identitas mahasiswa Anda."
              },
              {
                step: "02",
                title: "Login",
                desc: "Masuk ke dashboard pemilihan dengan kredensial yang aman dan terenkripsi."
              },
              {
                step: "03",
                title: "Voting",
                desc: "Gunakan hak suara Anda untuk memilih kandidat terbaik secara transparan."
            }].map((item,i)=>(
              <motion.div key={i} className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 sm:p-10 hover:bg-white/20 transition-all duration-300 cursor-pointer shadow-xl"
                initial={{ opacity:0, x: -20 }} whileInView={{ opacity:1, x:0 }} viewport={{once:true}} transition={{ delay: i*0.2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-6xl font-black text-pink-400/20 absolute top-4 right-6 leading-none">{item.step}</span>
                <h3 className="font-black text-2xl mb-4 text-pink-400 tracking-tighter relative z-10">{item.title}</h3>
                <p className="text-white/80 text-base font-light leading-relaxed relative z-10">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section id="contact" className="py-24 bg-gradient-to-b from-pink-500/20 to-pink-600/30 text-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl font-black mb-8 tracking-tighter text-pink-100">Hubungi Kami</h2>
            <div className="space-y-4 sm:space-y-6">
              {contacts.map((c,i)=>(
                <motion.a 
                  href={c.link} 
                  target={c.link.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  key={i} 
                  className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-pink-500/50 transition-all group cursor-pointer block"
                  initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{once:true}}
                  whileTap={{ scale: 0.98 }}>
                  <div className="text-2xl sm:text-3xl text-pink-500 bg-pink-500/20 p-3 sm:p-4 rounded-2xl group-hover:scale-110 transition-transform">{c.icon}</div>
                  <div className="overflow-hidden">
                    <p className="text-pink-300 text-[10px] font-bold uppercase tracking-widest">{c.label}</p>
                    <p className="text-sm sm:text-lg font-medium truncate">{c.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 h-[300px] sm:h-full min-h-[350px] rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10 grayscale hover:grayscale-0 transition-all duration-700 shadow-pink-500/10">
            <iframe
              title="Lokasi Himaif Bandung"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.945829910543!2d107.59218677420455!3d-6.897089167493208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6638062a4d3%3A0x6b86604294a2b972!2sJl.%20Pasir%20Kaliki%20No.179%20A%2C%20Pamoyanan%2C%20Kec.%20Cicendo%2C%20Kota%20Bandung%2C%20Jawa%20Barat%2040173!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      {/* ================= MODERN BRIGHT FOOTER ================= */}
      <motion.footer 
        className="relative py-12 sm:py-20 text-center overflow-hidden"
        initial={{ opacity:0 }}
        animate={footerVisible ? { opacity:1 } : { opacity:0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-pink-500/40 via-pink-400/10 to-transparent backdrop-blur-3xl z-0" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="mb-10 flex justify-center gap-10">
            <motion.a 
              href="https://www.instagram.com/himaif.iwu/" target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.3, rotate: 10 }} whileTap={{ scale: 0.9 }}
              className="bg-white/20 p-4 rounded-2xl cursor-pointer hover:bg-pink-500 transition-colors shadow-lg border border-white/20 group"
            >
              <FaInstagram className="text-2xl text-white" />
            </motion.a>
            <motion.a 
              href="mailto:ristekhimaif@gmail.com"
              whileHover={{ scale: 1.3, rotate: -10 }} whileTap={{ scale: 0.9 }}
              className="bg-white/20 p-4 rounded-2xl cursor-pointer hover:bg-pink-500 transition-colors shadow-lg border border-white/20 group"
            >
              <FaEnvelope className="text-2xl text-white" />
            </motion.a>
            <motion.div
              whileHover={{ scale: 1.3, rotate: 10 }} whileTap={{ scale: 0.9 }}
              className="bg-white/20 p-4 rounded-2xl cursor-pointer hover:bg-pink-500 transition-colors shadow-lg border border-white/20 group"
            >
              <FaGlobe className="text-2xl text-white" />
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            className="inline-block px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-8 shadow-xl"
          >
            <p className="text-white font-black text-xs sm:text-sm tracking-[0.2em] uppercase">
              Himaif <span className="text-pink-400">Vote</span> — Build for Excellence
            </p>
          </motion.div>

          <p className="text-pink-100/40 text-[9px] sm:text-xs font-medium tracking-[0.5em] uppercase italic">
            © 2026 E-Voting Himaif • Crafted with Love by Ristek
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

export default LandingPage;