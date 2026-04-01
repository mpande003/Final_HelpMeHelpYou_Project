"use client";

import { useActionState, useState } from "react";

import type { AppEvent } from "@/lib/events";
import { deleteEventAction } from "../dashboard/event-actions";

function buildAddress(event: AppEvent) {
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

export default function DeleteEventPanel({ events }: { events: AppEvent[] }) {
  const [selectedEventId, setSelectedEventId] = useState(
    events[0] ? String(events[0].id) : "",
  );
  const [state, formAction, isPending] = useActionState(deleteEventAction, {
    error: "",
    success: "",
  });

  const selectedEvent = events.find((event) => String(event.id) === selectedEventId);

  if (events.length === 0) {
    return (
      <section className="rounded-[1.75rem] border border-[#eadbd0] bg-white/92 p-8 shadow-[0_18px_45px_rgba(94,52,33,0.08)]">
        <h2 className="text-2xl font-semibold text-[#241815]">Delete Event</h2>
        <p className="mt-3 text-sm text-[#71594e]">
          No events are available to delete yet.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[#ead7cb] bg-[linear-gradient(135deg,#fffaf7_0%,#fff4ef_58%,#f7e7de_100%)] p-7 shadow-[0_18px_50px_rgba(94,52,33,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#aa725e]">
          Event operations
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#241815]">
          Delete Event
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6d554a]">
          Permanently remove an event record and its marker data from the
          system. This action also writes to the audit log.
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-[#eadbd0] bg-white/92 p-6 shadow-[0_18px_45px_rgba(94,52,33,0.08)]">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6b5c]">
                Select Event
              </span>
              <select
                className="w-full rounded-2xl border border-[#e9d7cb] bg-white px-4 py-3 text-sm text-[#251916] outline-none transition focus:border-[#8d2925] focus:ring-4 focus:ring-[#8d2925]/10"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.eventName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedEvent && (
            <div className="rounded-[1.5rem] border border-[#f0d7d4] bg-[#fff7f6] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b06d59]">
                Selected event
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#241815]">
                {selectedEvent.eventName}
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9a7464]">
                    Type
                  </p>
                  <p className="mt-2 text-sm text-[#3a2823]">
                    {selectedEvent.eventType}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9a7464]">
                    Date Range
                  </p>
                  <p className="mt-2 text-sm text-[#3a2823]">
                    {selectedEvent.startDate} to {selectedEvent.endDate}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9a7464]">
                    Location
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#3a2823]">
                    {buildAddress(selectedEvent) || "No location provided"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {(state.error || state.success) && (
          <div
            className={`mt-5 rounded-2xl border px-5 py-4 text-sm font-medium ${
              state.error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {state.error || state.success}
          </div>
        )}

        <form action={formAction} className="mt-6">
          <input type="hidden" name="eventId" value={selectedEventId} />
          <button
            type="submit"
            disabled={isPending || !selectedEventId}
            className="rounded-full border border-[#f0d3cf] bg-[#a52b2f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8f1f24] disabled:opacity-50"
          >
            {isPending ? "Deleting event..." : "Delete event permanently"}
          </button>
        </form>
      </section>
    </div>
  );
}
