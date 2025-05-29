const express = require("express");
const router = express.Router();
const { performNetworkScan } = require("../services/networkScan");
const { performEndpointScan } = require("../services/endpointScan");
const { performDataScan } = require("../services/dataScan");

router.post("/network", async (req, res) => {
  try {
    const riskScore = await performNetworkScan(); // Mocked for now
    res.json({ networkRisk: riskScore });
  } catch (error) {
    res.status(500).json({ error: "Network scan failed" });
  }
});

router.post("/endpoint", async (req, res) => {
  try {
    const riskScore = await performEndpointScan(); // Mocked for now
    res.json({ endpointRisk: riskScore });
  } catch (error) {
    res.status(500).json({ error: "Endpoint scan failed" });
  }
});

router.post("/data", async (req, res) => {
  try {
    const riskScore = await performDataScan(); // Mocked for now
    res.json({ dataRisk: riskScore });
  } catch (error) {
    res.status(500).json({ error: "Data scan failed" });
  }
});

router.get("/results", (req, res) => {
  // Mocked results (replace with actual results from database)
  res.json({
    network: 4, // Example: 4/10 risk
    endpoint: 6, // Example: 6/10 risk
    data: 3, // Example: 3/10 risk
  });
});

module.exports = router;