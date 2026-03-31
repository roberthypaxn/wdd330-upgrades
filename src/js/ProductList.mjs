import { renderListWithTemplate } from "./utils.mjs";

function handleSearch(products) {
  const searchInput = document.querySelector("[data-search]"); // select the search box
  const resultList = document.querySelector(".search-result");

  searchInput.addEventListener("input", (event) => {
    resultList.innerHTML = "";

    const value = event.target.value.toLowerCase().trim();

    if (value !== "") {
      products.forEach((product) => {
        const isAlive =
          product.Name.toLowerCase().includes(value) ||
          product.Brand.Name.toLowerCase().includes(value) ||
          product.Colors[0].ColorName.toLowerCase().includes(value) ||
          product.DescriptionHtmlSimple.toLowerCase().includes(value);
        if (isAlive) {
          const li = document.createElement("li");
          // Add product name text
          li.innerHTML = `<a href="/product_pages/index.html?product=${product.Id}"><img
          src="${product.Images.PrimarySmall}"
          alt="Image of ${product.Name}"
          /><p>${product.Name}</p></a>`;
          // Append to list
          resultList.appendChild(li);
          console.log(product.Name);
          console.log(isAlive);
        }
      });
    }
  });
}
function CardTemplate(product) {
  return `<li class="product-card">
    <a href="/product_pages/index.html?product=${product.Id}">
      <img
        src="${product.Images.PrimaryMedium}"
        alt="Image of ${product.Name}"
      />
      <h3 class="card__brand">${product.Brand.Name}</h3>
      <h2 class="card__name">${product.Name}</h2>
      <p class="product-card__price">$${product.FinalPrice}</p></a
    >
  </li>`;
}

export default class ProductListing {
  constructor(datasource, category, element) {
    this.datasource = datasource;
    this.category = category;
    this.element = element;
  }

  async init() {
    const products = await this.datasource.getData(this.category);

    handleSearch(products);

    renderListWithTemplate(CardTemplate, this.element, products);
  }
}
