# Backend Folder Roles

This document explains the recommended backend folder structure for **Travel From Photo** and the responsibility of each folder.

For a project-level explanation like this, the most common location is:

- `docs/` when the whole team should read it as shared architecture guidance
- `backend/README.md` when the document is only for backend developers

For this project, `docs/` is the better default because the backend design affects frontend integration, API planning, and database work.

---

## Recommended Backend Structure

```text
backend/
  app/
    routers/
      image.py
    services/
      exif_service.py
      clip_service.py
      image_ingestion_service.py
    repositories/
      image_metadata_repository.py
    models/
      image_metadata.py
    schemas/
      image_metadata.py
    core/
      config.py
      db.py
```

---

## Folder Roles

### `routers/`

**Role:** API entry layer

This folder receives HTTP requests from the frontend or other clients.

Typical responsibilities:

- Define API endpoints such as `POST /api/image/upload`
- Read request parameters, uploaded files, and query values
- Call service-layer functions
- Return JSON responses

What should stay out of this folder:

- Heavy EXIF parsing
- CLIP/OpenAI logic
- Raw SQLAlchemy insert/update logic

In short:

`routers` should be thin. They are the connection point between the frontend and the backend.

---

### `services/`

**Role:** business logic and compute layer

This folder contains the main application logic.

Typical responsibilities:

- Extract EXIF metadata from an uploaded image
- Run CLIP classification
- Call OpenAI or weather APIs later
- Combine multiple steps into one use-case flow

Examples in this project:

- `exif_service.py`
  - Reads image metadata
- `clip_service.py`
  - Runs CLIP-based image labeling
- `image_ingestion_service.py`
  - High-level orchestration such as:
    - receive uploaded file
    - extract metadata
    - decide whether GPS exists
    - run CLIP if needed
    - store results through repositories

In short:

`services` decide **what the system does**.

---

### `repositories/`

**Role:** database access layer

This folder is responsible for reading from and writing to the database.

Typical responsibilities:

- Insert image metadata rows
- Update analysis status
- Query saved images or candidates
- Hide SQLAlchemy session details from upper layers

Example:

- `image_metadata_repository.py`
  - `create_image_metadata(...)`
  - `get_image_metadata_by_id(...)`
  - `list_metadata_with_gps(...)`

Why this helps:

- Service logic stays cleaner
- DB code is centralized
- If the schema changes, fewer files need updates

In short:

`repositories` decide **how data is stored and retrieved**.

---

### `models/`

**Role:** database schema layer

This folder defines SQLAlchemy ORM models.

Typical responsibilities:

- Define table names
- Define columns and types
- Define primary keys and foreign keys
- Define relationships between tables

Example:

- `image_metadata.py`
  - SQLAlchemy model for metadata storage

In short:

`models` define **what the database tables look like**.

---

### `schemas/`

**Role:** request and response data shape layer

This folder defines the structured data that moves through the API.

Typical responsibilities:

- Validate request body shape
- Define response JSON shape
- Keep API contracts explicit

Examples:

- Input schema for uploaded image processing request
- Response schema for extracted metadata result

Why this matters:

- Routers become easier to read
- API responses stay consistent
- Frontend developers know what shape to expect

In short:

`schemas` define **what data enters and leaves the API**.

---

### `core/`

**Role:** shared backend foundation

This folder holds low-level configuration and shared infrastructure setup.

Typical responsibilities:

- Load environment variables
- Configure the database engine and session
- Provide reusable backend-wide utilities

Current examples in this project:

- `config.py`
  - environment variables such as database URL and API keys
- `db.py`
  - SQLAlchemy engine, session, and base class

In short:

`core` provides the **foundation used by all backend layers**.

---

## Recommended Request Flow

The intended request flow should look like this:

```text
Frontend
-> router
-> service
-> repository
-> database
```

For image analysis:

```text
Frontend upload
-> routers/image.py
-> services/image_ingestion_service.py
-> services/exif_service.py
-> services/clip_service.py
-> repositories/image_metadata_repository.py
-> PostgreSQL
```

---

## Why This Structure Helps

This structure helps manage growing complexity by separating responsibilities:

- `routers` handle requests
- `services` handle workflow and logic
- `repositories` handle persistence
- `models` define tables
- `schemas` define API data shapes
- `core` provides shared infrastructure

That means one file does not need to do everything at once.

---

## Practical Rule of Thumb

When deciding where new code should go, use this rule:

- If it receives an HTTP request: put it in `routers`
- If it performs business logic or orchestration: put it in `services`
- If it saves or loads data: put it in `repositories`
- If it defines a DB table: put it in `models`
- If it defines request/response shapes: put it in `schemas`
- If it sets up global backend configuration: put it in `core`

---

## Notes for This Project

- The current codebase already has `routers`, `services`, `models`, and `core`.
- `repositories` and `schemas` are the next useful step as database and API logic grow.
- This is especially useful for upcoming features such as:
  - Google Geocoding integration
  - OpenAI itinerary generation
  - weather API integration
  - gallery persistence
  - Travelize
  - AI Trip Journal
