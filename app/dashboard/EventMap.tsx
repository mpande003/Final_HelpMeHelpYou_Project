"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

type EventSummary = {
  id: number;
  eventName: string;
  eventType: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
};

function FitBounds({ events }: { events: EventSummary[] }) {
  const map = useMap();

  useEffect(() => {
    if (events.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(
      events.map((event) => [event.latitude, event.longitude] as [number, number]),
    );
    map.fitBounds(bounds.pad(0.2));
  }, [events, map]);

  return null;
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function EventMap({
  events,
  selectedEventId,
  onSelectEvent,
}: {
  events: EventSummary[];
  selectedEventId: number | null;
  onSelectEvent: (eventId: number) => void;
}) {
  const center: [number, number] = events.length
    ? [events[0].latitude, events[0].longitude]
    : [20.5937, 78.9629];

  return (
    <MapContainer center={center} zoom={5} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds events={events} />
      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.latitude, event.longitude]}
          icon={markerIcon}
          eventHandlers={{
            click: () => onSelectEvent(event.id),
          }}
        >
          {selectedEventId === event.id && (
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{event.eventName}</p>
                <p>{event.eventType}</p>
                <p>
                  {event.startDate} to {event.endDate}
                </p>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
