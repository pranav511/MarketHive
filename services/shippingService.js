exports.calculateShipping = (totalAmount, address) => {

  let shipping = 0;

  if (totalAmount < 1000) {
    shipping = 50;
  }

  return {
    shipping_charge: shipping,
    is_free: shipping === 0
  };
};


exports.calculateETA = (address) => {

  const warehouseState = "Maharashtra";

  if (address.state === warehouseState) {
    return "2 Days Delivery";
  }

  return "4-5 Days Delivery";
};