"use client";

import { useState } from "react";
import {
  internalFormInputClassName,
  internalSecondaryButtonClassName,
} from "./internalTheme";

type MapLinkExtractorProps = {
  onCoordinatesExtracted: (lat: string, lng: string, rawLink: string) => void;
};

export default function MapLinkExtractor({ onCoordinatesExtracted }: MapLinkExtractorProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExtract = async () => {
    if (!url.trim()) {
      setError("Please enter a Google Maps link.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/get-coordinates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract coordinates.");
      }

      if (data.lat && data.lng) {
        // Trigger the callback to update the parent components (Event Creation form)
        onCoordinatesExtracted(data.lat, data.lng, url);
        setUrl(""); // Clear input on success
      } else {
        throw new Error("Coordinates not found in this URL format.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while parsing.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border-warm)] bg-[#fffaf5] p-5 shadow-sm">
      <h4 className="text-sm font-semibold tracking-tight text-[var(--red-dark)]">
        Extract from Google Maps Link
      </h4>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Paste any Google Maps link (including short links like maps.app.goo.gl) to auto-fill latitude and longitude.
      </p>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          className={`${internalFormInputClassName} flex-1`}
          placeholder="https://maps.app.goo.gl/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleExtract}
          disabled={isLoading || !url}
          className={`${internalSecondaryButtonClassName} whitespace-nowrap disabled:opacity-50`}
        >
          {isLoading ? "Extracting..." : "Auto-fill map data"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
