let map;
let tooltip;
let populationScale;
let markerGroup = L.layerGroup();
let townData = [];
let popupTimeout;  // Timeout variable to manage popup delay

document.addEventListener("DOMContentLoaded", initializeMap);

function initializeMap() {
    map = L.map('map').setView([53.829, -4.526], 6);
    var baseLayers = {
        "OpenStreetMap Standard": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map),
        "CartoDB Positron": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
            attribution: 'Map tiles by CARTO, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
        }),
        "CartoDB Dark Matter": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
            attribution: 'Map tiles by CARTO, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
        }),
        "Esri World Street Map": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
        }),
        "Esri World Imagery": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }),
        "Open Topo Map": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>'
        }),
    };
    L.control.layers(baseLayers).addTo(map);
    markerGroup.addTo(map);
    tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
    populationScale = d3.scaleSqrt().range([3, 20]);
    loadMapData();
}

function loadMapData() {
    const numTowns = document.getElementById("slider").value;

    // Handle case when the number of towns is 0
    if (numTowns === "0") {
        markerGroup.clearLayers(); // Clear the map markers
        alert('No towns to display'); // Optionally, show an alert
        return; // Exit the function early
    }

    // If the number of towns is greater than 0, fetch and display the data
    if (numTowns > 0) {
        fetch(`http://34.147.162.172/Circles//Towns/${numTowns}`)
            .then(response => response.ok ? response.json() : Promise.reject('Load failed: ' + response.statusText))
            .then(data => {
                townData = data;
                const populations = data.map(town => Number(town.Population));
                populationScale.domain([Math.min(...populations), Math.max(...populations)]);
                updateMap(data);
            })
            .catch(error => {
                alert('Failed to load data: ' + error);
                console.error(error);
            });
    }
}

function updateMap(townData) {
    markerGroup.clearLayers();
    townData.forEach(town => {
        const radius = populationScale(Number(town.Population));

        // Create the circle marker
        const circleMarker = L.circleMarker([town.lat, town.lng], {
            color: "#FF4500",
            weight: 1,
            fillOpacity: 0.5,
            radius: radius
        }).addTo(markerGroup);

        // Set up the popup content
        const popupContent = `
            <div><strong>Town:</strong> <a href="https://en.wikipedia.org/wiki/${town.Town}" target="_blank">${town.Town}</a></div>
            <div><strong>County:</strong> ${town.County}</div>
            <div><strong>Population:</strong> ${town.Population}</div>
        `;

        // Bind the popup to the circle marker
        circleMarker.bindPopup(popupContent);

        // Handle mouseover event on the circle marker to open the popup
        circleMarker.on('mouseover', function () {
            clearTimeout(popupTimeout); // Clear any existing timeout to prevent premature closing
            this.openPopup();
        });

        // Handle mouseout event to keep the popup open for 2 seconds
        circleMarker.on('mouseout', function () {
            popupTimeout = setTimeout(() => {
                this.closePopup();  // Close popup after delay
            }, 2000);  // Keep the popup open for 2 seconds
        });

        // Handle click event on the circle marker for zoom and show popup
        circleMarker.on('click', function () {
            map.flyTo([town.lat, town.lng], 13, {
                animate: true,
                duration: 1.5  // Smoother transition with increased duration
            });

            // Show popup after zoom is complete (delay for smoother transition)
            setTimeout(() => {
                this.openPopup();
            }, 1500); // Delay matches the flyTo duration
        });
    });

    // Listen for map zoomstart and zoomend events
    map.on('zoomstart', function () {
        // Reduce fill opacity during zoom to make circles fade
        markerGroup.eachLayer(layer => {
            if (layer instanceof L.CircleMarker) {
                layer.setStyle({ fillOpacity: 0.1 });
            }
        });
    });

    map.on('zoomend', function () {
        // Restore fill opacity after zooming is complete
        markerGroup.eachLayer(layer => {
            if (layer instanceof L.CircleMarker) {
                layer.setStyle({ fillOpacity: 0.5 });
            }
        });
    });
}

function updateTownCount() {
    const count = document.getElementById("slider").value;
    document.getElementById("town-count").innerText = count;
}

document.addEventListener("DOMContentLoaded", initializeMap);
