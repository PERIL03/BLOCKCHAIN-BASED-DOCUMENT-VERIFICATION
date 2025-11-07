// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentRegistry
 * @dev A gas-optimized smart contract for registering and verifying document hashes on the blockchain
 * @notice This contract allows users to register document hashes and verify their authenticity
 * @custom:security-contact security@example.com
 */
contract DocumentRegistry {
    /// @dev Structure to store document information
    struct Document {
        bytes32 documentHash;
        address owner;
        uint256 timestamp;
        string metadata;
        bool exists;
    }

    /// @dev Mapping from document hash to Document struct
    mapping(bytes32 => Document) private documents;
    
    /// @dev Mapping to track document hashes registered by each address
    mapping(address => bytes32[]) private ownerDocuments;
    
    /// @dev Array of all registered document hashes
    bytes32[] private allDocumentHashes;
    
    /// @dev Total number of documents registered
    uint256 public documentCount;

    /// @notice Emitted when a new document is registered
    /// @param documentHash The hash of the registered document
    /// @param owner The address that registered the document
    /// @param timestamp The block timestamp when the document was registered
    /// @param metadata Additional metadata about the document
    event DocumentRegistered(
        bytes32 indexed documentHash,
        address indexed owner,
        uint256 timestamp,
        string metadata
    );

    /// @notice Emitted when a document is verified
    /// @param documentHash The hash of the verified document
    /// @param verifier The address that performed the verification
    /// @param exists Whether the document exists in the registry
    event DocumentVerified(
        bytes32 indexed documentHash,
        address indexed verifier,
        bool exists
    );

    /// @dev Error thrown when trying to register a document that already exists
    error DocumentAlreadyExists(bytes32 documentHash);
    
    /// @dev Error thrown when a document hash is invalid (zero)
    error InvalidDocumentHash();
    
    /// @dev Error thrown when querying a non-existent document
    error DocumentNotFound(bytes32 documentHash);
    
    /// @dev Error thrown when metadata exceeds maximum length
    error MetadataTooLong();

    /// @dev Maximum length for metadata string (to prevent gas issues)
    uint256 private constant MAX_METADATA_LENGTH = 256;

    /**
     * @notice Modifier to check if document hash is valid (non-zero)
     * @param _documentHash The document hash to validate
     */
    modifier validDocumentHash(bytes32 _documentHash) {
        if (_documentHash == bytes32(0)) {
            revert InvalidDocumentHash();
        }
        _;
    }

    /**
     * @notice Modifier to check if document does not already exist
     * @param _documentHash The document hash to check
     */
    modifier documentDoesNotExist(bytes32 _documentHash) {
        if (documents[_documentHash].exists) {
            revert DocumentAlreadyExists(_documentHash);
        }
        _;
    }

    /**
     * @notice Modifier to check if document exists
     * @param _documentHash The document hash to check
     */
    modifier documentExists(bytes32 _documentHash) {
        if (!documents[_documentHash].exists) {
            revert DocumentNotFound(_documentHash);
        }
        _;
    }

    /**
     * @notice Modifier to validate metadata length
     * @param _metadata The metadata string to validate
     */
    modifier validMetadata(string memory _metadata) {
        if (bytes(_metadata).length > MAX_METADATA_LENGTH) {
            revert MetadataTooLong();
        }
        _;
    }

    /**
     * @notice Register a new document hash on the blockchain
     * @dev Stores the document hash along with the sender's address, timestamp, and metadata
     * @param _documentHash The SHA-256 hash of the document
     * @param _metadata Additional information about the document (max 256 characters)
     * @return success Returns true if the document was successfully registered
     */
    function registerDocument(
        bytes32 _documentHash,
        string memory _metadata
    )
        external
        validDocumentHash(_documentHash)
        documentDoesNotExist(_documentHash)
        validMetadata(_metadata)
        returns (bool success)
    {
        // Create and store the document
        documents[_documentHash] = Document({
            documentHash: _documentHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            metadata: _metadata,
            exists: true
        });

        // Add to owner's document list
        ownerDocuments[msg.sender].push(_documentHash);
        
        // Add to global document list
        allDocumentHashes.push(_documentHash);
        
        // Increment counter
        unchecked {
            documentCount++;
        }

        // Emit event
        emit DocumentRegistered(_documentHash, msg.sender, block.timestamp, _metadata);

        return true;
    }

    /**
     * @notice Get details of a registered document
     * @dev Retrieves all information about a document from the blockchain
     * @param _documentHash The hash of the document to retrieve
     * @return documentHash The document hash
     * @return owner The address that registered the document
     * @return timestamp The timestamp when the document was registered
     * @return metadata The metadata associated with the document
     * @return exists Whether the document exists in the registry
     */
    function getDocument(bytes32 _documentHash)
        external
        view
        validDocumentHash(_documentHash)
        documentExists(_documentHash)
        returns (
            bytes32 documentHash,
            address owner,
            uint256 timestamp,
            string memory metadata,
            bool exists
        )
    {
        Document memory doc = documents[_documentHash];
        return (
            doc.documentHash,
            doc.owner,
            doc.timestamp,
            doc.metadata,
            doc.exists
        );
    }

    /**
     * @notice Verify if a document hash exists in the registry
     * @dev This is a gas-efficient way to check document existence
     * @param _documentHash The hash of the document to verify
     * @return exists Returns true if the document is registered
     */
    function verifyDocument(bytes32 _documentHash)
        external
        returns (bool exists)
    {
        bool documentExists = documents[_documentHash].exists;
        
        emit DocumentVerified(_documentHash, msg.sender, documentExists);
        
        return documentExists;
    }

    /**
     * @notice Get all documents registered by a specific owner
     * @dev Returns an array of document hashes owned by the specified address
     * @param _owner The address to query
     * @return An array of document hashes
     */
    function getDocumentsByOwner(address _owner)
        external
        view
        returns (bytes32[] memory)
    {
        return ownerDocuments[_owner];
    }

    /**
     * @notice Get the total number of documents registered by an owner
     * @param _owner The address to query
     * @return The number of documents owned
     */
    function getOwnerDocumentCount(address _owner)
        external
        view
        returns (uint256)
    {
        return ownerDocuments[_owner].length;
    }

    /**
     * @notice Get all registered document hashes (paginated)
     * @dev Returns a subset of all document hashes to prevent gas issues
     * @param _offset The starting index
     * @param _limit The maximum number of items to return
     * @return An array of document hashes
     */
    function getAllDocuments(uint256 _offset, uint256 _limit)
        external
        view
        returns (bytes32[] memory)
    {
        uint256 totalDocs = allDocumentHashes.length;
        
        if (_offset >= totalDocs) {
            return new bytes32[](0);
        }

        uint256 end = _offset + _limit;
        if (end > totalDocs) {
            end = totalDocs;
        }

        uint256 resultLength = end - _offset;
        bytes32[] memory result = new bytes32[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allDocumentHashes[_offset + i];
        }

        return result;
    }

    /**
     * @notice Check if a document exists (view function, no event)
     * @param _documentHash The hash to check
     * @return exists Whether the document exists
     */
    function documentExistsView(bytes32 _documentHash)
        external
        view
        returns (bool exists)
    {
        return documents[_documentHash].exists;
    }

    /**
     * @notice Get the timestamp when a document was registered
     * @param _documentHash The hash of the document
     * @return The registration timestamp
     */
    function getDocumentTimestamp(bytes32 _documentHash)
        external
        view
        documentExists(_documentHash)
        returns (uint256)
    {
        return documents[_documentHash].timestamp;
    }

    /**
     * @notice Get the owner of a document
     * @param _documentHash The hash of the document
     * @return The address of the document owner
     */
    function getDocumentOwner(bytes32 _documentHash)
        external
        view
        documentExists(_documentHash)
        returns (address)
    {
        return documents[_documentHash].owner;
    }

    /**
     * @notice Get contract information
     * @return The total number of registered documents
     */
    function getTotalDocuments()
        external
        view
        returns (uint256)
    {
        return documentCount;
    }
}
