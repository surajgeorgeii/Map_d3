let map;
let tooltip;
let populationScale;
let markerGroup = L.layerGroup();
let townData = [];

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
        const marker = L.circleMarker([town.lat, town.lng], {
            color: "#FF4500",
            weight: 1,
            fillOpacity: 0.8,
            radius: radius
        }).addTo(markerGroup);
        
        // Manually open and close the popup on hover
        marker.on('mouseover', function () {
            this.openPopup();
        }).on('mouseout', function () {
            this.closePopup();
        });

        // Setting popup content separately
        marker.bindPopup(`
            <div><strong>Town:</strong> <a href="https://en.wikipedia.org/wiki/${town.Town}" target="_blank">${town.Town}</a></div>
            <div><strong>County:</strong> ${town.County}</div>
            <div><strong>Population:</strong> ${town.Population}</div>
        `);
    });
}

function updateTownCount() {
    const count = document.getElementById("slider").value;
    document.getElementById("town-count").innerText = count;
}

document.addEventListener("DOMContentLoaded", initializeMap);
