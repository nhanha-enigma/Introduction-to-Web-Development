

// Execute code when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    setupWishlistFeature();
    setupFormValidation();
    autoFillSavedCustomerData();
});

// =========================================================
// DATA STRUCTURES (2 Objects / Arrays as required)
// =========================================================

// Array 1: Array of objects representing the menu catalog for the interactive feature
const bakeryProducts = [
    { id: "item-1", name: "Classic Sourdough Loaf", price: "$8.50" },
    { id: "item-2", name: "Butter Croissant", price: "$4.00" },
    { id: "item-3", name: "Pain au Chocolat", price: "$4.75" },
    { id: "item-4", name: "Custom Layer Cake", price: "$38.00" }
];

// Object 1: Form validation rules and custom inline error messages
const validationRules = {
    minNameLength: 2,
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
        nameError: "Please enter your full name (at least 2 characters).",
        emailError: "Please enter a valid email address (e.g., name@example.com).",
        requestTypeError: "Please select a request type from the dropdown list."
    }
};

// =========================================================
// FEATURE 1: Interactive Favorites / Wishlist Tracker
// =========================================================

function setupWishlistFeature() {
    const container = document.getElementById("wishlist-container");
    if (!container) return; // Exit if not on products.html

    renderWishlistUI(container);
    refreshFavoritesList();
}

// Render product buttons dynamically into the DOM
function renderWishlistUI(targetElement) {
    let html = `
        <div class="wishlist-box" style="background-color: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #D88C5A; margin: 20px 0;">
            <h3 style="color: #6B3E26; margin-top: 0;">Save Your Favorite Daily Treats</h3>
            <p style="margin-bottom: 12px; font-size: 0.95rem;">Click the buttons below to save items you plan to pick up at the bakery:</p>
            <div class="product-buttons" style="display: flex; flex-wrap: wrap; gap: 10px;">`;

    bakeryProducts.forEach(function (product) {
        html += `
            <button type="button" class="fav-toggle-btn" id="btn-${product.id}" onclick="toggleFavoriteItem('${product.id}')"
                    style="background-color: #FFF8F0; border: 1px solid #6B3E26; color: #6B3E26; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: 600;">
                + Add ${product.name} (${product.price})
            </button>`;
    });

    html += `
            </div>
            <div id="favorites-summary-display" style="margin-top: 15px; padding-top: 12px; border-top: 1px dashed #D88C5A;"></div>
        </div>`;

    targetElement.innerHTML = html;
}

// Retrieve array of saved product IDs from localStorage
function fetchStoredFavorites() {
    const rawData = localStorage.getItem("northstar_favorites");
    return rawData ? JSON.parse(rawData) : [];
}

// Toggle product ID in array and update localStorage
function toggleFavoriteItem(productId) {
    let currentFavorites = fetchStoredFavorites();
    const existingIndex = currentFavorites.indexOf(productId);

    if (existingIndex === -1) {
        currentFavorites.push(productId);
    } else {
        currentFavorites.splice(existingIndex, 1);
    }

    localStorage.setItem("northstar_favorites", JSON.stringify(currentFavorites));
    refreshFavoritesList();
}

// Dynamically update button UI and summary panel on screen
function refreshFavoritesList() {
    const savedIds = fetchStoredFavorites();
    const displayBox = document.getElementById("favorites-summary-display");

    // Update button visual state
    bakeryProducts.forEach(function (product) {
        const btn = document.getElementById(`btn-${product.id}`);
        if (btn) {
            if (savedIds.includes(product.id)) {
                btn.textContent = `✓ ${product.name} Saved`;
                btn.style.backgroundColor = "#6B3E26";
                btn.style.color = "#FFF8F0";
            } else {
                btn.textContent = `+ Add ${product.name} (${product.price})`;
                btn.style.backgroundColor = "#FFF8F0";
                btn.style.color = "#6B3E26";
            }
        }
    });

    if (!displayBox) return;

    if (savedIds.length === 0) {
        displayBox.innerHTML = "<p style='font-style: italic; color: #666; margin: 0;'>No items added to your favorites list yet.</p>";
    } else {
        const savedObjects = bakeryProducts.filter(function (product) {
            return savedIds.includes(product.id);
        });

        let summaryHtml = "<p style='margin: 0 0 5px 0;'><strong>Your Saved Items for Pickup:</strong></p><ul style='margin: 0; padding-left: 20px;'>";
        savedObjects.forEach(function (product) {
            summaryHtml += `<li>${product.name} — ${product.price}</li>`;
        });
        summaryHtml += "</ul>";
        displayBox.innerHTML = summaryHtml;
    }
}

// =========================================================
// FEATURE 2: Form Validation & Persistent Customer Info
// =========================================================

function setupFormValidation() {
    const preOrderForm = document.querySelector("form");
    if (!preOrderForm) return; // Exit if form is not present

    preOrderForm.addEventListener("submit", function (event) {
        let isFormValid = true;

        // Clear existing error messages
        document.querySelectorAll(".error-text").forEach(function (msg) {
            msg.remove();
        });

        const nameInput = document.getElementById("full-name");
        const emailInput = document.getElementById("email-address");
        const requestSelect = document.getElementById("request-type");

        // Check 1: Required Name & Min Length
        if (nameInput && nameInput.value.trim().length < validationRules.minNameLength) {
            renderInlineError(nameInput, validationRules.messages.nameError);
            isFormValid = false;
        }

        // Check 2: Valid Email Format Regex Check
        if (emailInput && !validationRules.emailPattern.test(emailInput.value.trim())) {
            renderInlineError(emailInput, validationRules.messages.emailError);
            isFormValid = false;
        }

        // Check 3: Select option required
        if (requestSelect && requestSelect.value === "") {
            renderInlineError(requestSelect, validationRules.messages.requestTypeError);
            isFormValid = false;
        }

        // Block submission if errors exist
        if (!isFormValid) {
            event.preventDefault();
        } else {
            // Save Customer Name and Email to localStorage for return visits
            const customerProfile = {
                savedName: nameInput.value.trim(),
                savedEmail: emailInput.value.trim()
            };
            localStorage.setItem("northstar_customer", JSON.stringify(customerProfile));
        }
    });
}

// Helper to inject inline error message under input field
function renderInlineError(inputElement, errorMessage) {
    const errorSpan = document.createElement("span");
    errorSpan.className = "error-text";
    errorSpan.style.color = "#b91c1c";
    errorSpan.style.fontSize = "0.85rem";
    errorSpan.style.fontWeight = "bold";
    errorSpan.style.display = "block";
    errorSpan.style.marginTop = "4px";
    errorSpan.textContent = errorMessage;

    inputElement.parentNode.appendChild(errorSpan);
    inputElement.style.borderColor = "#b91c1c";
}

// Load remembered customer profile when opening contact page
function autoFillSavedCustomerData() {
    const nameInput = document.getElementById("full-name");
    const emailInput = document.getElementById("email-address");

    if (nameInput && emailInput) {
        const savedProfileRaw = localStorage.getItem("northstar_customer");
        if (savedProfileRaw) {
            const profile = JSON.parse(savedProfileRaw);
            nameInput.value = profile.savedName || "";
            emailInput.value = profile.savedEmail || "";
        }
    }
}
