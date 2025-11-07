const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config();

const Document = require("../backend/models/Document");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb:

/**
 * Generate a random document hash
 */
function generateDocumentHash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Generate sample documents
 */
function generateSampleDocuments() {
  const sampleDocs = [
    {
      name: "Sample Contract Agreement",
      type: "pdf",
      content: "This is a sample contract agreement between parties A and B..."
    },
    {
      name: "Academic Transcript",
      type: "pdf",
      content: "University of Example - Official Transcript for Student ID 12345..."
    },
    {
      name: "Medical Certificate",
      type: "pdf",
      content: "Medical Certificate issued by Dr. Smith on behalf of patient..."
    },
    {
      name: "Property Deed",
      type: "pdf",
      content: "Legal property deed for 123 Main Street, registered on..."
    },
    {
      name: "Insurance Policy",
      type: "pdf",
      content: "Insurance Policy Number INS-2024-001, coverage details..."
    },
    {
      name: "Employment Letter",
      type: "pdf",
      content: "Employment verification letter for John Doe, position: Software Engineer..."
    },
    {
      name: "Tax Return 2024",
      type: "pdf",
      content: "Annual tax return filing for fiscal year 2024..."
    },
    {
      name: "Birth Certificate",
      type: "pdf",
      content: "Official birth certificate issued by City Registry..."
    },
    {
      name: "Vehicle Registration",
      type: "pdf",
      content: "Vehicle registration document for ABC-1234..."
    },
    {
      name: "Diploma Certificate",
      type: "pdf",
      content: "Bachelor of Science in Computer Science, graduated 2023..."
    }
  ];

  return sampleDocs.map((doc, index) => {
    const fileHash = generateDocumentHash(doc.content);
    const blockchainHash = "0x" + generateDocumentHash(fileHash + Date.now().toString());
    
    return {
      fileName: doc.name,
      fileHash: fileHash,
      fileSize: Math.floor(Math.random() * 5000000) + 100000,
      fileType: doc.type,
      uploadedBy: "user" + (index % 3 + 1) + "@example.com",
      blockchainHash: blockchainHash,
      blockchainNetwork: "localhost",
      transactionHash: "0x" + crypto.randomBytes(32).toString("hex"),
      blockNumber: 1000 + index,
      verified: true,
      metadata: {
        description: `Sample document for testing: ${doc.name}`,
        category: ["legal", "academic", "medical", "property", "insurance", "employment", "tax", "identity", "vehicle", "education"][index],
        tags: ["sample", "test", "demo"],
        version: "1.0"
      }
    };
  });
}

/**
 * Seed the database with sample documents
 */
async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");

  try {
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    console.log("🗑️  Clearing existing documents...");
    const deleteResult = await Document.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing documents\n`);

    console.log("📝 Generating sample documents...");
    const sampleDocuments = generateSampleDocuments();
    console.log(`✅ Generated ${sampleDocuments.length} sample documents\n`);

    console.log("💾 Inserting documents into database...");
    const insertedDocs = await Document.insertMany(sampleDocuments);
    console.log(`✅ Successfully inserted ${insertedDocs.length} documents\n`);

    console.log("═══════════════════════════════════════════════════════");
    console.log("📊 Seeding Summary");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`Total Documents: ${insertedDocs.length}`);
    console.log(`Database: ${MONGODB_URI}`);
    console.log("═══════════════════════════════════════════════════════\n");

    console.log("📄 Sample Documents:");
    insertedDocs.slice(0, 3).forEach((doc, index) => {
      console.log(`\n${index + 1}. ${doc.fileName}`);
      console.log(`   File Hash: ${doc.fileHash.substring(0, 20)}...`);
      console.log(`   Blockchain Hash: ${doc.blockchainHash.substring(0, 20)}...`);
      console.log(`   Category: ${doc.metadata.category}`);
      console.log(`   Uploaded By: ${doc.uploadedBy}`);
    });

    console.log("\n✅ Database seeding completed successfully!");

  } catch (error) {
    console.error("\n❌ Error seeding database:");
    console.error(error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n📡 Database connection closed");
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, generateSampleDocuments };
