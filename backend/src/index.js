import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import requestLogger from "./middleware/requestLogger.js";
import errorHandler from "./middleware/errorHandler.js";

import employeeRoutes from "./routes/employee-routes.js";
import authRoutes from "./routes/auth-routes.js";
import dashboardRoutes from "./routes/dashboard-routes.js";
import attendanceRoutes from "./routes/attendance-routes.js";
import payrollRoutes from "./routes/payroll-routes.js";
import dutyToasterRoutes from "./routes/duty-roaster-routes.js";
import dutyOverrideRoutes from "./routes/duty-overrides-route.js";
import dutyWeeklyScheduleRoutes from "./routes/duty-weekday-route.js";
import salaryRoutes from "./routes/salary-routes.js";
import logger from "./config/logger.js";
import { posthog } from "./config/posthog.js";

import path from "path";
import { fileURLToPath } from "url";

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "..", ".env")
});

// ENV PORT
const port = process.env.PORT || 3000;

const app = express();

// --------------------
// Global Middlewares
// --------------------
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Static File Serving
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --------------------
// API Routes
// --------------------
app.use("/employees", employeeRoutes);
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/payroll", payrollRoutes);
app.use("/duty-toaster", dutyToasterRoutes);
app.use("/duty-overrides", dutyOverrideRoutes);
app.use("/duty-weekly-schedule", dutyWeeklyScheduleRoutes);
app.use("/salary", salaryRoutes);



// Error Handler (LAST)
app.use(errorHandler);

// --------------------
// Start Server
// --------------------
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);

  posthog.capture({
    distinctId: "server",
    event: "backend_server_started",
    properties: {
      port,
      time: new Date().toISOString(),
    },
  });
});
