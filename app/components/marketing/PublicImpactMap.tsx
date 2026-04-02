"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

type PublicImpactEvent = {
  id: number;
  eventName: string;
  eventType: string;
  description: string | null;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  villageTownCity: string | null;
  district: string | null;
  state: string | null;
  fullName: string | null;
  buildingStreetArea: string | null;
  mapLink: string | null;
  latitude: number;
  longitude: number;
};

function buildAddress(event: PublicImpactEvent) {
  return [
    event.fullName,
    event.buildingStreetArea,
    event.villageTownCity,
    event.district,
    event.state,
  ]
    .filter(Boolean)
    .join(", ");
}

function FitBounds({ events }: { events: PublicImpactEvent[] }) {
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

export default function PublicImpactMap({
  events,
}: {
  events: PublicImpactEvent[];
}) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    events[0]?.id ?? null,
  );

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? events[0] ?? null,
    [events, selectedEventId],
  );

  const center: [number, number] = events.length
    ? [events[0].latitude, events[0].longitude]
    : [20.5937, 78.9629];

  const additionalEvents = useMemo(
    () => events.filter((event) => event.id !== selectedEvent?.id).slice(0, 5),
    [events, selectedEvent],
  );

  if (events.length === 0) {
    return (
      <div className="impact-empty">
        No mapped events are available yet. Add event coordinates in the dashboard to publish
        them here.
      </div>
    );
  }

  return (
    <div className="impact-layout">
      <section className="impact-map-card">
        <div className="impact-map-frame">
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
                  click: () => setSelectedEventId(event.id),
                }}
              >
                <Popup>
                  <div className="impact-popup">
                    <p className="impact-popup-title">{event.eventName}</p>
                    <p>{event.eventType}</p>
                    <p>
                      {event.startDate} to {event.endDate}
                    </p>
                    <p>{buildAddress(event) || "Location details available in the panel."}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>

      <section className="impact-details-card">
        <p className="page-header-eyebrow">Selected marker</p>
        {selectedEvent ? (
          <div className="impact-details">
            <div>
              <h2>{selectedEvent.eventName}</h2>
              <p className="impact-subtitle">{selectedEvent.eventType}</p>
            </div>

            <div className="impact-detail-grid">
              <article className="impact-detail-box">
                <p className="impact-label">Date</p>
                <p>
                  {selectedEvent.startDate} to {selectedEvent.endDate}
                </p>
              </article>
              <article className="impact-detail-box">
                <p className="impact-label">Time</p>
                <p>
                  {selectedEvent.startTime ?? "-"} to {selectedEvent.endTime ?? "-"}
                </p>
              </article>
              <article className="impact-detail-box impact-detail-box-wide">
                <p className="impact-label">Location</p>
                <p>{buildAddress(selectedEvent) || "No address provided"}</p>
              </article>
              <article className="impact-detail-box impact-detail-box-wide">
                <p className="impact-label">Event info</p>
                <p>{selectedEvent.description || "No description provided for this event yet."}</p>
              </article>
            </div>

            {selectedEvent.mapLink ? (
              <a
                href={selectedEvent.mapLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
              >
                Open location link
              </a>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="impact-list-card">
        <p className="page-header-eyebrow">Other entries</p>
        {additionalEvents.length > 0 ? (
          <div className="impact-entry-list">
            {additionalEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                className="impact-entry-item"
                onClick={() => setSelectedEventId(event.id)}
              >
                <div>
                  <h3>{event.eventName}</h3>
                  <p>{event.eventType}</p>
                </div>
                <span>{event.villageTownCity || event.district || "View event"}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="impact-empty-list">No additional mapped events available.</p>
        )}
      </section>
    </div>
  );
}
