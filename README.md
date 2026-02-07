# Wellness & Nutrition API - Backend

A modular, production-ready Node.js/Express backend for a wellness and nutrition application with user authentication.

## Features

- **User Authentication**: Register, login, logout with JWT tokens
- **Password Security**: bcryptjs hashing with salt rounds
- **Cookie-based Sessions**: HttpOnly cookies for secure token storage
- **Image Analysis**: Food nutrition analysis using Gemini AI
- **Protected Routes**: Middleware for authentication verification
- **Input Validation**: Express-validator for data validation
- **Error Handling**: Global error handling middleware
- **MongoDB/Mongoose**: Database integration with schemas and models

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (JSON Web Tokens)
- bcryptjs
- Sharp (Image Processing)
- Gemini AI

## Project Structure

```
backend/
├── index.js                    # Main entry point
├── .env                        # Environment variables
├── .env.example                # Environment variables template
├── package.json
├── README.md
├── models/
│   └── User.js                # User model with password hashing
├── middleware/
│   ├── auth.js                # JWT authentication middleware
│   └── errorMiddleware.js     # Global error handler
├── controllers/
│   ├── authController.js      # Auth logic (register, login, etc.)
│   └── nutritionController.js # Image analysis logic
├── routes/
│   ├── authRoutes.js          # Authentication routes
│   └── nutritionRoutes.js     # Nutrition routes
└── utils/
    └── (helper functions)
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong random string for JWT signing
   - `GEMINI_API_KEY`: Your Google Gemini API key

4. **Start MongoDB**
   Make sure MongoDB is running locally or provide a cloud MongoDB URI in `.env`

5. **Run the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/me` | Get current user profile | Private |
| PUT | `/api/auth/updateprofile` | Update user profile | Private |
| PUT | `/api/auth/updatepassword` | Update password | Private |

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

#### Get Profile (with JWT token)
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

### Nutrition Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/nutrition/analyze` | Analyze food image | Public |
| POST | `/api/nutrition/store` | Store nutrition entry | Private |

#### Analyze Food Image
```bash
POST /api/nutrition/analyze
Content-Type: multipart/form-data

image: [image file]
```

### Health Check
```bash
GET /health
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/well-nutritions` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `JWT_COOKIE_EXPIRE` | Cookie expiration (days) | `7` |
| `GEMINI_API_KEY` | Google Gemini API key | Required |

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Signed with HS256 algorithm
- **HttpOnly Cookies**: Prevents XSS attacks
- **Input Validation**: Sanitizes and validates user input
- **Error Handling**: Catches and handles errors gracefully
- **Environment Variables**: Sensitive data not exposed in code

## API Response Format

### Success Response
```json
{
    "success": true,
    "data": { ... },
    "token": "jwt-token-here"
}
```

### Error Response
```json
{
    "success": false,
    "error": "Error message here"
}
```

## Development

### Available Scripts

- `npm run dev` - Start in development mode with auto-reload
- `npm start` - Start in production mode
- `npm test` - Run tests (not configured yet)

### Testing with Postman/Insomnia

1. Register a new user: `POST /api/auth/register`
2. Login: `POST /api/auth/login` (receives JWT in cookie and response)
3. Copy the JWT token from the response
4. Use the token in the Authorization header for protected routes:
   - Header: `Authorization: Bearer <your-token>`
   - Or the cookie will be automatically sent

## Database Models

### User Schema
```javascript
{
    name: String,        // Required, max 50 chars
    email: String,       // Required, unique, valid email format
    password: String,    // Required, min 6 chars, hashed
    avatar: String,      // Optional, default empty
    createdAt: Date      // Auto-generated
}
```

## Middleware

### auth.js - Protect Route
```javascript
const { protect } = require('./middleware/auth');

// Use on protected routes
router.get('/profile', protect, (req, res) => {
    // req.user contains the authenticated user
    res.json({ user: req.user });
});
```

### errorMiddleware.js - Error Handler
Catches and formats errors consistently:
- Validation errors
- Duplicate key errors
- JWT errors
- Cast errors (invalid ObjectId)
- Custom error responses

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] OAuth integration (Google, Facebook)
- [ ] Role-based access control
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] API documentation with Swagger
- [ ] Unit and integration tests
- [ ] Nutrition model and history tracking
- [ ] Analytics endpoints

## License

ISC

## Author

Your Name

