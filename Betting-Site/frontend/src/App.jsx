import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import AuthForm from "./AuthForm";
import EventCard from "./EventCard";
import BetSlip from "./BetSlip";
import MyBets from "./MyBets";
import History from "./History";

const asList = (d) => (Array.isArray(d) ? d : []);

export default function App() {
  const [me, setMe] = useState(null);
  const [events, setEvents] = useState([]);
  const [bets, setBets] = useState([]);
  const [txs, setTxs] = useState([]);
  const [slip, setSlip] = useState([]);
  const [tab, setTab] = useState("events");
  const [error, setError] = useState("");

  const logout = useCallback(() => {
    localStorage.clear();
    setMe(null);
    setBets([]);
    setTxs([]);
    setSlip([]);
    setTab("events");
  }, []);

  const loadAccount = useCallback(async () => {
    try {
      setMe(await api("/me/"));
      setBets(asList(await api("/bets/")));
      setTxs(asList(await api("/transactions/")));
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    api("/events/", { auth: false })
      .then((d) => setEvents(asList(d)))
      .catch((e) => setError(e.message));
    if (localStorage.getItem("access")) loadAccount();
  }, [loadAccount]);

  function pick(event, p) {
    if (!me) return setError("Log in to place a bet.");
    setError("");
    setSlip((prev) => {
      const existing = prev.find((s) => s.event.id === event.id);
      if (existing && existing.pick === p) return prev.filter((s) => s.event.id !== event.id);
      if (existing) return prev.map((s) => (s.event.id === event.id ? { event, pick: p } : s));
      if (prev.length >= 10) return prev;
      return [...prev, { event, pick: p }];
    });
  }

  const removeLeg = (id) => setSlip((prev) => prev.filter((s) => s.event.id !== id));

  function onPlaced() {
    setSlip([]);
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
              <button className={tab === "history" ? "tab active" : "tab"} onClick={() => setTab("history")}>History</button>
            </nav>
          )}
          {tab === "events" ? (
            events.length ? (
              events.map((e) => <EventCard key={e.id} event={e} slip={slip} onPick={pick} />)
            ) : (
              <p className="muted">No upcoming events.</p>
            )
          ) : tab === "bets" ? (
            <MyBets bets={bets} />
          ) : (
            <History txs={txs} />
          )}
        </main>

        <aside>
          {me ? (
            <BetSlip slip={slip} onRemove={removeLeg} onClear={() => setSlip([])} onPlaced={onPlaced} />
          ) : (
            <AuthForm onAuth={loadAccount} />
          )}
        </aside>
      </div>
    </div>
  );
}