document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "http://127.0.0.1:57490/api/proxy";

    const modal = document.querySelector(".sf-modal");
    const closeBtn = document.querySelector(".sf-close");
    const closeBtnbtm = document.querySelector(".sf-close-apply");

    const step1 = document.querySelector(".sf-step-1");
    const step2 = document.querySelector(".sf-step-2");
    const step3 = document.querySelector(".sf-step-3");

    const brandSelect = document.querySelector(".sf-brand");
    const genderSelect = document.querySelector(".sf-gender");
    const styleSelect = document.querySelector(".sf-style");
    const measurementBox = document.querySelector(".sf-measurements");
    const resultBox = document.querySelector(".sf-result");
    const errorBox = document.querySelector(".sf-error");

    let brandId = "", shoeType = "", styleId = "";
    let category = "Shoes", unit = "cm", insertRemoval = false, width = "Medium", foot = "both";
    let measurementKeys = [], measurements = { left: {}, right: {} };
    let step = 1, braceOption = "No Brace";

    const removalCheckbox = document.querySelector(".sf-removal");
    const backStep1 = document.querySelector(".sf-back-step-1");
    const backStep2 = document.querySelector(".sf-back-step-2");
    const emailInput = document.querySelector(".sf-email");

    function clearStep1Error() {
        errorBox.innerText = "";
        errorBox.classList.remove("show");
    }

    function validateStep1() {

    if (!brandSelect.value) {
        errorBox.innerText = "Please select a brand";
        errorBox.classList.add("show");
        return false;
    }

    if (!genderSelect.value) {
        errorBox.innerText = "Please select shoe type";
        errorBox.classList.add("show");
        return false;
    }

    if (!styleSelect.value) {
        errorBox.innerText = "Please select a style";
        errorBox.classList.add("show");
        return false;
    }

    errorBox.innerText = "";
    errorBox.classList.remove("show");
    return true;
}

    // ================= MODAL OPEN =================
    document.querySelectorAll(".sf-open").forEach(btn => {
        btn.addEventListener("click", () => {
            
            modal.classList.add("active");
            document.body.classList.add("app-modal-open");
            console.log("Opening cloth size finder modal");

            resetShoes();
            loadBrandsShoes();

           setDefaultSelections();
        });
    });

    // ================= MODAL CLOSE =================
    [closeBtn, closeBtnbtm].forEach(btn => {
        if (btn) {
            btn.addEventListener("click", () => {
                modal.classList.remove("active");
                document.body.classList.remove("app-modal-open");
                resetShoes();
            });
        }
    });

    // ================= UNIT & BRACE =================
    document.querySelectorAll('input[name="sf-unit"]').forEach(radio => {
        radio.addEventListener("change", e => unit = e.target.value);
    });

    document.querySelectorAll('input[name="sf-brace"]').forEach(radio => {
        radio.addEventListener("change", e => braceOption = e.target.value);
    });

    // ================= REMOVAL CHECKBOX =================
    if (removalCheckbox) {
        removalCheckbox.addEventListener("change", e => insertRemoval = e.target.checked);
    }

    // ================= BACK BUTTONS =================
    if (backStep1) backStep1.addEventListener("click", e => {
        e.preventDefault();
        step2.style.display = "none";
        step1.style.display = "block";
        step = 1;

        insertRemoval = false;
        if (removalCheckbox) removalCheckbox.checked = false;

        setDefaultSelections();
    });

    if (backStep2) backStep2.addEventListener("click", e => {
        e.preventDefault();
        if (emailInput) emailInput.value = "";
        step3.style.display = "none";
        step2.style.display = "block";
        step = 2;
    });

    // ================= DEFAULT SELECTION FUNCTION =================
    function setDefaultSelections() {
        unit = "cm";
        braceOption = "No Brace";
        insertRemoval = false;

        const cmRadio = document.querySelector('input[name="sf-unit"][value="cm"]');
        const braceRadio = document.querySelector('input[name="sf-brace"][value="No Brace"]');

        if (cmRadio) {
            cmRadio.checked = true;
            cmRadio.dispatchEvent(new Event("change"));
        }

        if (braceRadio) {
            braceRadio.checked = true;
            braceRadio.dispatchEvent(new Event("change"));
        }

        if (removalCheckbox) removalCheckbox.checked = false;

         setTimeout(() => {
            document.querySelector('input[name="sf-unit"]:checked')?.dispatchEvent(new Event("change"));
            document.querySelector('input[name="sf-brace"]:checked')?.dispatchEvent(new Event("change"));
        }, 0);
    }

    // ================= resetShoes =================
    function resetShoes() {
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
        insertRemoval = false;

        if (removalCheckbox) removalCheckbox.checked = false;

        braceOption = "No Brace";
        document.querySelectorAll('input[name="sf-brace"]').forEach(radio => radio.checked = radio.value === braceOption);

        unit = "cm";
        document.querySelectorAll('input[name="sf-unit"]').forEach(radio => radio.checked = radio.value === unit);

        setTimeout(() => {
            document.querySelector('input[name="sf-unit"]:checked')?.dispatchEvent(new Event("change"));
            document.querySelector('input[name="sf-brace"]:checked')?.dispatchEvent(new Event("change"));
        }, 0);
    }

    // ================= UPDATE BRAND UI =================
    function updateBrandUI() {
        const selectedBrandName = brandSelect.options[brandSelect.selectedIndex]?.text.toLowerCase() || "";
        const isBilly = selectedBrandName.includes("billy");

        const billyImage = document.querySelector(".billy-footwear");
        const friendlyImage = document.querySelector(".friendly-footwear");

        const billyLabels = document.querySelectorAll(".labels.billy-footwear");
        const friendlyLabels = document.querySelectorAll(".labels.friendly-footwear");

        if (isBilly) {
            if (billyImage) billyImage.style.display = "flex";
            billyLabels.forEach(el => el.style.display = "flex");
            if (friendlyImage) friendlyImage.style.display = "none";
            friendlyLabels.forEach(el => el.style.display = "none");
        } else {
            if (friendlyImage) friendlyImage.style.display = "flex";
            friendlyLabels.forEach(el => el.style.display = "flex");
            if (billyImage) billyImage.style.display = "none";
            billyLabels.forEach(el => el.style.display = "none");
        }
    }

    // ================= LOAD BRANDS =================
    async function loadBrandsShoes() {
        brandSelect.innerHTML = "<option>Loading...</option>";
        const res = await fetch(`${BASE_URL}/v1/brands-list`);
        const json = await res.json();
        brandSelect.innerHTML = `<option value="">Select Brand</option>`;
        json.data.forEach(b => brandSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`);
    }

    // ================= LOAD GENDERS =================
    brandSelect.onchange = async () => {

    brandId = brandSelect.value;

    // resetShoes dependent dropdowns
    genderSelect.innerHTML = `<option value="">Select Shoe Type</option>`;
    styleSelect.innerHTML = `<option value="">Select Style</option>`;
    shoeType = "";
    styleId = "";

    validateStep1(); //  ADD THIS

    if (!brandId) return;

    updateBrandUI();

    genderSelect.innerHTML = "<option>Loading...</option>";

    const res = await fetch(`${BASE_URL}/v1/shoe-genders/${brandId}`);
    const json = await res.json();

    genderSelect.innerHTML = `<option value="">Select Shoe Type</option>`;
    json.data.forEach(g =>
        genderSelect.innerHTML += `<option value="${g.id}">${g.name}</option>`
    );
};

    // ================= LOAD STYLES =================
    genderSelect.onchange = async () => {

    shoeType = genderSelect.value;

    styleSelect.innerHTML = `<option value="">Select Style</option>`;
    styleId = "";

    validateStep1(); //  ADD

    if (!shoeType) return;

    styleSelect.innerHTML = "<option>Loading...</option>";

    const res = await fetch(`${BASE_URL}/v1/shoe-styles/${brandId}/${shoeType}`);
    const json = await res.json();

    styleSelect.innerHTML = `<option value="">Select Style</option>`;
    json.data.forEach(s =>
        styleSelect.innerHTML += `<option value="${s.id}">${s.name} - ${s.width_group}</option>`
    );
};

   styleSelect.onchange = () => {
    styleId = styleSelect.value;
    validateStep1(); //  ADD
};

    document.querySelector(".sf-next").onclick = async () => {
        errorBox.innerText = "";
        errorBox.classList.remove("show");

        if (!validateStep1()) return;

        step1.style.display = "none";
        step2.style.display = "block";
        step = 2;

        await loadMeasurementsShoes();
    };

    // ================= LOAD MEASUREMENTS =================
    async function loadMeasurementsShoes() {
        measurementBox.innerHTML = "Loading measurements...";
        const res = await fetch(`${BASE_URL}/v1/shoe-measurements?brand_id=${brandId}`);
        const json = await res.json();

        measurementKeys = json.data.measurement_types.map(m => m.id);
        measurementBox.innerHTML = "";

        const selectedBrandName = brandSelect.options[brandSelect.selectedIndex].text.toLowerCase();
        const isBilly = selectedBrandName.includes("billy");
	
	const MAX_LENGTH = 7;

        ["left", "right"].forEach(side => {
            const title = document.createElement("h4");
            title.innerHTML = `<span>${side.toUpperCase()} FOOT</span>`;
            measurementBox.appendChild(title);

            const rowDiv = document.createElement("div");
            rowDiv.className = "sf-measurements-input-row";
            measurementBox.appendChild(rowDiv);

            measurementKeys.forEach((m, index) => {
                measurements[side][m] = "";

                const wrapper = document.createElement("div");
                wrapper.className = "sf-measure-input-wrapper";

                const label = document.createElement("label");
                if (isBilly) label.innerText = ["A","D","E"][index] || m;
                else label.innerText = ["A","D"][index] || m;

                label.htmlFor = `${side}-${m}`;

                const input = document.createElement("input");
                input.type = "number";
                input.placeholder = "00.00";
                input.dataset.side = side;
                input.dataset.key = m;
                input.className = "sf-measure";
                input.id = `${side}-${m}`;
                input.min = "0";
                input.step = "0.001";

                //input.addEventListener("keydown", e => { if(e.key==="-"||e.key==="e") e.preventDefault(); });
                //input.addEventListener("input", function(){ if(this.value<0)this.value=""; });
		
		// Prevent invalid keys
		    input.addEventListener("keydown", e => { 
			if (e.key === "-" || e.key === "e") e.preventDefault(); 
		    });

		    // Character limit + negative check
		    input.addEventListener("input", function () {
			if (this.value.length > MAX_LENGTH) {
			    this.value = this.value.slice(0, MAX_LENGTH);
			}
			if (this.value < 0) {
			    this.value = "";
			}
		    });

                wrapper.appendChild(label);
                wrapper.appendChild(input);
                rowDiv.appendChild(wrapper);
            });
        });

        document.querySelectorAll(".sf-measure").forEach(input => {
            input.oninput = e => measurements[e.target.dataset.side][e.target.dataset.key] = parseFloat(e.target.value||0);
        });
    }

    // ================= SUBMIT =================
    document.querySelector(".sf-submit").onclick = async () => {
        errorBox.innerText = "";
        resultBox.innerHTML = "";

        if (!brandId) { errorBox.innerText="Please select a brand."; return; }
        if (category==="Shoes" && !shoeType) { errorBox.innerText="Please select shoe type."; return; }

        // Validate all inputs
        let isValid=true;
        document.querySelectorAll(".sf-measure").forEach(input=>{
            const val=parseFloat(input.value);
            if(!val || val<=0){ input.style.border="1px solid red"; isValid=false; }
            else input.style.border="";
        });
        if(!isValid){ errorBox.innerText="Please fill the fields correctly."; return; }

        step2.style.display="none";
        step3.style.display="block";
        step=3;
        resultBox.innerHTML="Finding your perfect size...";

        try {
            const res = await fetch(`${BASE_URL}/v1/shoes-sizes`, {
                method:"POST",
                headers:{"Content-Type":"application/json","Accept":"application/json"},
                body:JSON.stringify({brand_id:brandId,category,shoe_type:category==="Shoes"?shoeType:null,unit,width,foot,measurements,styleId:styleId||null,insertRemoval})
            });
            const data=await res.json();

            

            if (data.status === "success" && data.data?.recommended_size) {

                const result = data.data;
                const recommended = result.recommended_size;
                const allSizes = result.all_sizes || [];
                const minSize = result.min_size;
                const maxSize = result.max_size;
                const isBetween = result.is_between;

                resultBox.innerHTML = `
                    <h2>MEASUREMENT COMPLETE</h2>

                    <div class="summery-size-box">
                        <p>Category: ${recommended?.shoe_gender?.name || ""}</p>
                        <p>Brand: ${recommended?.shoe_brand?.name || ""}</p>
                        <p>Style: ${recommended?.shoe_style?.name || ""}</p>
                        <p>Brace Option: ${braceOption || ""}</p>
                    </div>

                    <div class="recommended-size-box" 
                        style="background:#f5f5f5;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
                        
                        <h3>Recommended Size</h3>

                        <h4>
                            UK ${recommended?.uk_size ?? "-"} 
                            ${recommended?.shoe_style?.width_group 
                                ? `(${recommended.shoe_style.width_group})` 
                                : ""}
                        </h4>

                        <p>
                            US ${recommended?.us_size ?? "-"} | 
                            EU ${recommended?.eu_size ?? "-"}
                        </p>

                        ${
                            isBetween && allSizes.length > 1
                            ? `
                            <div style="margin-top:15px;padding:12px;">
                            You're between Size UK ${minSize} and ${maxSize}. 
                                We recommend Size 
                                <strong> 
                                    UK ${recommended?.uk_size ?? "-"} 
                                    ${recommended?.shoe_style?.width_group 
                                        ? `(${recommended.shoe_style.width_group})` 
                                        : ""} 
                                </strong>
                                for a more comfortable fit.
                                <small>Also consider: ${allSizes.join(", ")}</small>
                            </div>
                            `
                            : ""
                        }
                    </div>
                `;
            }

            /* ================= NEW SMART MESSAGE HANDLING ================= */
            else if (data.status === "success" && !data.data?.recommended_size) {

                //  Above Maximum Size Case
                if (data.message?.toLowerCase().includes("above the maximum")) {

                    resultBox.innerHTML = `
                        <div style="background:#fff7ed;border:1px solid #f59e0b;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
                            <h3>${data.message}</h3>
                            <p style="margin-top:10px;">
                                Please enable the insert removal option and try again.
                            </p>
                        </div>
                    `;
                }

                //  Multiple Sizes Found
                else if (data.message?.toLowerCase().includes("multiple shoe sizes")) {

                    resultBox.innerHTML = `
                         <div style="background:#fff7ed;border:1px solid #f59e0b;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
                            <h3>It looks like the sizes may not have been entered correctly.</h3>
                            <p style="margin-top:10px;">Please contact our support team for assistance:</p>
                            <p>Email: <a href="mailto:help@specialkids.company">help@specialkids.company</a></p>
                            <p>Telephone:<br>+44 (0) 121 354 6543 (UK)<br>+44 (0) 792 7200 762 (UK)</p>
                        </div>
                    `;
                }

                //  Any Other Success Message
                else {
                    resultBox.innerHTML = `
                        <div style="background:#fff7ed;border:1px solid #f59e0b;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
                        <h3>It looks like the sizes may not have been entered correctly.</h3>
                        <p style="margin-top:10px;">Please contact our support team for assistance:</p>
                        <p>Email: <a href="mailto:help@specialkids.company">help@specialkids.company</a></p>
                        <p>Telephone:<br>+44 (0) 121 354 6543 (UK)<br>+44 (0) 792 7200 762 (UK)</p>
                    </div>
                    `;
                }
            }

            /* ================= REAL ERROR ================= */
            else {
                resultBox.innerHTML = `
                    <div style="background:#fff7ed;border:1px solid #f59e0b;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
                        <h3>It looks like the sizes may not have been entered correctly.</h3>
                        <p style="margin-top:10px;">Please contact our support team for assistance:</p>
                        <p>Email: <a href="mailto:help@specialkids.company">help@specialkids.company</a></p>
                        <p>Telephone:<br>+44 (0) 121 354 6543 (UK)<br>+44 (0) 792 7200 762 (UK)</p>
                    </div>
                `;
            }
        } catch(err){
            resultBox.innerHTML=`
                <div style="background:#fff7ed;border:1px solid #f59e0b;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
                    <h3>It looks like the sizes may not have been entered correctly.</h3>
                    <p style="margin-top:10px;">Please contact our support team for assistance:</p>
                    <p>Email: <a href="mailto:help@specialkids.company">help@specialkids.company</a></p>
                    <p>Telephone:<br>+44 (0) 121 354 6543 (UK)<br>+44 (0) 792 7200 762 (UK)</p>
                </div>
            `;
        }
    };
});



// cloth size finder logic

// document.addEventListener("DOMContentLoaded", () => {

// const modal = document.querySelector(".sf-modal");
// if (!modal) return;

// const clothesBlock = modal.querySelector(".cloth-size-finder");
// if (!clothesBlock) return;

// const Clothes = {

// BASE_URL: "http://127.0.0.1:57490/api/proxy/v1/clothes",

// step1: clothesBlock.querySelector(".cloth-step-1"),
// step2: clothesBlock.querySelector(".cloth-step-2"),
// step3: clothesBlock.querySelector(".cloth-step-3"),

// brandSelect: clothesBlock.querySelector(".cloth-brand"),
// categorySelect: clothesBlock.querySelector(".cloth-category"),   //  FIXED
// productTypeSelect: clothesBlock.querySelector(".cloth-product-type"),
// styleSelect: clothesBlock.querySelector(".cloth-style"),

// measurementBox: clothesBlock.querySelector(".cloth-measurements"),
// resultBox: clothesBlock.querySelector(".cloth-result"),
// errorBox: clothesBlock.querySelector(".cloth-error"),

// nextBtn: clothesBlock.querySelector(".cloth-next"),
// backStep1Btn: clothesBlock.querySelector(".cloth-back-step-1"),
// backStep2Btn: clothesBlock.querySelector(".cloth-back-step-2"),
// submitBtn: clothesBlock.querySelector(".cloth-submit"),

// brandId: "",
// categoryId: "",      
// productTypeId: "",
// styleId: "",
// unit: "cm",
// measurements: {},



// reset() {
//     this.step1.style.display = "block";
//     this.step2.style.display = "none";
//     this.step3.style.display = "none";

//     this.brandSelect.innerHTML = "";
//     this.categorySelect.innerHTML = "";   //  FIXED
//     this.productTypeSelect.innerHTML = "";
//     this.styleSelect.innerHTML = "";
//     this.measurementBox.innerHTML = "";
//     this.resultBox.innerHTML = "";
//     this.errorBox.innerText = "";

//     this.brandId = "";
//     this.categoryId = "";    //  FIXED
//     this.productTypeId = "";
//     this.styleId = "";
//     this.measurements = {};
// },

// // ================= LOAD BRANDS =================
// async loadBrands() {
//     this.brandSelect.innerHTML = "<option>Loading...</option>";
//     try {
//         const res = await fetch(`${this.BASE_URL}/brands`);
//         const data = await res.json();

//         this.brandSelect.innerHTML = `<option value="">Select Brand</option>`;
//         data.data.forEach(b => {
//             this.brandSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`;
//         });

//     } catch (err) {
//         this.brandSelect.innerHTML = `<option value="">Failed to load</option>`;
//     }
// },

// // ================= LOAD CATEGORIES =================
// async loadCategories() {
//     if (!this.brandId) return;

//     this.categorySelect.innerHTML = "<option>Loading...</option>";

//     try {
//         const res = await fetch(`${this.BASE_URL}/clothes-categories/${this.brandId}`);
//         const data = await res.json();

//         this.categorySelect.innerHTML = `<option value="">Select Category</option>`;
//         data.data.forEach(cat => {
//             this.categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
//         });

//     } catch (err) {
//         this.categorySelect.innerHTML = `<option value="">Failed to load</option>`;
//     }
// },

// // ================= LOAD PRODUCT TYPES =================
// async loadProductTypes() {
//     if (!this.categoryId) return;

//     this.productTypeSelect.innerHTML = "<option>Loading...</option>";

//     try {
//         const res = await fetch(`${this.BASE_URL}/clothes-product-types/${this.categoryId}`);
//         const data = await res.json();

//         this.productTypeSelect.innerHTML = `<option value="">Select Product Type</option>`;
//         data.data.forEach(pt => {
//             this.productTypeSelect.innerHTML += `<option value="${pt.id}">${pt.name}</option>`;
//         });

//     } catch (err) {
//         this.productTypeSelect.innerHTML = `<option value="">Failed to load</option>`;
//     }
// },

// // ================= LOAD STYLES =================
// async loadStyles() {
//     if (!this.productTypeId) return;

//     this.styleSelect.innerHTML = "<option>Loading...</option>";

//     try {
//         const res = await fetch(`${this.BASE_URL}/clothes-styles/${this.productTypeId}`);
//         const data = await res.json();

//         this.styleSelect.innerHTML = `<option value="">Select Style</option>`;
//         data.data.forEach(style => {
//             this.styleSelect.innerHTML += `<option value="${style.id}">${style.name}</option>`;
//         });

//     } catch (err) {
//         this.styleSelect.innerHTML = `<option value="">Failed to load</option>`;
//     }
// },

// // ================= LOAD MEASUREMENTS =================
// async loadMeasurements() {
//     if (!this.styleId) return;

//     this.measurementBox.innerHTML = "<p>Loading...</p>";
//     this.measurements = {};

//     try {
//         const res = await fetch(`${this.BASE_URL}/clothes-measurements?style_id=${this.styleId}`);
//         const json = await res.json();

//         if (!json.status || !json.data?.length) {
//             this.measurementBox.innerHTML = "<p>No measurements found</p>";
//             return;
//         }

//         this.measurementBox.innerHTML = "";

//         json.data.forEach(m => {

//             const div = document.createElement("div");

//             div.innerHTML = `
//                 <label>
//                     ${m.label}
//                     <input type="number"
//                         data-id="${m.label}"
//                         min="0"
//                         step="0.01"
//                         placeholder="0.0">
//                 </label>
//             `;

//             this.measurementBox.appendChild(div);
//             this.measurements[m.label] = 0;
//         });

//         this.measurementBox.querySelectorAll("input").forEach(input => {
//             input.addEventListener("input", e => {
//                 this.measurements[e.target.dataset.id] =
//                     parseFloat(e.target.value) || 0;
//             });
//         });

//     } catch (err) {
//         this.measurementBox.innerHTML = "<p>Failed to load</p>";
//     }
// },

// // ================= SUBMIT =================
// async submit() {
//     const allFilled = Object.values(this.measurements).every(v => v > 0);

//     if (!allFilled) {
//         this.errorBox.innerText = "Please fill all measurement fields";
//         this.errorBox.style.display = "block";
//         return;
//     }

//     this.step2.style.display = "none";
//     this.step3.style.display = "block";
//     this.resultBox.innerHTML = "<p>Calculating...</p>";

//     try {
//         const res = await fetch(`${this.BASE_URL}/clothes-sizes`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 brand_id: Number(this.brandId),
//                 category_id: Number(this.categoryId),
//                 product_type_id: Number(this.productTypeId),
//                 style_id: this.styleId ? Number(this.styleId) : null,
//                 measurements: this.measurements,
//                 unit: this.unit
//             })
//         });

//         const data = await res.json();

//         // ================= SUCCESS WITH RECOMMENDED SIZE =================
//         if (data.status && data.data?.recommended_size) {
//             const size = data.data.recommended_size;
//             const allChartIds = data.data.all_chart_ids || [];

//             this.resultBox.innerHTML = `
//                 <h2>MEASUREMENT COMPLETE</h2>

//                 <div class="summery-size-box">
//                     <p>Category: ${size.category ?? ""}</p>
//                     <p>Brand: ${size.brand ?? ""}</p>
//                     <p>Style: ${size.style ?? ""}</p>
//                 </div>

//                 <div class="recommended-size-box"
//                      style="background:#f5f5f5;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
//                     <h3>Recommended Size</h3>
//                     <h4>UK ${size.uk_size ?? "-"}</h4>
//                     ${
//                         allChartIds.length > 1
//                         ? `<small>Also consider: ${allChartIds.join(", ")}</small>`
//                         : ""
//                     }
//                 </div>
//             `;
//         }

//         // ================= SUCCESS BUT NO RECOMMENDED SIZE =================
//         else if (data.status && !data.data?.recommended_size) {
//             this.resultBox.innerHTML = `
//                 <div style="background:#fff7ed;border:1px solid #f59e0b;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
//                     <h3>${data.message || "No matching size found"}</h3>
//                     <p style="margin-top:10px;">Please check your measurements or contact support.</p>
//                     <p>Email: <a href="mailto:help@specialkids.company">help@specialkids.company</a></p>
//                     <p>Telephone:<br>+44 (0) 121 354 6543 (UK)<br>+44 (0) 792 7200 762 (UK)</p>
//                 </div>
//             `;
//         }

//         // ================= REAL ERROR =================
//         else {
//             this.resultBox.innerHTML = `
//                 <div style="background:#fff7ed;border:1px solid #f59e0b;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
//                     <h3>It looks like the sizes may not have been entered correctly.</h3>
//                     <p style="margin-top:10px;">Please contact our support team for assistance:</p>
//                     <p>Email: <a href="mailto:help@specialkids.company">help@specialkids.company</a></p>
//                     <p>Telephone:<br>+44 (0) 121 354 6543 (UK)<br>+44 (0) 792 7200 762 (UK)</p>
//                 </div>
//             `;
//         }

//     } catch (err) {
//         this.resultBox.innerHTML = `
//             <div style="background:#fff7ed;border:1px solid #f59e0b;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
//                 <h3>It looks like the sizes may not have been entered correctly.</h3>
//                 <p style="margin-top:10px;">Please contact our support team for assistance:</p>
//                 <p>Email: <a href="mailto:help@specialkids.company">help@specialkids.company</a></p>
//                 <p>Telephone:<br>+44 (0) 121 354 6543 (UK)<br>+44 (0) 792 7200 762 (UK)</p>
//             </div>
//         `;
//     }
// }

// };


// // ================= EVENTS =================

// // Modal open
// document.querySelectorAll(".sf-open").forEach(btn => {
//     btn.addEventListener("click", () => {
//         modal.classList.add("active");
//         document.body.classList.add("app-modal-open");
//         Clothes.reset();
//         Clothes.loadBrands();
//     });
// });

// // Brand change
// Clothes.brandSelect.addEventListener("change", () => {
//     Clothes.brandId = Clothes.brandSelect.value;
//     Clothes.categoryId = "";
//     Clothes.productTypeId = "";
//     Clothes.styleId = "";
//     Clothes.loadCategories(); //  FIXED
// });

// // Category change
// Clothes.categorySelect.addEventListener("change", () => {
//     Clothes.categoryId = Clothes.categorySelect.value;
//     Clothes.productTypeId = "";
//     Clothes.styleId = "";
//     Clothes.loadProductTypes();
// });

// // Product type change
// Clothes.productTypeSelect.addEventListener("change", () => {
//     Clothes.productTypeId = Clothes.productTypeSelect.value;
//     Clothes.loadStyles();
// });

// // Style change
// Clothes.styleSelect.addEventListener("change", () => {
//     Clothes.styleId = Clothes.styleSelect.value;
// });

// // ================= VALIDATION =================
// function validateStep1Cloth() {
//     if (!Clothes.brandSelect.value) {
//         Clothes.errorBox.innerText = "Please select a brand";
//         Clothes.errorBox.style.display = "block"; // <-- show error
//         return false;
//     }

//     if (!Clothes.categorySelect.value) {    
//         Clothes.errorBox.innerText = "Please select a category";
//         Clothes.errorBox.style.display = "block";
//         return false;
//     }

//     if (!Clothes.productTypeSelect.value) {
//         Clothes.errorBox.innerText = "Please select a product type";
//         Clothes.errorBox.style.display = "block";
//         return false;
//     }

//     if (!Clothes.styleSelect.value) {
//         Clothes.errorBox.innerText = "Please select a style";
//         Clothes.errorBox.style.display = "block";
//         return false;
//     }

//     // Clear error if all valid
//     Clothes.errorBox.innerText = "";
//     Clothes.errorBox.style.display = "none"; //
//     return true;
// }

// // Next
// Clothes.nextBtn.addEventListener("click", async () => {

//     //  Use the new validation
//     if (!validateStep1Cloth()) return;

//     Clothes.step1.style.display = "none";
//     Clothes.step2.style.display = "block";

//     await Clothes.loadMeasurements();
// });



// // Back buttons
// Clothes.backStep1Btn.addEventListener("click", () => {
//     Clothes.step2.style.display = "none";
//     Clothes.step1.style.display = "block";
// });

// Clothes.backStep2Btn.addEventListener("click", () => {
//     Clothes.step3.style.display = "none";
//     Clothes.step2.style.display = "block";
// });

// // Submit
// Clothes.submitBtn.addEventListener("click", () => {
//     Clothes.submit();
// });

// // Close modal
// modal.querySelectorAll(".sf-close, .sf-close-apply").forEach(btn => {
//     btn.addEventListener("click", () => {
//         modal.classList.remove("active");
//         document.body.classList.remove("app-modal-open");
//         Clothes.reset();
//     });
// });

// });