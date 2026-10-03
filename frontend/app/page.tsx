"use client";

import { useEffect, useState } from "react";

type Event = {
  id: number;
  title: string;
  date: string;
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Load all events from the backend
  const loadEvents = async () => {
    try {
      setError("");

      const response = await fetch(
        "http://localhost:8080/api/events"
      );

      if (!response.ok) {
        throw new Error("Failed to load events");
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error(error);
      setError(
        "Could not connect to the backend. Make sure Spring Boot is running."
      );
    }
  };

  // Add a new event
  const addEvent = async () => {
    if (!title || !date) {
      setError("Please enter an event title and date.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        "http://localhost:8080/api/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            date: date,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add event");
      }

      setTitle("");
      setDate("");

      await loadEvents();
    } catch (error) {
      console.error(error);
      setError("Could not add the event.");
    }
  };

  // Start editing an event
  const editEvent = (event: Event) => {
    setEditingId(event.id);
    setTitle(event.title);
    setDate(event.date);
    setError("");
  };

  // Update an existing event
  const updateEvent = async () => {
    if (editingId === null || !title || !date) {
      setError("Please enter an event title and date.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/events/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            date: date,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      setEditingId(null);
      setTitle("");
      setDate("");

      await loadEvents();
    } catch (error) {
      console.error(error);
      setError("Could not update the event.");
    }
  };

  // Delete an event
  const deleteEvent = async (id: number) => {
    try {
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/events/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      // If we were editing the deleted event, clear the form
      if (editingId === id) {
        setEditingId(null);
        setTitle("");
        setDate("");
      }

      await loadEvents();
    } catch (error) {
      console.error(error);
      setError("Could not delete the event.");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDate("");
    setError("");
  };

  // Load events when the page first opens
  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Event Manager
          </h1>

          <p className="mt-2 text-gray-600">
            Create, edit, and manage your events.
          </p>
        </header>

        {/* Add/Edit Event Form */}
        <section className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold">
            {editingId === null ? "Add Event" : "Edit Event"}
          </h2>

          <div className="flex flex-col gap-4">
            {/* Event Title */}
            <input
              type="text"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded border border-gray-300 p-3 outline-none focus:border-black"
            />

            {/* Event Date */}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border border-gray-300 p-3 outline-none focus:border-black"
            />

            {/* Form Buttons */}
            <div className="flex gap-3">
              <button
                onClick={
                  editingId === null ? addEvent : updateEvent
                }
                className="rounded bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
              >
                {editingId === null
                  ? "Add Event"
                  : "Update Event"}
              </button>

              {editingId !== null && (
                <button
                  onClick={cancelEdit}
                  className="rounded border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}
        </section>

        {/* Events List */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Events
          </h2>

          {events.length === 0 ? (
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-gray-600">
                No events yet. Add your first event above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Event Information */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {event.title}
                    </h3>

                    <p className="mt-2 text-gray-600">
                      {event.date}
                    </p>
                  </div>

                  {/* Event Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => editEvent(event)}
                      className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
