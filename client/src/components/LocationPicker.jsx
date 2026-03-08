import { useState, useEffect } from 'react';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition({ latitude: e.latlng.lat, longitude: e.latlng.lng });
        },
    });

    return position ? <Marker position={[position.latitude, position.longitude]} /> : null;
};

const LocationPicker = ({ location, setLocation, address, setAddress }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    useEffect(() => {
        if (!location) detectLocation();
    }, []);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
                <button
                    type="button"
                    onClick={detectLocation}
                    disabled={loading}
                    className="btn-outline !py-2 !px-4 text-sm flex items-center gap-2"
                >
                    <HiOutlineLocationMarker className="w-4 h-4" />
                    {loading ? 'Detecting...' : 'Auto-detect Location'}
                </button>
                {location && (
                    <span className="text-xs text-gray-500 whitespace-nowrap hidden sm:inline">
                        📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </span>
                )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <input
                type="text"
                value={address || ''}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter pickup address (e.g., Building Name, Street)"
                className="input-field mb-2"
            />

            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-64 sm:h-80 relative z-0">
                {location ? (
                    <>
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur text-xs font-medium px-3 py-1.5 rounded-full shadow-sm text-gray-700 pointer-events-none">
                            Click anywhere on the map to adjust pin
                        </div>
                        <MapContainer
                            center={[location.latitude, location.longitude]}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker position={location} setPosition={setLocation} />
                        </MapContainer>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <HiOutlineLocationMarker className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 max-w-xs">Please allow location access to drop a pin on the map</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationPicker;
