import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import AuthForm from "./AuthForm";
import EventCard from "./EventCard";
import BetSlip from "./BetSlip";
import MyBets from "./MyBets";

export default function App() {
  const [me, setMe] = useState(null);
  const [events, setEvents] = useState([]);
  const [bets, setBets] = useState([]);
  const [slip, setSlip] = useState(null);
  const [tab, setTab] = useState("events");
  const [error, setError] = useState("");

  const logout = useCallback(() => {
    localStorage.clear();
    setMe(null);
    setBets([]);
    setSlip(null);
    setTab("events");
  }, []);

  const loadAccount = useCallback(async () => {
    try {
      setMe(await api("/me/"));
      setBets(await api("/bets/"));
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    api("/events/", { auth: false }).then(setEvents).catch((e) => setError(e.message));
    if (localStorage.getItem("access")) loadAccount();
  }, [loadAccount]);

  function pick(event, p) {
    if (!me) return setError("Log in to place a bet.");
    setError("");
    setSlip({ event, pick: p });
  }

  function onPlaced() {
    setSlip(null);
    loadAccount();
    setTab("bets");
  }

  return (
    <div className="app">
      <header>
        <h1>🎯 BetBox</h1>
        {me && (
          <div className="user">
            <span>{me.username}</span>
            <strong className="balance">{Number(me.balance).toFixed(2)}</strong>
            <button className="link" onClick={logout}>Log out</button>
          </div>
        )}
      </header>

      {error && <p className="error">{error}</p>}

      <div className="layout">
        <main>
          {me && (
            <nav>
              <button className={tab === "events" ? "tab active" : "tab"} onClick={() => setTab("events")}>Events</button>
              <button className={tab === "bets" ? "tab active" : "tab"} onClick={() => setTab("bets")}>My bets ({bets.length})</button>
            </nav>
          )}
          {tab === "events" ? (
            events.length ? (
              events.map((e) => <EventCard key={e.id} event={e} slip={slip} onPick={pick} />)
            ) : (
              <p className="muted">No upcoming events.</p>
            )
          ) : (
            <MyBets bets={bets} />
          )}
        </main>

        <aside>
          {me ? (
            <BetSlip slip={slip} onClear={() => setSlip(null)} onPlaced={onPlaced} />
          ) : (
            <AuthForm onAuth={loadAccount} />
          )}
        </aside>
      </div>
    </div>
  );
}