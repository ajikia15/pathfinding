import React from "react";

function StepCostList({ stepCosts }) {
  if (!stepCosts || stepCosts.length === 0) return null;
  return (
    <div className="step-costs card">
      <h4>Step-by-step Cost Calculation</h4>
      {stepCosts.map((step, idx) => (
        <div key={idx}>
          Step: {idx + 1} &nbsp; Cost: {step.total} (
          <span style={{ color: "#888" }}>+{step.added}</span>) &nbsp;
          <span style={{ color: "#888" }}>{step.formula}</span>
        </div>
      ))}
    </div>
  );
}

export default StepCostList;
