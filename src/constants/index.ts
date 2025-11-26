// Payment Options
export const PAYMENT_OPTIONS = [
  {
    id: "bank-transfer",
    label: "Bank Transfer (to get paid the next business day)",
  },
  {
    id: "check-by-mail",
    label: "Check by Mail",
  },
  {
    id: "pickup-check",
    label: "Pickup check",
  },
] as const;

// Car Years (2020-2025)
export const CAR_YEARS = Array.from({ length: 6 }, (_, i) => 2020 + i);

// US States
export const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
] as const;

// Pickup Check Information
export const PICKUP_CHECK_INFO = {
  companyName: "Elite Limousine Plus, Inc.",
  address: {
    street: "32-72 Gale Ave",
    city: "Long Island City, NY 11101",
  },
  department: "Driver Relations (first floor)",
  phone: "718-472-2300 x237 / x211",
  hours: "Mon - Fri 10:00 am - 6:00 pm",
} as const;

