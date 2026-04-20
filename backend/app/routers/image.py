import os
import shutil
from pathlib import Path
import googlemaps
from fastapi import APIRouter, File, UploadFile
from dotenv import load_dotenv

# Import services
from app.services.image_ingestion_service import ingest_uploaded_file
from app.services.clip_service import analyze_image_by_axes

# Init Google Maps
load_dotenv()
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

router = APIRouter()

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    # Save temp file
    temp_path = Path(f"temp_{file.filename}")
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    await file.seek(0)
    
    # Extract metadata
    metadata = await ingest_uploaded_file(file)
    result_data = metadata.model_dump() if hasattr(metadata, "model_dump") else dict(metadata)
    
    # 1. Location (Google Maps API)
    gps = result_data.get("gps")
    has_gps = gps is not None and gps.get("latitude") and gps.get("longitude")
    
    if has_gps:
        print(f"[GPS] Found: {gps['latitude']}, {gps['longitude']}")
        try:
            # Request English city names
            reverse_geocode_result = gmaps.reverse_geocode((gps["latitude"], gps["longitude"]), language='en')
            if reverse_geocode_result:
                address_components = reverse_geocode_result[0].get("address_components", [])
                city = next((c["long_name"] for c in address_components if "locality" in c["types"]), 
                            next((c["long_name"] for c in address_components if "administrative_area_level_1" in c["types"]), "Unknown Region"))
                result_data["city"] = city
            else:
                result_data["city"] = "Unknown Location"
        except Exception as e:
            print(f"[Error] Google Maps API: {e}")
            result_data["city"] = "Geocoding Failed"
    else:
        print("[GPS] Not found")
        result_data["city"] = "Unknown Location"

    # 2. AI Tags (CLIP)
    print("[CLIP] Analyzing image...")
    clip_result = analyze_image_by_axes(temp_path)
    
    # Extract summary to prevent nested dicts
    if isinstance(clip_result, dict) and "summary" in clip_result:
        result_data["summary"] = clip_result["summary"]
    else:
        result_data["summary"] = clip_result

    # Cleanup & Return
    temp_path.unlink(missing_ok=True)
    print("[Success] Data ready")
    
    return result_data