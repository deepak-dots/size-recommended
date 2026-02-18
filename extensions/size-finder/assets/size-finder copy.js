document.addEventListener("DOMContentLoaded", () => {

  //const BASE_URL = "/apps/size-finder";
  const BASE_URL = "https://futures-deck-llp-essex.trycloudflare.com/api/proxy";

  const modal = document.getElementById("sf-modal");
  const openBtn = document.getElementById("sf-open");
  const closeBtn = document.getElementById("sf-close");
  const closeBtnbtm = document.getElementById("sf-close-apply");

  const step1 = document.getElementById("sf-step-1");
  const step2 = document.getElementById("sf-step-2");
  const step3 = document.getElementById("sf-step-3");

  const brandSelect = document.getElementById("sf-brand");
  const genderSelect = document.getElementById("sf-gender");
  const styleSelect = document.getElementById("sf-style");
  const measurementBox = document.getElementById("sf-measurements");
  const resultBox = document.getElementById("sf-result");
  const errorBox = document.getElementById("sf-error");

  let brandId = "";
  let shoeType = "";
  let styleId = "";
  let category = "Shoes"; // default category, can be updated dynamically if needed
  let unit = "cm";
  let width = "Medium";
  let foot = "both";
  let measurementKeys = [];
  let measurements = { left: {}, right: {} };
  let step = 1;

  // ================= MODAL =================
  openBtn.onclick = () => {
    modal.classList.add("active");
    document.body.classList.add("app-modal-open");
    reset();
    loadBrands();
  };

  closeBtn.onclick = () => {
    modal.classList.remove("active");
    document.body.classList.remove("app-modal-open");
    reset();
  };
  closeBtnbtm.onclick = () => {
    modal.classList.remove("active");
    document.body.classList.remove("app-modal-open");
    reset();
  };

  function reset() {
    step1.style.display = "block";
    step2.style.display = "none";
    step3.style.display = "none";

    brandSelect.innerHTML = "";
    genderSelect.innerHTML = "";
    styleSelect.innerHTML = "";
    measurementBox.innerHTML = "";
    resultBox.innerHTML = "";
    errorBox.innerText = "";

    brandId = shoeType = styleId = "";
    measurementKeys = [];
    measurements = { left: {}, right: {} };
    step = 1;
  }

  // ================= LOAD BRANDS =================
  async function loadBrands() {
    brandSelect.innerHTML = "<option>Loading...</option>";

    const res = await fetch(`${BASE_URL}/v1/brands-list`);
    const json = await res.json();

    brandSelect.innerHTML = `<option value="">Select Brand</option>`;
    json.data.forEach(b => {
      brandSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`;
    });
  }

  // ================= LOAD GENDERS =================
  brandSelect.onchange = async () => {
    brandId = brandSelect.value;
    if (!brandId) return;

    genderSelect.innerHTML = "<option>Loading...</option>";

    const res = await fetch(`${BASE_URL}/v1/shoe-genders/${brandId}`);
    const json = await res.json();

    genderSelect.innerHTML = `<option value="">Select Shoe Type</option>`;
    json.data.forEach(g => {
      genderSelect.innerHTML += `<option value="${g.id}">${g.name}</option>`;
    });
  };

  // ================= LOAD STYLES =================
  genderSelect.onchange = async () => {
    shoeType = genderSelect.value;
    if (!shoeType) return;

    styleSelect.innerHTML = "<option>Loading...</option>";

    const res = await fetch(`${BASE_URL}/v1/shoe-styles/${brandId}/${shoeType}`);
    const json = await res.json();

    styleSelect.innerHTML = `<option value="">Select Style</option>`;
    json.data.forEach(s => {
      styleSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });
  };

  styleSelect.onchange = () => {
    styleId = styleSelect.value;
  };

  // ================= NEXT STEP =================
  document.getElementById("sf-next").onclick = async () => {
    if (!brandId || !shoeType) {
      errorBox.innerText = "Select brand & shoe type";
      return;
    }

    step1.style.display = "none";
    step2.style.display = "block";
    step = 2;

    await loadMeasurements();
  };

  // ================= LOAD MEASUREMENTS =================
    async function loadMeasurements() {
    measurementBox.innerHTML = "Loading measurements...";

    const res = await fetch(`${BASE_URL}/v1/shoe-measurements?brand_id=${brandId}`);
    const json = await res.json();

    measurementKeys = json.data.measurement_types.map(m => m.id);

    measurementBox.innerHTML = "";

    ["left", "right"].forEach(side => {
        // Heading
        const title = document.createElement("h4");
        title.innerHTML = `<span>${side.toUpperCase()} FOOT</span>`;
        measurementBox.appendChild(title);

        // Row container
        const rowDiv = document.createElement("div");
        rowDiv.className = "sf-measurements-input-row";
        measurementBox.appendChild(rowDiv);

        // Inputs with labels inside the row
        measurementKeys.forEach(m => {
        measurements[side][m] = "";

        const wrapper = document.createElement("div"); // wrapper for label + input
        wrapper.className = "sf-measure-input-wrapper";

        const label = document.createElement("label");
        label.innerText = `${m}`; // customize label text as needed
        label.htmlFor = `${side}-${m}`;

        const input = document.createElement("input");
        input.type = "number";
        input.placeholder = `00.00`;
        input.dataset.side = side;
        input.dataset.key = m;
        input.className = "sf-measure";
        input.id = `${side}-${m}`;

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        rowDiv.appendChild(wrapper);
        });
    });

    // Attach input listeners
    document.querySelectorAll(".sf-measure").forEach(input => {
        input.oninput = e => {
        measurements[e.target.dataset.side][e.target.dataset.key] =
            parseFloat(e.target.value || 0);
        };
    });
    }


  // ================= SUBMIT =================
  document.getElementById("sf-submit").onclick = async () => {
    errorBox.innerText = "";
    resultBox.innerHTML = "";

    if (!brandId) {
      errorBox.innerText = "Please select a brand.";
      return;
    }

    if (category === "Shoes" && !shoeType) {
      errorBox.innerText = "Please select shoe type.";
      return;
    }

    const leftA = parseFloat(measurements.left[measurementKeys[0]] || 0);
    const rightA = parseFloat(measurements.right[measurementKeys[0]] || 0);

    if (!leftA && !rightA) {
      errorBox.innerText = "Please enter at least foot length.";
      return;
    }

    // go to step 3
    step2.style.display = "none";
    step3.style.display = "block";
    step = 3;

    resultBox.innerHTML = "Finding your perfect size...";

    try {
      const res = await fetch(`${BASE_URL}/v1/shoes-sizes`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            brand_id: brandId,
            category: category,
            shoe_type: category === "Shoes" ? shoeType : null,
            unit,
            width,
            foot,
            measurements,
            styleId: styleId || null,
            insertRemoval: false
        }),
    });

      const data = await res.json();

      // ================= DISPLAY RESULT LIKE REACT =================
      if (data.status === "success" && data.data) {

        const genderName = data.data.shoe_gender?.name || "";
        const brandName = data.data.shoe_brand?.name || "";
        const styleName = data.data.shoe_style?.name || "";
        const widthGroup = data.data.shoe_style?.width_group || "";

        resultBox.innerHTML = `
          <h2>MEASUREMENT COMPLETE</h2>

          <p>Category: ${genderName}</p>
          <p>Brand: ${brandName}</p>
          <p>Style: ${styleName}</p>
          <p>Width-Group: ${widthGroup}</p>

          <div style="
            background:#f5f5f5;
            padding:20px;
            border-radius:12px;
            text-align:center;
            margin:20px 0;
          ">
            <h3>Recommended Size</h3>
            <h4>UK ${data.data.uk_size}</h4>
            <p>
              US ${data.data.us_size} | EU ${data.data.eu_size}
            </p>
          </div>
        `;

      } 
      else if (data.message && !data.data) {

        resultBox.innerHTML = `
          <div style="
            background:${data.status === "error" ? "#fef2f2" : "#fff7ed"};
            border:1px solid ${data.status === "error" ? "#ef4444" : "#f59e0b"};
            padding:20px;
            border-radius:12px;
            margin:20px 0;
          ">
            <h3>Size Information</h3>
            <p>${data.message}</p>
          </div>
        `;

      } 
      else {
        resultBox.innerHTML = "Size not found.";
      }


    } catch (err) {
      resultBox.innerHTML = "Unable to fetch size. Please try again.";
    }
  };

  // ================= APPLY =================
  const applyBtn = document.getElementById("sf-apply");
  if (applyBtn) {
    applyBtn.onclick = () => {
      modal.classList.remove("active");
      reset();
    };
  }

});
