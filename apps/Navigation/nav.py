# backend.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import os
import requests

ORS_API_KEY = os.getenv("ORS_API_KEY")  # set your OpenRouteService API key
if not ORS_API_KEY:
    raise RuntimeError("Set ORS_API_KEY environment variable before running the backend.")

app = FastAPI(title="India Navigation API")

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input model
class RouteRequest(BaseModel):
    source: tuple[float, float]  # (lat, lon)
    destination: tuple[float, float]  # (lat, lon)

# India bounding box for validation
INDIA_BOUNDS = {
    "min_lat": 6.5,
    "max_lat": 37.5,
    "min_lon": 68.0,
    "max_lon": 97.5,
}

def in_india(lat: float, lon: float) -> bool:
    return (
        INDIA_BOUNDS["min_lat"] <= lat <= INDIA_BOUNDS["max_lat"]
        and INDIA_BOUNDS["min_lon"] <= lon <= INDIA_BOUNDS["max_lon"]
    )

@app.post("/api/route")
async def get_route(data: RouteRequest):
    src_lat, src_lon = data.source
    dst_lat, dst_lon = data.destination

    # Validation: inside India
    if not in_india(src_lat, src_lon) or not in_india(dst_lat, dst_lon):
        raise HTTPException(status_code=400, detail="Both points must be inside India")

    # Call OpenRouteService
    url = "https://api.openrouteservice.org/v2/directions/driving-car"
    headers = {"Authorization": ORS_API_KEY, "Content-Type": "application/json"}
    body = {"coordinates": [[src_lon, src_lat], [dst_lon, dst_lat]]}  # (lon, lat)

    resp = requests.post(url, json=body, headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=f"ORS error: {resp.text}")

    route = resp.json()
    coords = route["features"][0]["geometry"]["coordinates"]
    distance_km = route["features"][0]["properties"]["segments"][0]["distance"] / 1000

    return {
        "distance_km": distance_km,
        "route_coords": coords,
    }
