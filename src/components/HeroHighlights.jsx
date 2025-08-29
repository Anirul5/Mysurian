// src/components/HeroHighlights.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Skeleton,
  Typography,
  Chip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useAllItems from "../hooks/useAllItems";

const isTruthy = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "1" || s === "true" || s === "yes" || s === "y" || s === "on";
  }
  return false;
};
const toOrder = (v) => (Number.isFinite(+v) ? +v : 999);
const stripHtml = (html) => {
  if (!html) return "";
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent || el.innerText || "";
};

export default function HeroHighlights() {
  const { allItems, loading } = useAllItems();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const heroes = useMemo(
    () =>
      (allItems || [])
        .filter((i) => isTruthy(i?.hero) || isTruthy(i?.banner))
        .sort((a, b) => toOrder(a?.heroOrder) - toOrder(b?.heroOrder))
        .slice(0, 5),
    [allItems]
  );

  const [idx, setIdx] = useState(0);
  const total = heroes.length;

  const hoverRef = useRef(false);
  const timerRef = useRef(null);
  const next = () => setIdx((p) => (p + 1) % Math.max(total, 1));
  const prev = () =>
    setIdx((p) => (p - 1 + Math.max(total, 1)) % Math.max(total, 1));
  const go = (i) => setIdx(i);

  useEffect(() => {
    if (!total) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!hoverRef.current) next();
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [total]);

  useEffect(() => {
    if (idx >= total) setIdx(0);
  }, [total, idx]);

  // swipe (simple)
  const ref = useRef(null);
  const drag = useRef({ a: false, x: 0, y: 0, dx: 0, dy: 0, t: 0 });
  const SWIPE = 50,
    TIME = 1000;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ts = (e) => {
      drag.current = {
        a: true,
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        dx: 0,
        dy: 0,
        t: Date.now(),
      };
      hoverRef.current = true;
    };
    const tm = (e) => {
      if (!drag.current.a) return;
      drag.current.dx = e.touches[0].clientX - drag.current.x;
      drag.current.dy = e.touches[0].clientY - drag.current.y;
    };
    const te = () => {
      const d = drag.current;
      if (!d.a) return;
      const fast = Date.now() - d.t < TIME;
      if (Math.abs(d.dx) > Math.abs(d.dy) && Math.abs(d.dx) > SWIPE && fast) {
        d.dx < 0 ? next() : prev();
      }
      d.a = false;
      setTimeout(() => (hoverRef.current = false), 150);
    };
    el.addEventListener("touchstart", ts, { passive: true });
    el.addEventListener("touchmove", tm, { passive: true });
    el.addEventListener("touchend", te, { passive: true });
    return () => {
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchmove", tm);
      el.removeEventListener("touchend", te);
    };
  }, []);

  const height = { xs: 320, sm: 520, md: 600 };

  if (loading)
    return (
      <Box sx={{ width: "100%", mb: 6, height: "250px" }}>
        <Skeleton variant="rectangular" width="100%" height="250px" />
      </Box>
    );
  if (!total) return null;

  return (
    <Box
      ref={ref}
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
      sx={{
        position: "relative",
        width: "100%",
        height,
        mb: 6,
        overflow: "hidden",
        userSelect: "none",
        touchAction: "pan-y",
      }}
    >
      {heroes.map((item, i) => (
        <Box
          key={item.id}
          sx={{
            position: "absolute",
            inset: 0,
            opacity: i === idx ? 1 : 0,
            transition: "opacity 600ms ease",
            pointerEvents: i === idx ? "auto" : "none",
          }}
        >
          {/* Background */}
          <Box
            component="img"
            src={item.image || "/fallback.jpg"}
            alt={item.name || "Highlight"}
            loading="lazy"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Vignette (edges darker + bottom text zone) */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(60% 80% at 20% 60%, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 100%), linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.45) 85%)",
            }}
          />

          {/* Glass card with text */}
          <Box
            sx={{
              position: "absolute",
              left: { xs: 16, sm: 40 },
              bottom: { xs: 20, sm: 40 },
              pr: { xs: 16, sm: 0 },
              maxWidth: 760,
            }}
          >
            <Box
              sx={{
                bgcolor: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                borderRadius: 2,
                p: { xs: 2, sm: 3 },
                color: "white",
              }}
            >
              {/* Optional category chip if you store it */}
              {item.categoryName && (
                <Chip
                  label={item.categoryName}
                  size="small"
                  sx={{
                    mb: 1,
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "#fff",
                  }}
                />
              )}

              <Typography
                variant={isSm ? "h5" : "h3"}
                sx={{ fontWeight: 800, lineHeight: 1.15 }}
              >
                {item.name || item.title || "Highlight"}
              </Typography>

              {!!item.description && (
                <Typography
                  variant={isSm ? "body2" : "h6"}
                  sx={{
                    mt: 1.25,
                    opacity: 0.95,
                    display: "-webkit-box",
                    WebkitLineClamp: isSm ? 2 : 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {stripHtml(item.description)}
                </Typography>
              )}

              <Box sx={{ mt: 2.5 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size={isSm ? "medium" : "large"}
                  onClick={() => navigate(`/${item.categoryId}/${item.id}`)}
                  sx={{
                    fontWeight: 700,
                    px: { xs: 2.5, sm: 4 },
                    py: { xs: 1, sm: 1.15 },
                    borderRadius: 999,
                    textTransform: "none",
                    boxShadow: "0 6px 20px rgba(255,165,0,0.35)",
                  }}
                >
                  View Details
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      ))}

      {/* Arrows — float just outside the content zone */}
      <IconButton aria-label="Previous" onClick={prev} sx={arrowSx("left")}>
        <ChevronLeft fontSize="large" />
      </IconButton>
      <IconButton aria-label="Next" onClick={next} sx={arrowSx("right")}>
        <ChevronRight fontSize="large" />
      </IconButton>

      {/* Dots (higher, tighter) */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 18,
          display: "flex",
          justifyContent: "center",
          gap: 1,
          pointerEvents: "none",
        }}
      >
        {heroes.map((_, i) => (
          <Box
            key={i}
            onClick={() => go(i)}
            sx={{
              pointerEvents: "auto",
              width: i === idx ? 22 : 10,
              height: 10,
              borderRadius: 999,
              bgcolor: i === idx ? "secondary.main" : "rgba(255,255,255,0.6)",
              cursor: "pointer",
              transition: "all .25s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

function arrowSx(side) {
  return {
    position: "absolute",
    top: "50%",
    [side]: { xs: 10, sm: 24 },
    transform: "translateY(-50%)",
    bgcolor: "rgba(0,0,0,0.38)",
    color: "white",
    "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
  };
}
