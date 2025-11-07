const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const multer = require("multer");
const Document = require("../models/Document");
const { validateDocumentUpload, validateDocumentVerify } = require("../middleware/validation");
const { registerDocumentOnBlockchain, verifyDocumentOnBlockchain, getDocumentFromBlockchain } = require("../utils/blockchain");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

/**
 * @route   POST /api/documents/upload
 * @desc    Upload and register a document on the blockchain
 * @access  Public
 */
router.post("/upload", upload.single("file"), validateDocumentUpload, async (req, res) => {
  try {
    const { file } = req;
    const { description, category, tags, uploadedBy } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const fileHash = crypto.createHash("sha256").update(file.buffer).digest("hex");

    const existingDoc = await Document.findByFileHash(fileHash);
    if (existingDoc) {
      return res.status(409).json({
        success: false,
        error: "Document already exists in the registry",
        document: {
          id: existingDoc._id,
          fileName: existingDoc.fileName,
          fileHash: existingDoc.fileHash,
          blockchainHash: existingDoc.blockchainHash,
          uploadedAt: existingDoc.createdAt,
        },
      });
    }

    const metadata = JSON.stringify({
      fileName: file.originalname,
      fileType: file.mimetype,
      uploadedBy: uploadedBy || "anonymous",
      uploadedAt: new Date().toISOString(),
      description: description || "",
      category: category || "other",
    });

    const blockchainResult = await registerDocumentOnBlockchain(fileHash, metadata);

    const document = new Document({
      fileName: file.originalname,
      fileHash: fileHash,
      fileSize: file.size,
      fileType: file.mimetype,
      uploadedBy: uploadedBy || "anonymous",
      blockchainHash: blockchainResult.documentHash,
      blockchainNetwork: blockchainResult.network,
      transactionHash: blockchainResult.transactionHash,
      blockNumber: blockchainResult.blockNumber,
      verified: true,
      metadata: {
        description: description || "",
        category: category || "other",
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim())) : [],
        version: "1.0",
      },
      status: "confirmed",
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: "Document successfully registered on blockchain",
      document: {
        id: document._id,
        fileName: document.fileName,
        fileHash: document.fileHash,
        fileSize: document.fileSize,
        fileType: document.fileType,
        uploadedBy: document.uploadedBy,
        blockchainHash: document.blockchainHash,
        transactionHash: document.transactionHash,
        blockNumber: document.blockNumber,
        network: document.blockchainNetwork,
        createdAt: document.createdAt,
        metadata: document.metadata,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to register document on blockchain",
      details: error.message,
    });
  }
});

/**
 * @route   POST /api/documents/verify
 * @desc    Verify a document against the blockchain
 * @access  Public
 */
router.post("/verify", upload.single("file"), validateDocumentVerify, async (req, res) => {
  try {
    const { file } = req;
    const { fileHash: providedHash } = req.body;

    let fileHash;

    if (file) {
      fileHash = crypto.createHash("sha256").update(file.buffer).digest("hex");
    } else if (providedHash) {
      fileHash = providedHash.toLowerCase();
    } else {
      return res.status(400).json({
        success: false,
        error: "Either file or fileHash must be provided",
      });
    }

    const document = await Document.findByFileHash(fileHash);

    if (!document) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: "Document not found in registry",
        fileHash: fileHash,
      });
    }

    const blockchainVerification = await verifyDocumentOnBlockchain(document.blockchainHash);

    await document.incrementVerification();

    res.json({
      success: true,
      verified: blockchainVerification.exists,
      message: blockchainVerification.exists
        ? "Document verified successfully on blockchain"
        : "Document found in database but not verified on blockchain",
      document: {
        id: document._id,
        fileName: document.fileName,
        fileHash: document.fileHash,
        uploadedBy: document.uploadedBy,
        blockchainHash: document.blockchainHash,
        transactionHash: document.transactionHash,
        blockNumber: document.blockNumber,
        network: document.blockchainNetwork,
        registeredAt: document.createdAt,
        verificationCount: document.verificationCount,
        lastVerifiedAt: document.lastVerifiedAt,
        metadata: document.metadata,
      },
      blockchain: blockchainVerification,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify document",
      details: error.message,
    });
  }
});

/**
 * @route   GET /api/documents
 * @desc    Get all documents with pagination and filtering
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      verified,
      uploadedBy,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (category) filter["metadata.category"] = category;
    if (verified !== undefined) filter.verified = verified === "true";
    if (uploadedBy) filter.uploadedBy = new RegExp(uploadedBy, "i");

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const documents = await Document.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const total = await Document.countDocuments(filter);

    res.json({
      success: true,
      documents: documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalDocuments: total,
        documentsPerPage: parseInt(limit),
        hasNextPage: skip + documents.length < total,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve documents",
      details: error.message,
    });
  }
});

/**
 * @route   GET /api/documents/stats
 * @desc    Get document statistics
 * @access  Public
 */
router.get("/stats/overview", async (req, res) => {
  try {
    const stats = await Document.getStatistics();

    res.json({
      success: true,
      statistics: stats,
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve statistics",
      details: error.message,
    });
  }
});

/**
 * @route   GET /api/documents/hash/:hash
 * @desc    Get a document by file hash
 * @access  Public
 */
router.get("/hash/:hash", async (req, res) => {
  try {
    const { hash } = req.params;

    const document = await Document.findByFileHash(hash.toLowerCase());

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found with this hash",
      });
    }

    res.json({
      success: true,
      document: document,
    });
  } catch (error) {
    console.error("Get document by hash error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve document",
      details: error.message,
    });
  }
});

/**
 * @route   GET /api/documents/:id
 * @desc    Get a single document by ID
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id).select("-__v");

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    res.json({
      success: true,
      document: document,
    });
  } catch (error) {
    console.error("Get document error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve document",
      details: error.message,
    });
  }
});

module.exports = router;
