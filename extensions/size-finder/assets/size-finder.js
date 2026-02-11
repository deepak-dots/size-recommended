document.addEventListener("DOMContentLoaded", () => {

    //const BASE_URL = "/apps/size-finder";
    const BASE_URL = "https://simultaneously-journalists-forwarding-matched.trycloudflare.com/api/proxy";

    const modal = document.getElementById("sf-modal");
    const openBtn = document.getElementById("sf-open");
    const closeBtn = document.getElementById("sf-close");

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
    let brace = "no";
    let foot = "both";
    let measurementKeys = [];
    let measurements = {
        left: {},
        right: {}
    };
    let step = 1;

    // ================= MODAL =================
    openBtn.onclick = () => {
        modal.classList.add("active");
        reset();
        loadBrands();
    };

    closeBtn.onclick = () => {
        modal.classList.remove("active");
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
        measurements = {
            left: {},
            right: {}
        };
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
            const title = document.createElement("h4");
            title.innerHTML = side.toUpperCase() + " <span>FOOT</span>";
            measurementBox.appendChild(title);

            measurementKeys.forEach(m => {
                measurements[side][m] = "";

                measurementBox.innerHTML += `
          <input
            type="number"
            placeholder="${side} foot measurement"
            data-side="${side}"
            data-key="${m}"
            class="sf-measure"
          />
        `;
            });
        });

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
                    brace,
                    foot,
                    measurements,
                    styleId: styleId || null,
                    insertRemoval: false
                }),
            });

            const data = await res.json();

            // display full API response like React
            if (data.status === "success") {
                resultBox.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            } else {
                resultBox.innerHTML = data.message || "Size not found.";
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
