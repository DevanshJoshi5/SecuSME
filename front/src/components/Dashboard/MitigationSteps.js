import React from "react";

const MitigationSteps = ({ scores }) => {
  const steps = [];
  if (scores.network > 5) steps.push("Strengthen firewall rules and scan for open ports.");
  if (scores.endpoint > 5) steps.push("Install antivirus/EDR and enable MFA on all devices.");
  if (scores.data > 5) steps.push("Encrypt sensitive data and implement DLP measures.");

  return (
    <div>
      <h3>Mitigation Steps</h3>
      <ul>
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
    </div>
  );
};

export default MitigationSteps;