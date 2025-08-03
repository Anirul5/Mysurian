import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Grid, Card, CardContent, CardMedia, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const formatField = (field, value) => {
  switch (field) {
    case "rating":
      return `⭐ ${value}`;
    case "contact":
      return `📞 ${value}`;
    case "cuisine":
      return `🍽️ ${value}`;
    case "date":
      return `📅 ${value}`;
    case "address":
    case "description":
      return value;
    default:
      return value;
  }
};

export default function DataList({ title, collectionName, fields }) {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      const dataCollection = collection(db, collectionName);
      const snapshot = await getDocs(dataCollection);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(list);
    };
    fetchData();
  }, [collectionName]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 4 }}>
        {title}
      </Typography>
      <Grid container spacing={3} sx={{ justifyContent: "center" }}>
        {items.map(item => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, cursor: "pointer" }}
                onClick={() => navigate(`/${collectionName}/${item.id}`)}>
              {item.imageURL && (
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageURL}
                  alt={item.name}
                />
              )}
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.name}
                </Typography>
                {fields.map(field => (
                  item[field] && (
                    <Typography
                      key={field}
                      variant="body2"
                      color={field === "address" ? "text.secondary" : "text.primary"}
                      sx={{ mt: field !== "name" ? 1 : 0 }}
                    >
                      {formatField(field, item[field])}
                    </Typography>
                  )
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
