"use client";

import { useEffect, useState } from "react";
import { Ms } from "./theme/Ms";

/**
 * Porting esatto di renderWeatherWidget + fetchOpenMeteo (mipacompanion/
 * vncompanion): stessa chiamata Open-Meteo (meteo + marino), stessa
 * mappatura condizione/icona, stesso pannello previsioni a 5 giorni che
 * si apre/chiude cliccando il widget.
 */

const MILAZZO_LAT = 38.2333;
const MILAZZO_LON = 15.24;

function weatherCondition(code: number): string {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partly";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "cloudy";
}

function weatherIconForCode(code: number): string {
  const cond = weatherCondition(code);
  const map: Record<string, string> = {
    clear: "sunny",
    partly: "partly_cloudy_day",
    cloudy: "cloud",
    fog: "foggy",
    rain: "rainy",
    snow: "weather_snowy",
    storm: "thunderstorm",
  };
  return map[cond] ?? "cloud";
}

interface DailyForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  wind: number | null;
  humidity: number | null;
  waveHeight: number | null;
  seaTemp: number | null;
}

interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    wind: number;
    weatherCode: number;
    seaTemp: number | null;
    waveHeight: number | null;
  };
  daily: DailyForecast[];
}

async function fetchOpenMeteo(): Promise<WeatherData | null> {
  try {
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${MILAZZO_LAT}&longitude=${MILAZZO_LON}` +
      "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,relative_humidity_2m_mean&timezone=auto&forecast_days=6";
    const marineUrl =
      `https://marine-api.open-meteo.com/v1/marine?latitude=${MILAZZO_LAT}&longitude=${MILAZZO_LON}` +
      "&current=wave_height,sea_surface_temperature" +
      "&hourly=sea_surface_temperature&daily=wave_height_max&timezone=auto&forecast_days=6";

    const [wRes, mRes] = await Promise.all([fetch(weatherUrl), fetch(marineUrl)]);
    const w = await wRes.json();
    const m = await mRes.json();
    if (w.error || m.error) return null;

    const hourlyTimes: string[] = m.hourly?.time ?? [];
    const hourlySea: number[] = m.hourly?.sea_surface_temperature ?? [];
    function seaTempForDate(dateStr: string): number | null {
      const idx = hourlyTimes.indexOf(dateStr + "T12:00");
      return idx >= 0 && hourlySea[idx] != null ? Math.round(hourlySea[idx] * 10) / 10 : null;
    }

    const daily: DailyForecast[] = (w.daily?.time ?? []).map((date: string, i: number) => ({
      date,
      weatherCode: w.daily.weather_code[i],
      tempMax: Math.round(w.daily.temperature_2m_max[i]),
      tempMin: Math.round(w.daily.temperature_2m_min[i]),
      wind: w.daily.wind_speed_10m_max?.[i] != null ? Math.round(w.daily.wind_speed_10m_max[i]) : null,
      humidity:
        w.daily.relative_humidity_2m_mean?.[i] != null
          ? Math.round(w.daily.relative_humidity_2m_mean[i])
          : null,
      waveHeight:
        m.daily?.wave_height_max?.[i] != null ? Math.round(m.daily.wave_height_max[i] * 10) / 10 : null,
      seaTemp: seaTempForDate(date),
    }));

    return {
      current: {
        temp: Math.round(w.current.temperature_2m),
        humidity: Math.round(w.current.relative_humidity_2m),
        wind: Math.round(w.current.wind_speed_10m),
        weatherCode: w.current.weather_code,
        seaTemp: m.current?.sea_surface_temperature != null ? Math.round(m.current.sea_surface_temperature * 10) / 10 : null,
        waveHeight: m.current?.wave_height != null ? Math.round(m.current.wave_height * 10) / 10 : null,
      },
      // il giorno 0 è oggi, già mostrato nella parte principale del widget
      daily: daily.slice(1),
    };
  } catch (e) {
    console.error("Open-Meteo fetch error:", e);
    return null;
  }
}

function dayName(dateStr: string): string {
  const d = new Date(dateStr + "T12:00");
  return d.toLocaleDateString("it-IT", { weekday: "short" });
}

export function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchOpenMeteo().then((d) => {
      if (cancelled) return;
      if (!d) setError(true);
      else setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div className="pharmacy-loading">Meteo non disponibile al momento.</div>;
  }

  if (!data) {
    return (
      <div className="pharmacy-loading">
        <Ms icon="progress_activity" /> Caricamento…
      </div>
    );
  }

  const { current, daily } = data;

  return (
    <div className={"weather-widget" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)}>
      <div className="weather-main">
        <div className="weather-icon-big">
          <Ms icon={weatherIconForCode(current.weatherCode)} />
        </div>
        <div>
          <div className="weather-temp-big">{current.temp}°</div>
          <div className="weather-desc">Milazzo</div>
        </div>
        <div className="weather-expand-hint">
          Previsioni
          <Ms icon="expand_more" />
        </div>
      </div>

      <div className="weather-stats">
        <div className="weather-stat">
          <Ms icon="air" />
          <div className="weather-stat-val">{current.wind} km/h</div>
          <div className="weather-stat-label">Vento</div>
        </div>
        <div className="weather-stat">
          <Ms icon="water_drop" />
          <div className="weather-stat-val">{current.humidity}%</div>
          <div className="weather-stat-label">Umidità</div>
        </div>
        <div className="weather-stat">
          <Ms icon="waves" />
          <div className="weather-stat-val">{current.seaTemp != null ? `${current.seaTemp}°C` : "—"}</div>
          <div className="weather-stat-label">Mare</div>
        </div>
        <div className="weather-stat">
          <Ms icon="tsunami" />
          <div className="weather-stat-val">{current.waveHeight != null ? `${current.waveHeight} m` : "—"}</div>
          <div className="weather-stat-label">Onde</div>
        </div>
      </div>

      <div className="weather-forecast">
        <div className="forecast-inner">
          {daily.slice(0, 5).map((d) => (
            <div key={d.date} className="forecast-day">
              <div className="forecast-day-name">{dayName(d.date)}</div>
              <Ms icon={weatherIconForCode(d.weatherCode)} />
              <div className="forecast-day-temp">
                {d.tempMax}° <span>{d.tempMin}°</span>
              </div>
              <div className="forecast-day-extra">
                {d.wind != null && (
                  <div className="forecast-day-extra-row">
                    <Ms icon="air" /> {d.wind} km/h
                  </div>
                )}
                {d.seaTemp != null && (
                  <div className="forecast-day-extra-row">
                    <Ms icon="waves" /> {d.seaTemp}°C
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
