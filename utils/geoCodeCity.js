module.exports.geoCodeCity = async (location) => {
	var apiUrl = `https://nominatim.openstreetmap.org/search?q=${location}&format=geojson&limit=1`;
	try {
		// AJAX request to OpenStreetMap Nominatim
		var response = await fetch(apiUrl);
		var data = await response.json();
		return data.features[0].geometry;
	} catch (error) {
		console.error('Error:', error);
		// Handle error (e.g., display error message to user)
	}
};
