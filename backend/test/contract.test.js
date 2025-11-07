const { expect } = require("chai");
const hre = require("hardhat");

describe("DocumentRegistry Contract", function () {
  let documentRegistry;
  let owner;
  let addr1;
  let addr2;

  const sampleHash1 = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const sampleHash2 = "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321";
  const sampleHash3 = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const sampleMetadata1 = "Test Document 1";
  const sampleMetadata2 = "Test Document 2";

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    const DocumentRegistry = await hre.ethers.getContractFactory("DocumentRegistry");
    documentRegistry = await DocumentRegistry.deploy();
    await documentRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const address = await documentRegistry.getAddress();
      expect(address).to.match(/^0x[a-fA-F0-9]{40}$/);
    });

    it("Should start with zero documents", async function () {
      const count = await documentRegistry.getTotalDocuments();
      expect(Number(count)).to.equal(0);
    });
  });

  describe("Document Registration", function () {
    it("Should register a document successfully", async function () {
      const tx = await documentRegistry.registerDocument(sampleHash1, sampleMetadata1);
      await tx.wait();

      const count = await documentRegistry.getTotalDocuments();
      expect(Number(count)).to.equal(1);
    });

    it("Should emit DocumentRegistered event", async function () {
      const tx = await documentRegistry.registerDocument(sampleHash1, sampleMetadata1);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(log => {
        try {
          const parsed = documentRegistry.interface.parseLog(log);
          return parsed && parsed.name === 'DocumentRegistered';
        } catch (e) {
          return false;
        }
      });
      
      expect(event).to.exist;
    });

    it("Should fail to register with zero hash", async function () {
      const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
      try {
        await documentRegistry.registerDocument(zeroHash, sampleMetadata1);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("InvalidDocumentHash");
      }
    });

    it("Should fail to register duplicate document", async function () {
      await documentRegistry.registerDocument(sampleHash1, sampleMetadata1);
      
      try {
        await documentRegistry.registerDocument(sampleHash1, sampleMetadata1);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("DocumentAlreadyExists");
      }
    });

    it("Should fail with metadata too long", async function () {
      const longMetadata = "a".repeat(257);
      try {
        await documentRegistry.registerDocument(sampleHash1, longMetadata);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("MetadataTooLong");
      }
    });

    it("Should register multiple documents", async function () {
      await documentRegistry.registerDocument(sampleHash1, sampleMetadata1);
      await documentRegistry.registerDocument(sampleHash2, sampleMetadata2);

      const count = await documentRegistry.getTotalDocuments();
      expect(Number(count)).to.equal(2);
    });
  });

  describe("Document Retrieval", function () {
    beforeEach(async function () {
      await documentRegistry.registerDocument(sampleHash1, sampleMetadata1);
    });

    it("Should retrieve document details", async function () {
      const doc = await documentRegistry.getDocument(sampleHash1);
      
      expect(doc[0]).to.equal(sampleHash1);
      expect(doc[1]).to.equal(owner.address);
      expect(doc[3]).to.equal(sampleMetadata1);
      expect(doc[4]).to.equal(true);
    });

    it("Should fail to get non-existent document", async function () {
      try {
        await documentRegistry.getDocument(sampleHash2);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("DocumentNotFound");
      }
    });

    it("Should get document timestamp", async function () {
      const timestamp = await documentRegistry.getDocumentTimestamp(sampleHash1);
      expect(Number(timestamp)).to.be.greaterThan(0);
    });

    it("Should get document owner", async function () {
      const docOwner = await documentRegistry.getDocumentOwner(sampleHash1);
      expect(docOwner).to.equal(owner.address);
    });
  });

  describe("Document Verification", function () {
    beforeEach(async function () {
      await documentRegistry.registerDocument(sampleHash1, sampleMetadata1);
    });

    it("Should verify existing document", async function () {
      const tx = await documentRegistry.verifyDocument(sampleHash1);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(log => {
        try {
          const parsed = documentRegistry.interface.parseLog(log);
          return parsed && parsed.name === 'DocumentVerified';
        } catch (e) {
          return false;
        }
      });
      
      expect(event).to.exist;
    });

    it("Should verify non-existent document as false", async function () {
      const tx = await documentRegistry.verifyDocument(sampleHash2);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(log => {
        try {
          const parsed = documentRegistry.interface.parseLog(log);
          return parsed && parsed.name === 'DocumentVerified';
        } catch (e) {
          return false;
        }
      });
      
      expect(event).to.exist;
    });

    it("Should check document existence (view)", async function () {
      const exists = await documentRegistry.documentExistsView(sampleHash1);
      expect(exists).to.equal(true);

      const notExists = await documentRegistry.documentExistsView(sampleHash2);
      expect(notExists).to.equal(false);
    });
  });

  describe("Owner Documents", function () {
    it("Should track documents by owner", async function () {
      await documentRegistry.connect(addr1).registerDocument(sampleHash1, sampleMetadata1);
      await documentRegistry.connect(addr1).registerDocument(sampleHash2, sampleMetadata2);
      await documentRegistry.connect(addr2).registerDocument(sampleHash3, "Test Doc 3");

      const addr1Docs = await documentRegistry.getDocumentsByOwner(addr1.address);
      const addr2Docs = await documentRegistry.getDocumentsByOwner(addr2.address);

      expect(addr1Docs.length).to.equal(2);
      expect(addr2Docs.length).to.equal(1);
      expect(addr1Docs[0]).to.equal(sampleHash1);
      expect(addr1Docs[1]).to.equal(sampleHash2);
    });

    it("Should get owner document count", async function () {
      await documentRegistry.connect(addr1).registerDocument(sampleHash1, sampleMetadata1);
      await documentRegistry.connect(addr1).registerDocument(sampleHash2, sampleMetadata2);

      const count = await documentRegistry.getOwnerDocumentCount(addr1.address);
      expect(Number(count)).to.equal(2);
    });
  });

  describe("Pagination", function () {
    beforeEach(async function () {
      for (let i = 1; i <= 5; i++) {
        const hash = "0x" + i.toString(16).padStart(64, "0");
        await documentRegistry.registerDocument(hash, `Document ${i}`);
      }
    });

    it("Should get all documents with pagination", async function () {
      const docs = await documentRegistry.getAllDocuments(0, 3);
      expect(docs.length).to.equal(3);
    });

    it("Should handle offset correctly", async function () {
      const docs = await documentRegistry.getAllDocuments(2, 2);
      expect(docs.length).to.equal(2);
    });

    it("Should handle limit exceeding total", async function () {
      const docs = await documentRegistry.getAllDocuments(0, 10);
      expect(docs.length).to.equal(5);
    });

    it("Should return empty array when offset exceeds total", async function () {
      const docs = await documentRegistry.getAllDocuments(10, 5);
      expect(docs.length).to.equal(0);
    });
  });

  describe("Gas Optimization", function () {
    it("Should have reasonable gas cost for registration", async function () {
      const tx = await documentRegistry.registerDocument(sampleHash1, sampleMetadata1);
      const receipt = await tx.wait();
      
      expect(Number(receipt.gasUsed)).to.be.lessThan(300000);
    });

    it("Should have low gas cost for verification", async function () {
      await documentRegistry.registerDocument(sampleHash1, sampleMetadata1);
      
      const tx = await documentRegistry.verifyDocument(sampleHash1);
      const receipt = await tx.wait();
      
      expect(Number(receipt.gasUsed)).to.be.lessThan(100000);
    });
  });
});
