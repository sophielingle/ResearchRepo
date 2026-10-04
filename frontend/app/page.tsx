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

  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isRegistering, setIsRegistering] = useState(false);

  const [error, setError] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const loadEvents = async (authToken: string) => {
    try {
      setError("");

      const response = await fetch(
        "http://localhost:8080/api/events",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          setToken(null);
          throw new Error("Your session has expired.");
        }

        throw new Error("Failed to load events");
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Could not load events.");
      }
    }
  };

  useEffect(() => {
    if (token) {
      loadEvents(token);
    }
  }, [token]);

  const handleAuth = async () => {
    setLoginError("");

    if (!username.trim()) {
      setLoginError("Please enter a username.");
      return;
    }

    if (!password) {
      setLoginError("Please enter a password.");
      return;
    }

    try {
      const endpoint = isRegistering
        ? "http://localhost:8080/api/auth/register"
        : "http://localhost:8080/api/auth/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Authentication failed."
        );
      }

      if (isRegistering) {
        setIsRegistering(false);
        setPassword("");
        setLoginError(
          "Registration successful. You can now log in."
        );
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setPassword("");
      setLoginError("");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError("Authentication failed.");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setEvents([]);
    setUsername("");
    setPassword("");
    setTitle("");
    setDate("");
    setEditingId(null);
    setError("");
    setLoginError("");
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
        event.title.trim().toLowerCase() ===
          trimmedTitle.toLowerCase() &&
        event.date === date
    );

    if (duplicate) {
      setError(
        "An event with this title already exists on this date."
      );
      return false;
    }

    return true;
  };

  const addEvent = async () => {
    setError("");

    if (!validateEvent() || !token) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            date: date,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add event");
      }

      setTitle("");
      setDate("");

      await loadEvents(token);
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

    if (editingId === null || !token) {
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
            Authorization: `Bearer ${token}`,
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

      await loadEvents(token);
    } catch (error) {
      console.error(error);
      setError("Could not update the event.");
    }
  };

  const deleteEvent = async (id: number) => {
    if (!token) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/events/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

      await loadEvents(token);
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

  const calendarEvents = events.map((event) => ({
    id: event.id.toString(),
    title: event.title,
    date: event.date,
  }));

  if (!token) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-md pt-16">
          <section className="rounded-lg bg-white p-8 shadow">
            <h1 className="text-3xl font-bold text-gray-900">
              Event Manager
            </h1>

            <p className="mt-2 text-gray-600">
              {isRegistering
                ? "Create an account to manage your events."
                : "Log in to manage your events."}
            </p>

            <div className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded border border-gray-300 p-3 outline-none focus:border-black"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-gray-300 p-3 outline-none focus:border-black"
              />

              <button
                onClick={handleAuth}
                className="w-full rounded bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
              >
                {isRegistering ? "Register" : "Login"}
              </button>

              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setLoginError("");
                  setPassword("");
                }}
                className="w-full rounded border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
              >
                {isRegistering
                  ? "Already have an account? Login"
                  : "Need an account? Register"}
              </button>
            </div>

            {loginError && (
              <div className="mt-4 rounded bg-red-100 p-3 text-red-700">
                {loginError}
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Event Manager
            </h1>

            <p className="mt-2 text-gray-600">
              Create, edit, delete, and view your events.
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
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

          {error && (
            <div className="mt-4 rounded bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}
        </section>

        <section className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-2xl font-semibold">
            Calendar
          </h2>

          <Calendar events={calendarEvents} />
        </section>

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
