# API Overview

This document lists the external APIs currently planned for the project. It is intentionally short and acts as a quick reference for the APIs that are already in scope.

## Current APIs

### 1. Google Cloud Vision API

Used for landmark detection from uploaded images so the backend can identify likely places from travel photos.

### 2. Google Maps JavaScript API

Used to display detected or inferred locations on an interactive map in the frontend.

### 3. Google Geocoding API

Used to convert latitude and longitude coordinates into a human-readable address.

## Notes

- More APIs may be added later.
- This file is intentionally brief.
- Detailed request and response information is in `api-details.md`.
- Fallback behavior is documented in `errors-and-fallbacks.md`.
