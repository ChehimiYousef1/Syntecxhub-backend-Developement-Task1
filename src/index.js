require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const errorHandler = require("../errors/errorHandler");
const notFound = require("../errors/notFound");
const AppError = require("../utils/AppError");

const connectDB = require("../config/db");
const runMigrations = require("../migrations/runMigrations");

const usersRouter = require("./routes/UserRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

/* Swagger */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Syntecxhub Backend - Users API",
      version: "1.0.0",
      description:
        "Users CRUD API for Syntecxhub.\n\nDeveloper: Youssef El Chehimi",
       contact: {
        name: "Youssef El Chehimi",
        email: "Youssef@openmindsaihamburg.com"
      }
    },
   servers: [
      {
        url: "https://syntecxhub-api.onrender.com",
        description: "Production server"
      }
    ]
  },
  apis: ["./src/routes/*.js"]
};
console.log(`🚀 Running on ${PORT}`);
const specs = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/api-docs.json", (req, res) => res.json(specs));

app.use(express.json());

/**
 * @swagger
 * /hello:
 *   get:
 *     tags:
 *       - Default's Api's
 *     summary: Health check endpoint
 *     description: Returns a simple response to verify that the API is running correctly.
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
app.get("/hello", (req, res) => {
  res.json({ ok: true , message: "Simple message\n hello from Youssef El Chehimi Developer"});
});

/**
 * @swagger
 * /test-error:
 *   get:
 *     tags:
 *       - Error Handling Api's
 *     summary: Trigger error handler
 *     description: This endpoint intentionally throws an error to test global error handling middleware.
 *     responses:
 *       400:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 */
app.get("/test-error", (req, res, next) => {
  next(new AppError("Something went wrong", 400));
});


/* Routes */
app.use("/users", usersRouter);

// 404 handler (after all routes)
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: `[NOT FOUND] ${req.method} ${req.originalUrl} - This route does not exist` });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
});

/* Error pipeline */
app.use(notFound);
app.use(errorHandler);

/* Start server */
const startServer = async () => {
  try {
    await connectDB();
    await runMigrations();

    app.listen(PORT, () => {
      console.log(`🚀 Running on ${PORT}`);
    });

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

startServer();


