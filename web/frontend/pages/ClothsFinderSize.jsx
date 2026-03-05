import React, { useState, useEffect } from "react";

const FindMySize = () => {
  const BASE_URL = "/api/proxy/v1/cloths";

  // ===================== STATE =====================
  const [step, setStep] = useState(1);

  const [brands, setBrands] = useState([]);
  const [brandId, setBrandId] = useState("");
  const [productTypes, setProductTypes] = useState([]);
  const [productTypeId, setProductTypeId] = useState("");
  const [styles, setStyles] = useState([]);
  const [styleId, setStyleId] = useState("");
  const [measurements, setMeasurements] = useState({});
  const [measurementKeys, setMeasurementKeys] = useState([]);
  const [unit, setUnit] = useState("cm");

  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingProductTypes, setLoadingProductTypes] = useState(false);
  const [loadingStyles, setLoadingStyles] = useState(false);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);

  // ===================== RESET =====================
  const reset = () => {
    setStep(1);
    setBrandId("");
    setProductTypeId("");
    setStyleId("");
    setBrands([]);
    setProductTypes([]);
    setStyles([]);
    setMeasurements({});
    setMeasurementKeys([]);
    setUnit("cm");
    setResult("");
    setError("");
  };

  // ===================== FETCH BRANDS =====================
  useEffect(() => {
    const loadBrands = async () => {
      setLoadingBrands(true);
      try {
        const res = await fetch(`${BASE_URL}/brands`);
        const json = await res.json();
        setBrands(json.data || []);
      } catch {
        setError("Error loading brands");
      } finally {
        setLoadingBrands(false);
      }
    };

    if (step === 1) loadBrands();
  }, [step]);

  // ===================== FETCH PRODUCT TYPES =====================
  useEffect(() => {
    if (!brandId) return;
    const loadProductTypes = async () => {
      setLoadingProductTypes(true);
      try {
        const res = await fetch(`${BASE_URL}/product-types/${brandId}`);
        const json = await res.json();
        setProductTypes(json.data || []);
      } catch {
        setError("Error loading product types");
      } finally {
        setLoadingProductTypes(false);
      }
    };
    loadProductTypes();
  }, [brandId]);

  // ===================== FETCH STYLES =====================
  useEffect(() => {
    if (!brandId || !productTypeId) return;
    const loadStyles = async () => {
      setLoadingStyles(true);
      try {
        const res = await fetch(`${BASE_URL}/styles/${brandId}/${productTypeId}`);
        const json = await res.json();
        setStyles(Object.values(json.data || {}));
      } catch {
        setError("Error loading styles");
      } finally {
        setLoadingStyles(false);
      }
    };
    loadStyles();
  }, [brandId, productTypeId]);

  // ===================== FETCH MEASUREMENTS =====================
  useEffect(() => {
    if (!styleId) return;
    const loadMeasurements = async () => {
      setLoadingMeasurements(true);
      try {
        const res = await fetch(`${BASE_URL}/fields/${styleId}`);
        const json = await res.json();
        if (!json.status || !json.measurement_fields || json.measurement_fields.length === 0) {
          setError("No measurements found for this style");
          setMeasurementKeys([]);
          setMeasurements({});
          return;
        }

        setMeasurementKeys(json.measurement_fields);
        const initialMeasurements = {};
        json.measurement_fields.forEach((m) => {
          initialMeasurements[m.field_key] = 0;
        });
        setMeasurements(initialMeasurements);
      } catch {
        setError("Error loading measurements");
      } finally {
        setLoadingMeasurements(false);
      }
    };
    loadMeasurements();
  }, [styleId]);

  // ===================== HANDLE MEASUREMENT INPUT =====================
  const handleMeasurementChange = (key, value) => {
    let val = parseFloat(value);
    if (isNaN(val)) val = 0;
    setMeasurements((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // ===================== SUBMIT =====================
  const handleSubmit = async () => {
    if (!brandId || !productTypeId || !styleId) {
      setError("Please select brand, product type, and style.");
      return;
    }
    setError("");
    setResult("Finding your perfect size…");
    try {
      const res = await fetch(`${BASE_URL}/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: brandId,
          product_type_id: productTypeId,
          style_id: styleId,
          measurements,
          unit,
        }),
      });

      const data = await res.json();
      if (data.status) {
        setResult(`Recommended Size: ${data.recommended_size}`);
      } else if (data.errors) {
        setResult(Object.values(data.errors).flat().join(", "));
      } else {
        setResult(data.message);
      }
      setStep(3);
    } catch {
      setResult("Error calculating size. Please try again.");
    }
  };

  // ===================== JSX =====================
  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ background: "#fff", padding: 30, borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        {step === 1 && (
          <>
            <h2>Select Brand, Product Type & Style</h2>

            {/* Brand */}
            <label>
              Brand:
              {loadingBrands ? (
                <p>Loading brands...</p>
              ) : (
                <select value={brandId} onChange={(e) => setBrandId(e.target.value)} style={{ width: "100%", padding: 8 }}>
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
            </label>

            {/* Product Type */}
            {brandId && (
              <label>
                Product Type:
                {loadingProductTypes ? (
                  <p>Loading product types...</p>
                ) : (
                  <select value={productTypeId} onChange={(e) => setProductTypeId(e.target.value)} style={{ width: "100%", padding: 8 }}>
                    <option value="">Select Product Type</option>
                    {productTypes.map((pt) => (
                      <option key={pt.id} value={pt.id}>{pt.name}</option>
                    ))}
                  </select>
                )}
              </label>
            )}

            {/* Style */}
            {brandId && productTypeId && (
              <label>
                Style:
                {loadingStyles ? (
                  <p>Loading styles...</p>
                ) : (
                  <select value={styleId} onChange={(e) => setStyleId(e.target.value)} style={{ width: "100%", padding: 8 }}>
                    <option value="">Select Style</option>
                    {styles.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
              </label>
            )}

            <button onClick={() => setStep(2)} style={{ marginTop: 20, padding: 10, background: "#008060", color: "#fff" }}>
              Next Step →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Enter Measurements</h2>

            {/* Unit */}
            <div style={{ marginBottom: 10 }}>
              Unit:
              <button onClick={() => setUnit("cm")} style={{ margin: 5, background: unit === "cm" ? "#008060" : "#eee" }}>CM</button>
              <button onClick={() => setUnit("in")} style={{ margin: 5, background: unit === "in" ? "#008060" : "#eee" }}>IN</button>
            </div>

            {/* Measurements */}
            {loadingMeasurements ? (
              <p>Loading measurements...</p>
            ) : measurementKeys.length === 0 ? (
              <p>No measurements available</p>
            ) : (
              measurementKeys.map((m) => (
                <div key={m.field_key} style={{ marginBottom: 10 }}>
                  <label>{m.name}:</label>
                  <input
                    type="number"
                    min={m.min ?? 0}
                    max={m.max ?? 200}
                    step="0.01"
                    value={measurements[m.field_key]}
                    onChange={(e) => handleMeasurementChange(m.field_key, e.target.value)}
                    style={{ width: "100%", padding: 6 }}
                  />
                </div>
              ))
            )}

            <button onClick={() => setStep(1)} style={{ marginRight: 10 }}>← Back</button>
            <button onClick={handleSubmit}>Submit →</button>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Result</h2>
            <p>{result}</p>
            <button onClick={reset}>Close & Reset</button>
          </>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
};

export default FindMySize;