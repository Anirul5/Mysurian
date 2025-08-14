// HomePageSkeleton.jsx
import React from "react";
import { Box, Grid, Skeleton, Typography, Container } from "@mui/material";

export default function HomePageSkeleton() {
  return (
    <Container sx={{ mt: 4, justifyItems: "center" }}>
      {/* Hero Section Skeleton */}
      {/* <Skeleton
        variant="rectangular"
        width="100%"
        height={400}
        animation="wave"
      /> */}

      {/* Featured Topics Skeleton */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          <Skeleton width={200} />
        </Typography>
        <Grid container spacing={2}>
          {[...Array(1)].map((_, index) => (
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={idx}
                  minWidth={240}
                >
                  <Skeleton
                    variant="rectangular"
                    height={200}
                    sx={{ borderRadius: 2 }}
                    minWidth={240}
                  />
                  <Skeleton variant="text" height={30} minWidth={240} />
                  <Skeleton variant="text" height={20} minWidth={240} />
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
