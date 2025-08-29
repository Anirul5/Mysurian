import { Card, CardContent, Skeleton } from "@mui/material";

export function ItemSkeleton() {
  return (
    <Card
      sx={{
        width: 200,
        height: 250,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Skeleton variant="rectangular" width="100%" height={160} />
      <CardContent>
        <Skeleton width="80%" height={20} />
      </CardContent>
    </Card>
  );
}
