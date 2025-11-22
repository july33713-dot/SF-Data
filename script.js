document.addEventListener("DOMContentLoaded", function () {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzZT3O4B56wASEbOuYfy2KK4Ohz2OMbCGJ3M623rVN9Ft6PSXxpwcekeJdnlOacTod9/exec';
  const form = document.getElementById("productForm");
  const genderSelect = document.getElementById("gender");
  const boysCat = document.getElementById("boysCat");
  const girlsCat = document.getElementById("girlsCat");
  const sizeGrid = document.getElementById("sizeGrid");
  const sizeDetails = document.getElementById("sizeDetails");
  const msg = document.getElementById("msg");

  // Helper function to get value
  function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  // === Gender Switcher ===
  genderSelect.addEventListener("change", () => {
    boysCat.classList.toggle("hidden", genderSelect.value !== "Boys");
    girlsCat.classList.toggle("hidden", genderSelect.value !== "Girls");
  });

  // === Show OTHER input ===
  document.querySelectorAll("select").forEach((select) => {
    select.addEventListener("change", function () {
      const otherInput = this.parentElement.querySelector(".other-input");
      if (otherInput) {
        otherInput.classList.toggle("hidden", this.value !== "other");
      }
    });
  });

  // === Size Buttons ===
  const sizes = [
    "00","02","04","06","08","10","12","14","16","18","20",
    "22","24","26","28","30","32","34","36","38","40"
  ];

  sizes.forEach((size) => {
    const div = document.createElement("div");
    div.className = "size-option";
    div.textContent = size;
    div.addEventListener("click", () => toggleSize(size, div));
    sizeGrid.appendChild(div);
  });

  function toggleSize(size, el) {
    el.classList.toggle("selected");
    const existing = document.getElementById("detail-" + size);

    if (el.classList.contains("selected")) {
      const div = document.createElement("div");
      div.className = "size-input";
      div.id = "detail-" + size;
      div.dataset.size = size;

      div.innerHTML = `
        <label>${size}</label>
        <input type="number" class="price-input" placeholder="Price (₹)" required>
        <input type="text" class="age-input" placeholder="Age (3-4Y)" required>
        <input type="number" class="qty-input" placeholder="Qty" required>
      `;
      sizeDetails.appendChild(div);
    } else if (existing) {
      existing.remove();
    }
  }

  // === Submit Handler ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msg.textContent = "⏳ Submitting...";
    msg.style.color = "#444";

    // Collect sizes
    const selectedSizes = [];
    document.querySelectorAll(".size-input").forEach((div) => {
      selectedSizes.push({
        size: div.dataset.size,
        price: div.querySelector(".price-input").value,
        age: div.querySelector(".age-input").value,
        qty: div.querySelector(".qty-input").value
      });
    });

    const data = {
      productName: getValue("productName"),
      sku: getValue("sku"),
      gender: getValue("gender"),
      productType: getValue("productType"),
      productTypeOther: getValue("productTypeOther"),
      boysCategory: getValue("boysCategory"),
      boysCategoryOther: getValue("boysCategoryOther"),
      girlsCategory: getValue("girlsCategory"),
      girlsCategoryOther: getValue("girlsCategoryOther"),
      fabricType: getValue("fabricType"),
      fabricOther: getValue("fabricOther"),
      color: getValue("color"),
      patternType: getValue("patternType"),
      patternOther: getValue("patternOther"),
      sizes: selectedSizes
    };

    try {
      let response;

      // Try normal JSON POST
      try {
        response = await fetch(SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      } catch (err) {
        // Will retry with no-cors
      }

      // If normal POST fails, try no-cors mode
      if (!response || !response.ok) {
        await fetch(SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(data)
        });

        msg.textContent = "✅ Submitted (no-cors mode). Check your sheet!";
        msg.style.color = "green";
        form.reset();
        sizeDetails.innerHTML = "";
        document.querySelectorAll(".size-option").forEach(el => el.classList.remove("selected"));
        return;
      }

      const result = await response.json();

      if (result.result === "success") {
        msg.textContent = "✅ Product saved successfully!";
        msg.style.color = "green";
        form.reset();
        sizeDetails.innerHTML = "";
        document.querySelectorAll(".size-option").forEach(el => el.classList.remove("selected"));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      msg.textContent = "❌ Error: " + error.message;
      msg.style.color = "red";
    }
  });
});
