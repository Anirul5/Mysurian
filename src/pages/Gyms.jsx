import React from "react";
import DataList from "../components/DataList";
import { Helmet } from "react-helmet-async";

export default function Gyms() {
  return (
    <>
      <Helmet>
        <title>Gyms & Fitness in Mysuru | Mysurian</title>
        <meta
          name="description"
          content="Discover the best gyms and fitness centers in Mysuru. Find the perfect place to stay fit."
        />
      </Helmet>

      <DataList
        collectionName="gyms"
        fields={["address", "rating", "contact"]}
        title="Gyms & Fitness in Mysuru"
      />
    </>
  );
}
