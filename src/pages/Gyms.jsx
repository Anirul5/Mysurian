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
          content="Find the best gyms and fitness centers in Mysuru with reviews, ratings, and membership info."
        />
      </Helmet>
      <DataList
        title="Gyms & Fitness"
        collectionName="gyms"
        fields={["address", "contact"]}
      />
    </>
  );
}
