const baseURL = import.meta.env.VITE_SERVER_URL;

async function convertToJson(res) {
  const data = await res.json();
  if (res.ok) {
    return data;
  } else {
    console.log("This is the end!");
    throw { name: "servicesError", message: data };
  }
}

export default class ExternalServices {
  constructor() {
    // this.category = category;
    // this.path = `../json/${this.category}.json`;
  }
  // getData() {
  //   return fetch(this.path)
  //     .then(convertToJson)
  //     .then((data) => data);
  //}
  async getData(category) {
    const response = await fetch(`${baseURL}/products/search/${category}`);
    const data = await convertToJson(response);
    return data.Result;
  }

  async findProductById(id) {
    // const products = await this.getData();
    // return products.find((item) => item.Id === id);
    const response = await fetch(`${baseURL}/product/${id}`);
    const data = await convertToJson(response);
    return data.Result;
  }

  async checkout(order) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    };
    console.log("Checkout submitted!");
    return await fetch(baseURL + "/checkout/", options).then(convertToJson);
  }
}
