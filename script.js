document.addEventListener("DOMContentLoaded", function () {
  const genderSelect = document.getElementById("gender");
  const boysCat = document.getElementById("boysCat");
  const girlsCat = document.getElementById("girlsCat");
  const sizeGrid = document.getElementById("sizeGrid");
  const sizeDetails = document.getElementById("sizeDetails");
  const msg = document.getElementById("msg");

  // Helper for safer field reading
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

  // === Size List ===
  const sizes = [
    "00","02","04","06","08","10","12","14","16","18","20",
    "22","24","26","28","30","32","34","36","38","40"
  ];

  // Render Size Buttons
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

  // === SUBMIT ===
  document.getElementById("productForm").addEventListener("submit", async (e) => {
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
        qty: div.querySelector(".qty-input").value,
      });
    });

    // Form Data
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

      sizes: selectedSizes,
    };

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzg4nmRT8aDDzFWQYidXIk2MGkv86K2Eo3JIyd97_-X5bU72YeYjH7LNYFfmTs5ZgAx/exec",
        {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();

      if (result.result === "success") {
        msg.textContent = "✅ Product saved successfully!";
        msg.style.color = "green";

        e.target.reset();
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
