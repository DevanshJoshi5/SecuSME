import React from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const RiskHeatmap = ({ scanScores, questionnaireScores }) => {
  const data = {
    labels: ["Network", "Endpoint", "Data"],
    datasets: [
      {
        label: "Scan Risk",
        data: [
          scanScores?.network || 0,
          scanScores?.endpoint || 0,
          scanScores?.data || 0,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Questionnaire Risk",
        data: [
          questionnaireScores?.network || 0,
          questionnaireScores?.endpoint || 0,
          questionnaireScores?.data || 0,
        ],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 10, // Ensure the y-axis goes from 0 to 10
        title: {
          display: true,
          text: "Risk Score (0-10)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Category",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  };

  return (
    <div>
      <h3>Risk Heatmap</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default RiskHeatmap;