import React from "react";

function StepCostList({ stepCosts }) {
  if (!stepCosts || stepCosts.length === 0) return null;
  return (
    // Use the standard card class and specific section class
    <div className="card step-cost-section">
      <h4>Step Cost Calculation</h4>
      <div className="step-cost-list">
        {stepCosts.map((step, idx) => (
          <div key={idx}>
            Step {idx + 1}: Node{" "}
            <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
              {step.nodeId}
            </span>{" "}
            &nbsp; f = <span className="cost-value">{step.f}</span> (g=
            <span className="cost-value">{step.g}</span> + h=
            <span className="cost-value">{step.h}</span>)
            {/* Optional: Add formula back if needed */}
            {/* <span className="formula">{step.formula}</span> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StepCostList;
