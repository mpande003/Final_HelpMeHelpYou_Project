"use client";

import { useActionState, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import {
  readdEventMarkerAction,
  removeEventMarkerAction,
} from "./event-actions";

type EventSummary = {
  id: number;
  eventName: string;
  eventType: string;
  description: string | null;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  fullName: string | null;
  buildingStreetArea: string | null;
  villageTownCity: string | null;
  district: string | null;
  state: string | null;
  mapLink: string | null;
  latitude: number;
  longitude: number;
  status: string | null;
  markerStatus: "active" | "removed";
};

const EventMap = dynamic(() => import("./EventMap"), { ssr: false });

function buildAddress(event: EventSummary) {
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

export default function ImpactMapPanel({ events }: { events: EventSummary[] }) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    events.find((event) => event.markerStatus === "active")?.id ?? null,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeEventMarkerAction,
    { error: "", success: "" },
  );
  const [readdState, readdAction, readdPending] = useActionState(
    readdEventMarkerAction,
    { error: "", success: "" },
  );
  const activeEvents = useMemo(
    () => events.filter((event) => event.markerStatus === "active"),
    [events],
  );
  const removedEvents = useMemo(
    () => events.filter((event) => event.markerStatus === "removed"),
    [events],
  );
  const effectiveSelectedEventId =
    selectedEventId &&
    activeEvents.some((event) => event.id === selectedEventId)
      ? selectedEventId
      : (activeEvents[0]?.id ?? null);

  const selectedEvent = useMemo(
    () =>
      activeEvents.find((event) => event.id === effectiveSelectedEventId) ?? null,
    [effectiveSelectedEventId, activeEvents],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[#ead7cb] bg-[linear-gradient(135deg,#fffaf7_0%,#fff4ef_58%,#f7e7de_100%)] p-7 shadow-[0_18px_50px_rgba(94,52,33,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#aa725e]">
          Geographic impact
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#241815]">
          Impact Map
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6d554a]">
          Every saved event with latitude and longitude is placed on the map.
          Click a marker to review its core event details.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="overflow-hidden rounded-[1.75rem] border border-[#eadbd0] bg-white/92 shadow-[0_18px_45px_rgba(94,52,33,0.08)]">
          {activeEvents.length === 0 ? (
            <div className="flex min-h-[420px] items-center justify-center p-8 text-center text-sm text-[#755d52]">
              Save an event with latitude and longitude to place its marker on
              the impact map.
            </div>
          ) : (
            <div className="h-[420px]">
              <EventMap
                events={activeEvents}
                selectedEventId={effectiveSelectedEventId}
                onSelectEvent={setSelectedEventId}
              />
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-[#eadbd0] bg-white/92 p-6 shadow-[0_18px_45px_rgba(94,52,33,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ad725d]">
            Marker details
          </p>
          {selectedEvent ? (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-2xl font-semibold text-[#241815]">
                  {selectedEvent.eventName}
                </h3>
                <p className="mt-1 text-sm text-[#71594e]">
                  {selectedEvent.eventType}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#fbf6f2] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9a7464]">
                    Dates
                  </p>
                  <p className="mt-2 text-sm text-[#3a2823]">
                    {selectedEvent.startDate} to {selectedEvent.endDate}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#fbf6f2] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9a7464]">
                    Time
                  </p>
                  <p className="mt-2 text-sm text-[#3a2823]">
                    {selectedEvent.startTime ?? "-"} to{" "}
                    {selectedEvent.endTime ?? "-"}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#fbf6f2] p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9a7464]">
                    Location
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#3a2823]">
                    {buildAddress(selectedEvent) || "No address provided"}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#fbf6f2] p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9a7464]">
                    Description
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#3a2823]">
                    {selectedEvent.description || "No description provided"}
                  </p>
                </div>
              </div>

              {selectedEvent.mapLink && (
                <a
                  href={selectedEvent.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-[#e6d5ca] bg-[#fff7f2] px-4 py-2 text-sm font-medium text-[#7a1418] transition hover:bg-[#ffefe5]"
                >
                  Open map link
                </a>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#71594e]">
              Select a marker to inspect its event details.
            </p>
          )}
        </section>
      </div>

      <section className="rounded-[1.75rem] border border-[#eadbd0] bg-white/92 p-6 shadow-[0_18px_45px_rgba(94,52,33,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ad725d]">
              Marker registry
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#241815]">
              Markers Table
            </h3>
          </div>
          <p className="text-sm text-[#71594e]">
            Manage every mapped event location directly from this table.
          </p>
        </div>

        {(removeState.error || removeState.success) && (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
              removeState.error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {removeState.error || removeState.success}
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#efe2d8] text-[#8d6f62]">
                <th className="px-3 py-3 font-semibold">Event</th>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">Coordinates</th>
                <th className="px-3 py-3 font-semibold">Date Range</th>
                <th className="px-3 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeEvents.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-[#755d52]" colSpan={5}>
                    No markers available yet.
                  </td>
                </tr>
              ) : (
                activeEvents.map((event) => (
                  <tr
                    key={event.id}
                    className={`border-b border-[#f5ece5] ${
                      effectiveSelectedEventId === event.id ? "bg-[#fff8f3]" : ""
                    }`}
                  >
                    <td className="px-3 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedEventId(event.id)}
                        className="text-left"
                      >
                        <span className="block font-semibold text-[#241815]">
                          {event.eventName}
                        </span>
                        <span className="block text-xs text-[#7b6358]">
                          {buildAddress(event) || "No address provided"}
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-4 text-[#6f564b]">
                      {event.eventType}
                    </td>
                    <td className="px-3 py-4 text-[#6f564b]">
                      {event.latitude}, {event.longitude}
                    </td>
                    <td className="px-3 py-4 text-[#6f564b]">
                      {event.startDate} to {event.endDate}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEventId(event.id)}
                          className="rounded-full border border-[#dfd1c6] bg-white px-3 py-1.5 text-xs font-medium text-[#3a2823] transition hover:bg-[#faf4ef]"
                        >
                          View
                        </button>
                        <form action={removeAction}>
                          <input type="hidden" name="eventId" value={event.id} />
                          <button
                            type="submit"
                            disabled={removePending}
                            className="rounded-full border border-[#f0d3cf] bg-[#fff6f5] px-3 py-1.5 text-xs font-medium text-[#a52b2f] transition hover:bg-[#ffeceb] disabled:opacity-50"
                          >
                            {removePending ? "Removing..." : "Remove Marker"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[#eadbd0] bg-white/92 p-6 shadow-[0_18px_45px_rgba(94,52,33,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ad725d]">
              Removed markers
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#241815]">
              Re-add Markers Table
            </h3>
          </div>
          <p className="text-sm text-[#71594e]">
            Restore previously removed markers back onto the impact map.
          </p>
        </div>

        {(readdState.error || readdState.success) && (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
              readdState.error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {readdState.error || readdState.success}
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#efe2d8] text-[#8d6f62]">
                <th className="px-3 py-3 font-semibold">Event</th>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">Coordinates</th>
                <th className="px-3 py-3 font-semibold">Date Range</th>
                <th className="px-3 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {removedEvents.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-[#755d52]" colSpan={5}>
                    No removed markers available.
                  </td>
                </tr>
              ) : (
                removedEvents.map((event) => (
                  <tr key={event.id} className="border-b border-[#f5ece5]">
                    <td className="px-3 py-4">
                      <span className="block font-semibold text-[#241815]">
                        {event.eventName}
                      </span>
                      <span className="block text-xs text-[#7b6358]">
                        {buildAddress(event) || "No address provided"}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-[#6f564b]">
                      {event.eventType}
                    </td>
                    <td className="px-3 py-4 text-[#6f564b]">
                      {event.latitude}, {event.longitude}
                    </td>
                    <td className="px-3 py-4 text-[#6f564b]">
                      {event.startDate} to {event.endDate}
                    </td>
                    <td className="px-3 py-4">
                      <form action={readdAction}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <button
                          type="submit"
                          disabled={readdPending}
                          className="rounded-full border border-[#cfe6d4] bg-[#eef8f0] px-3 py-1.5 text-xs font-medium text-[#2d7a43] transition hover:bg-[#e5f5e8] disabled:opacity-50"
                        >
                          {readdPending ? "Adding..." : "Re-add Marker"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
