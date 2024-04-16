campgroundss.features.forEach((item) => (item.type = 'Feature'));

let tiles = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
	maxZoom: 20,
	subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
});

let map = L.map('cluster-map').addLayer(tiles);

let markers = L.markerClusterGroup();

let geoJsonLayer = L.geoJson(campgroundss, {
	onEachFeature: function (feature, layer) {
		layer.bindPopup(
			`<a href="/campgrounds/${feature._id}"><h5>${feature.title}</h5></a>
			<p style="margin:0; opacity: 0.8;">${feature.location}</p>
			<p style="margin:5px 0">${feature.description.substring(0, 40)}...</p>`
		);
	},
});
markers.addLayer(geoJsonLayer);

map.addLayer(markers);
map.fitBounds(markers.getBounds());
