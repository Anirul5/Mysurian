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
        <meta property="og:title" content="Restaurants & Cafes in Mysuru" />
        <meta
          property="og:description"
          content="Explore Mysuru's best restaurants and cafes with Mysurian."
        />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:url" content="https://mysurian09.web.app/restaurants" />
      </Helmet>
    
    <DataList
      title="Restaurants & Cafes"
      collectionName="restaurants"
      fields={["address", "cuisine"]}
    />
    </>
  );
}
