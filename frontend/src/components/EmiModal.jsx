import React, { useState } from 'react';

export default function EmiModal({ onClose }) {
  const [loanAmount, setLoanAmount] = useState(8000000); // 80 Lakhs
  const [interestRate, setInterestRate] = useState(8.5); // 8.5%
  const [tenureYears, setTenureYears] = useState(20);

  // EMI formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const calculateEMI = () => {
    const p = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;
    if (r === 0) return Math.round(p / n);
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const monthlyEMI = calculateEMI();
  const totalPayment = monthlyEMI * tenureYears * 12;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content emi-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

        <div className="modal-header">
          <h2>Housing Loan EMI Calculator</h2>
          <p>Estimate your monthly commitment with current bank interest rates.</p>
        </div>

        <div className="emi-calculator-grid">
          <div className="emi-sliders">
            <div className="slider-group">
              <div className="slider-header">
                <label>Loan Amount</label>
                <span className="slider-val">₹{(loanAmount / 100000).toFixed(1)} Lakhs</span>
              </div>
              <input
                type="range"
                min="500000"
                max="50000000"
                step="100000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
              />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label>Interest Rate (% per annum)</label>
                <span className="slider-val">{interestRate}%</span>
              </div>
              <input
                type="range"
                min="6.5"
                max="14.0"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
              />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label>Loan Tenure (Years)</label>
                <span className="slider-val">{tenureYears} Years</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="emi-result-card">
            <span className="emi-result-label">Estimated Monthly EMI</span>
            <h3 className="emi-result-amount">₹{monthlyEMI.toLocaleString('en-IN')}</h3>

            <div className="emi-breakdown">
              <div className="emi-breakdown-row">
                <span>Principal Amount</span>
                <strong>₹{loanAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="emi-breakdown-row">
                <span>Total Interest Payable</span>
                <strong>₹{totalInterest.toLocaleString('en-IN')}</strong>
              </div>
              <div className="emi-breakdown-row total">
                <span>Total Amount Payable</span>
                <strong>₹{totalPayment.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <button className="btn-primary full-width" onClick={onClose}>
              Browse Properties in this Budget
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
