// src/components/CreatePostSection.js
import React, { useState } from "react";
import "./styles/CreatePostSection.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Poprawne ikony Leaflet
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const CreatePostSection = ({ onCancel, onSubmit }) => {
  const [locations, setLocations] = useState([]);
  const [travelDate, setTravelDate] = useState("");
  const [duration, setDuration] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [description, setDescription] = useState("");

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();

      const country = data.address.country;
      const city = data.address.city || data.address.town || data.address.village || "";

      const newLocation = { country, city, lat, lng };
      setLocations((prev) => [...prev, newLocation]);
      // Zapobiegamy dodaniu duplikatu
      const exists = locations.find(
        (loc) => loc.lat === lat && loc.lng === lng
      );
      if (!exists) {
        setLocations((prev) => [...prev, newLocation]);
      }
    } catch (err) {
      console.error("Błąd podczas pobierania lokalizacji:", err);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
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

  const handleSubmit = () => {
    if (locations.length === 0) {
      alert("Musisz wybrać przynajmniej jedną lokalizację na mapie!");
      return;
    }

    const post = {
      title: generateTitle(),
      description,
      travelDate,
      duration,
      priceFrom,
      priceTo,
      maxPeople,
      locationData: locations,
    };

    onSubmit(post);
  };

  return (
    <div className="create-post-container">
      <h2>Nowy wyjazd</h2>

      <div className="map-wrapper">
          <MapContainer
      center={[52, 19]}
      zoom={5}
      style={{ height: "300px" }}
      scrollWheelZoom={false}
      whenCreated={(mapInstance) => {
        setTimeout(() => {
          mapInstance.invalidateSize(); // Fix dla błędów wyświetlania
        }, 0);
      }}
    >

          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler />
          {locations.map((loc, i) => (
            <Marker key={i} position={[loc.lat, loc.lng]} />
          ))}
        </MapContainer>
      </div>

      <div className="form-wrapper">
        <label>Tytuł (automatyczny):</label>
        <input type="text" value={generateTitle()} readOnly />

        <label>Opis:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opisz wyjazd, plany, atrakcje itd..."
          rows={4}
        />

        <label>Data wyjazdu:</label>
        <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />

        <label>Liczba dni:</label>
        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />

        <label>Cena od:</label>
        <input type="number" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} />

        <label>Cena do:</label>
        <input type="number" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} />

        <label>Maksymalna liczba osób:</label>
        <input type="number" value={maxPeople} onChange={(e) => setMaxPeople(e.target.value)} />

        <div className="form-actions">
          <button onClick={handleSubmit}>Dodaj</button>
          <button className="cancel" onClick={onCancel}>Anuluj</button>
        </div>
      </div>
    </div>
  );
};


export default CreatePostSection;
