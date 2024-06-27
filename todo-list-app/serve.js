import { serve } from "bun";

serve({
  port: 3000,
  fetch(req) {
    return new Response(Bun.file("./public/index.html"));
  },
});
