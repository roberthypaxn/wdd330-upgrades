import { setLocalStorage } from "./utils.mjs";
import { getLocalStorage } from "./utils.mjs";

function productTemplate(product) {
  return `
    <section class="product-detail"> <h3>${product.Brand.Name}</h3>
    <h2 class="divider">${product.NameWithoutBrand}</h2>
    <img
      class="divider"
      src="${product.Images.PrimaryLarge}"
      alt="${product.NameWithoutBrand}"
    />
    <p class="product-card__price">$${product.FinalPrice}</p>
    <p class="product__color">${product.Colors[0].ColorName}</p>
    <p class="product__description">
    ${product.DescriptionHtmlSimple}
    </p>
    <div class="product-detail__add">
      <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
    </div></section>`;
}
export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productID = productId;
    this.dataSource = dataSource;
    this.product = {};
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productID);
    this.render("main");
    document
      .getElementById("addToCart")
      .addEventListener("click", this.addProductToCart.bind(this));
  }

  addProductToCart() {
    let product = this.product; //Get product
    let cart = getLocalStorage("so-cart") || []; //Get cart from local storage
    // Get current cart array
    // Check if cart is not empty
    let existingItem = cart.find((item) => {
      return item.Id === product.Id;
    });

    if (existingItem) {
      // Increment quantity of existing item
      existingItem.quantity++;
    } else {
      // Add new product to cart
      product.quantity = 1;
      cart.push(product);
    }
    let overAllPayment = 0;
    cart.forEach((item) => {
      const totalForSet = (item.FinalPrice * item.quantity).toFixed(2);
      // Add to total each iteration
      overAllPayment += parseFloat(totalForSet);
    });
    // Save updated cart array
    setLocalStorage("so-cart", cart);
    setLocalStorage("so-cart-total", overAllPayment.toFixed(2));
  }

  render(selector) {
    const element = document.querySelector(selector);
    element.insertAdjacentHTML("afterBegin", productTemplate(this.product));
  }
}
