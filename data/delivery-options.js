// ============================================
// Delivery Options Data
// ============================================

const deliveryOptions = [
  {
    id: '1',
    deliveryDays: 7,
    priceCents: 0
  },
  {
    id: '2',
    deliveryDays: 3,
    priceCents: 499
  },
  {
    id: '3',
    deliveryDays: 1,
    priceCents: 999
  }
];

function getDeliveryOption(deliveryOptionId) {
  return deliveryOptions.find(option => option.id === deliveryOptionId) || deliveryOptions[0];
}

function calculateDeliveryDate(deliveryOption) {
  const today = new Date();
  const deliveryDate = new Date(today);
  
  let daysAdded = 0;
  while (daysAdded < deliveryOption.deliveryDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    // Skip weekends
    const dayOfWeek = deliveryDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }
  
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return deliveryDate.toLocaleDateString('en-US', options);
}
