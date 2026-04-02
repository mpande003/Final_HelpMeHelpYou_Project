import { PublicSiteShell } from "../components/marketing/PublicSiteShell";
import PublicImpactMapSection from "../components/marketing/PublicImpactMapSection";
import { listEvents } from "../../lib/events";

export const metadata = {
  title: "Impact Map | CEP Project",
  description:
    "View event locations on the CEP Project public impact map with OpenStreetMap markers.",
};

export default function ImpactPage() {
  const events = listEvents()
    .filter((event) => event.markerStatus === "active")
    .map((event) => ({
      id: event.id,
      eventName: event.eventName,
      eventType: event.eventType,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      villageTownCity: event.villageTownCity,
      district: event.district,
      state: event.state,
      fullName: event.fullName,
      buildingStreetArea: event.buildingStreetArea,
      mapLink: event.mapLink,
      latitude: event.latitude,
      longitude: event.longitude,
    }));

  return (
    <PublicSiteShell activePath="/impact">
      <section className="container content-section">
        <PublicImpactMapSection events={events} />
      </section>
    </PublicSiteShell>
  );
}
