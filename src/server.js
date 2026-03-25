const express = require("express");
const path = require("path");
const { leads } = require("./data/leads");
const { buildDashboard } = require("./services/dashboardService");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/dashboard", (_, res) => {
  res.json(buildDashboard(leads));
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`LinkedIn enricher dashboard running on http://localhost:${port}`);
});
