# System Architecture

This document consolidates the detailed system design notes that were previously scattered between the root documentation files. It focuses on the current technical plan, backend responsibilities, security assumptions, and the multi-stage image processing flow.

## 1. System Technology Stack

### Frontend

- React
- Vite
- TypeScript
- Responsive UI for desktop and mobile
- Image upload interface
- Gallery and profile management
- Map visualization

### Backend

- FastAPI
- Python
- Handles API requests and AI image analysis pipeline
- Authentication and authorization
- Image upload and processing
- Communication with external APIs

### Database

- PostgreSQL
- Stores user accounts, uploaded images, metadata, groups, and posts

### ORM

- SQLAlchemy
- Object relational mapping between backend models and PostgreSQL

### Authentication

- Google OAuth
- JWT (JSON Web Token)
- Secure authentication
- Role-based access control for `User` and `Admin`

### Container

- Docker
- Standardized environment for database and backend services

### Real-Time Communication

- WebSocket
- Used for real-time chat between users

### AI / Image Processing

- EXIF metadata extraction
- CLIP / HuggingFace models
- Google Vision API / landmark detection
- Google Places API
- Google Directions API

## 2. Backend Architecture Overview

The backend server manages image processing, authentication, user data, and communication with AI services and external APIs.

### Backend Service Modules

```text
Backend (FastAPI)
│
├ Authentication Service
│  ├ User signup/login
│  ├ JWT token generation
│  └ Role-based access control
│
├ Image Upload Service
│  ├ Image upload validation
│  ├ Image storage
│  ├ Thumbnail generation
│  └ Image metadata extraction
│
├ Image Analysis Service
│  ├ EXIF metadata extraction
│  ├ Landmark detection API
│  ├ Image semantic analysis (CLIP)
│  └ Keyword extraction
│
├ Location Service
│  ├ Google Places API
│  └ Location candidate ranking
│
├ Route Service
│  └ Google Directions API
│
├ Gallery Service
│  ├ Image grouping
│  ├ Gallery generation
│  └ Thumbnail retrieval
│
├ Profile Service
│  ├ Privacy settings
│  └ User data management
│
└ Admin Service
   ├ User search
   ├ Profile access
   └ Content moderation
```

## 3. Backend Security and File Upload Protection

To reduce malicious file uploads and abuse, the project should apply validation in both the frontend and backend.

### Frontend Security Measures

- Allow only image file formats such as JPEG, PNG, and WEBP.
- Limit maximum upload size, for example `30MB` per image.
- Prevent rapid repeated uploads using cooldown logic or client-side rate limiting.
- Perform basic MIME type validation before sending the file.

### Backend Security Measures

#### File Type Verification

- Validate the actual file signature.
- Use magic number checks and Python imaging libraries.
- Reject files that are disguised as images.

#### File Size Limitation

- Enforce a maximum upload size server-side.
- Prevent resource abuse and denial-of-service style uploads.

#### Suspicious File Protection

- Reject files such as `.exe`, `.js`, and `.sh` even if renamed to image-like extensions.

#### Upload Rate Limiting

- Limit the number of uploads per user within a time window.
- Example policy: `10 uploads per minute`.

#### Secure File Storage

- Store uploaded files outside executable directories.
- Example structure:

```text
/storage/images/
/storage/thumbnails/
```

## 4. User Image Processing Pipeline

Only logged-in users should be allowed to access image search, gallery features, and location detection.

### Main Image Processing Flow

```text
User uploads image
       │
       ▼
Image validation
       │
       ▼
EXIF metadata extraction
       │
       ├ GPS data exists
       │      │
       │      ▼
       │  Location identified
       │
       ▼
No GPS data
       │
       ▼
Landmark detection API
       │
       ├ Landmark found
       │      │
       │      ▼
       │  Location determined
       │
       ▼
No landmark detected
       │
       ▼
Image semantic analysis (CLIP)
       │
       ▼
Keyword extraction
       │
       ▼
Location search using:
- user input country
- optional city
- semantic keywords
```

## 5. Additional Image Context Analysis

If the image contains food or generic objects where landmark detection fails, the system should use additional contextual information.

Useful context sources include:

- User-provided country
- Optional city
- Previously uploaded images
- Image groups
- User description

Example extracted keywords:

- ramen
- street
- urban
- tropical
- coastal
- city street

These keywords can then be used to search possible locations via location APIs.

## 6. Advanced Search Features

The search interface can include an expandable advanced search panel to improve detection accuracy.

### Image Proximity Check

Users can indicate whether the uploaded image is likely from the same country or region as previously uploaded images. This helps the backend narrow the search scope.

### Additional Description Field

Users can provide contextual information about the environment.

Example inputs:

- tropical
- cold climate
- near road
- city
- rural area
- coastal
- mountain

These keywords can improve semantic location matching.

## 7. Gallery Behavior

The gallery organizes uploaded images into location-based groups.

### Group Rules

- Images are grouped by city.
- If the city changes, a new group is created.
- The first image becomes the group thumbnail.

### Gallery UI Behavior

Each group card can include:

- Thumbnail image
- Number of images
- Location information

### View Images

Clicking **View Images** can open an image viewer that lets users:

- Browse images with left and right arrows
- View the selected image in the center
- Navigate between images in the same group

### Open Guide

Clicking **Open Guide** should display a map view and generate a route to the detected location.

## 8. Profile and Privacy Controls

Users can manage personal information and uploaded images through the profile area.

Profile scope includes:

- Uploaded image groups
- Gallery access
- Privacy settings

### Privacy Policy Direction

Users should be able to control whether administrators are allowed to view their uploaded images.

Example setting:

```text
Allow admin to view my images
[ON / OFF]
```

If disabled:

- Admin can still see the user account.
- Admin cannot access image data.

This should be enforced through backend authorization checks.

## 9. Admin Access Rule

All admin-only APIs should require both:

1. A valid authenticated user session or JWT.
2. A verified admin role.

If either check fails, access should be denied. This policy should be implemented in FastAPI dependency-based authorization logic when the admin backend is added.
