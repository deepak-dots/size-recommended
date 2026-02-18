document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = " https://from-breach-bearing-reports.trycloudflare.com/api/proxy";

    const modal = document.getElementById("sf-modal");
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

    let brandId = "", shoeType = "", styleId = "";
    let category = "Shoes", unit = "cm", insertRemoval = false, width = "Medium", foot = "both";
    let measurementKeys = [], measurements = { left: {}, right: {} };
    let step = 1, braceOption = "No Brace";

    const removalCheckbox = document.getElementById("sf-removal");
    const backStep1 = document.getElementById("sf-back-step-1");
    const backStep2 = document.getElementById("sf-back-step-2");
    const emailInput = document.getElementById("sf-email");

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

            reset();
            loadBrands();

           setDefaultSelections();
        });
    });

    // ================= MODAL CLOSE =================
    [closeBtn, closeBtnbtm].forEach(btn => {
        if (btn) {
            btn.addEventListener("click", () => {
                modal.classList.remove("active");
                document.body.classList.remove("app-modal-open");
                reset();
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

    // ================= RESET =================
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
    async function loadBrands() {
        brandSelect.innerHTML = "<option>Loading...</option>";
        const res = await fetch(`${BASE_URL}/v1/brands-list`);
        const json = await res.json();
        brandSelect.innerHTML = `<option value="">Select Brand</option>`;
        json.data.forEach(b => brandSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`);
    }

    // ================= LOAD GENDERS =================
    brandSelect.onchange = async () => {

    brandId = brandSelect.value;

    // Reset dependent dropdowns
    genderSelect.innerHTML = `<option value="">Select Shoe Type</option>`;
    styleSelect.innerHTML = `<option value="">Select Style</option>`;
    shoeType = "";
    styleId = "";

    validateStep1(); // ✅ ADD THIS

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

    validateStep1(); // ✅ ADD

    if (!shoeType) return;

    styleSelect.innerHTML = "<option>Loading...</option>";

    const res = await fetch(`${BASE_URL}/v1/shoe-styles/${brandId}/${shoeType}`);
    const json = await res.json();

    styleSelect.innerHTML = `<option value="">Select Style</option>`;
    json.data.forEach(s =>
        styleSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`
    );
};

   styleSelect.onchange = () => {
    styleId = styleSelect.value;
    validateStep1(); // ✅ ADD
};

    // ================= NEXT STEP =================
    document.getElementById("sf-next").onclick = async () => {
        errorBox.innerText = "";
        errorBox.classList.remove("show");

        if (!validateStep1()) return;

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

        const selectedBrandName = brandSelect.options[brandSelect.selectedIndex].text.toLowerCase();
        const isBilly = selectedBrandName.includes("billy");

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

                input.addEventListener("keydown", e => { if(e.key==="-"||e.key==="e") e.preventDefault(); });
                input.addEventListener("input", function(){ if(this.value<0)this.value=""; });

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
    document.getElementById("sf-submit").onclick = async () => {
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

            if(data.status==="success" && data.data){
                resultBox.innerHTML=`
                    <h2>MEASUREMENT COMPLETE</h2>
                    <div class="summery-size-box">
                        <p>Category: ${data.data.shoe_gender?.name||""}</p>
                        <p>Brand: ${data.data.shoe_brand?.name||""}</p>
                        <p>Style: ${data.data.shoe_style?.name||""}</p>
                        <p>Brace Option: ${braceOption}</p>
                    </div>
                    <div class="recommended-size-box" style="background:#f5f5f5;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
                        <h3>Recommended Size</h3>
                        <h4>UK ${data.data.uk_size} - ${data.data.shoe_style?.width_group ? `(${data.data.shoe_style.width_group})` : ""} </h4>
                        <p>US ${data.data.us_size} | EU ${data.data.eu_size}</p>
                    </div>
                `;
            } else {
                resultBox.innerHTML=`
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