const mongoose = require("mongoose");

/**
 * Document Schema for storing document metadata and blockchain information
 */
const documentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
      maxlength: [255, "File name cannot exceed 255 characters"],
    },
    fileHash: {
      type: String,
      required: [true, "File hash is required"],
      unique: true,
      index: true,
      validate: {
        validator: function (v) {
          return /^[a-f0-9]{64}$/i.test(v);
        },
        message: "Invalid file hash format (must be 64 hex characters)",
      },
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
      min: [0, "File size cannot be negative"],
    },
    fileType: {
      type: String,
      required: [true, "File type is required"],
      trim: true,
    },
    uploadedBy: {
      type: String,
      required: [true, "Uploader information is required"],
      trim: true,
    },
    blockchainHash: {
      type: String,
      required: [true, "Blockchain hash is required"],
      unique: true,
      index: true,
      validate: {
        validator: function (v) {
          return /^0x[a-f0-9]{64}$/i.test(v);
        },
        message: "Invalid blockchain hash format (must start with 0x followed by 64 hex characters)",
      },
    },
    blockchainNetwork: {
      type: String,
      required: [true, "Blockchain network is required"],
      enum: {
        values: ["31337", "localhost", "sepolia", "mainnet", "goerli", "polygon", "mumbai"],
        message: "{VALUE} is not a supported network",
      },
      default: "31337",
    },
    transactionHash: {
      type: String,
      required: [true, "Transaction hash is required"],
      validate: {
        validator: function (v) {
          return /^0x[a-f0-9]{64}$/i.test(v);
        },
        message: "Invalid transaction hash format",
      },
    },
    blockNumber: {
      type: Number,
      required: [true, "Block number is required"],
      min: [0, "Block number cannot be negative"],
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationCount: {
      type: Number,
      default: 0,
      min: [0, "Verification count cannot be negative"],
    },
    lastVerifiedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      description: {
        type: String,
        maxlength: [1000, "Description cannot exceed 1000 characters"],
        default: "",
      },
      category: {
        type: String,
        enum: {
          values: [
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
          ],
          message: "{VALUE} is not a valid category",
        },
        default: "other",
      },
      tags: {
        type: [String],
        default: [],
        validate: {
          validator: function (v) {
            return v.length <= 10;
          },
          message: "Cannot have more than 10 tags",
        },
      },
      version: {
        type: String,
        default: "1.0",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "failed"],
        message: "{VALUE} is not a valid status",
      },
      default: "confirmed",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

documentSchema.index({ createdAt: -1 });
documentSchema.index({ uploadedBy: 1, createdAt: -1 });
documentSchema.index({ "metadata.category": 1 });
documentSchema.index({ status: 1, verified: 1 });

documentSchema.virtual("age").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

documentSchema.methods.incrementVerification = async function () {
  this.verificationCount += 1;
  this.lastVerifiedAt = new Date();
  this.verified = true;
  return this.save();
};

documentSchema.statics.findByFileHash = function (fileHash) {
  return this.findOne({ fileHash });
};

documentSchema.statics.findByBlockchainHash = function (blockchainHash) {
  return this.findOne({ blockchainHash });
};

documentSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        verified: [{ $match: { verified: true } }, { $count: "count" }],
        byCategory: [
          { $group: { _id: "$metadata.category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        byNetwork: [
          { $group: { _id: "$blockchainNetwork", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        byStatus: [
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ],
        recentDocuments: [
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          {
            $project: {
              fileName: 1,
              fileHash: 1,
              uploadedBy: 1,
              createdAt: 1,
              verified: 1,
            },
          },
        ],
        totalVerifications: [
          {
            $group: {
              _id: null,
              total: { $sum: "$verificationCount" },
            },
          },
        ],
      },
    },
  ]);

  return {
    totalDocuments: stats[0].total[0]?.count || 0,
    verifiedDocuments: stats[0].verified[0]?.count || 0,
    byCategory: stats[0].byCategory,
    byNetwork: stats[0].byNetwork,
    byStatus: stats[0].byStatus,
    recentDocuments: stats[0].recentDocuments,
    totalVerifications: stats[0].totalVerifications[0]?.total || 0,
  };
};

documentSchema.pre("save", function (next) {
  if (this.fileHash) {
    this.fileHash = this.fileHash.toLowerCase();
  }
  if (this.blockchainHash) {
    this.blockchainHash = this.blockchainHash.toLowerCase();
  }
  if (this.transactionHash) {
    this.transactionHash = this.transactionHash.toLowerCase();
  }
  next();
});

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
