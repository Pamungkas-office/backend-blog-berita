import "dotenv/config";
import app from "./server.js";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
