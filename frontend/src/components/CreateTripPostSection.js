import React, { useState } from "react";
import "./styles/CreatePostSection.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const CreateTripPostSection = ({ onCancel, onSubmit }) => {
  const [locations, setLocations] = useState([]);
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState([]);

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      const country = data.address.country;
      const city = data.address.city || data.address.town || data.address.village || "";

      const exists = locations.find((loc) => loc.lat === lat && loc.lng === lng);
      if (!exists) {
        setLocations((prev) => [...prev, { country, city, lat, lng }]);
      }
    } catch (err) {
      console.error("Błąd lokalizacji:", err);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({ click: handleMapClick });
    return null;
  };

  const generateTitle = () => {
    const grouped = locations.reduce((acc, loc) => {
      acc[loc.country] = acc[loc.country] || [];
      if (!acc[loc.country].includes(loc.city)) acc[loc.country].push(loc.city);
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([country, cities]) => `${country} - ${cities.join(", ")}`)
      .join(" | ");
  };

  const handlePhotoUpload = (e) => {
    setPhotos([...e.target.files]);
  };

  const handleSubmit = async () => {
    if (locations.length === 0) {
      alert("Wybierz przynajmniej jedną lokalizację!");
      return;
    }
  
    const formData = new FormData();
    formData.append("title", generateTitle());
    formData.append("description", description);
    formData.append("locationData", JSON.stringify(locations));
  
    if (duration) formData.append("duration", duration);
    if (price) formData.append("price", price);
    photos.forEach((file) => formData.append("photos", file));
  
    onSubmit(formData); // ⬅️ wysyłane do TripsPage.js
  };
  

  const handleRemoveLocation = (index) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="create-post-container">
      <h2>Nowa relacja z podróży</h2>

      <div className="map-wrapper">
        <MapContainer center={[52, 19]} zoom={5} style={{ height: "300px" }} scrollWheelZoom={true}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler />
          {locations.map((loc, i) => (
            <Marker key={i} position={[loc.lat, loc.lng]} />
          ))}
        </MapContainer>
      </div>

      {locations.length > 0 && (
        <div className="location-list">
          <h4>Wybrane miejsca:</h4>
          <ul>
            {locations.map((loc, index) => (
              <li key={index}>
                {loc.country} - {loc.city}{" "}
                <button onClick={() => handleRemoveLocation(index)}>❌</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-wrapper">
        <label>Tytuł (automatyczny):</label>
        <input type="text" value={generateTitle()} readOnly />

        <label>Opis:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Opisz swoją podróż..."
        />

        <label>Liczba spędzonych dni:</label>
        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />

        <label>Całkowity koszt (PLN):</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />

        <label>Zdjęcia z podróży:</label>
        <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} />

        <div className="form-actions">
          <button onClick={handleSubmit}>Dodaj</button>
          <button className="cancel" onClick={onCancel}>Anuluj</button>
        </div>
      </div>
    </div>
  );
};

export default CreateTripPostSection;
