"use client";

import { useState, useEffect } from "react";

export default function BannerConstruccion() {
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const ya = sessionStorage.getItem("banner-dismissed");
    if (ya) setVisible(false);
  }, []);

  const cerrar = () => {
    sessionStorage.setItem("banner-dismissed", "1");
    setDismissed(true);
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');

        .banner-wrapper {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          width: calc(100% - 48px);
          max-width: 680px;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .banner-wrapper.saliendo {
          animation: slideDown 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(30px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        @keyframes slideDown {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to   { opacity: 0; transform: translateX(-50%) translateY(30px); }
        }

        .banner-card {
          background: #0f0f0f;
          border: 1px solid #2a2a2a;
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset;
          backdrop-filter: blur(12px);
        }

        .banner-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .banner-texto {
          flex: 1;
          min-width: 0;
        }

        .banner-titulo {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          color: #f59e0b;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 2px 0;
        }

        .banner-desc {
          font-family: 'Space Mono', monospace;
          font-size: 11.5px;
          color: #888;
          margin: 0;
          line-height: 1.5;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .banner-desc strong {
          color: #ccc;
          font-weight: 700;
        }

        .banner-cerrar {
          flex-shrink: 0;
          background: #1e1e1e;
          border: 1px solid #333;
          color: #666;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: background 0.2s, color 0.2s;
          padding: 0;
        }

        .banner-cerrar:hover {
          background: #2a2a2a;
          color: #fff;
        }

        .banner-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f59e0b;
          flex-shrink: 0;
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
        }

        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(245,158,11,0.5); }
          70%  { box-shadow: 0 0 0 7px rgba(245,158,11,0); }
          100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
        }

        @media (max-width: 480px) {
          .banner-desc {
            font-size: 10.5px;
          }
          .banner-wrapper {
            bottom: 80px;
          }
        }
      `}</style>

      <div className={`banner-wrapper${dismissed ? " saliendo" : ""}`}>
        <div className="banner-card">
          <div className="banner-dot" />
          <div className="banner-icon">🚧</div>
          <div className="banner-texto">
            <p className="banner-titulo">Sitio en construcción</p>
            <p className="banner-desc">
              Estamos trabajando en mejoras. <strong>No realizar compras</strong> por el momento.
            </p>
          </div>
          <button className="banner-cerrar" onClick={cerrar} aria-label="Cerrar aviso">
            ✕
          </button>
        </div>
      </div>
    </>
  );
}
