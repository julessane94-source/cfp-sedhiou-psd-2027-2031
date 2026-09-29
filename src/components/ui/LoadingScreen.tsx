"use client";

import Image from "next/image";

type LoadingScreenProps = {
  message?: string;
};

export default function LoadingScreen({
  message = "Chargement de la plateforme...",
}: LoadingScreenProps) {
  return (
    <div className="loading-screen" role="status" aria-label={message}>
      <div className="loading-content">
        <div className="loading-logo">
          <Image
            src="/logo-cfp-sedhiou.svg"
            alt="Logo CFP Sédhiou"
            width={110}
            height={110}
            priority
          />
        </div>

        <div className="loading-brand">
          <strong>CFP Sédhiou</strong>
          <span>Plateforme de gestion</span>
        </div>

        <div className="loading-spinner" />

        <p>{message}</p>
      </div>
    </div>
  );
}
