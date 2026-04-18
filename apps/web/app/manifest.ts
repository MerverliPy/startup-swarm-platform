import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Startup Swarm Platform",
    short_name: "Startup Swarm",
    description:
      "GitHub-authenticated swarm dashboard with installable mobile shell, bounded run execution, and review surfaces.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#111827",
    orientation: "portrait",
    icons: [
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
