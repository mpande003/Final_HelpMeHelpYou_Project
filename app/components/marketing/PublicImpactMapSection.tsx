"use client";

import dynamic from "next/dynamic";

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

const PublicImpactMap = dynamic(() => import("./PublicImpactMap"), {
  ssr: false,
});

export default function PublicImpactMapSection({
  events,
}: {
  events: PublicImpactEvent[];
}) {
  return <PublicImpactMap events={events} />;
}
