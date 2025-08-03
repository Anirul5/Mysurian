import React from "react";
import DataList from "../components/DataList";
import { Helmet } from "react-helmet-async";

export default function Hotels() {
  return (
    <>
      <Helmet>
        <title>Hotels in Mysuru | Mysurian</title>
        <meta
          name="description"
          content="Find top-rated hotels and stays in Mysuru with reviews, ratings, and booking info."
        />
      </Helmet>

      <DataList
        collectionName="hotels"
        fields={["address", "rating", "contact"]}
        title="Hotels in Mysuru"
      />
    </>
  );
}
