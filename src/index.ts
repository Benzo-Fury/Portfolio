import { serve } from "bun";
import index from "./index.html";

const server = serve({
  port: 8879,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // "/public/logo.svg": new Response(
    //   await Bun.file("./src/public/logo.svg").bytes(),
    //   { headers: { "Content-Type": "image/svg+xml" } }
    // ),
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
