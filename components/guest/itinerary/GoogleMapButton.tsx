"use client";

interface GoogleMapButtonProps {
  title?: string;
  description?: string;
  mapUrl: string;
  buttonText?: string;
}

export function GoogleMapButton({
  title,
  description,
  mapUrl,
  buttonText = "Open Google Maps",
}: GoogleMapButtonProps) {
  return (
    <div className="map-section">
      {title && <h4>{title}</h4>}
      {description && <p>{description}</p>}
      <a href={mapUrl} target="_blank" rel="noopener noreferrer">
        <button className="google-maps-button">
          <svg className="gmaps-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
          </svg>
          {buttonText}
        </button>
      </a>
    </div>
  );
}
