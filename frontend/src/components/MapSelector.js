import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const LocationPicker = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
};

const MapSelector = ({ markers, setMarkers }) => {
  const handleSelect = (latlng) => {
    setMarkers([...markers, latlng]);
  };

  return (
    <MapContainer
      center={[52.2297, 21.0122]} // domyślnie Warszawa
      zoom={5}
      style={{ height: "300px", width: "100%", marginTop: "10px" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationPicker onSelect={handleSelect} />
      {markers.map((pos, idx) => (
        <Marker key={idx} position={pos} />
      ))}
    </MapContainer>
  );
};

export default MapSelector;
