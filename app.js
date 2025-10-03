const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3001;

// Routes
const UserRoutes = require("./routes/UserRoutes");
const TransactionRoutes = require("./routes/TransactionRoutes");
const RewardRoutes = require("./routes/RewardRoutes");
const RewardTierRoutes = require("./routes/RewardTierRoutes");
const ProductPromoRoutes = require("./routes/ProductPromoRoutes");
const PointsRoutes = require("./routes/PointsRoutes");
const EventsRoutes = require("./routes/EventsRoutes");
const path = require("path");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  "/api",
  UserRoutes,
  TransactionRoutes,
  RewardRoutes,
  RewardTierRoutes,
  ProductPromoRoutes,
  PointsRoutes,
  EventsRoutes
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend success connected",
    timeStamp: new Date().toString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
