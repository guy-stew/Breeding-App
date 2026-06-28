import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WhelpWise",
    short_name: "WhelpWise",
    description: "WhelpWise — breeding records, kept right.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f1",
    theme_color: "#0f172a",
    icons: [
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
