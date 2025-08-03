import { Helmet } from "react-helmet-async";
import DataList from "../components/DataList";

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
      title="Hotels & Stays"
      collectionName="hotels"
      fields={["address", "rating"]}
    />
    </>
  );
}
