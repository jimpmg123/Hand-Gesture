# Project Details

This document contains the detailed project description that is intentionally omitted from the short root `README.md`. It combines the original project summary, planned feature set, and the current user-facing product direction.

## 1. Project Introduction

**Travel From Photo** is a web application that helps users identify travel locations from uploaded photos, infer restaurant candidates from food images, and generate routes to those places.

The goal of the project is to provide a more intuitive travel experience by turning a simple image into useful location, food, and navigation information.

## 2. Problem

Many travelers take photos during their trips and later share them with others. However, the location information of these photos is often lost or forgotten, especially after the images are shared on social media or transferred between devices. As a result, it becomes difficult to remember or identify where the photo was taken.

Existing AI tools that attempt to identify locations from images often rely on visual recognition alone. When the image contains common objects such as food or indoor scenes, these systems frequently struggle to determine the correct location because many places look visually similar. This leads to low accuracy in identifying the original place where the photo was taken.

Therefore, travelers need a system that can better infer or recover the location of a photo and help them rediscover where the photo was taken.

## 3. Solution

The application supports three main entry points:

1. Upload a travel photo.
2. Upload a food photo.
3. Enter a destination manually.

The backend then combines image analysis, metadata, and user-provided context to estimate a destination or restaurant candidate. The result is shown on a map, and the user can continue to route guidance from the detected place.

## 4. Core Feature Areas

### Travel Photo Search

- Users can upload place photos to start location identification.
- The system checks GPS metadata first when available.
- If metadata is missing, the system falls back to landmark detection and semantic image analysis.

### Food Recognition and Restaurant Search

- If the uploaded image is food, the system detects the cuisine or meal type.
- The system uses country, city, recent uploads, and other context to narrow possible restaurant candidates.
- Restaurant candidates can later be shown on the map and used for route guidance.

### Manual Destination Input

- Users can type a destination directly without uploading an image.
- This supports a standard navigation flow when the destination is already known.

### Hint-Based and Advanced Search Support

- Users can provide country and optional city hints.
- The system can use recently uploaded photos as contextual evidence.
- Future advanced search fields may include regional proximity assumptions and free-text environment descriptions.

### Map Visualization

- The frontend shows detected or inferred results on an interactive map.
- Coordinates, readable addresses, and later route overlays can all be attached to the same location result.

### Route Generation

- Users can receive route guidance to the selected destination or restaurant.
- This applies to both landmark-based results and food-based restaurant discovery results.

### Personal Gallery

- Logged-in users can review their uploaded photos and grouped image history.
- Gallery cards can later include detected location details and guidance entry points.

### Profile and Privacy Controls

- Users can manage uploaded image groups and privacy settings.
- The project plans to support controls such as allowing or blocking admin access to image data.

### Admin Management

- Admin users can manage users, uploaded data, moderation workflows, and system content.
- Admin access should always be protected by authentication and role checks.

### Real-Time Chat

- Real-time chat is part of the planned roadmap.
- It is not the current implementation priority, but the system is being designed with future WebSocket support in mind.

## 5. User Roles

### Normal User

- Upload travel photos and food photos.
- Search for locations.
- Search for restaurants from food photos.
- Explore results on the map.
- Generate routes to destinations.
- Review personal uploads in gallery pages.
- Manage personal privacy settings.

### Admin

- Search users.
- Access profiles.
- Moderate content.
- Manage uploaded image records.
- Monitor results and overall system content.
- Respect user privacy settings for image access.

## 6. Current Product Direction

The current product direction combines two related user stories:

- Recover the location of a travel memory from a photo.
- Re-discover a restaurant from a food image when the user no longer remembers the place name.

This means the system should not treat image analysis as a single-path landmark detector. Instead, it should support travel scenes, food images, generic places, and user-supported context as part of one connected search workflow.

## 7. Related Documents

- `docs/system-architecture.md` for system structure and backend pipeline details.
- `docs/api-overview.md` for a short list of currently planned external APIs.
- `docs/api-details.md` for request and response references.
- `docs/errors-and-fallbacks.md` for fallback behavior when landmark detection is weak or fails.
