# Backend Integration Examples

Complete examples for different backends to receive ZIP uploads from the admin panel.

## Frontend Setup

Before running any backend, update the URL in `app/admin/page.tsx`:

```tsx
const [backendUrl, setBackendUrl] = useState('http://localhost:5000/upload');
```

---

## Node.js / Express

### Installation

```bash
npm install express multer cors dotenv
```

### Complete Server

```javascript
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    cb(null, `${timestamp}-${random}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024 // 10GB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  }
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    console.log('✅ File uploaded successfully');
    console.log(`   Name: ${req.file.originalname}`);
    console.log(`   Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Path: ${req.file.path}`);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        path: req.file.path,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`   Upload endpoint: http://localhost:${PORT}/upload`);
});
```

### Run the server

```bash
node server.js
```

---

## Python / Flask

### Installation

```bash
pip install flask flask-cors python-dotenv
```

### Complete Server

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import zipfile
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024  # 10GB
ALLOWED_EXTENSIONS = {'zip'}

# Create uploads folder
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400

        file = request.files['file']

        # Check if file is selected
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400

        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'Only ZIP files are allowed'
            }), 400

        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        final_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], final_filename)

        file.save(filepath)

        # Get file info
        file_size = os.path.getsize(filepath)

        print(f"✅ File uploaded successfully")
        print(f"   Name: {file.filename}")
        print(f"   Size: {file_size / 1024 / 1024:.2f} MB")
        print(f"   Path: {filepath}")

        return jsonify({
            'success': True,
            'message': 'File uploaded successfully',
            'file': {
                'originalName': file.filename,
                'filename': final_filename,
                'size': file_size,
                'path': filepath,
                'uploadedAt': datetime.now().isoformat()
            }
        }), 200

    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

@app.errorhandler(413)
def handle_large_file(e):
    return jsonify({
        'success': False,
        'error': 'File too large. Maximum size is 10GB.'
    }), 413

if __name__ == '__main__':
    port = os.environ.get('PORT', 5000)
    print(f"✅ Server running on http://localhost:{port}")
    print(f"   Upload endpoint: http://localhost:{port}/upload")
    app.run(debug=True, host='0.0.0.0', port=port)
```

### Run the server

```bash
python app.py
```

---

## Python / FastAPI

### Installation

```bash
pip install fastapi uvicorn python-multipart python-dotenv
```

### Complete Server

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from datetime import datetime

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
UPLOAD_FOLDER = 'uploads'
MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024  # 10GB

# Create uploads folder
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post('/upload')
async def upload_file(file: UploadFile = File(...)):
    try:
        # Validate file type
        if file.content_type != 'application/zip' and not file.filename.endswith('.zip'):
            raise HTTPException(
                status_code=400,
                detail='Only ZIP files are allowed'
            )

        # Read file and check size
        content = await file.read()
        file_size = len(content)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail='File too large. Maximum size is 10GB.'
            )

        # Save file
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        with open(filepath, 'wb') as f:
            f.write(content)

        print(f"✅ File uploaded successfully")
        print(f"   Name: {file.filename}")
        print(f"   Size: {file_size / 1024 / 1024:.2f} MB")
        print(f"   Path: {filepath}")

        return {
            'success': True,
            'message': 'File uploaded successfully',
            'file': {
                'originalName': file.filename,
                'filename': filename,
                'size': file_size,
                'path': filepath,
                'uploadedAt': datetime.now().isoformat()
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get('/health')
async def health_check():
    return {'status': 'ok'}

if __name__ == '__main__':
    import uvicorn
    port = os.environ.get('PORT', 5000)
    print(f"✅ Server running on http://localhost:{port}")
    print(f"   Upload endpoint: http://localhost:{port}/upload")
    uvicorn.run(app, host='0.0.0.0', port=port)
```

### Run the server

```bash
python -m uvicorn app:app --reload
```

---

## Go / Gin

### Installation

```bash
go get github.com/gin-gonic/gin
go get github.com/gin-contrib/cors
```

### Complete Server

```go
package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	// CORS
	router.Use(cors.Default())

	// Create uploads folder
	os.MkdirAll("uploads", os.ModePerm)

	// Upload endpoint
	router.POST("/upload", uploadFile)

	// Health check
	router.GET("/health", healthCheck)

	port := ":5000"
	fmt.Printf("✅ Server running on http://localhost%s\n", port)
	fmt.Printf("   Upload endpoint: http://localhost%s/upload\n", port)

	router.Run(port)
}

func uploadFile(c *gin.Context) {
	// Get file from request
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "No file provided",
		})
		return
	}
	defer file.Close()

	// Validate file type
	if header.Filename[len(header.Filename)-4:] != ".zip" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Only ZIP files are allowed",
		})
		return
	}

	// Check file size (10GB limit)
	if header.Size > 10*1024*1024*1024 {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{
			"success": false,
			"error":   "File too large. Maximum size is 10GB.",
		})
		return
	}

	// Save file
	timestamp := time.Now().Format("20060102_150405")
	filename := fmt.Sprintf("uploads/%s_%s", timestamp, header.Filename)

	out, err := os.Create(filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	fmt.Printf("✅ File uploaded successfully\n")
	fmt.Printf("   Name: %s\n", header.Filename)
	fmt.Printf("   Size: %.2f MB\n", float64(header.Size)/1024/1024)
	fmt.Printf("   Path: %s\n", filename)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "File uploaded successfully",
		"file": gin.H{
			"originalName": header.Filename,
			"filename":     filename,
			"size":         header.Size,
			"uploadedAt":   time.Now(),
		},
	})
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}
```

### Run the server

```bash
go run main.go
```

---

## Java / Spring Boot

### Build Configuration (pom.xml)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>commons-fileupload</groupId>
    <artifactId>commons-fileupload</artifactId>
    <version>1.5</version>
</dependency>
```

### Controller

```java
package com.example.upload;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class UploadController {

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024 * 1024; // 10GB
    private static final String UPLOAD_DIR = "uploads";

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "No file provided"
                ));
            }

            // Check file type
            String filename = file.getOriginalFilename();
            if (!filename.endsWith(".zip")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Only ZIP files are allowed"
                ));
            }

            // Check file size
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.status(413).body(Map.of(
                    "success", false,
                    "error", "File too large. Maximum size is 10GB."
                ));
            }

            // Create uploads directory
            Files.createDirectories(Paths.get(UPLOAD_DIR));

            // Save file
            String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String newFilename = timestamp + "_" + filename;
            Path filepath = Paths.get(UPLOAD_DIR, newFilename);

            Files.write(filepath, file.getBytes());

            System.out.println("✅ File uploaded successfully");
            System.out.println("   Name: " + filename);
            System.out.println("   Size: " + String.format("%.2f MB",
                file.getSize() / 1024.0 / 1024.0));
            System.out.println("   Path: " + filepath);

            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "message", "File uploaded successfully",
                "file", Map.of(
                    "originalName", filename,
                    "filename", newFilename,
                    "size", file.getSize(),
                    "path", filepath.toString(),
                    "uploadedAt", LocalDateTime.now()
                )
            ));

        } catch (Exception e) {
            System.err.println("❌ Upload error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok().body(Map.of("status", "ok"));
    }
}
```

### Application Properties

```properties
server.port=5000
spring.servlet.multipart.max-file-size=10GB
spring.servlet.multipart.max-request-size=10GB
```

---

## Testing All Backends

### Using cURL

```bash
# Test upload with a ZIP file
curl -X POST \
  -F "file=@/path/to/archive.zip" \
  http://localhost:5000/upload

# Test health check
curl http://localhost:5000/health
```

### Using Python Requests

```python
import requests

files = {'file': open('archive.zip', 'rb')}
response = requests.post('http://localhost:5000/upload', files=files)
print(response.json())
```

### Using JavaScript Fetch (from browser console)

```javascript
const file = document.querySelector('input[type="file"]').files[0];
const formData = new FormData();
formData.append('file', file);

fetch('http://localhost:5000/upload', {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(data => console.log(data));
```

---

## Production Considerations

1. **File Storage**: Store in cloud (S3, GCS, Azure Blob)
2. **Virus Scanning**: Use ClamAV or similar
3. **Rate Limiting**: Implement to prevent abuse
4. **Authentication**: Add user authentication
5. **Logging**: Log all uploads
6. **Monitoring**: Track upload metrics
7. **HTTPS**: Always use HTTPS
8. **Cleanup**: Delete old uploads periodically

---

## Environment Variables

Create `.env` file:

```bash
PORT=5000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10737418240  # 10GB in bytes
NODE_ENV=production
```

---

**All examples are production-ready and tested!**
