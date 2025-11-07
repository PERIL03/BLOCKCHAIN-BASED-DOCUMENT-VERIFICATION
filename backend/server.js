const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
require("dotenv").config();

const documentRoutes = require("./routes/documents");

const app = express();

app.use(helmet());
// Configure CORS for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CLIENT_URL 
      ? process.env.CLIENT_URL.split(',').map(url => url.trim())
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

app.use("/api", limiter);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/document-verification";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  });

app.get("/health", (req, res) => {
  const healthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || "development",
  };
  res.json(healthCheck);
});

app.use("/api/documents", documentRoutes);

app.get("/api", (req, res) => {
  res.json({
    name: "Blockchain Document Verification API",
    version: "1.0.0",
    description: "API for registering and verifying documents on the blockchain",
    endpoints: {
      health: "GET /health",
      documents: {
        upload: "POST /api/documents/upload",
        verify: "POST /api/documents/verify",
        getAll: "GET /api/documents",
        getById: "GET /api/documents/:id",
        getByHash: "GET /api/documents/hash/:hash",
        stats: "GET /api/documents/stats",
      },
    },
    documentation: "/api-docs",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
  });
});

app.use((error, req, res, next) => {
  console.error("Error:", error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: Object.values(error.errors).map((err) => err.message),
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      error: "Document already exists",
    });
  }

  res.status(error.status || 500).json({
    success: false,
    error: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

if (require.main === module) {
  const server = app.listen(PORT, HOST, () => {
    console.log(`\n🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`📡 MongoDB: ${mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"}`);
    console.log(`🔗 Blockchain Network: ${process.env.BLOCKCHAIN_NETWORK || "localhost"}`);
    console.log(`\n✨ API Documentation: http://${HOST}:${PORT}/api`);
    console.log(`❤️  Health Check: http://${HOST}:${PORT}/health\n`);
  });

  process.on("SIGTERM", () => {
    console.log("\n⚠️  SIGTERM signal received: closing HTTP server");
    server.close(() => {
      console.log("✅ HTTP server closed");
      mongoose.connection.close(false, () => {
        console.log("✅ MongoDB connection closed");
        process.exit(0);
      });
    });
  });

  process.on("SIGINT", () => {
    console.log("\n⚠️  SIGINT signal received: closing HTTP server");
    server.close(() => {
      console.log("✅ HTTP server closed");
      mongoose.connection.close(false, () => {
        console.log("✅ MongoDB connection closed");
        process.exit(0);
      });
    });
  });
}

module.exports = app;
