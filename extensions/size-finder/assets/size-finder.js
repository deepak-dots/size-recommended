document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "http://127.0.0.1:53951/api/proxy";

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
    const sizeReportBox = document.querySelector(".size-report");
    const errorBox = document.querySelector(".sf-error");

    let brandId = "", shoeType = "", styleId = "";
    let category = "Shoes", unit = "cm", insertRemoval = false, width = "", foot = "both";
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
        errorBox.innerText = "Please select shoe category";
        errorBox.classList.add("show");
        return false;
    }

    if (!styleSelect.value) {
        errorBox.innerText = "Please select shoe style";
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

                if (window.resetSizeFinderCategory) {
                    window.resetSizeFinderCategory();
                }
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


    // Start Again
    document.addEventListener("click", function (e) {

        const backStep1Btn = e.target.closest(".sf-back-step-1");
        const backStep2Btn = e.target.closest(".sf-back-step-2");

        // START AGAIN
        if (backStep1Btn) {
            e.preventDefault();

            step3.style.display = "none";
            step2.style.display = "none";
            step1.style.display = "block";
            step = 1;

            if (emailInput) emailInput.value = "";

            setDefaultSelections();

            // SHOW CATEGORY SECTION AGAIN
            const categoryWrapper = document.querySelector(".sf-category-btn-wraper");
            if (categoryWrapper) categoryWrapper.style.display = "block";
        }

        // REVIEW MEASUREMENTS
        if (backStep2Btn) {
            e.preventDefault();

            step3.style.display = "none";
            step2.style.display = "block";
            step = 2;

            if (emailInput) emailInput.value = "";
        }

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

        // Reset Steps
        step = 1;
        step1.style.display = "block";
        step2.style.display = "none";
        step3.style.display = "none";

        // Clear dropdowns
        brandSelect.innerHTML = `<option value="">Select Brand</option>`;
        genderSelect.innerHTML = `<option value="">Select Shoe category</option>`;
        styleSelect.innerHTML = `<option value="">Select Style</option>`;

        // Clear dynamic content
        measurementBox.innerHTML = "";
        resultBox.innerHTML = "";
        errorBox.innerText = "";
        errorBox.classList.remove("show");

        // Clear email
        if (emailInput) emailInput.value = "";

        // Reset variables
        brandId = "";
        shoeType = "";
        styleId = "";
        measurementKeys = [];
        measurements = { left: {}, right: {} };
        insertRemoval = false;
        width = "";
        foot = "both";
        braceOption = "No Brace";
        unit = "cm";

        // Reset checkboxes
        if (removalCheckbox) removalCheckbox.checked = false;

        // Reset radio buttons
        document.querySelectorAll('input[name="sf-unit"]').forEach(radio => {
            radio.checked = radio.value === "cm";
        });

        document.querySelectorAll('input[name="sf-brace"]').forEach(radio => {
            radio.checked = radio.value === "No Brace";
        });

        if (sizeReportBox) sizeReportBox.style.display = "none";

        // Reload brands again
        loadBrandsShoes();

        console.log("Modal fully reset");
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

     clearStep1Error();    

    brandId = brandSelect.value;

    // resetShoes dependent dropdowns
    genderSelect.innerHTML = `<option value="">Select Shoe Type</option>`;
    styleSelect.innerHTML = `<option value="">Select Style</option>`;
    shoeType = "";
    styleId = "";

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

    clearStep1Error();   

    shoeType = genderSelect.value;

    styleSelect.innerHTML = `<option value="">Select Style</option>`;
    styleId = "";

    if (!shoeType) return;

    styleSelect.innerHTML = "<option>Loading...</option>";

    const res = await fetch(`${BASE_URL}/v1/shoe-styles/${brandId}/${shoeType}`);
    const json = await res.json();

    styleSelect.innerHTML = `<option value="">Select Style</option>`;
    const selectedBrandName = brandSelect.options[brandSelect.selectedIndex]?.text.toLowerCase() || "";
    const isBilly = selectedBrandName.includes("billy");

    json.data.forEach(s => {
        if (isBilly && s.width_group) {
            styleSelect.innerHTML += `<option value="${s.id}">${s.name} - ${s.width_group}</option>`;
        } else {
            styleSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
        }
    });
};

   styleSelect.onchange = () => {
    clearStep1Error();
    styleId = styleSelect.value;
};

    document.querySelector(".sf-next").onclick = async () => {
        errorBox.innerText = "";
        errorBox.classList.remove("show");

        if (!validateStep1()) return; //  If validation fails → stop here

        //  Hide category ONLY after validation success
        const categoryBlock = document.querySelector(".sf-category-btn-wraper");
        if (categoryBlock) categoryBlock.style.display = "none";

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
        if (sizeReportBox) sizeReportBox.style.display = "none";
        resultBox.innerHTML="Finding your perfect size...";

        try {
            const res = await fetch(`${BASE_URL}/v1/shoes-sizes`, {
                method:"POST",
                headers:{"Content-Type":"application/json","Accept":"application/json"},
                body:JSON.stringify({brand_id:brandId,category,shoe_type:category==="Shoes"?shoeType:null,unit,width,foot,measurements,styleId:styleId||null,insertRemoval})
            });
            const data=await res.json();

            

            if (data.status === "success" && data.data?.recommended_size) {

                if (sizeReportBox) sizeReportBox.style.display = "block";

                const result = data.data;
                const recommended = result.recommended_size;
                const allSizes = result.all_sizes || [];
                const minSize = result.min_size;
                const maxSize = result.max_size;
                const isBetween = result.is_between;

                const selectedBrandName = recommended?.shoe_brand?.name?.toLowerCase() || "";
                const isBilly = selectedBrandName.includes("billy");

                resultBox.innerHTML = `
                    <h2 style="text-align: center;">MEASUREMENT COMPLETE</h2>
                    <div class="summery-size-box-report-summary">
                        <div class="summery-size-box">
                            <p>Category: ${recommended?.shoe_gender?.name || ""}</p>
                            <p>Brand: ${recommended?.shoe_brand?.name || ""}</p>
                            <p>Style: ${recommended?.shoe_style?.name || ""}</p>
                            <p>Brace Option: ${braceOption || ""}</p>
                        </div>

                        <div class="recommended-size-box" 
                            style="background:#f5f5f5;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
                            
                            <h3 style="text-align: center;">Recommended Size</h3>

                            ${isBilly ? `
                                <h4 style="text-align: center;">
                                    UK: ${recommended?.uk_size ?? "-"} 
                                    ${
                                        recommended?.shoe_style?.width_group 
                                        ? `(${recommended.shoe_style.width_group})` 
                                        : ""
                                    }
                                </h4>

                                <p>
                                    US: ${recommended?.us_size ?? "-"} | 
                                    EU: ${recommended?.eu_size ?? "-"}
                                </p>
                            ` : `
                                <h4 style="text-align: center;">
                                    UK: ${recommended?.uk_size ?? "-"}
                                </h4>
                            `}

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
                                </div>
                                `
                                : ""
                            }
                        </div>
                    </div>
                `;
            }

            /* ================= NEW SMART MESSAGE HANDLING ================= */
            else if (data.status === "success" && !data.data?.recommended_size) {

                //  Above Maximum Size Case
                if (data.message?.toLowerCase().includes("above the maximum")) {

                    // resultBox.innerHTML = `
                    //     <div style="background:#fff7ed;border:1px solid #f59e0b;padding:20px;border-radius:12px;margin:20px 0;text-align:center;">
                    //         <h3>${data.message}</h3>
                    //         <p style="margin-top:10px;">
                    //             Please enable the insert removal option and try again, please click on back button for this action.
                    //         </p>
                    //     </div>
                    // `;

                    resultBox.innerHTML = `
                        <div style="background:#fff7ed;border:1px solid #f59e0b;padding:24px;border-radius:12px;margin:20px 0;text-align:center;">
                            <h3 style="margin-bottom:10px;">We couldn’t confidently match a size yet.</h3>
                            <p style="margin-bottom:10px;">
                                Based on the measurements entered, we can’t confidently recommend a size. This usually happens if:</p>
                            <ul style="list-style:disc;text-align:left;display:inline-block;margin:0 0 20px 0;padding-left:20px;">
                                <li>A number was mistyped</li>
                                <li>Measurements were taken in different units</li>
                                <li>A brace setting doesn’t match the measurements</li>
                            </ul>
                            <p style="margin-bottom:20px;">Let’s quickly check a few things.</p>
                            <div style="margin-bottom:25px;">
                                <button class="sf-back-step-2 sf-secondary-btn popupBackBtn">
                                    Review My Measurements
                                </button>
                                <button class="sf-back-step-1 sf-secondary-btn popupBackBtn" >
                                    Start Again
                                </button>
                            </div>
                            <div style="border-top:1px solid #fed7aa;padding-top:15px;text-align:center;">
                                <p style="font-weight:bold;margin-bottom:8px;">Need personal help?</p>
                                <p style="margin:5px 0;">Our team specialises in adaptive fitting.</p>
                                <p style="margin:5px 0;">
                                    📧 <a href="mailto:help@specialkids.company" style="color:#c2410c;text-decoration:none;">help@specialkids.company</a><br>
                                    📞 +44 (0) 121 354 654
                                </p>
                            </div>
                        </div>
                    `;

                    if (sizeReportBox) sizeReportBox.style.display = "none";
                }

                //  Multiple Sizes Found
                else if (data.message?.toLowerCase().includes("multiple shoe sizes")) {

                    resultBox.innerHTML = `
                        <div style="background:#fff7ed;border:1px solid #f59e0b;padding:24px;border-radius:12px;margin:20px 0;text-align:center;">
                            <h3 style="margin-bottom:10px;">We couldn’t confidently match a size yet.</h3>
                            <p style="margin-bottom:10px;">
                                Based on the measurements entered, we can’t confidently recommend a size. This usually happens if:
                            </p>
                            <ul style="list-style:disc;text-align:left;display:inline-block;margin:0 0 20px 0;padding-left:20px;">
                                <li>A number was mistyped</li>
                                <li>Measurements were taken in different units</li>
                                <li>A brace setting doesn’t match the measurements</li>
                            </ul>
                            <p style="margin-bottom:20px;">Let’s quickly check a few things.</p>
                            <div style="margin-bottom:25px;">
                                <button class="sf-back-step-2 sf-secondary-btn popupBackBtn">
                                    Review My Measurements
                                </button>
                                <button class="sf-back-step-1 sf-secondary-btn popupBackBtn" >
                                    Start Again
                                </button>
                            </div>
                            <div style="border-top:1px solid #fed7aa;padding-top:15px;text-align:center;">
                                <p style="font-weight:bold;margin-bottom:8px;">Need personal help?</p>
                                <p style="margin:5px 0;">Our team specialises in adaptive fitting.</p>
                                <p style="margin:5px 0;">
                                    📧 <a href="mailto:help@specialkids.company" style="color:#c2410c;text-decoration:none;">help@specialkids.company</a><br>
                                    📞 +44 (0) 121 354 654
                                </p>
                            </div>
                        </div>
                    `;
                    if (sizeReportBox) sizeReportBox.style.display = "none";
                }

                //  Any Other Success Message
                else {
                       resultBox.innerHTML = `
                        <div style="background:#fff7ed;border:1px solid #f59e0b;padding:24px;border-radius:12px;margin:20px 0;text-align:center;">
                            <h3 style="margin-bottom:10px;">We couldn’t confidently match a size yet.</h3>
                            <p style="margin-bottom:10px;">
                                Based on the measurements entered, we can’t confidently recommend a size. This usually happens if:</p>
                            <ul style="list-style:disc;text-align:left;display:inline-block;margin:0 0 20px 0;padding-left:20px;">
                                <li>A number was mistyped</li>
                                <li>Measurements were taken in different units</li>
                                <li>A brace setting doesn’t match the measurements</li>
                            </ul>
                            <p style="margin-bottom:20px;">Let’s quickly check a few things.</p>
                            <div style="margin-bottom:25px;">
                                <button class="sf-back-step-2 sf-secondary-btn popupBackBtn">
                                    Review My Measurements
                                </button>
                                <button class="sf-back-step-1 sf-secondary-btn popupBackBtn" >
                                    Start Again
                                </button>
                            </div>
                            <div style="border-top:1px solid #fed7aa;padding-top:15px;text-align:center;">
                                <p style="font-weight:bold;margin-bottom:8px;">Need personal help?</p>
                                <p style="margin:5px 0;">Our team specialises in adaptive fitting.</p>
                                <p style="margin:5px 0;">
                                    📧 <a href="mailto:help@specialkids.company" style="color:#c2410c;text-decoration:none;">help@specialkids.company</a><br>
                                    📞 +44 (0) 121 354 654
                                </p>
                            </div>
                        </div>
                    `;
                    if (sizeReportBox) sizeReportBox.style.display = "none";
                }
            }

            /* ================= REAL ERROR ================= */
            else {
               resultBox.innerHTML = `
                        <div style="background:#fff7ed;border:1px solid #f59e0b;padding:24px;border-radius:12px;margin:20px 0;text-align:center;">
                            <h3 style="margin-bottom:10px;">We couldn’t confidently match a size yet.</h3>
                            <p style="margin-bottom:10px;">
                                Based on the measurements entered, we can’t confidently recommend a size. This usually happens if:
                            </p>
                            <ul style="list-style:disc;text-align:left;display:inline-block;margin:0 0 20px 0;padding-left:20px;">
                                <li>A number was mistyped</li>
                                <li>Measurements were taken in different units</li>
                                <li>A brace setting doesn’t match the measurements</li>
                            </ul>
                            <p style="margin-bottom:20px;">Let’s quickly check a few things.</p>
                            <div style="margin-bottom:25px;">
                                <button class="sf-back-step-2 sf-secondary-btn popupBackBtn">
                                    Review My Measurements
                                </button>
                                <button class="sf-back-step-1 sf-secondary-btn popupBackBtn" >
                                    Start Again
                                </button>
                            </div>
                            <div style="border-top:1px solid #fed7aa;padding-top:15px;text-align:center;">
                                <p style="font-weight:bold;margin-bottom:8px;">Need personal help?</p>
                                <p style="margin:5px 0;">Our team specialises in adaptive fitting.</p>
                                <p style="margin:5px 0;">
                                    📧 <a href="mailto:help@specialkids.company" style="color:#c2410c;text-decoration:none;">help@specialkids.company</a><br>
                                    📞 +44 (0) 121 354 654
                                </p>
                            </div>
                        </div>
                    `;
                if (sizeReportBox) sizeReportBox.style.display = "none";
            }
        } catch(err){
            resultBox.innerHTML=`
                <div style="background:#fff7ed;border:1px solid #f59e0b;padding:24px;border-radius:12px;margin:20px 0;text-align:center;">
                    <h3 style="margin-bottom:10px;">We couldn’t confidently match a size yet.</h3>
                    <p style="margin-bottom:10px;">
                        Based on the measurements entered, we can’t confidently recommend a size. This usually happens if:</p>
                    <ul style="list-style:disc;text-align:left;display:inline-block;margin:0 0 20px 0;padding-left:20px;">
                        <li>A number was mistyped</li>
                        <li>Measurements were taken in different units</li>
                        <li>A brace setting doesn’t match the measurements</li>
                    </ul>
                    <p style="margin-bottom:20px;">Let’s quickly check a few things.</p>
                    <div style="margin-bottom:25px;">
                        <button class="sf-back-step-2 sf-secondary-btn popupBackBtn">
                            Review My Measurements
                        </button>
                        <button class="sf-back-step-1 sf-secondary-btn popupBackBtn" >
                            Start Again
                        </button>
                    </div>
                    <div style="border-top:1px solid #fed7aa;padding-top:15px;text-align:center;">
                        <p style="font-weight:bold;margin-bottom:8px;">Need personal help?</p>
                        <p style="margin:5px 0;">Our team specialises in adaptive fitting.</p>
                        <p style="margin:5px 0;">
                            📧 <a href="mailto:help@specialkids.company" style="color:#c2410c;text-decoration:none;">help@specialkids.company</a><br>
                            📞 +44 (0) 121 354 654
                        </p>
                    </div>
                </div>
            `;
            if (sizeReportBox) sizeReportBox.style.display = "none";
        }
    };
});