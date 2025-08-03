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
      <meta property="og:title" content="Festivals & Events in Mysuru" />
      <meta
        property="og:description"
        content="Stay updated on Mysuru's festivals and events with Mysurian."
      />
      <meta property="og:image" content="/og-image.jpg" />
      <meta property="og:url" content="https://mysurian09.web.app/events" />
    </Helmet>
    <DataList
      title="Festivals & Events"
      collectionName="events"
      fields={["date", "description"]}
    />
    </>
  );
}
