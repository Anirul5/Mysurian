import React from "react";
import { Box, Alert } from "@mui/material";

/**
 * Accepts any of:
 *  - https://www.google.com/maps/embed/v1/place?... (keyed)
 *  - https://www.google.com/maps/embed?pb=...       (keyless)
 *  - a full <iframe ...> string pasted by an admin (we extract the src)
 */
export default function MapEmbed({ value }) {
  if (!value) return null;

  // If admin pasted an entire iframe, extract the src
  const iframeSrcMatch = /<iframe[^>]*\s+src=["']([^"']+)["']/i.exec(value);
  const url = iframeSrcMatch ? iframeSrcMatch[1] : value.trim();

  // Only allow Google Maps embed endpoints
  const ok = /^https:\/\/www\.google\.com\/maps\/embed(?:\/v1\/|)\S+$/i.test(
    url
  );
  if (!ok) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Invalid map URL. Please use Google Maps Embed URLs only.
      </Alert>
    );
  }

  return (
    <Box
      sx={{ width: "100%", height: 400, borderRadius: 2, overflow: "hidden" }}
    >
      <iframe
        src={url}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Location map"
        // sandbox helps harden third-party embeds
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </Box>
  );
}
