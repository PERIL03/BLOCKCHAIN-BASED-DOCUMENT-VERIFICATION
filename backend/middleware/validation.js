/**
 * Validation middleware for document operations
 */

/**
 * Validate document upload request
 */
const validateDocumentUpload = (req, res, next) => {
  const errors = [];

  if (req.body.uploadedBy) {
    const uploadedBy = req.body.uploadedBy.trim();
    if (uploadedBy.length < 3) {
      errors.push("uploadedBy must be at least 3 characters long");
    }
    if (uploadedBy.length > 100) {
      errors.push("uploadedBy cannot exceed 100 characters");
    }
  }

  if (req.body.description) {
    if (req.body.description.length > 1000) {
      errors.push("description cannot exceed 1000 characters");
    }
  }

  const validCategories = [
    "legal",
    "academic",
    "medical",
    "property",
    "insurance",
    "employment",
    "tax",
    "identity",
    "vehicle",
    "education",
    "other",
  ];

  if (req.body.category && !validCategories.includes(req.body.category)) {
    errors.push(`category must be one of: ${validCategories.join(", ")}`);
  }

  if (req.body.tags) {
    const tags = Array.isArray(req.body.tags)
      ? req.body.tags
      : req.body.tags.split(",").map((t) => t.trim());

    if (tags.length > 10) {
      errors.push("cannot have more than 10 tags");
    }

    tags.forEach((tag) => {
      if (tag.length > 50) {
        errors.push("each tag cannot exceed 50 characters");
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};

/**
 * Validate document verification request
 */
const validateDocumentVerify = (req, res, next) => {
  const errors = [];

  if (req.body.fileHash) {
    const hashRegex = /^[a-f0-9]{64}$/i;
    if (!hashRegex.test(req.body.fileHash)) {
      errors.push("fileHash must be a 64-character hexadecimal string (SHA-256)");
    }
  }

  if (!req.file && !req.body.fileHash) {
    errors.push("either file or fileHash must be provided");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const errors = [];

  if (req.query.page) {
    const page = parseInt(req.query.page);
    if (isNaN(page) || page < 1) {
      errors.push("page must be a positive integer");
    }
  }

  if (req.query.limit) {
    const limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit < 1) {
      errors.push("limit must be a positive integer");
    }
    if (limit > 100) {
      errors.push("limit cannot exceed 100");
    }
  }

  const validSortFields = ["createdAt", "fileName", "fileSize", "verificationCount"];
  if (req.query.sortBy && !validSortFields.includes(req.query.sortBy)) {
    errors.push(`sortBy must be one of: ${validSortFields.join(", ")}`);
  }

  const validOrders = ["asc", "desc"];
  if (req.query.order && !validOrders.includes(req.query.order)) {
    errors.push(`order must be one of: ${validOrders.join(", ")}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};

/**
 * Sanitize input to prevent XSS and injection attacks
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (str) => {
    if (typeof str !== "string") return str;
    return str
      .replace(/[<>]/g, "")
      .trim();
  };

  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitize(req.body[key]);
      }
    });
  }

  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === "string") {
        req.query[key] = sanitize(req.query[key]);
      }
    });
  }

  next();
};

module.exports = {
  validateDocumentUpload,
  validateDocumentVerify,
  validatePagination,
  sanitizeInput,
};
