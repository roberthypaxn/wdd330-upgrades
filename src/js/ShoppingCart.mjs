import { renderListWithTemplate } from "./utils.mjs";
import { getLocalStorage } from "./utils.mjs";
import { setLocalStorage } from "./utils.mjs";

function CardTemplate(item) {
  // Find the "quantity" property in each object
  const quantity = item.quantity;
  // Declare a variable named "icons"
  let icons = "";
  // Check the value of the "quantity" property
  if (quantity >= 1) {
    // If quantity is equal to 1, add specific icons to the "icons" variable
    icons +=
      '<li><button class="cart__reduce">✖</button></li><li><button class="cart__add">🞦</button></li>';
  }
  return `<li class="cart-card divider">
    <ul class="cart-card__icons">${icons}</ul>
    <a href="#" class="cart-card__image">
      <img
        src="${item.Images.PrimarySmall}"
        alt="${item.Name}"
      />
    </a>
    <a href="#">
      <h2 class="card__name">${item.Name}</h2>
    </a>
    <p class="cart-card__color">${item.Colors[0].ColorName}</p>
    <p class="cart-card__quantity">qty: ${item.quantity}</p>
    <p class="cart-card__price">Item Price: $${item.FinalPrice}</p>
    <p class="cart-card__total">Total Price: $${(
      item.FinalPrice * item.quantity
    ).toFixed(2)}</p>
    <p class="item__id" hidden>${item.Id}</p>
  </li>`;
}

export default class ShoppingCart {
  constructor() {
    this.cartItems = getLocalStorage("so-cart");
    this.overAllPayment = getLocalStorage("so-cart-total");
    this.element = document.querySelector(".product-list");
    this.total = document.querySelector(".cart__total");
    this.render();
  }

  async init() {
    this.render();
  }
  addOrRemove(items) {
    const addBtns = document.querySelectorAll(".cart__add");
    const removeBtns = document.querySelectorAll(".cart__reduce");

    addBtns.forEach((addBtn) => {
      addBtn.addEventListener("click", () => {
        //console.log("Add button clicked");
        const cardId =
          addBtn.parentElement.parentElement.parentElement.querySelector(
            ".item__id"
          ).textContent;
        const item = items.find((prod) => prod.Id === cardId);
        let quantity = item.quantity + 1;
        item.quantity = quantity;
        // Save the updated cart items to local storage
        setLocalStorage("so-cart", items);
        let overAllPayment = 0;
        items.forEach((item) => {
          const totalForSet = (item.FinalPrice * item.quantity).toFixed(2);
          overAllPayment += parseFloat(totalForSet);
        });
        setLocalStorage("so-cart-total", overAllPayment.toFixed(2));
        this.overAllPayment = overAllPayment.toFixed(2);
        // Render the updated cart items
        this.render();
      });
    });

    removeBtns.forEach((removeBtn) => {
      removeBtn.addEventListener("click", () => {
        //console.log("Remove button clicked");
        const cardId =
          removeBtn.parentElement.parentElement.parentElement.querySelector(
            ".item__id"
          ).textContent;
        //get product by id from LocalStorage and change it quantity
        const item = items.find((prod) => prod.Id === cardId);
        let quantity = item.quantity - 1;
        item.quantity = quantity;
        // Save the updated cart items to local storage
        setLocalStorage("so-cart", items);
        let overAllPayment = 0;
        items.forEach((item) => {
          const totalForSet = (item.FinalPrice * item.quantity).toFixed(2);
          overAllPayment += parseFloat(totalForSet);
        });
        setLocalStorage("so-cart-total", overAllPayment.toFixed(2));
        this.overAllPayment = overAllPayment.toFixed(2);
        // If quantity is equal to 0, remove the object from cartItems
        if (quantity === 0) {
          location.reload();
        }
        // Render the updated cart items
        this.render();
      });
    });
    // If quantity is equal to 0, remove the object from cartItems
    const newCart = getLocalStorage("so-cart").filter(
      (item) => item.quantity !== 0
    );
    setLocalStorage("so-cart", newCart);
    this.render;
  }

  // checkout(){
  //   let totalQuantity = this.cartItems.reduce(function(total, currentItem) {
  //     return total + currentItem.quantity;
  //   }, 0);
  //   console.log(totalQuantity);
  //   this.itemCount.innerText = `${totalQuantity} Items`;
  // }

  render() {
    renderListWithTemplate(
      CardTemplate,
      this.element,
      this.cartItems,
      "afterBegin",
      true
    );
    //document.querySelector(".cart-total").innerHTML = "Total $" + this.cartTotal;
    //console.log(this.cartItems);
    // Call the function to set up the event listeners
    this.addOrRemove(this.cartItems);
    // this.checkout();
    this.total.innerText = `Subtotal: $${parseFloat(
      this.overAllPayment
    ).toFixed(2)}`;
  }
}
