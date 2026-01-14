function StatCard({ title, value, glossy, candidate }) {
  // Jika ada candidate, tampilkan card kandidat
  if (candidate) {
    return (
      <div
        className="relative bg-white/20 backdrop-blur-md border border-white/20 
          rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-4 shadow-md
          transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      >
        {/* Overlay glossy */}
        <div className="absolute inset-0 bg-white/10 rounded-3xl pointer-events-none" />

        {candidate.photo && (
          <img
            src={`http://localhost:5000${candidate.photo}`}
            alt={candidate.name}
            className="w-24 h-24 rounded-full object-cover flex-shrink-0 border-2 border-white/30 shadow-sm"
          />
        )}

        <div className="flex-1 min-w-0 relative z-10 text-center sm:text-left">
          <h4 className="text-lg font-bold text-gray-800">{candidate.name}</h4>
          {candidate.vice && (
            <p className="text-gray-600 text-sm">Wakil: {candidate.vice}</p>
          )}
          {candidate.description && (
            <p className="text-gray-500 text-sm mt-2">{candidate.description}</p>
          )}
        </div>
      </div>
    );
  }

  // Jika tidak ada candidate, tampilkan stat biasa
  return (
    <div
      className={`relative rounded-3xl p-6 text-white shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
        ${glossy 
          ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 backdrop-blur-md bg-white/20 border border-white/30"
          : "bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700"}`
      }
    >
      {/* Overlay subtle untuk efek glossy */}
      {glossy && <div className="absolute inset-0 bg-white/10 rounded-3xl pointer-events-none" />}

      <div className="relative z-10 text-center">
        <p className="text-sm text-blue-100 mb-2 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export default StatCard;
