const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
  
      return {
        country: data.address.country || "",
        city: data.address.city || data.address.town || data.address.village || "",
        lat,
        lon
      };
    } catch (error) {
      console.error("Błąd geolokalizacji:", error);
      return null;
    }
  };
  
  export default reverseGeocode;
  