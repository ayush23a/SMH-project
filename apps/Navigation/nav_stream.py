# frontend.py
import streamlit as st
import requests
import folium
from streamlit_folium import st_folium
from streamlit_js_eval import get_geolocation

st.set_page_config(page_title="UniLink Navigation", layout="wide")
st.title("🗺️ India Navigation System")

FASTAPI_URL = "http://localhost:8000/api/route"

HOT_LOCATIONS = {
    "Bangalore": (12.9716, 77.5946),
    "Chennai": (13.0827, 80.2707),
    "Ghaziabad": (28.6692, 77.4538),
    "Jaipur": (26.9124, 75.7873),
    "Kolkata": (22.5726, 88.3639),
    "Lalitpur": (24.6869, 78.4183),
    "Maharashtra": (19.7515, 75.7139),
    "Mumbai": (19.0760, 72.8777),
    "Noida": (28.5355, 77.3910),
    "Pune": (18.5204, 73.8567),
    "Other": (22.9734, 78.6569),
}

# --------------------------
# Session state defaults
# --------------------------
if "current_location" not in st.session_state:
    st.session_state.current_location = HOT_LOCATIONS["Other"]

if "source" not in st.session_state:
    st.session_state.source = st.session_state.current_location

if "destination" not in st.session_state:
    st.session_state.destination = HOT_LOCATIONS["Other"]

if "route_coords" not in st.session_state:
    st.session_state.route_coords = []

# --------------------------
# Get current location
# --------------------------
geo = get_geolocation()
if geo:
    st.session_state.current_location = (geo["coords"]["latitude"], geo["coords"]["longitude"])
    st.success(f"📍 Current Location: {st.session_state.current_location}")
else:
    st.warning("Browser did not return location. Allow location access or choose manually.")

# --------------------------
# Source selection
# --------------------------
st.subheader("Select Source")
source_choice = st.radio("Pick source:", ["Current Location", "Hot Location", "Manual Input", "Click on Map"])
if source_choice == "Current Location":
    st.session_state.source = st.session_state.current_location
elif source_choice == "Hot Location":
    src_name = st.selectbox("Choose source city", list(HOT_LOCATIONS.keys()))
    st.session_state.source = HOT_LOCATIONS[src_name]
elif source_choice == "Manual Input":
    lat = st.number_input("Source Latitude", value=st.session_state.source[0])
    lon = st.number_input("Source Longitude", value=st.session_state.source[1])
    st.session_state.source = (lat, lon)

# --------------------------
# Destination selection
# --------------------------
st.subheader("Select Destination")
dest_choice = st.radio("Pick destination:", ["Hot Location", "Manual Input", "Click on Map"])
if dest_choice == "Hot Location":
    dst_name = st.selectbox("Choose destination city", list(HOT_LOCATIONS.keys()))
    st.session_state.destination = HOT_LOCATIONS[dst_name]
elif dest_choice == "Manual Input":
    lat = st.number_input("Destination Latitude", value=st.session_state.destination[0])
    lon = st.number_input("Destination Longitude", value=st.session_state.destination[1])
    st.session_state.destination = (lat, lon)

# --------------------------
# Interactive Map
# --------------------------
st.subheader("Map")

m = folium.Map(location=st.session_state.current_location, zoom_start=6)

# Draw markers
if st.session_state.source:
    folium.Marker(st.session_state.source, tooltip="Source", icon=folium.Icon(color="blue")).add_to(m)
if st.session_state.destination:
    folium.Marker(st.session_state.destination, tooltip="Destination", icon=folium.Icon(color="red")).add_to(m)

# Draw existing route
if st.session_state.route_coords:
    coords = [(lat, lon) for lon, lat in st.session_state.route_coords]
    folium.PolyLine(coords, color="green", weight=5).add_to(m)

# Map click selection
map_data = st_folium(m, width=900, height=600)
if map_data and map_data.get("last_clicked"):
    lat = map_data["last_clicked"]["lat"]
    lon = map_data["last_clicked"]["lng"]
    if source_choice == "Click on Map":
        st.session_state.source = (lat, lon)
    if dest_choice == "Click on Map":
        st.session_state.destination = (lat, lon)

# --------------------------
# Find route
# --------------------------
if st.button("Find Route"):
    src_lat, src_lon = st.session_state.source
    dst_lat, dst_lon = st.session_state.destination
    payload = {"source": [src_lat, src_lon], "destination": [dst_lat, dst_lon]}
    try:
        res = requests.post(FASTAPI_URL, json=payload, timeout=30)
        res.raise_for_status()
        data = res.json()

        st.session_state.route_coords = data.get("route_coords", [])
        distance_km = data.get("distance_km", 0)

        st.success(f"🚗 Distance: {distance_km:.2f} km")

    except Exception as e:
        st.error(f"Routing failed: {e}")
