"use client";

import { useEffect, useState } from "react";
import type { PropertySlug } from "@/config/properties";
import { getGuestContent, type GuestContent } from "@/lib/guest-content";
import { LocaleProvider, useLocale } from "@/lib/i18n/LocaleContext";
import { ThemeToggleButton } from "./theme/ThemeToggleButton";
import { LangFlagMenu } from "./theme/LangFlagMenu";
import { Ms } from "./theme/Ms";
import { WeatherWidget } from "./WeatherWidget";
import { PharmacyWidget } from "./PharmacyWidget";

/**
 * Porting fedele della dashboard companion (mipacompanion/vncompanion):
 * stessa struttura sidebar (desktop) + main-content, stesso header
 * (toggle tema + bandierina lingua + greeting-card), stessa griglia
 * quick-access (6 tile, colori a ciclo primary/clay/azure), stessi
 * pills desktop e bottom-tab-bar mobile.
 *
 * Differenza consapevole rispetto all'originale: l'originale ha ~15
 * pagine dedicate (una per voce di menu, con la propria vista a schermo
 * intero). Qui i contenuti restano raggruppati nelle 4 tab già
 * costruite (Home/Esplora/Info/Checkout) — la voce di menu/quick-tile
 * porta alla tab che contiene quel contenuto, invece che a una pagina
 * indipendente. La "griglia" e la navigazione di primo livello sono
 * identiche; la profondità di contenuto (pagine singole per ogni voce)
 * resta il pezzo non ancora replicato 1:1.
 */

type Tab = "home" | "esplora" | "info" | "checkout";

const QUICK_ACCESS: { id: string; icon: string; label: string; action: (nav: Nav) => void }[] = [
  { id: "schedine", icon: "badge", label: "Check-in", action: (nav) => nav.goToCheckin() },
  { id: "entryInstructions", icon: "door_open", label: "Istruzioni per Entrare", action: (nav) => nav.setTab("esplora") },
  { id: "philosophy", icon: "eco", label: "La Nostra Filosofia", action: (nav) => nav.setTab("info") },
  { id: "map", icon: "map", label: "Mappa Interattiva", action: (nav) => nav.setTab("esplora") },
  { id: "itinerary", icon: "explore", label: "Itinerario Giornaliero", action: (nav) => nav.goToItinerary() },
  { id: "directions", icon: "navigation", label: "Raggiungere/Lasciare Milazzo", action: (nav) => nav.setTab("esplora") },
];

const ACCENT_VARS = ["var(--primary)", "var(--clay)", "var(--azure)"];

const SIDEBAR_ITEMS: { id: string; icon: string; label: string; color: string; action: (nav: Nav) => void }[] = [
  { id: "home", icon: "home", label: "Home", color: "var(--primary)", action: (nav) => nav.setTab("home") },
  { id: "schedine", icon: "badge", label: "Check-in", color: "var(--clay)", action: (nav) => nav.goToCheckin() },
  { id: "entryInstructions", icon: "door_open", label: "Istruzioni per Entrare", color: "var(--azure)", action: (nav) => nav.setTab("esplora") },
  { id: "philosophy", icon: "eco", label: "La Nostra Filosofia", color: "var(--primary)", action: (nav) => nav.setTab("info") },
  { id: "map", icon: "map", label: "Mappa Interattiva", color: "var(--clay)", action: (nav) => nav.setTab("esplora") },
  { id: "itinerary", icon: "explore", label: "Itinerario Giornaliero", color: "var(--azure)", action: (nav) => nav.goToItinerary() },
  { id: "directions", icon: "navigation", label: "Raggiungere/Lasciare Milazzo", color: "var(--primary)", action: (nav) => nav.setTab("esplora") },
  { id: "info", icon: "info", label: "Info", color: "var(--clay)", action: (nav) => nav.setTab("info") },
  { id: "checkout", icon: "logout", label: "Check-out", color: "var(--danger)", action: (nav) => nav.setTab("checkout") },
];

const BOTTOM_TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "home", icon: "home", label: "Home" },
  { id: "esplora", icon: "explore", label: "Esplora" },
  { id: "info", icon: "info", label: "Info" },
  { id: "checkout", icon: "logout", label: "Check-Out" },
];

interface Nav {
  setTab: (t: Tab) => void;
  goToCheckin: () => void;
  goToItinerary: () => void;
}

function connectWifi(ssid: string, password: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(`SSID: ${ssid}\nPassword: ${password}`).catch(() => {});
  }
  window.location.href = `wifi:S:${ssid};T:WPA;P:${password};;`;
}

export function GuestDashboard({ slug, token }: { slug: PropertySlug; token: string }) {
  return (
    <LocaleProvider>
      <GuestDashboardInner slug={slug} token={token} />
    </LocaleProvider>
  );
}

function GuestDashboardInner({ slug, token }: { slug: PropertySlug; token: string }) {
  const { locale } = useLocale();
  const content = getGuestContent(slug, locale);
  const [tab, setTab] = useState<Tab>("home");
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`guest_name_${slug}`);
      if (stored) setGuestName(stored);
    } catch {
      // localStorage non disponibile: va bene, resta senza nome
    }
  }, [slug]);

  const nav: Nav = {
    setTab,
    goToCheckin: () => {
      window.location.href = `/guest/${token}/checkin`;
    },
    goToItinerary: () => {
      window.location.href = `/guest/${token}/itinerary`;
    },
  };

  return (
    <div className="dashboard-shell">
      <Sidebar tab={tab} nav={nav} guestName={guestName} />

      <div className="main-content">
        <div className="page dashboard-page">
          <div className="home-topbar">
            <div className="header-actions">
              <ThemeToggleButton />
              <LangFlagMenu />
            </div>
          </div>
          <div className="greeting-card">
            <div className="greeting-card-inner">
              <div className="home-greeting">Ciao, {guestName || "Ospite"}</div>
              <div className="home-greeting-sub">Come possiamo aiutarti?</div>
            </div>
          </div>

          <DesktopPills tab={tab} setTab={setTab} />

          <div className="dashboard-content">
            {tab === "home" && <HomeTab nav={nav} />}
            {tab === "esplora" && <EsploraTab content={content} token={token} />}
            {tab === "info" && <InfoTab content={content} />}
            {tab === "checkout" && <CheckoutTab content={content} slug={slug} />}
          </div>
        </div>
      </div>

      <BottomTabBar tab={tab} setTab={setTab} />
    </div>
  );
}

// ── Sidebar (desktop) ──────────────────────────

function Sidebar({ tab, nav, guestName }: { tab: Tab; nav: Nav; guestName: string | null }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">Dormilazzo</div>
        <div className="sidebar-sub">Ciao, {guestName || "Ospite"} 👋</div>
        <div className="sidebar-lang">
          <LangFlagMenu />
        </div>
      </div>
      <div className="sidebar-nav">
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.id}
            className={"sidebar-item" + (item.id === tab ? " active" : "")}
            onClick={() => item.action(nav)}
          >
            <span className="sidebar-item-icon" style={{ background: item.color }}>
              <Ms icon={item.icon} />
            </span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-footer">Dormilazzo · MiPA &amp; Via Nazionale</div>
    </div>
  );
}

// ── Pills (desktop) e bottom tab bar (mobile) ──

function DesktopPills({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="desktop-pills">
      {BOTTOM_TABS.map((t) => (
        <button
          key={t.id}
          className={"desktop-pill" + (t.id === tab ? " active" : "")}
          onClick={() => setTab(t.id)}
        >
          <Ms icon={t.icon} /> {t.label}
        </button>
      ))}
    </div>
  );
}

function BottomTabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="bottom-tabbar">
      {BOTTOM_TABS.map((t) => (
        <button
          key={t.id}
          className={"bottom-tab" + (t.id === tab ? " active" : "")}
          onClick={() => setTab(t.id)}
        >
          <Ms icon={t.icon} />
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Home ────────────────────────────────────────

function HomeTab({ nav }: { nav: Nav }) {
  return (
    <div className="home-layout">
      <div className="home-slot-weather">
        <WeatherWidget />
      </div>
      <div className="home-slot-quick">
        <div className="section-label">Accesso rapido</div>
        <div className="quick-grid">
          {QUICK_ACCESS.map((item, i) => (
            <button
              key={item.id}
              className="quick-tile"
              style={{ background: ACCENT_VARS[i % ACCENT_VARS.length] }}
              onClick={() => item.action(nav)}
            >
              <Ms icon={item.icon} />
              <span className="quick-tile-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Esplora ─────────────────────────────────────

function EsploraTab({ content, token }: { content: GuestContent; token: string }) {
  return (
    <div className="flex flex-col gap-6">
      <Section title="Come entrare">
        <Steps steps={content.entrySteps} />
      </Section>

      <Section title="Itinerario giornaliero">
        <a href={`/guest/${token}/itinerary`} className="card" style={{ background: "var(--toolbar)", color: "#fff" }}>
          <Ms icon="explore" />
          <span style={{ flex: 1, fontWeight: 600 }}>Scopri Milazzo in un giorno, passo dopo passo</span>
          <Ms icon="chevron_right" />
        </a>
      </Section>

      <Section title="Mappa">
        <a href={content.mapPlaceUrl} target="_blank" rel="noreferrer" className="card">
          <Ms icon="map" />
          <span style={{ flex: 1, fontWeight: 600 }}>Apri la mappa in Google Maps</span>
          <Ms icon="open_in_new" />
        </a>
      </Section>

      <Section title="Spiaggia">
        <a href={content.beachMapsUrl} target="_blank" rel="noreferrer" className="card" style={{ background: "var(--toolbar)", color: "#fff" }}>
          <Ms icon="beach_access" />
          <span style={{ flex: 1, fontWeight: 600 }}>Portami alla spiaggia</span>
        </a>
      </Section>

      <Section title="Prenota servizi">
        <div className="flex flex-col gap-2">
          {content.services.map((svc) => (
            <div key={svc.title} className="service-card">
              <div className="service-card-top">
                <span style={{ fontSize: 24 }}>{svc.emoji}</span>
                <div>
                  <p style={{ fontWeight: 700, color: "var(--text-1)" }}>{svc.title}</p>
                  <p style={{ fontSize: 12.5, color: "var(--text-3)" }}>{svc.price}</p>
                  <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>{svc.note}</p>
                </div>
              </div>
              <a
                href={`${content.whatsappUrl}?text=${encodeURIComponent(svc.waText)}`}
                target="_blank"
                rel="noreferrer"
                className="card"
                style={{ background: "#25d366", color: "#fff", justifyContent: "center" }}
              >
                Prenota via WhatsApp
              </a>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Come arrivare / ripartire">
        <p className="section-label" style={{ margin: "0 0 8px" }}>Arrivare</p>
        <div className="flex flex-col gap-2">
          {content.directions.arrivalModes.map((d) => (
            <DirCard key={d.title} {...d} />
          ))}
        </div>
        <p className="section-label" style={{ margin: "16px 0 8px" }}>Lasciare Milazzo</p>
        <div className="flex flex-col gap-2">
          {content.directions.departureModes.map((d) => (
            <DirCard key={d.title} {...d} />
          ))}
        </div>
      </Section>

      <Section title="Farmacie di turno">
        <PharmacyWidget />
      </Section>
    </div>
  );
}

function DirCard({ icon, color, title, desc }: { icon: string; color: string; title: string; desc: string }) {
  return (
    <div className="card" style={{ alignItems: "flex-start" }}>
      <span className="sidebar-item-icon" style={{ background: color, width: 34, height: 34 }}>
        <Ms icon={icon} />
      </span>
      <div>
        <p style={{ fontWeight: 700, color: "var(--text-1)" }}>{title}</p>
        <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── Info ────────────────────────────────────────

function InfoTab({ content }: { content: GuestContent }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="wifi-card">
        <p style={{ fontSize: 11, textTransform: "uppercase", opacity: 0.8, letterSpacing: ".05em" }}>WiFi</p>
        <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
          <div>
            <p style={{ fontSize: 14, opacity: 0.92 }}>Rete: {content.wifi.ssid}</p>
            <p style={{ fontSize: 14, opacity: 0.92 }}>Password: {content.wifi.password}</p>
          </div>
          <button
            onClick={() => connectWifi(content.wifi.ssid, content.wifi.password)}
            style={{ background: "rgba(255,255,255,.2)", color: "#fff", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600 }}
          >
            Connetti
          </button>
        </div>
      </div>

      <Section title="Informazioni generali">
        <div className="card" style={{ flexDirection: "column", alignItems: "stretch", gap: 0 }}>
          <InfoRow label="Check-in" value={content.checkinHours} />
          <InfoRow label="Check-out" value={content.checkoutHours} />
          <InfoRow label="Indirizzo" value={content.address} />
        </div>
      </Section>

      <Section title="Contatti">
        <div className="card" style={{ flexDirection: "column", alignItems: "stretch", gap: 0, padding: 0 }}>
          <a href={`tel:${content.phone}`} className="contact-btn">
            <span className="contact-btn-icon" style={{ background: "var(--primary)" }}>
              <Ms icon="call" />
            </span>
            <span>
              <span className="contact-btn-label" style={{ display: "block" }}>Telefono</span>
              <span className="contact-btn-value">{content.phoneDisplay}</span>
            </span>
          </a>
          <a href={`mailto:${content.email}`} className="contact-btn">
            <span className="contact-btn-icon" style={{ background: "var(--clay)" }}>
              <Ms icon="mail" />
            </span>
            <span>
              <span className="contact-btn-label" style={{ display: "block" }}>Email</span>
              <span className="contact-btn-value">{content.email}</span>
            </span>
          </a>
          <a href={content.whatsappUrl} target="_blank" rel="noreferrer" className="contact-btn">
            <span className="contact-btn-icon" style={{ background: "#25d366" }}>
              <Ms icon="chat" />
            </span>
            <span className="contact-btn-value">Chatta su WhatsApp</span>
          </a>
        </div>
      </Section>

      <Section title="Farmacie di turno">
        <PharmacyWidget />
      </Section>

      <Section title="La nostra filosofia">
        <div className="flex flex-col gap-3" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-2)" }}>
          {content.philosophy.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── Checkout ────────────────────────────────────

function CheckoutTab({ content, slug }: { content: GuestContent; slug: PropertySlug }) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [errors, setErrors] = useState<{ name?: boolean; room?: boolean }>({});

  function submit() {
    const nameOk = name.trim().length > 0;
    const roomOk = room.trim().length > 0;
    if (!nameOk || !roomOk) {
      setErrors({ name: !nameOk, room: !roomOk });
      return;
    }
    const waMessage = `Ciao! Sto facendo il check-out. Nome: ${name.trim()} — Camera: ${room.trim()}. Grazie!`;
    try {
      localStorage.removeItem(`guest_name_${slug}`);
    } catch {
      // localStorage non disponibile: non blocca comunque il check-out
    }
    window.open(`${content.whatsappUrl}?text=${encodeURIComponent(waMessage)}`, "_blank");
  }

  return (
    <div className="flex flex-col gap-5">
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-2)" }}>
        Grazie per aver soggiornato da noi! Prima di partire, ti preghiamo di:
      </p>
      <Steps
        steps={[
          "Lascia tutte le chiavi nella camera.",
          "Raccogli tutti i tuoi oggetti personali, compresi caricabatterie ed elettroniche.",
          "Controlla accuratamente la camera per eventuali oggetti dimenticati.",
          "Regola tutti i pagamenti in sospeso, inclusa la tassa di soggiorno.",
        ]}
      />
      <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-3)" }}>
        Se dimentichi qualcosa, offriamo un servizio di rispedizione (con costi aggiuntivi).
      </p>

      <div className="flex flex-col gap-3">
        <div>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>
            Nome e cognome
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              borderRadius: 10,
              border: `1px solid ${errors.name ? "var(--danger)" : "var(--sep)"}`,
              padding: 12,
              fontSize: 14,
              background: "var(--surface)",
              color: "var(--text-1)",
            }}
          />
          {errors.name && <p style={{ marginTop: 4, fontSize: 12, color: "var(--danger)" }}>Inserisci nome e cognome</p>}
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>
            Camera
          </label>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Es. Camera 2"
            style={{
              width: "100%",
              borderRadius: 10,
              border: `1px solid ${errors.room ? "var(--danger)" : "var(--sep)"}`,
              padding: 12,
              fontSize: 14,
              background: "var(--surface)",
              color: "var(--text-1)",
            }}
          />
          {errors.room && <p style={{ marginTop: 4, fontSize: 12, color: "var(--danger)" }}>Indica la camera</p>}
        </div>
      </div>

      <button onClick={submit} className="card" style={{ background: "var(--danger)", color: "#fff", justifyContent: "center", fontWeight: 700 }}>
        Completa check-out
      </button>
    </div>
  );
}

// ── Helpers UI ──────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="section-label">{title}</div>
      {children}
    </section>
  );
}

function Steps({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      {steps.map((step, i) => (
        <div key={i} className="card" style={{ alignItems: "flex-start" }}>
          <span
            className="sidebar-item-icon"
            style={{ background: "var(--primary)", width: 26, height: 26, fontSize: 12, fontWeight: 700, color: "#fff" }}
          >
            {i + 1}
          </span>
          <p style={{ fontSize: 13.5, color: "var(--text-2)" }}>{step}</p>
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="contact-btn" style={{ justifyContent: "space-between" }}>
      <span className="contact-btn-label">{label}</span>
      <span className="contact-btn-value">{value}</span>
    </div>
  );
}
