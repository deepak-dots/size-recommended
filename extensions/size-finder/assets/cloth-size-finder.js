document.addEventListener("DOMContentLoaded", () => {

const modal = document.querySelector(".sf-modal");
if (!modal) return;

const clothesBlock = modal.querySelector(".cloth-size-finder");
if (!clothesBlock) return;

const Clothes = {

BASE_URL: "http://127.0.0.1:53951/api/proxy/v1/clothes",

step1: clothesBlock.querySelector(".cloth-step-1"),
step2: clothesBlock.querySelector(".cloth-step-2"),
step3: clothesBlock.querySelector(".cloth-step-3"),

brandSelect: clothesBlock.querySelector(".cloth-brand"),
categorySelect: clothesBlock.querySelector(".cloth-category"),   //  FIXED
productTypeSelect: clothesBlock.querySelector(".cloth-product-type"),
styleSelect: clothesBlock.querySelector(".cloth-style"),

measurementBox: clothesBlock.querySelector(".cloth-measurements"),
resultBox: clothesBlock.querySelector(".cloth-result"),
errorBox: clothesBlock.querySelector(".cloth-error"),

measurementErrorBox: clothesBlock.querySelector(".cloth-measurement-error"),

nextBtn: clothesBlock.querySelector(".cloth-next"),
backStep1Btn: clothesBlock.querySelector(".cloth-back-step-1"),
backStep2Btn: clothesBlock.querySelector(".cloth-back-step-2"),
submitBtn: clothesBlock.querySelector(".cloth-submit"),

brandId: "",
categoryId: "",      
productTypeId: "",
styleId: "",
unit: "cm",
measurements: {},




reset() {
    this.step1.style.display = "block";
    this.step2.style.display = "none";
    this.step3.style.display = "none";

    this.brandSelect.innerHTML = "";
    this.categorySelect.innerHTML = `<option value="">Select Product Type</option>`;
    this.productTypeSelect.innerHTML = `<option value="">Select Category</option>`;
    this.styleSelect.innerHTML = `<option value="">Select Style</option>`;
    this.measurementBox.innerHTML = "";
    this.resultBox.innerHTML = "";
    this.errorBox.innerText = "";
    this.errorBox.style.display = "none";
    this.brandId = "";
    this.categoryId = "";    
    this.productTypeId = "";
    this.styleId = "";
    this.measurements = {};
    const img = document.getElementById("brand-measurement-image");
    if (img) img.src = "https://cdn.shopify.com/extensions/019c8e7c-b31d-7669-8cb3-3b4b1ca1cbd4/dev-35128f81-b929-4491-8193-e1e544ee0b50/assets/kesvir.jpg";    
   
    const unitBox = clothesBlock.querySelector(".unit-selector");
    if (unitBox) unitBox.style.display = "none";

    const sizeReportBox = clothesBlock.querySelector(".size-report");
    if (sizeReportBox) sizeReportBox.style.display = "none";
},



// ================= LOAD BRANDS =================
async loadBrands() {
    this.brandSelect.innerHTML = "<option>Loading...</option>";
    try {
        const res = await fetch(`${this.BASE_URL}/brands`);
        const data = await res.json();

        this.brandSelect.innerHTML = `<option value="">Select Brand</option>`;
        data.data.forEach(b => {
            this.brandSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`;
        });

    } catch (err) {
        this.brandSelect.innerHTML = `<option value="">Failed to load</option>`;
    }
},

// ================= LOAD CATEGORIES =================
async loadCategories() {
    if (!this.brandId) return;

    this.categorySelect.innerHTML = "<option>Loading...</option>";

    try {
        const res = await fetch(`${this.BASE_URL}/clothes-categories/${this.brandId}`);
        const data = await res.json();

        this.categorySelect.innerHTML = `<option value="">Select  Product Type</option>`;
        data.data.forEach(cat => {
            this.categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });

    } catch (err) {
        this.categorySelect.innerHTML = `<option value="">Failed to load</option>`;
    }
},

// ================= LOAD PRODUCT TYPES =================
async loadProductTypes() {
    if (!this.categoryId) return;

    this.productTypeSelect.innerHTML = "<option>Loading...</option>";

    try {
        const res = await fetch(`${this.BASE_URL}/clothes-product-types/${this.categoryId}`);
        const data = await res.json();

        this.productTypeSelect.innerHTML = `<option value="">Select Category</option>`;
        data.data.forEach(pt => {
            this.productTypeSelect.innerHTML += `<option value="${pt.id}">${pt.name}</option>`;
        });

    } catch (err) {
        this.productTypeSelect.innerHTML = `<option value="">Failed to load</option>`;
    }
},

// ================= LOAD STYLES =================
async loadStyles() {
    if (!this.productTypeId) return;

    this.styleSelect.innerHTML = "<option>Loading...</option>";

    try {
        const res = await fetch(`${this.BASE_URL}/clothes-styles/${this.productTypeId}`);
        const data = await res.json();

        this.styleSelect.innerHTML = `<option value="">Select Style</option>`;
        data.data.forEach(style => {
            this.styleSelect.innerHTML += `<option value="${style.id}">${style.name}</option>`;
        });

    } catch (err) {
        this.styleSelect.innerHTML = `<option value="">Failed to load</option>`;
    }
},

// ================= LOAD MEASUREMENTS =================
async loadMeasurements() {
    if (!this.styleId) return;

    this.measurementBox.innerHTML = "<p>Loading...</p>";
    this.measurements = {};

    try {
        const res = await fetch(`${this.BASE_URL}/clothes-measurements?style_id=${this.styleId}`);
        const json = await res.json();

        if (!json.status || !json.data?.length) {
            this.measurementBox.innerHTML = "<p>No measurements found</p>";
            return;
        }

        this.measurementBox.innerHTML = "";

        json.data.forEach(m => {

            const div = document.createElement("div");

            div.innerHTML = `
                <label data-original-label="${m.label}">
                    ${m.label.toLowerCase() === 'uk' ? 'UK' : m.label} (CM)
                    <input type="text"
                        inputmode="decimal"
                        pattern="[0-9]*[.]?[0-9]*"
                        data-id="${m.label}"
                        placeholder="0.0">
                </label>
            `;

            this.measurementBox.appendChild(div);
            this.measurements[m.label] = 0;
        });

        const MAX_LENGTH = 7;

        this.measurementBox.querySelectorAll("input").forEach(input => {

            // Block invalid keys
            input.addEventListener("keydown", function (e) {
                if (["-", "+", "e", "E"].includes(e.key)) {
                    e.preventDefault();
                }
            });

            input.addEventListener("input", (e) => {

                let value = e.target.value;

                // Allow only numbers and dot
                value = value.replace(/[^0-9.]/g, "");

                // Allow only ONE decimal point
                const parts = value.split(".");
                if (parts.length > 2) {
                    value = parts[0] + "." + parts[1];
                }

                // Limit decimal to 2 places (optional – remove if not needed)
                if (parts[1]) {
                    parts[1] = parts[1].slice(0, 2);
                    value = parts.join(".");
                }

                // Character limit (like shoes)
                if (value.length > MAX_LENGTH) {
                    value = value.slice(0, MAX_LENGTH);
                }

                e.target.value = value;

                this.measurements[e.target.dataset.id] =
                    value !== "" ? parseFloat(value) : 0;
            });

        });

    } catch (err) {
        this.measurementBox.innerHTML = "<p>Failed to load</p>";
    }

    
},


updateBrandImage() {
    const img = document.getElementById("brand-measurement-image");
    if (!img) return;

    const selectedBrandName =
        this.brandSelect.options[this.brandSelect.selectedIndex]?.text
            ?.trim()
            ?.toLowerCase()
            ?.replace(/\s+/g, '');   // remove spaces

    console.log("Normalized Brand:", selectedBrandName);

    const defaultImage = "https://cdn.shopify.com/extensions/019c8e7c-b31d-7669-8cb3-3b4b1ca1cbd4/dev-35128f81-b929-4491-8193-e1e544ee0b50/assets/kesvir.jpg";

    img.src = window.brandImages[selectedBrandName] || defaultImage;
},



// ================= SUBMIT =================
async submit() {

    const sizeReportBox = clothesBlock.querySelector(".size-report");

    // ================= VALIDATION (EMPTY NOT ALLOWED, 0+ ALLOWED) =================

        this.measurementErrorBox.innerText = "";
        this.measurementErrorBox.style.display = "none";

        let hasError = false;

        this.measurementBox.querySelectorAll("input").forEach(input => {

            const rawValue = input.value.trim();

            //  Empty NOT allowed
            if (rawValue === "") {
                input.style.border = "1px solid red";
                hasError = true;
                return;
            }

            const value = parseFloat(rawValue);

            //  Negative NOT allowed
            if (value < 0) {
                input.style.border = "1px solid red";
                hasError = true;
            } else {
                input.style.border = "";
            }
        });

        if (hasError) {
            // this.measurementErrorBox.innerText = "Please enter in all fields";
            // this.measurementErrorBox.style.display = "block";
            return;
        }


    // Clear previous measurement error
    this.measurementErrorBox.innerText = "";
    this.measurementErrorBox.style.display = "none";


    Clothes.backStep1Btn.addEventListener("click", () => {
        Clothes.measurementErrorBox.style.display = "none";
    });


    this.step2.style.display = "none";
    this.step3.style.display = "block";
    this.resultBox.innerHTML = "<p>Calculating...</p>";

    try {
        const res = await fetch(`${this.BASE_URL}/clothes-sizes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                brand_id: Number(this.brandId),
                category_id: Number(this.categoryId),
                product_type_id: Number(this.productTypeId),
                style_id: this.styleId ? Number(this.styleId) : null,
                measurements: this.measurements,
                unit: this.unit
            })
        });

        const data = await res.json();

        // ================= SUCCESS WITH RECOMMENDED SIZE =================
        if (data.status && data.data?.recommended_size) {

            const size = data.data.recommended_size;

            this.resultBox.innerHTML = `
                <h2>MEASUREMENT COMPLETE</h2>

                <div class="summery-size-box-report-summary">

                    <div class="recommended-size-box"
                        style="background:#f5f5f5;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
                        <h3 style="text-align:center;">Recommended Size</h3>
                        <h4 style="text-align:center;">UK: ${size.uk_size ?? "-"}</h4>
                        ${size.us_size || size.eu_size ? `
                            <p>
                                ${size.us_size ? `US: ${size.us_size}` : ""}
                                ${size.us_size && size.eu_size ? " | " : ""}
                                ${size.eu_size ? `EU: ${size.eu_size}` : ""}
                            </p>
                        ` : ""}

                        ${size.is_between ? `
                            <div style="margin-top:15px;padding:12px;">
                                You're between sizes UK ${size.min_size} and ${size.max_size}. 
                                We recommend <strong>UK ${size.uk_size ?? "-"}</strong> for a more comfortable fit.
                            </div>
                        ` : ""}
                    </div>
                </div>
            `;

            if (sizeReportBox) sizeReportBox.style.display = "block";
        }
        // ================= ERROR / NO SIZE =================
        else {
            if (sizeReportBox) sizeReportBox.style.display = "none";
            this.resultBox.innerHTML = `
                <div style="background:#fff7ed;border:1px solid #f59e0b;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
                    <h3>It looks like the measurements may not have been entered correctly.</h3>
                    <p style="margin-top:10px;">Please contact our support team for assistance:</p>
                    <p>Email: <a href="mailto:help@specialkids.company">help@specialkids.company</a></p>
                    <p>Telephone:<br>+44 (0) 121 354 6543 (UK)<br>+44 (0) 792 7200 762 (UK)</p>
                </div>
            `;
        }

    } catch(err) {
        if (sizeReportBox) sizeReportBox.style.display = "none";
        this.resultBox.innerHTML = `
            <div style="background:#fff7ed;border:1px solid #f59e0b;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
                <h3>It looks like the measurements may not have been entered correctly.</h3>
                <p style="margin-top:10px;">Please contact our support team for assistance:</p>
                <p>Email: <a href="mailto:help@specialkids.company">help@specialkids.company</a></p>
                <p>Telephone:<br>+44 (0) 121 354 6543 (UK)<br>+44 (0) 792 7200 762 (UK)</p>
            </div>
        `;
    }
}

};

function clearStep1Error() {
    Clothes.errorBox.innerText = "";
    Clothes.errorBox.style.display = "none";
}


// ================= EVENTS =================

// Modal open
document.querySelectorAll(".sf-open").forEach(btn => {
    btn.addEventListener("click", () => {
        modal.classList.add("active");
        document.body.classList.add("app-modal-open");
        Clothes.reset();
        Clothes.loadBrands();
    });
});

// Brand change
Clothes.brandSelect.addEventListener("change", () => {

    Clothes.brandId = Clothes.brandSelect.value;

    // Reset IDs
    Clothes.categoryId = "";
    Clothes.productTypeId = "";
    Clothes.styleId = "";

    // Clear dropdowns visually
    Clothes.categorySelect.innerHTML = `<option value="">Select Product Type</option>`;
    Clothes.productTypeSelect.innerHTML = `<option value="">Select Category</option>`;
    Clothes.styleSelect.innerHTML = `<option value="">Select Style</option>`;

    // Clear measurements & result
    Clothes.measurementBox.innerHTML = "";
    Clothes.measurementErrorBox.innerText = "";
    Clothes.measurementErrorBox.style.display = "none";

    clearStep1Error(); 

    // Load new categories
    Clothes.loadCategories();

    // Update brand image
    Clothes.updateBrandImage();

    handleUnitVisibility();
});

// Category change
Clothes.categorySelect.addEventListener("change", () => {

    Clothes.categoryId = Clothes.categorySelect.value;
    Clothes.productTypeId = "";
    Clothes.styleId = "";

    Clothes.productTypeSelect.innerHTML = `<option value="">Select Category</option>`;
    Clothes.styleSelect.innerHTML = `<option value="">Select Style</option>`;

    Clothes.measurementBox.innerHTML = "";
    Clothes.measurementErrorBox.innerText = "";
    Clothes.measurementErrorBox.style.display = "none";

    clearStep1Error(); 

    Clothes.loadProductTypes();
});

// Product type change
Clothes.productTypeSelect.addEventListener("change", () => {

    Clothes.productTypeId = Clothes.productTypeSelect.value;
    Clothes.styleId = "";

    Clothes.styleSelect.innerHTML = `<option value="">Select Style</option>`;

    Clothes.measurementBox.innerHTML = "";
    Clothes.measurementErrorBox.innerText = "";
    Clothes.measurementErrorBox.style.display = "none";

    clearStep1Error(); 

    Clothes.loadStyles();
});

// Style change
Clothes.styleSelect.addEventListener("change", () => {
    Clothes.styleId = Clothes.styleSelect.value;
    clearStep1Error(); 
});


// ================= UNIT SELECTION =================
Clothes.unitSelector = clothesBlock.querySelectorAll('input[name="unit"]');

Clothes.unitSelector.forEach(radio => {
    radio.addEventListener("change", (e) => {
        Clothes.unit = e.target.value;
        updateMeasurementLabels();
    });
});


Clothes.unitSelector.forEach(radio => {
    radio.addEventListener("change", updateMeasurementLabels);
});


function updateMeasurementLabels() {
    const isInch = Clothes.unit === 'inch';
    Clothes.measurementBox.querySelectorAll('label').forEach(label => {
        const originalLabel = label.dataset.originalLabel || label.innerText.split('(')[0].trim();
        label.dataset.originalLabel = originalLabel;
        label.innerHTML = `${originalLabel} (${isInch ? 'Inch' : 'CM'}) <input type="text" inputmode="decimal" pattern="[0-9]*[.]?[0-9]*" data-id="${originalLabel}" placeholder="0.0">`;
    });

    // rebind input events
    Clothes.measurementBox.querySelectorAll('input').forEach(input => {
        input.addEventListener("keydown", function (e) {
            if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
        });
        input.addEventListener("input", (e) => {
            let value = e.target.value.replace(/[^0-9.]/g, "");
            const parts = value.split(".");
            if (parts.length > 2) value = parts[0] + "." + parts[1];
            if (parts[1]) parts[1] = parts[1].slice(0,2);
            if (value.length > 7) value = value.slice(0,7);
            e.target.value = value;
            Clothes.measurements[e.target.dataset.id] = value !== "" ? parseFloat(value) : 0;
        });
    });
}

function handleUnitVisibility() {

    const unitBox = clothesBlock.querySelector(".unit-selector");
    if (!unitBox) return;

    const selectedBrandName =
        Clothes.brandSelect.options[Clothes.brandSelect.selectedIndex]?.text?.trim();

    if (selectedBrandName?.toLowerCase() === "kaycey") {

        // Show CM / INCH option only for KayCey
        unitBox.style.display = "flex";

    } else {

        // Hide for other brands
        unitBox.style.display = "none";

        // Force CM
        Clothes.unit = "cm";

        const cmRadio = clothesBlock.querySelector('input[name="unit"][value="cm"]');
        if (cmRadio) cmRadio.checked = true;

        updateMeasurementLabels();
    }
}


// ================= VALIDATION =================
function validateStep1Cloth() {
    if (!Clothes.brandSelect.value) {
        Clothes.errorBox.innerText = "Please select a brand";
        Clothes.errorBox.style.display = "block"; // <-- show error
        return false;
    }

    if (!Clothes.categorySelect.value) {    
        Clothes.errorBox.innerText = "Please select a product type";
        Clothes.errorBox.style.display = "block";
        return false;
    }

    if (!Clothes.productTypeSelect.value) {
        Clothes.errorBox.innerText = "Please select a category";
        Clothes.errorBox.style.display = "block";
        return false;
    }

    if (!Clothes.styleSelect.value) {
        Clothes.errorBox.innerText = "Please select a style";
        Clothes.errorBox.style.display = "block";
        return false;
    }

    // Clear error if all valid
    Clothes.errorBox.innerText = "";
    Clothes.errorBox.style.display = "none"; //
    return true;
}

// Next
Clothes.nextBtn.addEventListener("click", async () => {

    if (!validateStep1Cloth()) return; //  if invalid → stop

    //  Only now hide category
    const categoryBlock = document.querySelector(".sf-category-btn-wraper");
    if (categoryBlock) categoryBlock.style.display = "none";

    Clothes.step1.style.display = "none";
    Clothes.step2.style.display = "block";

    handleUnitVisibility();

    await Clothes.loadMeasurements();
});



// Back buttons
Clothes.backStep1Btn.addEventListener("click", () => {
    Clothes.step2.style.display = "none";
    Clothes.step1.style.display = "block";

    Clothes.measurementErrorBox.innerText = "";
    Clothes.measurementErrorBox.style.display = "none";

    const categoryBlock = document.querySelector(".sf-category-btn-wraper");
    if (categoryBlock) categoryBlock.style.display = "block";

    document.querySelector('input[name="unit"][value="cm"]').checked = true;
    Clothes.unit = "cm";
    updateMeasurementLabels();

});

Clothes.backStep2Btn.addEventListener("click", () => {
    Clothes.step3.style.display = "none";
    Clothes.step2.style.display = "block";
});

// Submit
Clothes.submitBtn.addEventListener("click", () => {
    Clothes.submit();
});

// Close modal
modal.querySelectorAll(".sf-close, .sf-close-apply").forEach(btn => {
    btn.addEventListener("click", () => {
        modal.classList.remove("active");
        document.body.classList.remove("app-modal-open");

        Clothes.reset();

        //  ADD THIS
        if (window.resetSizeFinderCategory) {
            window.resetSizeFinderCategory();
        }
    });
});

});
