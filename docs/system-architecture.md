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

## 10. AI Trip Journal Processing Flow

The journal feature uses a stricter pipeline than Search.

### Journal Eligibility Rule

Only images with exact EXIF time and exact EXIF GPS are allowed into the journal pipeline.

- `has_exif_datetime = true`
- `has_exif_gps = true`

Images whose location was inferred only by landmark detection, OCR, or OpenAI should not be used as journal source images.

### Observation Layer

Journal processing does not work directly on raw uploaded images first.
It first creates an intermediate observation layer.

- Images taken within `10 seconds` of the first image in a burst
- and within about `30 meters`
- are collapsed into a single observation

This is used to treat repeated burst shots as one observation in the journal timeline.

Each observation keeps:

- a representative image
- observation start/end time
- center latitude/longitude
- image count

### Segment Layer

After observations are created, the backend builds journal segments.
Segments are the actual stay / transit / uncertain units used by the journal.

- `stay`: a destination-like stop or visit segment
- `transit`: a movement segment between stays
- `uncertain`: a segment that could not be classified with enough confidence

The system should classify observations first and then merge nearby observations into final segments.

### Stay / Transit Classification Signals

The journal classifier should combine multiple signals instead of relying on one rule only.

#### Time and GPS

- observation order in time
- distance to previous and next observations
- duration within the current observation

#### POI Enrichment

The backend should query nearby places for ambiguous observations.

- destination-like POIs increase stay confidence
  - `restaurant`
  - `cafe`
  - `museum`
  - `tourist_attraction`
  - `lodging`
  - `park`
- transit-like POIs increase transit confidence
  - `train_station`
  - `subway_station`
  - `airport`
  - `bus_station`
  - `transit_station`

POI should be treated as a supporting signal, not the only rule.

#### Image Context Classification

The backend should run a journal-focused image classifier for ambiguous observations.

Useful labels include:

- `destination_scene`
- `transport_related_scene`
- `food_photo`
- `document_like`
- `generic_scene`

#### Document Understanding

If an observation looks document-like, the backend should run OCR and document classification.
Document subtype can then affect stay/transit confidence.

Example document subtypes:

- `transport_ticket`
- `lodging_confirmation`
- `museum_ticket`
- `receipt`
- `map_screenshot`

### Weather Lookup

Weather should not be fetched for all uploaded images at upload time.

Instead, historical weather should be fetched only during journal generation for eligible journal observations or segments.

Weather caching rule:

- cache key: `provider + country + city + weather_date`

This avoids repeated weather API calls for multiple images from the same city on the same date.

### Journal Generation

After segment construction is complete, the journal generation step should send structured segment data to the LLM.

The prompt should include:

- ordered segments
- representative images
- segment type
- location labels
- time range
- weather summary
- user notes when available

The model should generate narrative text from the segment structure, rather than trying to discover the segment structure by itself.
