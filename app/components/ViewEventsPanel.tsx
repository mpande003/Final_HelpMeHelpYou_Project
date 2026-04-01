"use client";

import type { AppEvent } from "@/lib/events";

function buildAddress(event: AppEvent) {
  return [
    event.fullName,
    event.buildingStreetArea,
    event.villageTownCity,
    event.district,
    event.state,
    event.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function ViewEventsPanel({ events }: { events: AppEvent[] }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[#ead7cb] bg-[linear-gradient(135deg,#fffaf7_0%,#fff4ef_58%,#f7e7de_100%)] p-7 shadow-[0_18px_50px_rgba(94,52,33,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#aa725e]">
          Event registry
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#241815]">
          View Events
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6d554a]">
          Review all saved events in one place, including their status, map
          visibility, timing, and location details.
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-[#eadbd0] bg-white/92 p-6 shadow-[0_18px_45px_rgba(94,52,33,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ad725d]">
              Saved events
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#241815]">
              Events Table
            </h3>
          </div>
          <p className="text-sm text-[#71594e]">
            Total records: {events.length}
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#efe2d8] text-[#8d6f62]">
                <th className="px-3 py-3 font-semibold">Event</th>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">Date Range</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Marker</th>
                <th className="px-3 py-3 font-semibold">Coordinates</th>
                <th className="px-3 py-3 font-semibold">Location</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-[#755d52]" colSpan={7}>
                    No events have been saved yet.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="border-b border-[#f5ece5]">
                    <td className="px-3 py-4">
                      <div>
                        <p className="font-semibold text-[#241815]">
                          {event.eventName}
                        </p>
                        <p className="mt-1 text-xs text-[#7b6358]">
                          {event.description || "No description provided"}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-[#6f564b]">{event.eventType}</td>
                    <td className="px-3 py-4 text-[#6f564b]">
                      {event.startDate} to {event.endDate}
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-[#fff4e8] px-3 py-1 text-xs font-semibold text-[#9b5c1c]">
                        {event.status || "Not set"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          event.markerStatus === "active"
                            ? "bg-[#edf8ef] text-[#2d7a43]"
                            : "bg-[#fff3e9] text-[#9b5c1c]"
                        }`}
                      >
                        {event.markerStatus}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-[#6f564b]">
                      {event.latitude}, {event.longitude}
                    </td>
                    <td className="px-3 py-4 text-[#6f564b]">
                      {buildAddress(event) || "No location provided"}
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
