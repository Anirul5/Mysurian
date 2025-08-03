import React from "react";
import DataList from "../components/DataList";

export default function Restaurants() {
  return (
    <DataList
      title="Restaurants & Cafes"
      collectionName="restaurants"
      fields={["address", "cuisine"]}
    />
  );
}
