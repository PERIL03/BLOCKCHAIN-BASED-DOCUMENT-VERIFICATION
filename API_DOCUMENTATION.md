# 📖 API Documentation

Complete API reference for the Blockchain Document Verification System.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently, the API does not require authentication. Future versions will implement JWT-based authentication.

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Additional error details"]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Endpoints

### Health Check

Check API server status.

#### Request

```http
GET /health
```

#### Response

```json
{
  "status": "ok",
  "timestamp": "2024-11-07T12:00:00.000Z",
  "uptime": 3600,
  "mongodb": "connected",
  "environment": "development"
}
```

---

### API Information

Get API metadata and available endpoints.

#### Request

```http
GET /api
```

#### Response

```json
{
  "name": "Blockchain Document Verification API",
  "version": "1.0.0",
  "description": "API for registering and verifying documents on the blockchain",
  "endpoints": {
    "health": "GET /health",
    "documents": {
      "upload": "POST /api/documents/upload",
      "verify": "POST /api/documents/verify",
      "getAll": "GET /api/documents",
      "getById": "GET /api/documents/:id",
      "getByHash": "GET /api/documents/hash/:hash",
      "stats": "GET /api/documents/stats"
    }
  }
}
```

---

## Documents

### Upload Document

Upload and register a document on the blockchain.

#### Request

```http
POST /api/documents/upload
Content-Type: multipart/form-data
```

**Form Data:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Document file (max 10MB) |
| `uploadedBy` | String | Yes | Name or email (3-100 chars) |
| `category` | String | No | Document category |
| `description` | String | No | Document description (max 1000 chars) |
| `tags` | String | No | Comma-separated tags (max 10) |

**Categories:**
- `legal`
- `academic`
- `medical`
- `property`
- `insurance`
- `employment`
- `tax`
- `identity`
- `vehicle`
- `education`
- `other`

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Document successfully registered on blockchain",
  "document": {
    "id": "507f1f77bcf86cd799439011",
    "fileName": "contract.pdf",
    "fileHash": "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
    "fileSize": 245760,
    "fileType": "application/pdf",
    "uploadedBy": "john@example.com",
    "blockchainHash": "0xa7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
    "transactionHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "blockNumber": 42,
    "network": "localhost",
    "createdAt": "2024-11-07T12:00:00.000Z",
    "metadata": {
      "description": "Employment contract",
      "category": "legal",
      "tags": ["contract", "2024"],
      "version": "1.0"
    }
  }
}
```

#### Error Responses

**400 Bad Request - No file:**
```json
{
  "success": false,
  "error": "No file uploaded"
}
```

**400 Bad Request - Validation error:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "uploadedBy must be at least 3 characters long",
    "description cannot exceed 1000 characters"
  ]
}
```

**409 Conflict - Duplicate:**
```json
{
  "success": false,
  "error": "Document already exists in the registry",
  "document": {
    "id": "507f1f77bcf86cd799439011",
    "fileName": "contract.pdf",
    "fileHash": "a7ffc6f8...",
    "uploadedAt": "2024-11-07T12:00:00.000Z"
  }
}
```

---

### Verify Document

Verify a document against the blockchain registry.

#### Request

```http
POST /api/documents/verify
Content-Type: multipart/form-data
```

**Form Data (Option 1 - By File):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Document to verify |

**Form Data (Option 2 - By Hash):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fileHash` | String | Yes | SHA-256 hash (64 hex chars) |

#### Response (200 OK - Verified)

```json
{
  "success": true,
  "verified": true,
  "message": "Document verified successfully on blockchain",
  "document": {
    "id": "507f1f77bcf86cd799439011",
    "fileName": "contract.pdf",
    "fileHash": "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
    "uploadedBy": "john@example.com",
    "blockchainHash": "0xa7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
    "transactionHash": "0x1234567890abcdef...",
    "blockNumber": 42,
    "network": "localhost",
    "registeredAt": "2024-11-07T12:00:00.000Z",
    "verificationCount": 5,
    "lastVerifiedAt": "2024-11-07T13:00:00.000Z",
    "metadata": {
      "description": "Employment contract",
      "category": "legal"
    }
  },
  "blockchain": {
    "exists": true,
    "transactionHash": "0xabcdef...",
    "document": {
      "documentHash": "0xa7ffc6f8...",
      "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "timestamp": 1699358400,
      "metadata": "{...}",
      "exists": true
    }
  }
}
```

#### Response (404 Not Found - Not Verified)

```json
{
  "success": false,
  "verified": false,
  "message": "Document not found in registry",
  "fileHash": "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"
}
```

---

### Get All Documents

Retrieve all documents with pagination and filtering.

#### Request

```http
GET /api/documents?page=1&limit=10&category=legal&verified=true&uploadedBy=john
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `limit` | Integer | 10 | Items per page (max 100) |
| `category` | String | - | Filter by category |
| `verified` | Boolean | - | Filter by verification status |
| `uploadedBy` | String | - | Filter by uploader (partial match) |
| `sortBy` | String | createdAt | Sort field |
| `order` | String | desc | Sort order (asc/desc) |

**Valid sortBy values:**
- `createdAt`
- `fileName`
- `fileSize`
- `verificationCount`

#### Response (200 OK)

```json
{
  "success": true,
  "documents": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fileName": "contract.pdf",
      "fileHash": "a7ffc6f8...",
      "fileSize": 245760,
      "fileType": "application/pdf",
      "uploadedBy": "john@example.com",
      "blockchainHash": "0xa7ffc6f8...",
      "blockchainNetwork": "localhost",
      "transactionHash": "0x1234...",
      "blockNumber": 42,
      "verified": true,
      "verificationCount": 5,
      "metadata": {
        "category": "legal",
        "description": "Employment contract"
      },
      "createdAt": "2024-11-07T12:00:00.000Z",
      "updatedAt": "2024-11-07T13:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalDocuments": 47,
    "documentsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### Get Document by ID

Retrieve a single document by its database ID.

#### Request

```http
GET /api/documents/:id
```

#### Response (200 OK)

```json
{
  "success": true,
  "document": {
    "_id": "507f1f77bcf86cd799439011",
    "fileName": "contract.pdf",
    "fileHash": "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
    "fileSize": 245760,
    "fileType": "application/pdf",
    "uploadedBy": "john@example.com",
    "blockchainHash": "0xa7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
    "blockchainNetwork": "localhost",
    "transactionHash": "0x1234567890abcdef...",
    "blockNumber": 42,
    "verified": true,
    "verificationCount": 5,
    "lastVerifiedAt": "2024-11-07T13:00:00.000Z",
    "metadata": {
      "description": "Employment contract",
      "category": "legal",
      "tags": ["contract", "2024"],
      "version": "1.0"
    },
    "status": "confirmed",
    "createdAt": "2024-11-07T12:00:00.000Z",
    "updatedAt": "2024-11-07T13:00:00.000Z"
  }
}
```

#### Response (404 Not Found)

```json
{
  "success": false,
  "error": "Document not found"
}
```

---

### Get Document by Hash

Retrieve a document by its file hash.

#### Request

```http
GET /api/documents/hash/:hash
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `hash` | String | SHA-256 file hash (64 hex chars) |

#### Response (200 OK)

Same as Get Document by ID.

#### Response (404 Not Found)

```json
{
  "success": false,
  "error": "Document not found with this hash"
}
```

---

### Get Statistics

Get system-wide statistics and analytics.

#### Request

```http
GET /api/documents/stats/overview
```

#### Response (200 OK)

```json
{
  "success": true,
  "statistics": {
    "totalDocuments": 47,
    "verifiedDocuments": 45,
    "byCategory": [
      { "_id": "legal", "count": 15 },
      { "_id": "academic", "count": 12 },
      { "_id": "medical", "count": 8 }
    ],
    "byNetwork": [
      { "_id": "localhost", "count": 40 },
      { "_id": "sepolia", "count": 7 }
    ],
    "byStatus": [
      { "_id": "confirmed", "count": 45 },
      { "_id": "pending", "count": 2 }
    ],
    "recentDocuments": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "fileName": "contract.pdf",
        "fileHash": "a7ffc6f8...",
        "uploadedBy": "john@example.com",
        "createdAt": "2024-11-07T12:00:00.000Z",
        "verified": true
      }
    ],
    "totalVerifications": 234
  }
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit info is included in response headers

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699359000
```

**Rate Limit Exceeded (429):**
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Examples

### Upload Document (cURL)

```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -F "file=@/path/to/document.pdf" \
  -F "uploadedBy=john@example.com" \
  -F "category=legal" \
  -F "description=Employment contract"
```

### Verify Document by Hash (cURL)

```bash
curl -X POST http://localhost:5000/api/documents/verify \
  -F "fileHash=a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"
```

### Get Documents with Filters (JavaScript)

```javascript
const response = await fetch('http://localhost:5000/api/documents?' + new URLSearchParams({
  page: 1,
  limit: 20,
  category: 'legal',
  verified: true,
  sortBy: 'createdAt',
  order: 'desc'
}));

const data = await response.json();
console.log(data.documents);
```

### Upload Document (JavaScript)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('uploadedBy', 'john@example.com');
formData.append('category', 'legal');
formData.append('description', 'Contract document');

const response = await fetch('http://localhost:5000/api/documents/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.document);
```

---

## Webhooks (Coming Soon)

Future versions will support webhooks for real-time notifications:

- Document uploaded
- Document verified
- Verification failed

---

## Support

For API support:
- **Documentation**: This file
- **GitHub Issues**: [Report an issue](https://github.com/yourusername/blockchain-doc-verify/issues)
- **Email**: api-support@example.com
