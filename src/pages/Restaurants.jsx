import React from "react";
import DataList from "../components/DataList";
import { Helmet } from "react-helmet-async";

export default function Restaurants() {
  return (
    <>
      <Helmet>
        <title>Restaurants & Cafes in Mysuru | Mysurian</title>
        <meta
          name="description"
          content="Explore Mysuru's best restaurants and cafes. Find great food, ambience, and local flavors."
        />
      </Helmet>

      <DataList
        collectionName="restaurants"
        fields={["address", "rating", "cuisine"]}
        title="Restaurants & Cafes in Mysuru"
      />
    </>
  );
}
