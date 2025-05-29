import React from "react";
import "../styles/questionnaire.css";

const extensions = [
  {
    name: "Network Shield",
    description: "Blocks unsafe web traffic and identifies suspicious domains.",
    image: "/assets/network_shield.png",
    downloadLink: "https://drive.google.com/your-network-shield-link",
  },
  {
    name: "Endpoint Defender",
    description: "Monitors endpoint behavior and flags malicious activities.",
    image: "/assets/endpoint_defender.png",
    downloadLink: "https://drive.google.com/your-endpoint-defender-link",
  },
  {
    name: "Data Watch",
    description: "Scans for sensitive data exposure and unauthorized access.",
    image: "/assets/data_watch.png",
    downloadLink: "https://drive.google.com/your-data-watch-link",
  },
];

const ExtensionDownloadsPage = () => {
  return (
    <div className="extensions-container">
      <h2>Recommended Security Extensions</h2>

      {extensions.map((ext, index) => (
        <div key={index} className="extension-card">
          <img src={ext.image} alt={ext.name} className="extension-image" />
          <div className="extension-details">
            <h3>{ext.name}</h3>
            <p>{ext.description}</p>
            <a href={ext.downloadLink} target="_blank" rel="noopener noreferrer">
              Download {ext.name}
            </a>
          </div>
        </div>
      ))}

      <div className="install-instructions">
        <h3>How to Install the Extension</h3>
        <ol>
          <li>
            Open Google Chrome and click on the 3-dot menu.
            <br />
            <img
              src="/assets/step1.png"
              alt="Step 1 - Open Extensions in Chrome"
              style={{ maxWidth: "100%", marginTop: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
          </li>
          <li>Click on <strong>Extensions</strong>, then select <strong>Manage Extensions</strong>.</li>
          <li>Enable <strong>Developer Mode</strong> at the top-right corner of the extensions page.</li>
          <li>Click <strong>Load unpacked</strong> and choose the extracted extension folder.</li>
          <img
              src="/assets/step2.png"
              alt="Step 4 - Load unpacked and choose the extracted extension folder"
              style={{ maxWidth: "100%", marginTop: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
          <li>The extension will now appear in your Chrome toolbar.</li>
        </ol>
      </div>
    </div>
  );
};

export default ExtensionDownloadsPage;
