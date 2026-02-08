# Well Nutritions - Backend API Documentation

A production-ready Node.js/Express backend for a wellness and nutrition application with user authentication and AI-powered food nutrition analysis.

## 🚀 Features

- **User Authentication**: Register, login, logout with JWT tokens
- **Password Security**: bcryptjs hashing with secure salt rounds
- **Cookie-based Sessions**: HttpOnly cookies for secure token storage
- **Food Image Analysis**: AI-powered nutrition analysis using Google Gemini
- **Image Storage**: Binary image storage with MongoDB
- **Nutrition History**: Track user's food intake with images
- **Protected Routes**: JWT middleware for route protection
- **Input Validation**: Express-validator for data integrity
- **Global Error Handling**: Standardized error responses
- **MongoDB Integration**: Mongoose schemas and models

## 📋 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Image Processing**: Sharp
- **AI**: Google Gemini API
- **Validation**: express-validator
- **HTTP Security**: Helmet

## 📁 Project Structure

```
backend/
├── index.js                    # Main application entry point
├── .env                        # Environment variables (add to .gitignore)
├── .env.example                # Template for environment setup
├── package.json                # Dependencies and scripts
├── README.md                   # This file
├── config/
│   └── config.js              # Configuration settings
├── models/
│   ├── User.js                # User schema and pre-hooks
│   └── Nutrition.js           # Nutrition entry schema
├── middleware/
│   ├── auth.js                # JWT verification middleware
│   ├── errorMiddleware.js     # Global error handler
│   └── validation.js          # Input validation chains
├── controllers/
│   ├── authController.js      # Auth business logic
│   └── nutritionController.js # Nutrition analysis logic
├── routes/
│   ├── authRoutes.js          # Authentication endpoints
│   └── nutritionRoutes.js     # Nutrition endpoints
└── utils/
    ├── logger.js              # Logging utility
    └── responseHandler.js     # Response formatting
```

## 🔧 Installation & Setup

### 1. Clone & Install

```bash
git clone <repository-url>
cd backend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/well-nutritions

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters-long
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# AI
GEMINI_API_KEY=your-google-gemini-api-key

# File Upload
MAX_FILE_SIZE=5242880
PASSWORD_MIN_LENGTH=6
```

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

### 4. Run the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Health check
curl http://localhost:3000/health
```

---

## 📚 API Endpoints Overview

| Route | Method | Protected | Description |
|-------|--------|-----------|-------------|
| `/api/auth/register` | POST | ❌ | Register new user |
| `/api/auth/login` | POST | ❌ | Login user |
| `/api/auth/logout` | POST | ✅ | Logout user |
| `/api/auth/me` | GET | ✅ | Get current profile |
| `/api/auth/updateprofile` | PUT | ✅ | Update profile |
| `/api/auth/updatepassword` | PUT | ✅ | Update password |
| `/api/nutrition/analyze` | POST | ✅ | Analyze food & save |
| `/api/nutrition/history` | GET | ✅ | Get nutrition history |
| `/api/nutrition/:id/image` | GET | ✅ | Get nutrition image |

---

## 🔐 Authentication Endpoints

All responses include `statusCode` and `success` fields.

### 1. Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
}
```

**Response (201 Created):**
```json
{
    "statusCode": 201,
    "success": true,
    "token": "eyJhbGc...",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "email": "john@example.com",
        "name": "John Doe"
    }
}
```

**Testing with curl:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

---

### 2. Login User

```bash
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
    "statusCode": 200,
    "success": true,
    "token": "eyJhbGc...",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "email": "john@example.com",
        "name": "John Doe"
    }
}
```

**Testing with curl:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }' \
  -c cookies.txt
```

---

### 3. Get Current User Profile

```bash
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
    "statusCode": 200,
    "success": true,
    "data": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "",
        "createdAt": "2026-02-08T10:30:00.000Z"
    }
}
```

**Testing with curl:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer your_token_here"
```

---

### 4. Update Profile

```bash
PUT /api/auth/updateprofile
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Jane Doe",
    "email": "jane@example.com"
}
```

**Response (200 OK):**
```json
{
    "statusCode": 200,
    "success": true,
    "data": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Jane Doe",
        "email": "jane@example.com"
    }
}
```

**Testing with curl:**
```bash
curl -X PUT http://localhost:3000/api/auth/updateprofile \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

---

### 5. Update Password

```bash
PUT /api/auth/updatepassword
Authorization: Bearer <token>
Content-Type: application/json

{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass456"
}
```

**Response (200 OK):**
```json
{
    "statusCode": 200,
    "success": true,
    "token": "eyJhbGc...",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "email": "john@example.com",
        "name": "John Doe"
    }
}
```

**Testing with curl:**
```bash
curl -X PUT http://localhost:3000/api/auth/updatepassword \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass456"
  }'
```

---

### 6. Logout

```bash
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
    "statusCode": 200,
    "success": true,
    "message": "Logged out successfully"
}
```

**Testing with curl:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer your_token_here"
```

---

## 🍕 Nutrition Endpoints

### 1. Analyze Food Image & Save

**IMPORTANT FEATURES:**
- Requires authentication (Bearer token)
- Accepts: multipart/form-data with image file
- Saves: nutrition data AND image to database automatically
- Returns: nutrition analysis in response
- Optional: `servings` and `notes` parameters

```bash
POST /api/nutrition/analyze
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: [image file]
servings: (optional) number of servings
notes: (optional) additional notes
```

**Response (201 Created):**
```json
{
    "statusCode": 201,
    "success": true,
    "message": "Nutrition analysis saved",
    "data": {
        "id": "69885901b0ed21d6925be993",
        "dish": "Grilled Chicken Breast with Steamed Broccoli",
        "calories": 350,
        "protein": 45,
        "carbs": 15,
        "fat": 12,
        "portion_estimate": "1 chicken breast (~6oz) + 1.5 cups broccoli"
    }
}
```

**Testing with curl:**
```bash
# Basic request
curl -X POST http://localhost:3000/api/nutrition/analyze \
  -H "Authorization: Bearer your_token_here" \
  -F "image=@/path/to/food_image.jpg"

# With optional parameters
curl -X POST http://localhost:3000/api/nutrition/analyze \
  -H "Authorization: Bearer your_token_here" \
  -F "image=@/path/to/food_image.jpg" \
  -F "servings=2" \
  -F "notes=Extra sauce on the side"
```

**Testing with Postman:**
1. Create POST request to `http://localhost:3000/api/nutrition/analyze`
2. **Headers**: Add `Authorization: Bearer your_token_here`
3. **Body**: Select **form-data**
   - Key: `image`, Type: **File**, Value: select food image
   - Key: `servings` (optional), Type: Text, Value: `1` or `2`
   - Key: `notes` (optional), Type: Text

**Supported formats:** JPEG, PNG, WebP (Max 5MB)

---

### 2. Get Nutrition History

Retrieves all nutrition entries for logged-in user (newest first). Images excluded for performance.

```bash
GET /api/nutrition/history
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
    "statusCode": 200,
    "success": true,
    "count": 2,
    "data": [
        {
            "_id": "69885901b0ed21d6925be993",
            "user": "507f1f77bcf86cd799439011",
            "dish": "Grilled Chicken with Broccoli",
            "calories": 350,
            "protein": 45,
            "carbs": 15,
            "fat": 12,
            "portion_estimate": "1 chicken breast + 1.5 cups broccoli",
            "createdAt": "2026-02-08T15:30:00.000Z"
        }
    ]
}
```

**Testing with curl:**
```bash
curl -X GET http://localhost:3000/api/nutrition/history \
  -H "Authorization: Bearer your_token_here"
```

**Note:** Use `/image` endpoint to fetch images separately.

---

### 3. Get Image for Nutrition Entry

Returns the actual image file for a nutrition entry.

```bash
GET /api/nutrition/:id/image
Authorization: Bearer <token>
```

**Parameters:**
- `:id` - Nutrition entry MongoDB ObjectId (from `/history` response)

**Response:** Binary image data with proper Content-Type header

**Testing with curl:**
```bash
# Save to file
curl -X GET http://localhost:3000/api/nutrition/69885901b0ed21d6925be993/image \
  -H "Authorization: Bearer your_token_here" \
  --output downloaded_image.jpg

# Check file type
curl -X GET http://localhost:3000/api/nutrition/69885901b0ed21d6925be993/image \
  -H "Authorization: Bearer your_token_here" | file -
```

**Testing with Postman:**
1. GET to `http://localhost:3000/api/nutrition/:id/image`
2. **Headers**: `Authorization: Bearer your_token_here`
3. Response shows preview in **Image** tab
4. Download via **Save Response** button

**JavaScript Frontend:**
```javascript
const nutritionId = '69885901b0ed21d6925be993';
const token = 'your_token_here';

const img = document.createElement('img');
img.src = `http://localhost:3000/api/nutrition/${nutritionId}/image`;
document.body.appendChild(img);
```

---

## ✅ Complete Testing Workflow

Follow this checklist to test all endpoints:

```bash
# 1. Health Check
curl http://localhost:3000/health

# 2. Register
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"TestPass123"}' \
  | jq -r '.token')

# 3. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'

# 4. Get Profile
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 5. Update Profile
curl -X PUT http://localhost:3000/api/auth/updateprofile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# 6. Analyze Food (get nutrition ID)
NUTRITION_ID=$(curl -s -X POST http://localhost:3000/api/nutrition/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/food.jpg" \
  | jq -r '.data.id')

# 7. Get History
curl -X GET http://localhost:3000/api/nutrition/history \
  -H "Authorization: Bearer $TOKEN"

# 8. Get Image
curl -X GET http://localhost:3000/api/nutrition/$NUTRITION_ID/image \
  -H "Authorization: Bearer $TOKEN" \
  --output image.jpg

# 9. Update Password
curl -X PUT http://localhost:3000/api/auth/updatepassword \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"TestPass123","newPassword":"NewPass456"}'

# 10. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔐 Authentication Details

### JWT Token
- **Algorithm**: HS256
- **Expiration**: 7 days (configurable)
- **Payload**: `{ id: userId }`

### Using Tokens

**Option 1: Authorization Header**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/auth/me
```

**Option 2: Cookie (auto-sent)**
```bash
curl -b cookies.txt http://localhost:3000/api/auth/me
```

### Error Responses

**Missing Token (401):**
```json
{
    "statusCode": 401,
    "success": false,
    "message": "Not authorized to access this route"
}
```

**Invalid Token (401):**
```json
{
    "statusCode": 401,
    "success": false,
    "message": "Invalid or expired token"
}
```

**Forbidden Access (403):**
```json
{
    "statusCode": 403,
    "success": false,
    "message": "Not authorized to access this resource"
}
```

---

## 📊 Database Models

### User Schema
```javascript
{
    name: String,           // Required, max 50 chars
    email: String,          // Required, unique
    password: String,       // Required, min 6 chars, hashed
    avatar: String,         // Optional, default ''
    createdAt: Date         // Auto, default Date.now
}
```

### Nutrition Schema
```javascript
{
    user: ObjectId,         // Required, ref User
    dish: String,           // Required
    calories: Number,       // Required
    protein: Number,        // Required
    carbs: Number,          // Required
    fat: Number,            // Required
    portion_estimate: String,
    image: {
        data: Buffer,       // Binary image data
        contentType: String // MIME type
    },
    createdAt: Date         // Auto, default Date.now
}
```

---

## 🚨 Error Codes Reference

| Code | Message | Cause |
|------|---------|-------|
| 400 | `No image provided` | Missing image in form-data |
| 400 | `Invalid file type` | Not JPEG/PNG/WebP |
| 400 | `${field} already exists` | Email already registered |
| 400 | Validation message | Input validation failed |
| 401 | `Not authorized to access this route` | Missing/invalid token |
| 401 | `Invalid or expired token` | Token expired or tampered |
| 403 | `Not authorized to access this resource` | User doesn't own resource |
| 404 | `Resource not found` | Invalid ID |
| 404 | `No image found for this entry` | Nutrition has no image |
| 500 | `Server Error` | Internal error |

---

## 🔍 Important Notes

### Image Analysis
- **Model**: Google Gemini
- **Default Portion**: 1 slice (pizza/cake), 1 bowl/plate (others)
- **Optional Parameters**:
  - `servings=2` - Override default servings
  - `notes=...` - Custom context
- **Processing Time**: 3-5 seconds per image
- **Accuracy**: Based on Gemini's portion size perception

### Security
- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ JWT tokens signed with HS256
- ✅ Cookies with HttpOnly flag
- ✅ Input validation on all endpoints
- ✅ Protected routes require auth
- ✅ Users access only their own data
- ✅ Images stored as binary in MongoDB

### Validation Rules
- **Email**: Valid format, unique
- **Password**: Min 6 characters
- **Name**: Max 50 characters
- **Image**: Max 5MB, JPEG/PNG/WebP only
- **New Password**: Must differ from current

---

## 📝 Environment Variables

```env
# Application
NODE_ENV=development              # development | production
PORT=3000                         # Server port

# Database
MONGODB_URI=mongodb://localhost:27017/well-nutritions

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRE=7d                     # Token expiration
JWT_COOKIE_EXPIRE=7               # Cookie expiration in days

# AI
GEMINI_API_KEY=your-google-api-key

# File Upload
MAX_FILE_SIZE=5242880             # 5MB in bytes

# Validation
PASSWORD_MIN_LENGTH=6
```

---

## 🐛 Troubleshooting

**"MONGODB_URI is required"**
- Add `MONGODB_URI` to `.env`

**"GEMINI_API_KEY is required"**
- Get key from Google Cloud Console, add to `.env`

**"No image provided" even with image**
- Verify field name is exactly `image` (case-sensitive)
- Use `multipart/form-data` Content-Type
- Check file size < 5MB
- Verify format is JPEG/PNG/WebP

**Token invalid after 7 days**
- Normal behavior, user needs to login again
- Change `JWT_EXPIRE` in `.env` if needed

**CORS errors from frontend**
- Add to `index.js`:
```javascript
const cors = require('cors');
app.use(cors());
```

---

## 📚 Recommended Testing Tools

- **Postman**: GUI-based, team collaboration
- **Insomnia**: Lightweight alternative
- **curl**: Command-line scripting
- **VS Code REST Client**: Built-in extension

---

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong random `JWT_SECRET`
- [ ] Configure production `MONGODB_URI`
- [ ] Set `secure: true` in cookies
- [ ] Enable CORS appropriately
- [ ] Add rate limiting
- [ ] Set up error logging
- [ ] Set up monitoring
- [ ] Use env-specific API keys
- [ ] Configure backups
- [ ] Set up SSL/HTTPS
- [ ] Add API documentation (Swagger)

---

## 📄 License

ISC

## 👨‍💻 Author

Darshan Trivedi

**Last Updated**: February 8, 2026

