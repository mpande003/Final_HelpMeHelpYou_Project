"use client";

import { useState } from "react";
import type { AppEvent } from "@/lib/events";
import ViewEventsPanel from "./ViewEventsPanel";
import AddEventForm from "./AddEventForm";
import UpdateEventForm from "./UpdateEventForm";
import DeleteEventPanel from "./DeleteEventPanel";

type EventView = "list" | "add" | "update" | "delete";

export default function EventManagementHub({ events }: { events: AppEvent[] }) {
  const [currentView, setCurrentView] = useState<EventView>("list");
  // We will need a way to pass the selected event to Update/Delete forms in the future.
  // For now, the forms have their own selection dropdowns or logic.

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-[#eadfb4] bg-[#fffaf0] p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#213028]">
            Event Management Hub
          </h2>
          <p className="mt-1 text-sm text-[#74673f]">
            {currentView === "list" && "Viewing all registered NGO events."}
            {currentView === "add" && "Creating a new event."}
            {currentView === "update" && "Updating an existing event."}
            {currentView === "delete" && "Removing an event from the registry."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentView !== "list" && (
            <button
              type="button"
              onClick={() => setCurrentView("list")}
              className="rounded-full border border-[#eadfb4] bg-white px-4 py-2 text-sm font-semibold text-[#8b6b18] transition hover:bg-[#fff8e8]"
            >
              Back to List
            </button>
          )}

          {currentView === "list" && (
            <>
              <button
                type="button"
                onClick={() => setCurrentView("update")}
                className="rounded-full border border-[#eadfb4] bg-white px-4 py-2 text-sm font-semibold text-[#8b6b18] transition hover:bg-[#fff8e8]"
              >
                Edit Event
              </button>
              <button
                type="button"
                onClick={() => setCurrentView("delete")}
                className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Delete Event
              </button>
              <button
                type="button"
                onClick={() => setCurrentView("add")}
                className="rounded-full bg-[#b08b2e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c19831]"
              >
                Create Event
              </button>
            </>
          )}
        </div>
      </div>

      <div>
        {currentView === "list" && <ViewEventsPanel events={events} />}
        {currentView === "add" && <AddEventForm />}
        {currentView === "update" && <UpdateEventForm events={events} />}
        {currentView === "delete" && <DeleteEventPanel events={events} />}
      </div>
    </div>
  );
}
