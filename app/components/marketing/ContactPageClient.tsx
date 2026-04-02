"use client";

import { useState } from "react";

export default function ContactPageClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setName("");
      setEmail("");
      setMessage("");
      setStatus({ type: "success", text: "Message sent successfully" });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to send message.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <article className="contact-form-card">
      <h2>Send us a message</h2>
      <p className="contact-form-subtext">We&apos;ll get back to you within 2 working days.</p>

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="contact-name">
            Full name <span className="required-indicator">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact-email">
            Email address <span className="required-indicator">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact-message">
            Message <span className="required-indicator">*</span>
          </label>
          <textarea
            id="contact-message"
            placeholder="Write your message here..."
            rows={7}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
          />
        </div>

        {status ? (
          <p className={`contact-form-status contact-form-status--${status.type}`}>{status.text}</p>
        ) : null}

        <button type="submit" className="btn btn-primary contact-submit-btn" disabled={isSending}>
          {isSending ? "Sending..." : "Send message"}
        </button>
      </form>
    </article>
  );
}
