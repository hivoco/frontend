# Admin ZIP Upload - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Update Backend URL

Edit `app/admin/page.tsx` (line 9):

```tsx
const [backendUrl, setBackendUrl] = useState('YOUR_BACKEND_URL_HERE');
```

Example:
```tsx
const [backendUrl, setBackendUrl] = useState('https://api.example.com/upload');
```

### Step 2: Access the Page

Navigate to:
```
http://localhost:3000/admin
```

### Step 3: Upload a ZIP File

Users can:
1. Drag and drop a ZIP file
2. Click "Select ZIP File" button
3. See real-time progress with percentage
4. View rotating tips during upload
5. Get success message when done

---

## 📋 What Users See

### Idle State
- Upload icon with gradient background
- "Upload Your ZIP File" heading
- Max size: 10 GB info
- Link to fast.com for speed check
- Select ZIP File button

### During Upload
- Animated loading spinner
- Real-time progress bar (0-100%)
- Uploaded bytes / Total bytes display
- Rotating tips (every 4 seconds)
- Status messages (every 2 seconds)
- Cancel Upload button

### Success State
- Success celebration card
- Total uploaded file size
- Tips for next time
- Upload Another File button
- View Details button

### Error State
- Clear error message with icon
- Allow retry

---

## 🔧 Backend Requirements

Your backend should accept:
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Field Name**: `file`
- **Max Size**: Handle up to 10GB
- **Response**: HTTP 200-299 for success

### Express.js Example

```javascript
const express = require('express');
const multer = require('multer');

app.post('/upload', multer().single('file'), (req, res) => {
  const file = req.file;

  // Process ZIP here
  console.log('Received:', file.originalname, file.size);

  // Send success
  res.json({ success: true });
});
```

### Python Flask Example

```python
from flask import Flask, request

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']

    # Process ZIP here
    print(f'Received: {file.filename} ({file.content_length} bytes)')

    # Send success
    return {'success': True}
```

---

## 🎨 Customization

### Change Max File Size

Edit `components/ZipUpload.tsx` line 128:

```tsx
const maxSize = 10 * 1024 * 1024 * 1024; // Change 10 to desired GB
```

### Change Tip Rotation Speed

Edit `components/ZipUpload.tsx` line 65:

```tsx
}, 4000); // Change 4000ms to desired value
```

### Change Status Message Speed

Edit `components/ZipUpload.tsx` line 57:

```tsx
}, 2000); // Change 2000ms to desired value
```

### Add Custom Tips

Edit `components/ZipUpload.tsx` line 18:

```tsx
const tipMessages = [
  { text: "Your custom tip", IconComponent: YourIcon },
  // Add more...
];
```

---

## 🎯 Key Features

| Feature | Details |
|---------|---------|
| File Size | Up to 10GB |
| File Type | ZIP only |
| Progress | Real-time percentage |
| Tips | 6 rotating tips with icons |
| Status | Changes every 2 seconds |
| Cancel | Can abort upload |
| Success | Full celebration UI |
| Responsive | Mobile to desktop |

---

## 🔗 Important Links

- **Speed Test**: [fast.com](https://fast.com)
- **Component File**: [ZipUpload.tsx](components/ZipUpload.tsx)
- **Admin Page**: [app/admin/page.tsx](app/admin/page.tsx)
- **Full Docs**: [ADMIN_UPLOAD_SETUP.md](ADMIN_UPLOAD_SETUP.md)

---

## ✅ Deployment Checklist

- [ ] Update backend URL
- [ ] Test with actual backend
- [ ] Verify CORS is enabled
- [ ] Set up file size limits on backend
- [ ] Enable HTTPS in production
- [ ] Test on mobile
- [ ] Monitor upload directory
- [ ] Add virus scanning (optional)
- [ ] Set rate limiting

---

## 🐛 Common Issues

### Upload doesn't start
- Check backend URL is correct
- Verify CORS headers
- Check browser console for errors

### Progress bar stuck
- Network may have paused
- Try cancelling and retrying
- Check server is receiving data

### Large files timeout
- Increase backend timeout
- Check connection at fast.com
- Consider chunked uploads for 5GB+

---

## 📞 Support

Check these first:
1. Browser console (F12) for errors
2. Network tab for failed requests
3. Backend logs for upload errors
4. [Full documentation](ADMIN_UPLOAD_SETUP.md)

---

**Version**: 1.0
**Last Updated**: 2024
**Status**: Production Ready ✅
