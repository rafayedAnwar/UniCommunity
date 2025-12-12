# Testing Guide for UniCommunity

## Test User Credentials

A test user has been created in the database with the following details:

- **User ID**: `693bd29cddcf4501d3dcd73c`
- **Email**: testuser@g.bracu.ac.bd
- **Name**: Test User
- **Current Courses**: CSE471, CSE370
- **Completed Courses**: CSE110, CSE111, CSE220

## How to Test the Application

### 1. Start the Backend Server

```bash
cd Backend
npm start
```

The server should run on `http://localhost:1760`

### 2. Start the Frontend Server

```bash
cd Frontend
npm start
```

The app should open at `http://localhost:3000`

### 3. Test the Features

#### Profile Page

- Navigate to: `http://localhost:3000/profile`
- You should see the test user's profile with existing data
- Try editing bio, social links, and managing courses

#### Forums Page

- Navigate to: `http://localhost:3000/forums`
- Test creating a new forum (e.g., CSE471 - System Analysis and Design)
- Join existing forums
- Upload resources (provide Google Drive links or similar)
- Download resources to test download counter

### 4. Create Additional Test Users (Optional)

If you need more users for testing, run:

```bash
cd Backend
npm run seed
```

This will either show existing test user or create a new one.

## Troubleshooting

### If you see "User not found" errors:

1. Make sure MongoDB is running
2. Verify the backend server is running on port 1760
3. Check that the userId in ProfilePage.js and ForumPage.js matches: `693bd29cddcf4501d3dcd73c`

### If backend won't start:

1. Ensure MongoDB is running: `mongod` or check your MongoDB service
2. Check `.env` file has correct configuration
3. Run `npm install` in Backend folder

### If frontend won't connect:

1. Verify backend is running on port 1760
2. Check CORS settings in server.js allow localhost:3000
3. Run `npm install` in Frontend folder

## API Testing with Postman/Thunder Client

### Get User Profile

```
GET http://localhost:1760/api/users/693bd29cddcf4501d3dcd73c
```

### Update User Profile

```
PUT http://localhost:1760/api/users/693bd29cddcf4501d3dcd73c
Content-Type: application/json

{
  "bio": "Updated bio text",
  "socialLinks": {
    "linkedIn": "https://linkedin.com/in/testuser",
    "github": "https://github.com/testuser",
    "portfolio": "https://testuser.dev"
  }
}
```

### Create Forum

```
POST http://localhost:1760/api/forums
Content-Type: application/json

{
  "courseCode": "CSE471",
  "courseName": "System Analysis and Design",
  "description": "Share resources for CSE471",
  "userId": "693bd29cddcf4501d3dcd73c"
}
```

### Get All Forums

```
GET http://localhost:1760/api/forums
```

## Notes

- The test user is pre-configured in both ProfilePage.js and ForumPage.js
- Authentication is temporarily bypassed for testing purposes
- Once Google OAuth is working, replace the hardcoded userId with actual authentication
