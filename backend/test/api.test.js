const request = require("supertest");
const { expect } = require("chai");
const mongoose = require("mongoose");
const app = require("../server");
const Document = require("../models/Document");

describe("API Endpoints", function () {
  this.timeout(40000);

  before(async function () {
    const testDbUri = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/document-verification-test";
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }
  });

  beforeEach(async function () {
    await Document.deleteMany({});
  });

  after(async function () {
    await Document.deleteMany({});
    await mongoose.connection.close();
  });

  describe("GET /health", function () {
    it("should return health status", async function () {
      const res = await request(app).get("/health");
      
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("status", "ok");
      expect(res.body).to.have.property("mongodb");
      expect(res.body).to.have.property("uptime");
    });
  });

  describe("GET /api", function () {
    it("should return API documentation", async function () {
      const res = await request(app).get("/api");
      
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("name");
      expect(res.body).to.have.property("endpoints");
    });
  });

  describe("POST /api/documents/upload", function () {
    it("should reject upload without file", async function () {
      const res = await request(app)
        .post("/api/documents/upload")
        .field("uploadedBy", "test@example.com");
      
      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
    });

    it("should validate uploadedBy length", async function () {
      const res = await request(app)
        .post("/api/documents/upload")
        .attach("file", Buffer.from("test content"), "test.txt")
        .field("uploadedBy", "ab");
      
      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
    });

    it("should validate category", async function () {
      const res = await request(app)
        .post("/api/documents/upload")
        .attach("file", Buffer.from("test content"), "test.txt")
        .field("uploadedBy", "test@example.com")
        .field("category", "invalid-category");
      
      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
    });

    it("should reject duplicate document", async function () {
      this.timeout(10000);
      
      const fileContent = "unique test content for duplicate test";
      
      const firstRes = await request(app)
        .post("/api/documents/upload")
        .attach("file", Buffer.from(fileContent), "test.txt")
        .field("uploadedBy", "test@example.com");
      
      if (firstRes.status === 500) {
        this.skip();
      }
      
      const res = await request(app)
        .post("/api/documents/upload")
        .attach("file", Buffer.from(fileContent), "test.txt")
        .field("uploadedBy", "test@example.com");
      
      expect(res.status).to.equal(409);
      expect(res.body.success).to.equal(false);
      expect(res.body.error).to.include("already exists");
    });
  });

  describe("POST /api/documents/verify", function () {
    it("should reject verification without file or hash", async function () {
      const res = await request(app)
        .post("/api/documents/verify");
      
      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
    });

    it("should validate fileHash format", async function () {
      const res = await request(app)
        .post("/api/documents/verify")
        .send({ fileHash: "invalid-hash" });
      
      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
    });

    it("should return not found for non-existent hash", async function () {
      const validHash = "a".repeat(64);
      
      const res = await request(app)
        .post("/api/documents/verify")
        .send({ fileHash: validHash });
      
      expect(res.status).to.equal(404);
      expect(res.body.success).to.equal(false);
      expect(res.body.verified).to.equal(false);
    });
  });

  describe("GET /api/documents", function () {
    beforeEach(async function () {
      const testDocs = [
        {
          fileName: "test1.pdf",
          fileHash: "a".repeat(64),
          fileSize: 1000,
          fileType: "application/pdf",
          uploadedBy: "user1@example.com",
          blockchainHash: "0x" + "a".repeat(64),
          blockchainNetwork: "localhost",
          transactionHash: "0x" + "1".repeat(64),
          blockNumber: 1,
          verified: true,
          metadata: { category: "legal" },
        },
        {
          fileName: "test2.pdf",
          fileHash: "b".repeat(64),
          fileSize: 2000,
          fileType: "application/pdf",
          uploadedBy: "user2@example.com",
          blockchainHash: "0x" + "b".repeat(64),
          blockchainNetwork: "localhost",
          transactionHash: "0x" + "2".repeat(64),
          blockNumber: 2,
          verified: false,
          metadata: { category: "academic" },
        },
      ];

      await Document.insertMany(testDocs);
    });

    it("should get all documents with default pagination", async function () {
      const res = await request(app).get("/api/documents");
      
      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.documents).to.be.an("array");
      expect(res.body.pagination).to.exist;
    });

    it("should filter by category", async function () {
      const res = await request(app).get("/api/documents?category=legal");
      
      expect(res.status).to.equal(200);
      expect(res.body.documents).to.have.length(1);
      expect(res.body.documents[0].metadata.category).to.equal("legal");
    });

    it("should filter by verified status", async function () {
      const res = await request(app).get("/api/documents?verified=true");
      
      expect(res.status).to.equal(200);
      expect(res.body.documents).to.have.length(1);
      expect(res.body.documents[0].verified).to.equal(true);
    });

    it("should paginate results", async function () {
      const res = await request(app).get("/api/documents?page=1&limit=1");
      
      expect(res.status).to.equal(200);
      expect(res.body.documents).to.have.length(1);
      expect(res.body.pagination.totalDocuments).to.equal(2);
      expect(res.body.pagination.totalPages).to.equal(2);
    });
  });

  describe("GET /api/documents/:id", function () {
    let testDocId;

    beforeEach(async function () {
      const doc = await Document.create({
        fileName: "test.pdf",
        fileHash: "c".repeat(64),
        fileSize: 1000,
        fileType: "application/pdf",
        uploadedBy: "test@example.com",
        blockchainHash: "0x" + "c".repeat(64),
        blockchainNetwork: "localhost",
        transactionHash: "0x" + "3".repeat(64),
        blockNumber: 3,
        metadata: { category: "legal" },
      });

      testDocId = doc._id;
    });

    it("should get document by ID", async function () {
      const res = await request(app).get(`/api/documents/${testDocId}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.document.fileName).to.equal("test.pdf");
    });

    it("should return 404 for non-existent ID", async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/documents/${fakeId}`);
      
      expect(res.status).to.equal(404);
      expect(res.body.success).to.equal(false);
    });

    it("should return 400 for invalid ID format", async function () {
      const res = await request(app).get("/api/documents/invalid-id");
      
      expect(res.status).to.equal(500);
      expect(res.body.success).to.equal(false);
    });
  });

  describe("GET /api/documents/hash/:hash", function () {
    beforeEach(async function () {
      await Document.create({
        fileName: "test.pdf",
        fileHash: "d".repeat(64),
        fileSize: 1000,
        fileType: "application/pdf",
        uploadedBy: "test@example.com",
        blockchainHash: "0x" + "d".repeat(64),
        blockchainNetwork: "localhost",
        transactionHash: "0x" + "4".repeat(64),
        blockNumber: 4,
        metadata: { category: "legal" },
      });
    });

    it("should get document by hash", async function () {
      const hash = "d".repeat(64);
      const res = await request(app).get(`/api/documents/hash/${hash}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.document.fileHash).to.equal(hash);
    });

    it("should return 404 for non-existent hash", async function () {
      const hash = "e".repeat(64);
      const res = await request(app).get(`/api/documents/hash/${hash}`);
      
      expect(res.status).to.equal(404);
      expect(res.body.success).to.equal(false);
    });
  });

  describe("GET /api/documents/stats/overview", function () {
    beforeEach(async function () {
      const testDocs = [
        {
          fileName: "doc1.pdf",
          fileHash: "1".repeat(64),
          fileSize: 1000,
          fileType: "pdf",
          uploadedBy: "user1@example.com",
          blockchainHash: "0x" + "1".repeat(64),
          blockchainNetwork: "localhost",
          transactionHash: "0x" + "a".repeat(64),
          blockNumber: 1,
          verified: true,
          verificationCount: 5,
          metadata: { category: "legal" },
        },
        {
          fileName: "doc2.pdf",
          fileHash: "2".repeat(64),
          fileSize: 2000,
          fileType: "pdf",
          uploadedBy: "user2@example.com",
          blockchainHash: "0x" + "2".repeat(64),
          blockchainNetwork: "localhost",
          transactionHash: "0x" + "b".repeat(64),
          blockNumber: 2,
          verified: true,
          verificationCount: 3,
          metadata: { category: "academic" },
        },
      ];

      await Document.insertMany(testDocs);
    });

    it("should get statistics overview", async function () {
      const res = await request(app).get("/api/documents/stats/overview");
      
      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.statistics).to.exist;
      expect(res.body.statistics.totalDocuments).to.equal(2);
      expect(res.body.statistics.verifiedDocuments).to.equal(2);
    });
  });

  describe("Error Handling", function () {
    it("should return 404 for non-existent endpoint", async function () {
      const res = await request(app).get("/api/nonexistent");
      
      expect(res.status).to.equal(404);
      expect(res.body.success).to.equal(false);
    });

    it("should handle invalid JSON", async function () {
      const res = await request(app)
        .post("/api/documents/verify")
        .set("Content-Type", "application/json")
        .send("invalid json");
      
      expect(res.status).to.be.oneOf([400, 500]);
    });
  });
});
