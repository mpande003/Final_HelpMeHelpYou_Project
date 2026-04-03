import { NextResponse } from "next/server";
import { extractCoordinatesFromUrl, isGoogleMapsLink } from "@/lib/mapUtils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "No URL provided." }, { status: 400 });
    }

    if (!isGoogleMapsLink(url)) {
      return NextResponse.json(
        { error: "Invalid Google Maps URL. Please provide a valid link." },
        { status: 400 },
      );
    }

    // Attempt to extract immediately if coordinates are visibly embedded.
    const immediateCoords = extractCoordinatesFromUrl(url);
    if (immediateCoords.lat && immediateCoords.lng) {
      return NextResponse.json(immediateCoords);
    }

    // If it's a shortlink (maps.app.goo.gl) or heavily structured place link,
    // we bypass CORS internally by hitting Google Maps servers to follow redirects.
    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        // Setting a browser-like user-agent helps map redirects safely
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      // The final expanded URL after all redirects
      const expandedUrl = response.url;
      const extracted = extractCoordinatesFromUrl(expandedUrl);

      if (extracted.lat && extracted.lng) {
        return NextResponse.json(extracted);
      }

      return NextResponse.json(
        { error: extracted.error || "Could not resolve coordinates from the expanded link." },
        { status: 400 },
      );
    } catch (fetchError) {
      console.error("Failed expanding short link: ", fetchError);
      return NextResponse.json(
        { error: "Failed to resolve the link. The URL might be broken." },
        { status: 400 },
      );
    }
  } catch (err) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
