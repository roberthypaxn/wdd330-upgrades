import ExternalServices from "./ExternalServices.mjs";
import {
  getLocalStorage,
  renderListWithTemplate,
  alertMessage,
  setLocalStorage,
  removeAllAlerts,
} from "./utils.mjs";

function CardTemplate(item) {
  let icons = "";
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

const services = new ExternalServices();

//takes the input data in the form and turns it into JSON
function formDataToJSON(formElement) {
  const formData = new FormData(formElement),
    convertedJSON = {};

  formData.forEach(function (value, key) {
    // Map form field names to desired JSON keys
    switch (key) {
      case "firstName":
        convertedJSON["fname"] = value;
        break;
      case "lastName":
        convertedJSON["lname"] = value;
        break;
      case "address":
        convertedJSON["street"] = value;
        break;
      case "city":
        convertedJSON["city"] = value;
        break;
      case "state":
        convertedJSON["state"] = value;
        break;
      case "zip":
        convertedJSON["zip"] = value;
        break;
      case "card":
        convertedJSON["cardNumber"] = value;
        break;
      case "exp":
        convertedJSON["expiration"] = value;
        break;
      case "cvv":
        convertedJSON["code"] = value;
        break;
    }
  });

  return convertedJSON;
}

// takes the items currently stored in the cart (localstorage) and returns them in a simplified form.
function packageItems(items) {
  // convert the list of products from localStorage to the simpler form required for the checkout process. Array.map would be perfect for this.
  const simplifiedItems = items.map((item) => {
    // console.log(item);
    return {
      id: item.Id,
      price: item.FinalPrice,
      name: item.Name,
      quantity: 1,
    };
  });
  return simplifiedItems;
}

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.cart = document.querySelector(".product-list");
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key);
    renderListWithTemplate(
      CardTemplate,
      this.cart,
      this.list,
      "afterBegin",
      true
    );
    document
      .querySelector(".button")
      .addEventListener("click", this.checkout.bind(this));
    this.calculateItemSummary();
    this.calculateOrdertotal();
  }

  calculateItemSummary() {
    // calculate and display the total amount of the items in the cart, and the number of items.
    let totalQuantity = this.list.reduce(function (total, currentItem) {
      return total + currentItem.quantity;
    }, 0);
    const itemCount = document.querySelector(".item__count");
    itemCount.innerHTML = `${totalQuantity} <span>Items</span>`;
  }

  calculateOrdertotal() {
    // calculate the shipping and tax amounts. Then use them to along with the cart total to figure out the order total
    this.list.forEach((item) => {
      const itemShipment = 10 + (parseInt(item.quantity) - 1) * 2;
      const itemTotal = parseFloat(item.quantity) * parseFloat(item.FinalPrice);
      const itemTax = ((itemTotal + itemShipment) * 6) / 100;
      const itemOrder = itemTotal + itemTax + itemShipment;

      this.itemTotal += itemTotal;
      this.shipping += itemShipment;
      this.tax += itemTax;
      this.orderTotal += itemOrder;
    });
    // display the totals.
    this.displayOrderTotals(
      this.itemTotal,
      this.shipping,
      this.tax,
      this.orderTotal
    );
  }

  displayOrderTotals(total, ship, tax, grossTotal) {
    // once the totals are all calculated display them in the order summary page
    const subtotal = document.querySelector(".sub__total");
    const shipping = document.querySelector(".shipping");
    const taxation = document.querySelector(".tax");
    const orderTotal = document.querySelector(".order__total");

    subtotal.innerHTML = `<span>subtotal</span> (Cart Total)<span>:</span> $ ${total}`;
    shipping.innerHTML = `<span>Shipping Cost:</span> $${ship}`;
    taxation.innerHTML = `<span>Tax:</span> $${tax}`;
    orderTotal.innerHTML = `<span>Order Total:</span> $${grossTotal}`;
  }

  async checkout() {
    event.preventDefault();
    console.log("button pressed");
    // build the data object from the calculated fields, the items in the cart, and the information entered into the form
    const formElement = document.forms["checkout"];

    const checkStatus = formElement.checkValidity();

    formElement.reportValidity();

    if (checkStatus) {
      const json = formDataToJSON(formElement);
      // add totals, and item details
      json.orderDate = new Date();
      json.orderTotal = this.orderTotal;
      json.tax = this.tax;
      json.shipping = this.shipping;
      json.items = packageItems(this.list);
      console.log(json);

      // call the checkout method in our ExternalServices module and send it our data object.
      try {
        const res = await services.checkout(json);
        console.log(res);
        setLocalStorage("so-cart", []); // Clear the cart after purchace
        setLocalStorage("so-cart-total", 0);
        location.assign("/checkout/success.html"); // Thank the client
      } catch (err) {
        // remove any previous alerts.
        removeAllAlerts();
        for (let message in err.message) {
          alertMessage(err.message[message]);
        }
        console.log(err);
      }
    }
  }
}
