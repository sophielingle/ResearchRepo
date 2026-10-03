"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Calendar = dynamic(() => import("./components/Calendar"), {
  ssr: false,
});

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

  const loadEvents = async () => {
    try {
      setError("");

      const response = await fetch("http://localhost:8080/api/events");

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

  const validateEvent = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Please enter an event title.");
      return false;
    }

    if (!date) {
      setError("Please select an event date.");
      return false;
    }

    const selectedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      setError("Please enter a valid date.");
      return false;
    }

    const duplicate = events.some(
      (event) =>
        event.id !== editingId &&
        event.title.trim().toLowerCase() === trimmedTitle.toLowerCase() &&
        event.date === date
    );

    if (duplicate) {
      setError("An event with this title already exists on this date.");
      return false;
    }

    return true;
  };

  const addEvent = async () => {
    setError("");

    if (!validateEvent()) {
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          date: date,
        }),
      });

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

  const editEvent = (event: Event) => {
    setEditingId(event.id);
    setTitle(event.title);
    setDate(event.date);
    setError("");
  };

  const updateEvent = async () => {
    setError("");

    if (editingId === null) {
      setError("No event is currently being edited.");
      return;
    }

    if (!validateEvent()) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/events/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
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

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDate("");
    setError("");
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const calendarEvents = events.map((event) => ({
    id: event.id.toString(),
    title: event.title,
    date: event.date,
  }));

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Event Manager
          </h1>

          <p className="mt-2 text-gray-600">
            Create, edit, delete, and view your events.
          </p>
        </header>

        <section className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold">
            {editingId === null ? "Add Event" : "Edit Event"}
          </h2>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded border border-gray-300 p-3 outline-none focus:border-black"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border border-gray-300 p-3 outline-none focus:border-black"
            />

            <div className="flex gap-3">
              <button
                onClick={editingId === null ? addEvent : updateEvent}
                className="rounded bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
              >
                {editingId === null ? "Add Event" : "Update Event"}
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

          {error && (
            <div className="mt-4 rounded bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}
        </section>

        <section className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-2xl font-semibold">Calendar</h2>

          <Calendar events={calendarEvents} />
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Events</h2>

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
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {event.title}
                    </h3>

                    <p className="mt-2 text-gray-600">
                      {event.date}
                    </p>
                  </div>

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
