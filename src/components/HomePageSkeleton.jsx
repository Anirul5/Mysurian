import React from "react";
import { Box, Grid, Skeleton, Container } from "@mui/material";

export default function HomePageSkeleton() {
  return (
    <Box>
      <Box
        sx={{ background: "linear-gradient(135deg,#FF7A18,#B13D00)", py: 8 }}
      >
        <Container maxWidth="lg">
          <Skeleton
            variant="text"
            height={56}
            width={420}
            sx={{ bgcolor: "rgba(255,255,255,.4)" }}
          />
          <Skeleton
            variant="text"
            height={32}
            width={520}
            sx={{ bgcolor: "rgba(255,255,255,.3)" }}
          />
          <Skeleton
            variant="rectangular"
            height={48}
            width={520}
            sx={{ mt: 3, borderRadius: 2 }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4 }}>
        <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 3 }} />
      </Container>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} item xs={12} sm={6} md={4}>
              <Skeleton
                variant="rectangular"
                height={220}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
