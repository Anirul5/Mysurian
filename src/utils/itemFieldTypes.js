// utils/itemFieldTypes.js

const itemFieldTypes = {
  name: { type: "string", required: true },
  description: { type: "string", required: true },
  date: { type: "date", required: true },
  address: { type: "string", required: false },
  image: { type: "string", required: false },
  gallery: { type: "array", required: false },
  mapurl: { type: "string", required: false },
  rating: { type: "number", required: false, min: 0, max: 5, step: 0.1 },
  featured: { type: "boolean", required: false },
  eyes: { type: "boolean", required: false },
  searchcount: { type: "number", required: false },
};

const typedOfFields = {
  string: { type: "string" },
  date: { type: "date" },
  array: { type: "array" },
  number: { type: "number" },
  boolean: { type: "boolean" },
};

export { itemFieldTypes, typedOfFields };
