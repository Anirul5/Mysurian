import React from "react";
import DataList from "../components/DataList";

export default function Events() {
  return (
    <DataList
      title="Festivals & Events"
      collectionName="events"
      fields={["date", "description"]}
    />
  );
}
