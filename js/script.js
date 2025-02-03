var map = L.map("map", {
  doubleClickZoom: false, // Disable double-click zoom
}).setView([16.402247682621997, 102.81088427798758], 9);

// Add satellite image
var osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

var Stadia_AlidadeSatellite = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}",
  {
    minZoom: 0,
    maxZoom: 20,
    attribution:
      '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: "jpg",
  }
);

var OpenTopoMap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 17,
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  }
);

osm.addTo(map);

// Load layers from GeoServer WMS
var wmsAMPHOE = L.tileLayer.wms(
  "http://localhost:8888/geoserver/CP373231/wms",
  {
    layers: "CP373231:AMPHOE",
    format: "image/png",
    transparent: true,
    version: "1.1.0",
    attribution: "AMPHOE boundary data from GeoServer WMS",
  }
);

// Define base map layers
var baseMaps = {
  OpenStreetMap: osm,
  Satellite: Stadia_AlidadeSatellite,
  Topographic: OpenTopoMap,
};

// Define overlay layers
var overlayMaps = {
  "AMPHOE Wms": wmsAMPHOE,
};

// Add layer control
var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

// Function to load Tambon WFS
function loadTambonWFS() {
  const wfsUrl = "http://localhost:8888/geoserver/CP373231/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=CP373231%3ATAMBON&maxFeatures=200&outputFormat=application%2Fjson";

  fetch(wfsUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูล WFS");
      }
      return response.json();
    })
    .then((geojsonData) => {
      const tambonLayer = L.geoJSON(geojsonData, {
        style: function (feature) {
          return {
            color: "purple", // สีเส้นขอบ
            weight: 2, // ความหนาเส้น
            fillOpacity: 0.2, // ความโปร่งใส
          };
        },
        onEachFeature: function (feature, layer) {
          if (feature.properties && feature.properties.TAM_NAMT) {
            layer.bindPopup(
              `<b>รหัสตำบล:</b> ${feature.properties.TAM_CODE}<br>` +
              `<b>ตำบล:</b> ${feature.properties.TAM_NAMT}`
            );
          }
        },
      });

      tambonLayer.addTo(map);
      layerControl.addOverlay(tambonLayer, "Tambon Wfs");
    })
    .catch((error) => {
      console.error("เกิดข้อผิดพลาด:", error);
    });
}

// Function to load Village WFS
function loadVillageWFS() {
  const wfsUrl = "http://localhost:8888/geoserver/CP373231/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=CP373231%3AVillage&maxFeatures=50&outputFormat=application%2Fjson";

  fetch(wfsUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูล WFS");
      }
      return response.json();
    })
    .then((geojsonData) => {
      const villageLayer = L.geoJSON(geojsonData, {
        style: function (feature) {
          return {
            color: "blue", // สีเส้นขอบ
            weight: 2, // ความหนาเส้น
            fillOpacity: 0.2, // ความโปร่งใส
          };
        },
        onEachFeature: function (feature, layer) {
          if (feature.properties && feature.properties.VILL_CODE) {
            layer.bindPopup(
              `<b>หมู่ที่:</b> ${feature.properties.VILL_CODE}` 
             
            );
          }
        },
      });

      villageLayer.addTo(map);
      layerControl.addOverlay(villageLayer, "Village Wfs");
    })
    .catch((error) => {
      console.error("เกิดข้อผิดพลาด:", error);
    });
}

// Function to load Village Point WFS
function loadVillagePointWFS() {
  const wfsUrl = "http://localhost:8888/geoserver/CP373231/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=CP373231%3AVillage_name_wgs84&maxFeatures=50&outputFormat=application%2Fjson";

  fetch(wfsUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูล WFS");
      }
      return response.json();
    })
    .then((geojsonData) => {
      const villagePointLayer = L.geoJSON(geojsonData, {
        onEachFeature: function (feature, layer) {
          if (feature.properties && feature.properties.VILL_NM_T) {
            layer.bindPopup(
              `<b>รหัสหมู่บ้าน:</b> ${feature.properties.VILL_IDN}<br>` +
              `<b>หมู่บ้าน:</b> ${feature.properties.VILL_NM_T}`
            );
          }
        },
      });

      villagePointLayer.addTo(map);
      layerControl.addOverlay(villagePointLayer, "Village Points Wfs");
    })
    .catch((error) => {
      console.error("เกิดข้อผิดพลาด:", error);
    });
}

// เรียกฟังก์ชันเพื่อโหลดข้อมูลทั้งหมด
loadTambonWFS();
loadVillageWFS();
loadVillagePointWFS();


// Add mini map
var miniMap = new L.Control.MiniMap(
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 15,
    attribution: "&copy; OpenStreetMap contributors",
  }),
  {
    toggleDisplay: true,
    position: "bottomright",
    zoomLevelOffset: -4,
  }
).addTo(map);

// แสดงพิกัดเมื่อเอาเมาส์ไปวางบนแผนที่
map.on("mousemove", (e) => {
  document.getElementById("lat").textContent = e.latlng.lat.toFixed(6);
  document.getElementById("long").textContent = e.latlng.lng.toFixed(6);
});

// แสดงข้อมูลเมื่อมีการซูมแผนที่
map.on("zoomend", () => {
  document.getElementById("zoom-level").textContent = map.getZoom();
});

// Show coordinates when mouse hovers over map
var kk_amphoe = new L.GeoJSON.AJAX("/data/kk_amphoe.geojson", {
  style: function (feature) {
    return { color: "red", weight: 2 };
  },
  onEachFeature: (feature, layer) => {
    if (feature.properties && feature.properties.AMP_NAME_T) {
      const popupContent =
        "อำเภอ: " +
        feature.properties.AMP_NAME_T +
        "<br>พื้นที่: " +
        feature.properties.Shape_Area +
        "</br>";

      layer.on("mouseover", (e) => {
        layer.bindPopup(popupContent).openPopup(e.latlng);
      });

      layer.on("mouseout", () => {
        layer.closePopup();
      });
    }
  },
});
kk_amphoe.addTo(map);

// Add layer for subdistricts (tambon)
var kk_tambon = new L.GeoJSON.AJAX("/data/kk_tambon.geojson", {
  style: function (feature) {
    return { color: "blue", weight: 2 };
  },
  onEachFeature: (feature, layer) => {
    if (feature.properties && feature.properties.AMP_NAMT) {
      const popupContent = "ตำบล: " + feature.properties.AMP_NAMT;

      layer.on("mouseover", (e) => {
        layer.bindPopup(popupContent).openPopup(e.latlng);
      });

      layer.on("mouseout", () => {
        layer.closePopup();
      });
    }
  },
});
kk_tambon.addTo(map);

// Add village points layer
var mk_village_pt = new L.GeoJSON.AJAX("/data/mk_village_pt.geojson", {
  onEachFeature: (feature, layer) => {
    if (feature.properties && feature.properties.VILL_NM_T) {
      const popupContent =
        "หมู่บ้าน: " +
        feature.properties.VILL_NM_T +
        "<br>ชื่อภาษาอังกฤษ : " +
        feature.properties.VILL_NM_E;

      layer.on("mouseover", (e) => {
        layer.bindPopup(popupContent).openPopup(e.latlng);
      });

      layer.on("mouseout", () => {
        layer.closePopup();
      });
    }
  },
});
mk_village_pt.addTo(map);

// เพิ่ม Cluster ให้กับ Marker ของหมู่บ้าน
mk_village_pt.on("data:loaded", () => {
  var markers = L.markerClusterGroup();

  // เพิ่ม Marker ต่าง ๆ ลงใน Cluster
  mk_village_pt.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      markers.addLayer(layer);
    }
  });

  // เพิ่ม Layer ของ Cluster ลงในแผนที่
  map.addLayer(markers);

  // เพิ่ม Cluster ลงใน Layer Control
  layerControl.addOverlay(markers, "Clustered Villages");
});

// Add village boundary layer
var mk_village = new L.GeoJSON.AJAX("/data/mk_village.geojson", {
  style: function (feature) {
    return { color: "green", weight: 2 };
  },
  onEachFeature: (feature, layer) => {
    if (feature.properties && feature.properties.VILL_CODE) {
      const popupContent = "หมู่ที่: " + feature.properties.VILL_CODE;

      layer.on("mouseover", (e) => {
        layer.bindPopup(popupContent).openPopup(e.latlng);
      });

      layer.on("mouseout", () => {
        layer.closePopup();
      });
    }
  },
});
mk_village.addTo(map);

// Add overlays to control
layerControl.addOverlay(kk_amphoe, "amphoe");
layerControl.addOverlay(mk_village_pt, "village_pt");
layerControl.addOverlay(mk_village, "village");
layerControl.addOverlay(kk_tambon, "tambon");

// Create marker on map double-click
let lastMarker = null; // เก็บ marker ตัวก่อนหน้า

map.on("dblclick", (e) => {
  const dateTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Bangkok",
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // ถ้ามี marker เก่าให้ลบ
  if (lastMarker) {
    map.removeLayer(lastMarker);
  }

  // สร้าง marker ใหม่ที่ตำแหน่งที่คลิก
  const marker = L.marker(e.latlng).addTo(map);

  marker
    .bindPopup(
      "<b> Lat:</b> " +
        e.latlng.lat.toFixed(6) +
        ", <b>Lng:</b> " +
        e.latlng.lng.toFixed(6) +
        "<br><b>DateTime:</b> " +
        dateTime
    )
    .openPopup();

  // เก็บ marker ตัวล่าสุด
  lastMarker = marker;
  e.originalEvent.stopPropagation();
});

// Add scale control
L.control.scale({ imperial: false, metric: true }).addTo(map);

// Handle current location button
document
  .getElementById("current-location-btn")
  .addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        map.setView([lat, lon], 15);

        const marker = L.marker([lat, lon]).addTo(map);

        marker
          .bindPopup(
            `<b>Your Location</b><br><b>Lat:</b> ${lat.toFixed(
              6
            )}<br><b>Lon: </b>${lon.toFixed(6)}`
          )
          .openPopup();

        marker.on("mouseover", () => marker.openPopup());
        marker.on("mouseout", () => marker.closePopup());
        marker.on("click", () => {
          alert(`Latitude: ${lat.toFixed(6)}, Longitude: ${lon.toFixed(6)}`);
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location.");
      }
    );
  });

var mea = L.control
  .polylineMeasure({
    position: "topleft",
    unit: "kilometres",
    showClearControl: "true",
  })
  .addTo(map);

// Fetch temperature using OpenWeatherMap API
var amphoeTemperatureLayer = null;

async function fetchTemperature(lat, lon) {
  const apiKey = "ffc9232b21140d317004e59a3b6f381c";
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.main.temp;
  } catch (error) {
    console.error("Error fetching temperature:", error);
    return null;
  }
}

// Assign color based on temperature
function getColor(temp) {
  if (temp >= 40) return "red";
  if (temp >= 30) return "orange";
  if (temp >= 20) return "yellow";
  if (temp >= 10) return "green";
  return "blue";
}

// Create Amphoe layer with temperature
function createAmphoeLayer(geojsonData) {
  if (
    !geojsonData ||
    !geojsonData.features ||
    geojsonData.features.length === 0
  ) {
    console.error("GeoJSON data is not valid or empty.");
    return;
  }

  const amphoeLayer = L.layerGroup();

  geojsonData.features.forEach((feature) => {
    const lat = feature.geometry.coordinates[0][0][0][1];
    const lon = feature.geometry.coordinates[0][0][0][0];

    fetchTemperature(lat, lon).then((temp) => {
      if (temp === null) return;

      const color = getColor(temp);

      var amphoeGeoJSON = L.geoJSON(feature, {
        style: function () {
          return { color: color, weight: 2 };
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.AMP_NAME_T) {
            const popupContent = `<b>อำเภอ:</b> ${feature.properties.AMP_NAME_T}<br><b>อุณหภูมิ:</b> ${temp} °C`;
            layer.bindPopup(popupContent);
          }
        },
      });

      amphoeLayer.addLayer(amphoeGeoJSON);
    });
  });

  return amphoeLayer;
}

// Load and display Amphoe temperature data
function fetchAndDisplayAmphoe() {
  if (amphoeTemperatureLayer) {
    map.removeLayer(amphoeTemperatureLayer);
    amphoeTemperatureLayer = null;
    return;
  }

  fetch("/data/kk_amphoe.geojson")
    .then((response) => response.json())
    .then((data) => {
      amphoeTemperatureLayer = createAmphoeLayer(data);
      map.addLayer(amphoeTemperatureLayer);
    })
    .catch((error) => {
      console.error("Error loading GeoJSON data:", error);
    });
}

// Add button for loading temperature data
var loadAmphoeButton = L.control({ position: "topright" });

loadAmphoeButton.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-bar");
  div.innerHTML =
    '<button style="background-color:rgb(255, 255, 255); padding: 5px; border-radius: 5px; ">อุณหภูมิ</button>';

  div.firstChild.onclick = function () {
    fetchAndDisplayAmphoe();
  };
  return div;
};

loadAmphoeButton.addTo(map);
