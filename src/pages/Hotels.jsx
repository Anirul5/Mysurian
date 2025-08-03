import React from "react";
import DataList from "../components/DataList";

export default function Hotels() {
  return (
    <DataList
      title="Hotels & Stays"
      collectionName="hotels"
      fields={["address", "rating"]}
    />
  );
}
