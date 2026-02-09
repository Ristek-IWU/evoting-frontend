import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function VoteChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: "Persentase Suara (%)",
        data: data.map((item) => item.percent),
        backgroundColor: [
          "#a855f7",
          "#ec4899",
          "#ef4444",
          "#f97316",
          "#22c55e",
          "#3b82f6",
        ],
        borderRadius: 14,
        barThickness: 42,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      tooltip: {
        callbacks: {
          // 🔥 TITLE TOOLTIP → PASLON + NAMA
          title: (ctx) => {
            const index = ctx[0].dataIndex;
            const name = ctx[0].label;
            return `Paslon ${index + 1} - ${name}`;
          },
          label: (ctx) => `Persentase: ${ctx.raw}%`,
          afterLabel: (ctx) => {
            const index = ctx.dataIndex;
            const totalVotes = data[index]?.total_votes;
            return totalVotes !== undefined
              ? `Jumlah Pemilih: ${totalVotes} orang`
              : "";
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + "%",
        },
        grid: {
          color: "rgba(0,0,0,0.06)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl p-6 shadow-xl w-full h-[440px]"
    >
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          Grafik Hasil Voting
        </h2>
        <p className="text-sm text-gray-500">
          Perbandingan persentase suara setiap paslon
        </p>
      </div>

      {/* CHART */}
      <div className="h-[330px]">
        <Bar data={chartData} options={options} />
      </div>
    </motion.div>
  );
}

export default VoteChart;
