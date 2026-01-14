export default function CandidateCard({
  name,
  vice,
  vision,
  photo,
  disabled,
  onVote,
}) {
  return (
    <div
      className={`relative bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100
        rounded-3xl p-6 shadow-lg text-gray-800
        hover:scale-105 hover:shadow-2xl transition-transform duration-300 flex flex-col items-center text-center
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={() => !disabled && onVote()}
    >
      {photo && (
        <img
          src={photo}
          alt={name}
          className="w-28 h-28 object-cover rounded-full mb-3 border-2 border-white shadow-sm"
        />
      )}
      <h3 className="font-bold text-lg mb-1">{name}</h3>
      <p className="text-sm text-gray-700 mb-2 font-semibold">Wakil: {vice}</p>
      <p className="text-sm text-gray-600 line-clamp-3">{vision}</p>
      {!disabled && (
        <span className="mt-4 px-4 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition">
          Pilih
        </span>
      )}
    </div>
  );
}
