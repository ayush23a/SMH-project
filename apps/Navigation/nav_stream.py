# frontend.py
import streamlit as st
import requests
import folium
from streamlit_folium import st_folium
from streamlit_js_eval import get_geolocation

st.set_page_config(page_title="India Navigation", layout="wide")
st.title("🗺️ India Navigation System")

FASTAPI_URL = "http://localhost:8000/api/route"

# Hot locations
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
    "Other": (22.9734, 78.6569)
}

# --- Get current location from browser ---
geo = get_geolocation()
if geo:
    current_location = (geo["coords"]["latitude"], geo["coords"]["longitude"])
    st.success(f"📍 Current Location: {current_location}")
else:
    st.warning("Browser did not return location. Allow location access or choose manually.")
    current_location = HOT_LOCATIONS["Other"]

# --- Source Selection ---
st.subheader("Select Source")
source_choice = st.radio("Pick source:", ["Use Current Location", "Select Hot Location"])
if source_choice == "Use Current Location":
    source = current_location
else:
    source_name = st.selectbox("Choose source city", list(HOT_LOCATIONS.keys()))
    source = HOT_LOCATIONS[source_name]

# --- Destination Selection ---
st.subheader("Select Destination")
dest_name = st.selectbox("Choose destination city", list(HOT_LOCATIONS.keys()))
destination = HOT_LOCATIONS[dest_name]

# --- Request route from backend ---
if st.button("Get Route"):
    try:
        payload = {"source": source, "destination": destination}
        res = requests.post(FASTAPI_URL, json=payload)
        res.raise_for_status()
        data = res.json()

        # Build map
        m = folium.Map(location=source, zoom_start=6)
        folium.Marker(source, tooltip="Source", icon=folium.Icon(color="blue")).add_to(m)
        folium.Marker(destination, tooltip="Destination", icon=folium.Icon(color="red")).add_to(m)

        coords = [(lat, lon) for lon, lat in data["route_coords"]]
        folium.PolyLine(coords, color="green", weight=5).add_to(m)

        st.subheader(f"🚗 Distance: {data['distance_km']:.2f} km")
        st_folium(m, width=900, height=600)

    except Exception as e:
        st.error(f"Routing failed: {e}")
