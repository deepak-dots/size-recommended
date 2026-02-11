import React, { useState, useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

const FindMySize = () => {
  const fetch = useAuthenticatedFetch();

  const [step, setStep] = useState(1);

  // =====================
  // CATEGORY
  // =====================
  const [category, setCategory] = useState("Shoes");

  // 🔴 NEW: Shoe Type (Men / Women / Kids / Toddler)
  const [shoeType, setShoeType] = useState("Women");

  const [brands, setBrands] = useState([]);
  const [brandId, setBrandId] = useState("");
  const [collection, setCollection] = useState("Main");
  const [width, setWidth] = useState("Medium");
  const [unit, setUnit] = useState("cm");
  const [brace, setBrace] = useState("no");
  const [foot, setFoot] = useState("both");

  const [measurements, setMeasurements] = useState({
    left: { A: "", B: "", C: "", D: "", E: "" },
    right: { A: "", B: "", C: "", D: "", E: "" },
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loadingBrands, setLoadingBrands] = useState(true);

  // =====================
  // HELPER: FRACTION SUPPORT
  // =====================
  const parseFraction = (str) => {
    if (!str) return 0;
    const parts = str.split("-");
    if (parts.length === 1) return parseFloat(parts[0]);
    const whole = parseFloat(parts[0]);
    const [num, denom] = parts[1].split("/").map(Number);
    return whole + num / denom;
  };

  // =====================
  // FETCH BRANDS
  // =====================
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/proxy/brands");
        const data = await res.json();
        if (Array.isArray(data)) setBrands(data);
        else setError("Invalid brand data");
      } catch (err) {
        setError("Unable to load brands");
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  // =====================
  // HANDLE MEASUREMENTS
  // =====================
  const handleMeasurementChange = (side, key, value) => {
    let val = value;
    if (unit === "in") val = parseFraction(value);
    else val = parseFloat(value);

    setMeasurements((prev) => ({
      ...prev,
      [side]: { ...prev[side], [key]: val },
    }));
  };

  // =====================
  // SUBMIT
  // =====================
  const handleSubmit = async () => {
    setError("");
    setResult(null);

    if (!brandId) return setError("Please select brand.");

    const leftA = parseFloat(measurements.left.A || 0);
    const rightA = parseFloat(measurements.right.A || 0);

    if (!leftA && !rightA)
      return setError("Please enter at least foot length (A).");

    try {
      const response = await fetch("/api/proxy/find-size", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: brandId,

          // ✅ Shoes / Clothing
          category,

          // 🔴 NEW: shoe type
          shoe_type: category === "Shoes" ? shoeType : null,

          collection,
          unit,
          width,
          brace,
          measurements,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setStep(3);
      } else {
        setError(data.message || "Size not found.");
      }
    } catch (err) {
      setError("Error fetching size.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={cardStyle}>

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <>
            <h3>STEP 1 OF 4</h3>
            <h2>What would you like to measure?</h2>

            <div style={{ marginBottom: 20 }}>
              <button
                style={category === "Shoes" ? activeBtn : normalBtn}
                onClick={() => setCategory("Shoes")}
              >Shoes</button>

              <button
                style={category === "Clothing" ? activeBtn : normalBtn}
                onClick={() => setCategory("Clothing")}
              >Clothing</button>
            </div>

            {/* 🔴 NEW: SHOE TYPE SELECTOR */}
            {category === "Shoes" && (
              <div style={{ marginBottom: 15 }}>
                <strong>Who is this for?</strong><br />
                {["Women", "Men", "Adult", "Kids", "Toddler"].map(type => (
                  <button
                    key={type}
                    style={shoeType === type ? activeBtn : normalBtn}
                    onClick={() => setShoeType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

            <label>
              Brand
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>

            <button style={buttonStyle} onClick={() => setStep(2)}>
              Next Step →
            </button>
          </>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && category === "Shoes" && (
          <>
            <h3>STEP 2 OF 4</h3>
            <h2>Manual Measurement</h2>

            <div style={{ marginBottom: 15 }}>
              <strong>Select unit:</strong><br />
              <button
                style={unit === "cm" ? activeBtn : normalBtn}
                onClick={() => setUnit("cm")}>CM</button>
              <button
                style={unit === "in" ? activeBtn : normalBtn}
                onClick={() => setUnit("in")}>Inches</button>
            </div>

            {(foot === "left" || foot === "both") && (
              <>
                <h4>LEFT FOOT ({unit.toUpperCase()})</h4>
                {["A","B","C","D","E"].map(k => (
                  <input
                    key={k}
                    placeholder={`${k} measurement`}
                    value={measurements.left[k]}
                    onChange={e => handleMeasurementChange("left", k, e.target.value)}
                    style={inputStyle}
                  />
                ))}
              </>
            )}

            {(foot === "right" || foot === "both") && (
              <>
                <h4>RIGHT FOOT ({unit.toUpperCase()})</h4>
                {["A","B","C","D","E"].map(k => (
                  <input
                    key={k}
                    placeholder={`${k} measurement`}
                    value={measurements.right[k]}
                    onChange={e => handleMeasurementChange("right", k, e.target.value)}
                    style={inputStyle}
                  />
                ))}
              </>
            )}

            <button onClick={() => setStep(1)} style={normalBtn}>← Back</button>
            <button onClick={handleSubmit} style={buttonStyle}>Get My Size →</button>
          </>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && result && (
          <>
            <h2>MEASUREMENT COMPLETE</h2>
            <p>Category: {shoeType}</p>

            {/* LEFT FOOT */}
            <div style={resultBox}>
              <h3>LEFT FOOT</h3>
              <p>
                US {result.us_size} | EU {result.eu_size} | UK {result.uk_size}
              </p>
            </div>

            {/* RIGHT FOOT */}
            <div style={resultBox}>
              <h3>RIGHT FOOT</h3>
              <p>
                US {result.us_size} | EU {result.eu_size} | UK {result.uk_size}
              </p>
            </div>

            {result.warning && (
              <p style={{ color: "#b45309", textAlign: "center" }}>
                {result.warning}
              </p>
            )}

            <button style={buttonStyle} onClick={() => setStep(1)}>
              Close and Apply Size →
            </button>
          </>
        )}


        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
};

// ===================== STYLES =====================
const cardStyle = { background: "#fff", padding: 30, borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" };
const resultBox = { background: "#f5f5f5", padding: 20, borderRadius: 12, textAlign: "center", margin: "20px 0" };
const inputStyle = { width: "100%", padding: 12, margin: "6px 0", borderRadius: 6, border: "1px solid #ccc" };
const buttonStyle = { width: "100%", padding: 14, background: "#008060", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", marginTop: 15 };
const normalBtn = { padding: "10px 18px", marginRight: 8, border: "1px solid #ccc", borderRadius: 6, background: "#f3f3f3", cursor: "pointer" };
const activeBtn = { ...normalBtn, background: "#008060", color: "#fff", border: "1px solid #008060" };

export default FindMySize;
