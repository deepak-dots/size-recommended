import React, { useState, useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { TextField, Stack } from "@shopify/polaris";


const FindMySize = () => {
  const fetch = useAuthenticatedFetch();

  const [step, setStep] = useState(1);

  // ===================== STATE =====================
  const [category, setCategory] = useState("shoes");
  const [shoeType, setShoeType] = useState(""); // dynamically selected gender
  const [brands, setBrands] = useState([]);
  const [brandId, setBrandId] = useState("");
  const [styles, setStyles] = useState([]);
  const [styleId, setStyleId] = useState("");
  const [widths, setWidths] = useState([]);
  const [width, setWidth] = useState("Medium");
  const [unit, setUnit] = useState("cm");
  const [brace, setBrace] = useState("no");
  const [foot, setFoot] = useState("both");
  const [brandType, setBrandType] = useState(""); 
  const [insertRemoval, setInsertRemoval] = useState(false);
  

  const [measurements, setMeasurements] = useState({
    left: {},
    right: {},
  });
  const [measurementKeys, setMeasurementKeys] = useState([]);
  const [measurementValues, setMeasurementValues] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [genders, setGenders] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingGenders, setLoadingGenders] = useState(true);
  const [loadingMeasurements, setLoadingMeasurements] = useState(true);
  const [loadingWidths, setLoadingWidths] = useState(true);
  const [loadingStyles, setLoadingStyles] = useState(true);

  // ===================== HELPER: FRACTION SUPPORT =====================
  const parseFraction = (str) => {
    if (!str) return 0;
    const parts = str.split("-");
    if (parts.length === 1) return parseFloat(parts[0]);
    const whole = parseFloat(parts[0]);
    const [num, denom] = parts[1].split("/").map(Number);
    return whole + num / denom;
  };

  // ===================== FETCH BRANDS =====================
  useEffect(() => {
    if (category !== "Shoes") return;
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/proxy/v1/brands-list");
        const json = await res.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          setBrands(json.data);
        }

        else setError("Invalid brand data");
      } catch (err) {
        setError("Unable to load brands");
      } finally {
        setLoadingBrands(false);
      } 
    };
    fetchBrands();
  }, [category]);

  // ===================== FETCH PRODUCT CATEGORIES =====================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/proxy/v1/product-categories");
        const json = await res.json();

        // check either 'success' or 'status' === 'success'
        if (json.status === "success" && Array.isArray(json.data)) {
          setProductCategories(json.data);
        } else {
          setError("Invalid product categories data");
          console.log("Product Categories Response:", json);
        }
      } catch (err) {
        setError("Unable to load product categories");
        console.error(err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
  if (!loadingCategories && productCategories.length > 0 && !category) {
    const shoesCategory = productCategories.find(
      (cat) => cat.name.toLowerCase() === "shoes"
    );

    if (shoesCategory) {
      setCategory(shoesCategory.name);
    }
  }
}, [loadingCategories, productCategories]);


  // ===================== FETCH SHOE GENDERS =====================
  useEffect(() => {
    if (category !== "Shoes" || !brandId) return;
    const fetchGenders = async () => {
      try {

        const res = await fetch("/api/proxy/v1/shoe-genders/" + brandId);
        const json = await res.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          setGenders(json.data);
        }

        else setError("Invalid shoe genders data");
      } catch (err) {
        setError("Unable to load shoe genders");
      } finally {
        setLoadingGenders(false);
      }
    };
    fetchGenders();
  }, [category, brandId]);

  // ===================== FETCH Style =====================
  useEffect(() => {
    if (category !== "Shoes") return;
    if (!brandId || !shoeType) return; // ✅ CRITICAL FIX

    const fetchStyles = async () => {
      try {
        setLoadingStyles(true);
        setError("");

        const res = await fetch(
          `/api/proxy/v1/shoe-styles/${brandId}/${shoeType}`
        );
        const json = await res.json();

        if (json.status === "success" && Array.isArray(json.data)) {
          setStyles(json.data);
        } else {
          setStyles([]);
          setError("No styles available for this selection.");
        }
      } catch (err) {
        console.error(err);
        setStyles([]);
        setError("Unable to load shoe styles");
      } finally {
        setLoadingStyles(false);
      }
    };

    fetchStyles();
  }, [category, brandId, shoeType]);



  // ===================== FETCH BRAND MEASUREMENTS =====================
  useEffect(() => {
    if (!brandId || category !== "Shoes") return;

    const fetchBrandMeasurements = async () => {
      try {
        setLoadingMeasurements(true);
        setError("");

        const res = await fetch(
          `/api/proxy/v1/shoe-measurements?brand_id=${brandId}`
        );
        const json = await res.json();

        /**
         * Expected response:
         * json.data.measurement_types = [{ id, code, name }]
         */
        if (
          json.status === "success" &&
          json.data &&
          Array.isArray(json.data.measurement_types)
        ) {
          const keys = json.data.measurement_types.map(
            (m) => m.id
          );
          const values = json.data.measurement_types.map(
            (m) => m.code
          );
          setMeasurementKeys(keys);
          setMeasurementValues(values);
          const initial = {};
          keys.forEach((k) => (initial[k] = ""));

          setMeasurements({
            left: { ...initial },
            right: { ...initial },
          });
        } else {
          setMeasurementKeys([]);
          setMeasurementValues([]);
          setError("Measurements not available for this brand.");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load brand measurements.");
        setMeasurementKeys([]);
        setMeasurementValues([]);
      } finally {
        setLoadingMeasurements(false);
      }
    };

    fetchBrandMeasurements();
  }, [brandId, category]);


  // ===================== HANDLE MEASUREMENTS =====================
  const handleMeasurementChange = (side, key, value) => {
    let val = unit === "in" ? parseFraction(value) : parseFloat(value);
    setMeasurements((prev) => ({
      ...prev,
      [side]: { ...prev[side], [key]: val },
    }));
  };

  // // ===================== SUBMIT =====================
  const handleSubmit = async () => {
    setError("");
    setResult(null);

    if (!brandId) return setError("Please select a brand.");
    if (category === "Shoes" && !shoeType) return setError("Please select shoe type.");

    const leftA = parseFloat(measurements.left[measurementKeys[0]] || 0);
    const rightA = parseFloat(measurements.right[measurementKeys[0]] || 0);
    if (!leftA && !rightA) return setError("Please enter at least foot length.");

    try {
      const response = await fetch("/api/proxy/v1/shoes-sizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: brandId,
          category,
          shoe_type: category === "Shoes" ? shoeType : null,
          unit,
          width,
          brace,
          foot,
          measurements,
          styleId: styleId || null,
          insertRemoval: insertRemoval,
          unit: unit === "in" ? "inches" : "cm",
        }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setResult(data);
        setStep(3);
      } else {
        setResult({
          status: "error",
          message: data.message || "Size not found."
        });
        setStep(3);
      }
    } catch (err) {
      setError("Error fetching size.");
    }
  };

  // ===================== JSX =====================
  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={cardStyle}>
        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <>
            <h3>STEP 1 OF 4</h3>
            <h2>What would you like to measure?</h2>
            <div style={{ marginBottom: 20 }}>
              {loadingCategories ? (
                <p>Loading categories...</p>
              ) : (
                productCategories.map((cat) => (
                  <button
                    key={cat.id}
                    style={category === cat.name ? activeBtn : normalBtn}
                    onClick={() => {
                      if (cat.name.toLowerCase() === "clothing") {
                        setError("Clothing size finder coming soon.");
                        return;
                      }

                      setError("");
                      setCategory(cat.name);

                      if (cat.name === "Shoes") {
                        setBrandId("");
                        setShoeType("");
                        setStyleId("");
                        setGenders([]);
                        setStyles([]);
                        setMeasurementKeys([]);
                        setMeasurementValues([]);
                      }
                    }}
                  >
                    {cat.name}
                  </button>

                ))
              )}
            </div>

            {/* BRAND SELECT */}
            {category === "Shoes" && (
              <label>
                Brand
                {loadingBrands ? (
                  <p>Loading brands...</p>
                ) : (
                  <select
                      value={brandId || ""}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedBrand = brands.find(b => b.id == selectedId);

                        setBrandId(selectedId);

                        if (selectedBrand?.name.toLowerCase().includes("billy")) {
                          setBrandType("billy");
                        } 
                        else if (selectedBrand?.name.toLowerCase().includes("friendly")) {
                          setBrandType("friendly");
                          setUnit("cm"); // Friendly only CM
                        } 
                        else {
                          setBrandType("");
                        }

                        setShoeType("");
                        setStyleId("");
                        setStyles([]);
                        setGenders([]);
                      }}

                      style={inputStyle}
                    >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                )}
              </label>
            )}

           {/* SHOE TYPE / GENDER SELECT */}
              {category === "Shoes" && brandId && (
                <label>
                  Who is this for?
                  {loadingGenders ? (
                    <p>Loading shoe types...</p>
                  ) : (
                    <select
                      value={shoeType || ""}
                      onChange={(e) => {
                        setShoeType(e.target.value);

                        // reset dependent style
                        setStyleId("");
                        setStyles([]);
                      }}
                      style={inputStyle}
                    >
                      <option value="">Select Shoe Type</option>
                      {genders.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              )}


            {/* Style Category */}
            {category === "Shoes" && brandId && shoeType && (
              <label>
                Style
                {loadingStyles ? (
                  <p>Loading styles...</p>
                ) : (
                  <select
                    value={styleId || ""}
                    onChange={(e) => setStyleId(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select Style</option>
                    {styles.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </label>
            )}


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


            {/* Unit */}
            {brandType !== "friendly" && (
              <div style={{ marginBottom: 15 }}>
                <strong>Select unit:</strong>
                <br />
                <button
                  style={unit === "cm" ? activeBtn : normalBtn}
                  onClick={() => setUnit("cm")}
                >
                  CM
                </button>
                <button
                  style={unit === "in" ? activeBtn : normalBtn}
                  onClick={() => setUnit("in")}
                >
                  Inches
                </button>
              </div>
            )}


            {/* ================= MEASUREMENTS ================= */}

            {loadingMeasurements ? (
              <p>Loading measurements...</p>
            ) : measurementKeys.length === 0 ? (
              <p style={{ color: "#666" }}>
                Measurements not available for this brand.
              </p>
            ) : (
              <>
                <h4>LEFT FOOT ({unit.toUpperCase()})</h4>
                <Stack wrap={true} spacing="tight">
                  {measurementKeys
                    .filter((k, i) => {
                      if (brandType === "friendly") {
                        return i === 0 || i === 1; // Only A & D
                      }
                      return true;
                    })
                    .map((k,i) => (
                    <Stack.Item fill key={`left-${k}`}>
                      <TextField
                        label={
                          brandType === "billy"
                            ? ["A - Length", "D - Ball Circumference", "E - Ankle Circumference"][i]
                            : measurementValues[i] || `Left Foot ${k}`
                        }
                        placeholder={`Left Foot ${measurementValues[i] ? measurementValues[i] : k}`} // Show code if name not available
                        value={measurements.left[k] || ""}
                        onChange={(value) =>
                          handleMeasurementChange("left", k, value)
                        }
                        type="number"
                      />
                    </Stack.Item>
                  ))}
                </Stack>

                <h4 style={{ marginTop: 20 }}>
                  RIGHT FOOT ({unit.toUpperCase()})
                </h4>
                <Stack wrap={true} spacing="tight">
                  {measurementKeys
                    .filter((k, i) => {
                      if (brandType === "friendly") {
                        return i === 0 || i === 1; // Only A & D
                      }
                      return true;
                    })
                    .map((k,i) => (
                    <Stack.Item fill key={`right-${k}`}>
                      <TextField
                        label={measurementValues[i] ? measurementValues[i] : k} // Optional: show label instead of placeholder
                        placeholder={`Right Foot ${measurementValues[i] ? measurementValues[i] : k}`}
                        value={measurements.right[k] || ""}
                        onChange={(value) =>
                          handleMeasurementChange("right", k, value)
                        }
                        type="number"
                      />
                    </Stack.Item>
                  ))}
                </Stack>
              </>
            )}

            {(brandType === "billy" || brandType === "friendly") && (
              <div style={{ marginTop: 20 }}>
                <label style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={insertRemoval}
                    onChange={(e) => setInsertRemoval(e.target.checked)}
                    style={{ marginRight: 8 }}
                  />
                  Remove insole for extra space
                </label>
              </div>
            )}

            <button onClick={() => setStep(1)} style={normalBtn}>
              ← Back
            </button>
            <button onClick={handleSubmit} style={buttonStyle}>
              Get My Size →
            </button>
          </>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && result && (
          <>
            <h2>MEASUREMENT COMPLETE</h2>

            {/* ✅ Exact size found */}
            {result.status === "success" && result.data && (
              <>
                <p>Category: {result.data.shoe_gender?.name}</p>
                <p>Brand: {result.data.shoe_brand?.name}</p>
                <p>Style: {result.data.shoe_style?.name}</p>
                <p>Width-Group: {result.data.shoe_style?.width_group}</p>

                <div style={resultBox}>
                  <h3>Recommended Size</h3>
                  <h4>UK {result.data.uk_size}</h4>
                  <p>
                    US {result.data.us_size} | EU {result.data.eu_size}
                  </p>
                </div>
              </>
            )}

            {/* ⚠️ Support / multiple size / warning message */}
            {result.message && !result.data && (
              <div
                style={{
                  ...resultBox,
                  background:
                    result.status === "error" ? "#fef2f2" : "#fff7ed",
                  border:
                    result.status === "error"
                      ? "1px solid #ef4444"
                      : "1px solid #f59e0b",
                }}
              >
                <h3>Size Information</h3>
                <p>{result.message}</p>
              </div>
            )}

            <button
                  style={buttonStyle}
                  onClick={() => {
                    setStep(1);
                    setResult(null);
                    setMeasurements({ left: {}, right: {} });
                    setInsertRemoval(false);
                  }}
                >

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
