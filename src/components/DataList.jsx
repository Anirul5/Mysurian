import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Container,
  Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

// Format helper
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

export default function DataList({ title, collectionName, fields, data }) {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!data) {
      const fetchData = async () => {
        const dataCollection = collection(db, collectionName);
        const snapshot = await getDocs(dataCollection);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Shuffle array (Fisher–Yates algorithm)
        for (let i = list.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [list[i], list[j]] = [list[j], list[i]];
        }
        setItems(list);
      };
      fetchData();
    }
  }, [collectionName, data]);

  const displayItems = (data || items).filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container sx={{ mt: 4 }}>
      {title && (
        <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 4 }}>
          {title}
        </Typography>
      )}

      {/* Search Bar */}
      <Container maxWidth="md">
        <Box sx={{ mt: 5, mb: 5 }}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${title || collectionName}...`}
          />
        </Box>
      </Container>

      {/* Card Grid */}
      <Grid container spacing={3} sx={{ justifyContent: "center" }}>
        {displayItems.map(item => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              sx={{ borderRadius: 3, boxShadow: 3, cursor: "pointer" }}
              onClick={() => navigate(`/${collectionName}/${item.id}`)}
            >
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
