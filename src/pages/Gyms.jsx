import React from "react";
import DataList from "../components/DataList";

export default function Gyms() {
  return (
    <DataList
      title="Gyms & Fitness"
      collectionName="gyms"
      fields={["address", "contact"]}
    />
  );
}
