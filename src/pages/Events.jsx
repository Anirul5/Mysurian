import React from "react";
import DataList from "../components/DataList";
import { Helmet } from "react-helmet-async";

export default function Events() {
  return (
    <>
      <Helmet>
        <title>Festivals & Events in Mysuru | Mysurian</title>
        <meta
          name="description"
          content="Stay updated on Mysuru's festivals and events. Discover cultural celebrations, concerts, and more."
        />
      </Helmet>

      <DataList
        collectionName="events"
        fields={["date", "address", "description"]}
        title="Festivals & Events in Mysuru"
      />
    </>
  );
}
