import { WebView } from 'react-native-webview';
import { View } from 'react-native';

interface MapProps {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

const Map = ({ latitude, longitude, city, country }: MapProps) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; }
          #map { height: 100vh; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${latitude}, ${longitude}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          L.marker([${latitude}, ${longitude}])
            .addTo(map)
            .bindPopup("${city}, ${country}");
        </script>
      </body>
    </html>
  `;

  return (
    <View className="h-full w-full overflow-hidden rounded-lg">
      <WebView
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default Map;