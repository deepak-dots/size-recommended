document.addEventListener("DOMContentLoaded", function () {

    const shoesBtn = document.querySelector(".sf-category-btn-shoes");
    const clothesBtn = document.querySelector(".sf-category-btn-clothes");

    const shoesBlock = document.querySelector(".shoes-block-messurement");
    const clothesBlock = document.querySelector(".clothes-block-messurement");

    // Shoes Click
    shoesBtn.addEventListener("click", function () {
        shoesBtn.classList.add("active");
        clothesBtn.classList.remove("active");

        shoesBlock.style.display = "block";
        clothesBlock.style.display = "none";
        console.log("Shoes button clicked");
    });

    // Clothes Click
    clothesBtn.addEventListener("click", function () {
        clothesBtn.classList.add("active");
        shoesBtn.classList.remove("active");
        clothesBtn.classList.remove("hidden");

        clothesBlock.style.display = "block";
        shoesBlock.style.display = "none";
        console.log("Clothes button clicked");
    });

    // ===== GLOBAL CATEGORY RESET =====
    window.resetSizeFinderCategory = function () {

        const shoesBtn = document.querySelector(".sf-category-btn-shoes");
        const clothesBtn = document.querySelector(".sf-category-btn-clothes");

        const shoesBlock = document.querySelector(".shoes-block-messurement");
        const clothesBlock = document.querySelector(".clothes-block-messurement");

        const categoryBlock = document.querySelector(".sf-category-btn-wraper");

        if (shoesBtn) shoesBtn.classList.add("active");
        if (clothesBtn) clothesBtn.classList.remove("active");

        if (shoesBlock) shoesBlock.style.display = "block";
        if (clothesBlock) clothesBlock.style.display = "none";

        if (categoryBlock) categoryBlock.style.display = "block";

        console.log("Global category reset done");
    };

});

document.addEventListener("DOMContentLoaded", function () {

    const hideBtns = document.querySelectorAll(".next-first-hide-product-cate");
    const showBtns = document.querySelectorAll(".back-first-show-product-cate");
    const categoryBlock = document.querySelector(".sf-category-btn-wraper");

    if (!categoryBlock) return;

    // Hide on all next buttons
    // hideBtns.forEach(btn => {
    //     btn.addEventListener("click", function () {
    //         categoryBlock.style.display = "none";
    //     });
    // });

    // Show on all back buttons
    showBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            categoryBlock.style.display = "block";
        });
    });

});

// ================= SEND SIZE REPORT =================

const BASE_URL = "http://127.0.0.1:65011/api/proxy";

document.addEventListener("click", async function (e) {

    const sendEmailBtn = e.target.closest(".sf-send-email");
    if (!sendEmailBtn) return;

    // Detect whether it's shoes block or clothes block
    const parentBlock =
        sendEmailBtn.closest(".shoes-block-messurement") ||
        sendEmailBtn.closest(".clothes-block-messurement");

    if (!parentBlock) return;

    const emailInput = parentBlock.querySelector(".sf-email");
    const reportDiv = parentBlock.querySelector(".summery-size-box-report-summary");

    const email = emailInput?.value.trim();

    if (!email) {
        alert("Please enter your email.");
        return;
    }

    if (!reportDiv || reportDiv.closest('[style*="display: none"]')) {
        alert("Please calculate your size first.");
        return;
    }

    const reportHtml = reportDiv.outerHTML;

    sendEmailBtn.disabled = true;
    sendEmailBtn.innerText = "Sending...";

    try {
        const response = await fetch(`${BASE_URL}/v1/send-size-report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                email: email,
                report_html: reportHtml
            })
        });

        const result = await response.json();

        if (result.success) {
            alert("Size report sent successfully!");
            emailInput.value = "";
        } else {
            alert("Failed to send report.");
            console.error(result.error);
        }

    } catch (error) {
        console.error(error);
        alert("Server error occurred.");
    }

    sendEmailBtn.disabled = false;
    sendEmailBtn.innerText = "Send My Size Report";
});