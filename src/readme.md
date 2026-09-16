# VidTube 🎥

VidTube is a backend-focused video-sharing platform inspired by modern video streaming applications. It provides RESTful APIs for user authentication, video management, comments, likes, playlists, subscriptions, tweets, and channel analytics.

The project is built using **Node.js, Express.js, MongoDB, and Mongoose**, with Cloudinary used for media storage.

## 🚀 Features

* User registration and authentication
* JWT-based access and refresh token authentication
* Email verification
* User profile management
* Video upload and management
* Video publishing/unpublishing
* Video search, sorting, and pagination
* Cloudinary integration for video and image uploads
* Comments on videos
* Like/unlike videos, comments, and tweets
* Create and manage playlists
* Add and remove videos from playlists
* Subscribe/unsubscribe to channels
* View channel subscribers
* View subscribed channels
* Tweet creation and management
* Channel dashboard and statistics
* Total videos, subscribers, likes, and views statistics
* Protected routes using authentication middleware
* Centralized error handling
* Standardized API responses

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication & Security

* JSON Web Token (JWT)
* bcrypt
* Cookie-based authentication
* CORS

### Media & Email

* Cloudinary
* Mailtrap

### Development Tools

* Nodemon
* Postman
* Git & GitHub

## 📁 Project Structure

```text
VidTube/
│
├── src/
│   ├── controllers/
│   │   ├── comment.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── like.controller.js
│   │   ├── playlist.controller.js
│   │   ├── subscription.controller.js
│   │   ├── tweet.controller.js
│   │   ├── user.controller.js
│   │   └── video.controller.js
│   │
│   ├── db/
│   │   └── database configuration
│   │
│   ├── middlewares/
│   │   └── authentication and other middleware
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── playlist.model.js
│   │   ├── subscription.model.js
│   │   └── tweet.model.js
│   │
│   ├── routes/
│   │   ├── comment.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── like.routes.js
│   │   ├── playlist.routes.js
│   │   ├── subscription.routes.js
│   │   ├── tweet.routes.js
│   │   ├── user.routes.js
│   │   └── video.routes.js
│   │
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   │
│   ├── app.js
│   └── index.js
│
├── .env.sample
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 🔐 Authentication

VidTube uses JWT-based authentication.

The authentication flow is:

```text
User Registration
       ↓
User Login
       ↓
Access Token + Refresh Token
       ↓
Authentication Middleware
       ↓
Protected Controller
       ↓
API Response
```

Protected APIs use the authenticated user's ID from:

```js
req.user._id
```

## 🎬 Video Management

Authenticated users can:

* Upload videos
* Upload thumbnails
* Publish videos
* Update video information
* Delete their videos
* Toggle video publish status
* View individual videos
* Search videos
* Sort videos
* Get paginated video results

Media files are uploaded to **Cloudinary**, while their URLs are stored in MongoDB.

## 💬 Comments

Users can:

* Add comments to videos
* View video comments
* Update their comments
* Delete their comments
* Like/unlike comments

Comments are associated with both the video and the user who created them.

## ❤️ Likes

The like system supports:

* Video likes
* Comment likes
* Tweet likes
* Unlike functionality
* Fetching videos liked by the current user

The same controller uses toggle logic:

```text
Like
 ↓
Check existing like
 ↓
 ┌───────────────┐
 │               │
Exists         Doesn't exist
 │               │
Delete          Create
 │               │
Unlike           Like
```

## 📂 Playlists

Users can create and manage playlists.

Playlist functionality includes:

* Create playlist
* Get user's playlists
* Get playlist by ID
* Update playlist
* Delete playlist
* Add video to playlist
* Remove video from playlist

A playlist contains references to videos and has an owner.

## 🔔 Subscriptions

Users can:

* Subscribe to channels
* Unsubscribe from channels
* View channel subscribers
* View channels they have subscribed to

The subscription relationship is stored using:

```text
subscriber → User
channel    → User
```

## 🐦 Tweets

Users can create short text-based posts and manage their own tweets.

Supported operations include:

* Create tweet
* Get tweets
* Get tweet by ID
* Update tweet
* Delete tweet
* Like/unlike tweets

## 📊 Dashboard

The dashboard provides channel-level statistics.

Currently supported statistics include:

* Total videos
* Total subscribers
* Total likes
* Total views

Example:

```json
{
  "totalVideos": 12,
  "totalSubscribers": 150,
  "totalLikes": 850,
  "totalViews": 12500
}
```

## 🔎 Search & Pagination

Video APIs support query parameters such as:

```text
?page=1
&limit=10
&query=javascript
&sortBy=createdAt
&sortType=desc
&userId=<USER_ID>
```

This allows videos to be searched, sorted, filtered, and paginated.

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/akash12576/VidTube.git
```

### 2. Move into the project

```bash
cd VidTube
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create environment file

Create a `.env` file in the project root.

Use `.env.sample` as a reference.

Example:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Add any other environment variables required by your current project.

### 5. Start the development server

```bash
npm run dev
```

The API will run on your configured port.

## 🧪 API Testing

You can test the APIs using **Postman**.

Typical API flow:

```text
Register User
     ↓
Login
     ↓
Get Authentication Token
     ↓
Upload Video
     ↓
Create Comment
     ↓
Like Video
     ↓
Create Playlist
     ↓
Subscribe to Channel
```

## 📌 API Modules

| Module        | Description                                    |
| ------------- | ---------------------------------------------- |
| Auth          | Registration, login, logout and authentication |
| Users         | User profile and account management            |
| Videos        | Upload, update, delete and retrieve videos     |
| Comments      | Video comments and management                  |
| Likes         | Video, comment and tweet likes                 |
| Playlists     | Playlist creation and video management         |
| Subscriptions | Channel subscriptions                          |
| Tweets        | Tweet management                               |
| Dashboard     | Channel statistics                             |

## 🧠 What I Learned

While building this project, I worked with:

* REST API development
* Express.js routing
* MongoDB database design
* Mongoose schemas and queries
* JWT authentication
* Authentication middleware
* CRUD operations
* MongoDB relationships using ObjectId references
* Mongoose `populate()`
* Pagination
* Searching and sorting
* File uploads
* Cloudinary integration
* Error handling
* Async request handling
* API response standardization
* Git and GitHub

## 🔮 Future Improvements

Possible future improvements include:

* Video streaming optimization
* Advanced recommendation system
* Watch history
* Watch later functionality
* Notifications
* Advanced search filters
* Better video analytics
* Content moderation
* Frontend application
* Real-time notifications
* Improved API documentation using Swagger

## 👨‍💻 Author

**Akash Kumar**

GitHub: [akash12576](https://github.com/akash12576)

## ⭐ Support

If you find this project useful for learning or development, consider giving the repository a star.
