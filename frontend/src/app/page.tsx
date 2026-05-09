import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Romy OSS — L'IA juridique française. Souveraine par conception.",
    description:
        "Romy est une plateforme d'IA juridique open source construite sur les données ouvertes françaises. Jurisprudence en temps réel. Modèle Mistral. Zéro donnée hors de France.",
};

export default function HomePage() {
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap');

        .romy-root *, .romy-root *::before, .romy-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .romy-root {
          --cobalt:    #1a4fa0;
          --cobalt-mid:#2860c0;
          --cadmium:   #f5c842;
          --ochre:     #d4882a;
          --burnt:     #b85c1a;
          --cream:     #fdf6e3;
          --warm-white:#fffbf0;
          --text:      #1e1a0e;
          --text-mid:  rgba(30,26,14,0.65);
          --text-dim:  rgba(30,26,14,0.42);
          --serif:     'Fraunces', Georgia, serif;
          --sans:      'DM Sans', sans-serif;
          --mono:      'DM Mono', monospace;
          font-family: var(--sans);
          font-size: 16px;
          line-height: 1.6;
          background: var(--cream);
          color: var(--text);
          overflow-x: hidden;
        }

        /* NAV */
        .r-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          height: 64px;
          background: rgba(253,246,227,0.88);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(212,136,42,0.15);
        }
        .r-nav-logo {
          font-family: var(--serif);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--cobalt);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .r-logo-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--cadmium);
          box-shadow: 0 0 0 2px rgba(245,200,66,0.3);
          flex-shrink: 0;
        }
        .r-nav-links { display: flex; align-items: center; gap: 6px; }
        .r-nav-link {
          font-family: var(--sans);
          font-size: 0.875rem;
          font-weight: 400;
          color: var(--text-mid);
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        .r-nav-link:hover { color: var(--cobalt); background: rgba(26,79,160,0.06); }
        .r-nav-cta {
          font-family: var(--sans);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--warm-white);
          background: var(--cobalt);
          text-decoration: none;
          padding: 9px 22px;
          border-radius: 8px;
          margin-left: 6px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(26,79,160,0.25);
        }
        .r-nav-cta:hover {
          background: var(--cobalt-mid);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(26,79,160,0.35);
        }

        /* HERO */
        .r-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 100px 48px 80px;
          overflow: hidden;
          background: var(--cream);
        }
        .r-swirl {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .r-swirl-1 {
          width: 700px; height: 700px;
          top: -200px; right: -150px;
          background: radial-gradient(ellipse at 40% 40%, rgba(61,126,200,0.18) 0%, rgba(26,79,160,0.08) 50%, transparent 75%);
          animation: r-drift 18s ease-in-out infinite alternate;
        }
        .r-swirl-2 {
          width: 500px; height: 500px;
          bottom: -100px; left: -100px;
          background: radial-gradient(ellipse, rgba(245,200,66,0.14) 0%, rgba(212,136,42,0.06) 50%, transparent 75%);
          animation: r-drift 24s ease-in-out infinite alternate-reverse;
        }
        .r-swirl-3 {
          width: 300px; height: 300px;
          top: 30%; right: 22%;
          background: radial-gradient(ellipse, rgba(245,200,66,0.1) 0%, transparent 70%);
          animation: r-drift 14s ease-in-out infinite alternate;
        }
        @keyframes r-drift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(24px,18px) scale(1.05); }
        }
        .r-hero-inner {
          max-width: 1120px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 460px;
          gap: 80px;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .r-hero-left { animation: r-rise 0.9s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes r-rise {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .r-hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--mono);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          color: var(--cobalt);
          background: rgba(26,79,160,0.08);
          border: 1px solid rgba(26,79,160,0.18);
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 28px;
        }
        .r-pill-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--cadmium);
          flex-shrink: 0;
        }
        .r-h1 {
          font-family: var(--serif);
          font-size: clamp(3rem, 5.5vw, 5rem);
          font-weight: 400;
          line-height: 1.06;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 28px;
        }
        .r-blue  { color: var(--cobalt); }
        .r-gold  { color: var(--ochre); font-style: italic; }
        .r-sub {
          font-size: 1.1rem;
          font-weight: 300;
          color: var(--text-mid);
          line-height: 1.75;
          max-width: 460px;
          margin-bottom: 44px;
        }
        .r-actions { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
        .r-btn-primary {
          font-family: var(--sans);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--warm-white);
          background: var(--cobalt);
          text-decoration: none;
          padding: 14px 30px;
          border-radius: 10px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(26,79,160,0.28);
        }
        .r-btn-primary:hover {
          background: var(--cobalt-mid);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(26,79,160,0.38);
        }
        .r-btn-secondary {
          font-family: var(--sans);
          font-size: 0.95rem;
          font-weight: 400;
          color: var(--cobalt);
          text-decoration: none;
          padding: 13px 28px;
          border-radius: 10px;
          border: 1.5px solid rgba(26,79,160,0.22);
          background: transparent;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .r-btn-secondary:hover {
          border-color: var(--cobalt);
          background: rgba(26,79,160,0.05);
          transform: translateY(-2px);
        }

        /* QUERY CARD */
        .r-card {
          background: var(--warm-white);
          border: 1px solid rgba(212,136,42,0.2);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 24px 64px rgba(26,40,80,0.1), 0 4px 16px rgba(26,40,80,0.06);
          animation: r-rise 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s both;
        }
        .r-card-header {
          background: var(--cobalt);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .r-card-dots { display: flex; gap: 6px; }
        .r-cdot { width: 10px; height: 10px; border-radius: 50%; }
        .r-cdot-r { background: #ff6b6b; }
        .r-cdot-y { background: var(--cadmium); }
        .r-cdot-g { background: #4dde80; }
        .r-card-title {
          font-family: var(--mono);
          font-size: 0.72rem;
          font-weight: 300;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.08em;
        }
        .r-card-body {
          padding: 24px 22px 28px;
          font-family: var(--mono);
          font-size: 0.8rem;
          line-height: 1.9;
        }
        .r-cline    { display: block; }
        .r-cl-blue  { color: var(--cobalt); }
        .r-cl-gold  { color: var(--ochre); font-weight: 500; }
        .r-cl-green { color: #2a8a4a; }
        .r-cl-muted { color: var(--text-dim); }
        .r-cl-text  { color: var(--text-mid); }
        .r-cursor {
          display: inline-block;
          width: 7px; height: 13px;
          background: var(--cobalt);
          vertical-align: middle;
          margin-left: 2px;
          border-radius: 1px;
          animation: r-cblink 1s step-end infinite;
        }
        @keyframes r-cblink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* STATS */
        .r-stats { background: var(--cobalt); padding: 48px; }
        .r-stats-inner {
          max-width: 1120px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4,1fr);
        }
        .r-stat { text-align: center; padding: 8px 24px; position: relative; }
        .r-stat + .r-stat::before {
          content: '';
          position: absolute;
          left: 0; top: 15%; height: 70%;
          width: 1px;
          background: rgba(255,255,255,0.15);
        }
        .r-stat-num {
          font-family: var(--serif);
          font-size: 2.8rem;
          font-weight: 600;
          color: var(--cadmium);
          display: block;
          line-height: 1;
          margin-bottom: 8px;
          letter-spacing: -0.03em;
        }
        .r-stat-label {
          font-family: var(--sans);
          font-size: 0.82rem;
          font-weight: 300;
          color: rgba(255,255,255,0.6);
          line-height: 1.5;
        }

        /* FEATURES */
        .r-features { padding: 96px 48px; background: var(--cream); }
        .r-features-inner { max-width: 1120px; margin: 0 auto; }
        .r-eyebrow {
          font-family: var(--mono);
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          color: var(--ochre);
          margin-bottom: 12px;
          display: block;
        }
        .r-section-title {
          font-family: var(--serif);
          font-size: 2.2rem;
          font-weight: 400;
          color: var(--text);
          letter-spacing: -0.02em;
          margin-bottom: 56px;
        }
        .r-features-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 24px;
        }
        .r-feature-card {
          background: var(--warm-white);
          border: 1px solid rgba(212,136,42,0.14);
          border-radius: 14px;
          padding: 32px 28px;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          box-shadow: 0 2px 8px rgba(26,40,80,0.04);
        }
        .r-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(26,79,160,0.1);
          border-color: rgba(26,79,160,0.2);
        }
        .r-feature-icon {
          width: 44px; height: 44px;
          border-radius: 10px;
          background: rgba(26,79,160,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          margin-bottom: 18px;
        }
        .r-feature-title {
          font-family: var(--serif);
          font-size: 1.05rem;
          font-weight: 400;
          color: var(--text);
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }
        .r-feature-desc {
          font-size: 0.875rem;
          font-weight: 300;
          color: var(--text-mid);
          line-height: 1.7;
        }

        /* STACK */
        .r-stack {
          padding: 80px 48px;
          background: var(--warm-white);
          border-top: 1px solid rgba(212,136,42,0.12);
          border-bottom: 1px solid rgba(212,136,42,0.12);
        }
        .r-stack-inner { max-width: 1120px; margin: 0 auto; }
        .r-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .r-table th {
          font-family: var(--mono);
          font-size: 0.68rem;
          font-weight: 400;
          letter-spacing: 0.14em;
          color: var(--text-dim);
          text-align: left;
          padding: 10px 18px;
          border-bottom: 1.5px solid rgba(212,136,42,0.18);
        }
        .r-table td {
          padding: 15px 18px;
          border-bottom: 1px solid rgba(212,136,42,0.08);
          font-size: 0.9rem;
          vertical-align: middle;
        }
        .r-table tr:last-child td { border-bottom: none; }
        .r-table tr:hover td { background: rgba(26,79,160,0.03); }
        .r-table td:first-child {
          font-family: var(--mono);
          font-size: 0.72rem;
          color: var(--text-dim);
          letter-spacing: 0.04em;
          width: 150px;
        }
        .r-table td:nth-child(2) { font-weight: 500; color: var(--cobalt); }
        .r-table td:nth-child(3) { color: var(--text-mid); font-weight: 300; }
        .r-badge {
          display: inline-flex;
          align-items: center;
          font-family: var(--mono);
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          color: var(--burnt);
          border: 1px solid rgba(184,92,26,0.25);
          padding: 2px 7px;
          border-radius: 100px;
          margin-left: 8px;
          vertical-align: middle;
          background: rgba(245,200,66,0.1);
        }

        /* CTA */
        .r-cta {
          padding: 100px 48px;
          text-align: center;
          background: var(--cream);
          position: relative;
          overflow: hidden;
        }
        .r-cta::before {
          content: '';
          position: absolute;
          top: -180px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 600px;
          border-radius: 50%;
          border: 60px solid rgba(245,200,66,0.07);
          pointer-events: none;
        }
        .r-cta::after {
          content: '';
          position: absolute;
          top: -100px; left: 50%;
          transform: translateX(-50%);
          width: 400px; height: 400px;
          border-radius: 50%;
          border: 40px solid rgba(26,79,160,0.05);
          pointer-events: none;
        }
        .r-cta-inner { position: relative; z-index: 1; max-width: 580px; margin: 0 auto; }
        .r-cta-h2 {
          font-family: var(--serif);
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 400;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 16px;
          line-height: 1.15;
        }
        .r-cta-h2 em { font-style: italic; color: var(--cobalt); }
        .r-cta-p {
          font-size: 1rem;
          font-weight: 300;
          color: var(--text-mid);
          margin-bottom: 44px;
          line-height: 1.75;
        }
        .r-cta-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

        /* FOOTER */
        .r-footer {
          background: var(--cobalt);
          padding: 32px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .r-footer-logo {
          font-family: var(--serif);
          font-size: 1rem;
          font-weight: 400;
          color: var(--cadmium);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .r-footer-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--cadmium); }
        .r-footer-links { display: flex; gap: 24px; }
        .r-footer-link {
          font-family: var(--sans);
          font-size: 0.82rem;
          font-weight: 300;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: color 0.15s;
        }
        .r-footer-link:hover { color: rgba(255,255,255,0.85); }
        .r-footer-copy {
          font-family: var(--mono);
          font-size: 0.72rem;
          color: rgba(255,255,255,0.22);
          letter-spacing: 0.04em;
        }

        /* RESPONSIVE */
        @media (max-width: 960px) {
          .r-hero-inner { grid-template-columns: 1fr; }
          .r-card { display: none; }
          .r-stats-inner { grid-template-columns: repeat(2,1fr); gap: 32px; }
          .r-stat + .r-stat::before { display: none; }
          .r-features-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .r-nav { padding: 0 20px; }
          .r-hero, .r-features, .r-stack, .r-cta { padding-left: 20px; padding-right: 20px; }
          .r-stats { padding: 40px 20px; }
          .r-stats-inner { grid-template-columns: 1fr 1fr; gap: 24px; }
          .r-features-grid { grid-template-columns: 1fr; }
          .r-footer { padding: 24px 20px; flex-direction: column; align-items: flex-start; }
        }
      `}</style>

            <div className="romy-root">

                {/* NAV */}
                <nav className="r-nav">
                    <Link href="/" className="r-nav-logo">
                        <span className="r-logo-dot" />
                        Romy OSS
                    </Link>
                    <div className="r-nav-links">
                        <a href="#features" className="r-nav-link">Fonctionnalités</a>
                        <a href="#stack" className="r-nav-link">Stack</a>
                        <a href="https://github.com/HelvetesDykare/romy" className="r-nav-link" target="_blank" rel="noopener noreferrer">GitHub</a>
                        <Link href="/login" className="r-nav-link">Connexion</Link>
                        <Link href="/signup" className="r-nav-cta">Essayer →</Link>
                    </div>
                </nav>

                {/* HERO */}
                <section className="r-hero">
                    <div className="r-swirl r-swirl-1" />
                    <div className="r-swirl r-swirl-2" />
                    <div className="r-swirl r-swirl-3" />
                    <div className="r-hero-inner">
                        <div className="r-hero-left">
                            <div className="r-hero-pill">
                                <span className="r-pill-dot" />
                                Open source · données hébergées en France
                            </div>
                            <h1 className="r-h1">
                                L&apos;IA juridique<br />
                                <span className="r-gold">française.</span><br />
                                <span className="r-blue">Souveraine</span><br />
                                par conception.
                            </h1>
                            <p className="r-sub">
                                Construite sur les données ouvertes que la France a déjà rendues publiques.
                                Jurisprudence en temps réel. Modèle Mistral.
                                Aucune donnée ne quitte le territoire français.
                            </p>
                            <div className="r-actions">
                                <Link href="/signup" className="r-btn-primary">Essayer gratuitement</Link>
                                <a href="https://github.com/HelvetesDykare/romy" className="r-btn-secondary" target="_blank" rel="noopener noreferrer">Voir sur GitHub</a>
                            </div>
                        </div>

                        {/* Query card */}
                        <div className="r-card">
                            <div className="r-card-header">
                                <div className="r-card-dots">
                                    <span className="r-cdot r-cdot-r" />
                                    <span className="r-cdot r-cdot-y" />
                                    <span className="r-cdot r-cdot-g" />
                                </div>
                                <span className="r-card-title">romy — recherche juridique</span>
                            </div>
                            <div className="r-card-body">
                                <span className="r-cline"><span className="r-cl-blue">→</span> <span className="r-cl-text">Conditions de la rupture conventionnelle ?</span></span>
                                <span className="r-cline">&nbsp;</span>
                                <span className="r-cline"><span className="r-cl-muted">// JusticeLibre MCP · search_all</span></span>
                                <span className="r-cline"><span className="r-cl-green">✓</span> <span className="r-cl-muted">Cass. soc., 15 janv. 2014, n°12-27.943</span></span>
                                <span className="r-cline"><span className="r-cl-green">✓</span> <span className="r-cl-muted">Cass. soc., 29 janv. 2020, n°18-23.238</span></span>
                                <span className="r-cline"><span className="r-cl-green">✓</span> <span className="r-cl-muted">Art. L1237-11 Code du travail</span></span>
                                <span className="r-cline">&nbsp;</span>
                                <span className="r-cline"><span className="r-cl-muted">// Mistral Large · génération</span></span>
                                <span className="r-cline"><span className="r-cl-gold">La rupture conventionnelle</span> <span className="r-cl-text">est un</span></span>
                                <span className="r-cline"><span className="r-cl-text">mode de rupture du CDI résultant</span></span>
                                <span className="r-cline"><span className="r-cl-text">d&apos;un accord entre l&apos;employeur et</span></span>
                                <span className="r-cline"><span className="r-cl-text">le salarié (art. L1237-11 C. trav.).</span></span>
                                <span className="r-cline"><span className="r-cl-text">La Cour de cassation exige un</span></span>
                                <span className="r-cline"><span className="r-cl-text">consentement libre et éclairé...</span></span>
                                <span className="r-cline">&nbsp;</span>
                                <span className="r-cline"><span className="r-cl-blue">›</span> <span className="r-cursor" /></span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* STATS */}
                <div className="r-stats">
                    <div className="r-stats-inner">
                        <div className="r-stat">
                            <span className="r-stat-num">4M+</span>
                            <span className="r-stat-label">décisions de justice<br />accessibles en temps réel</span>
                        </div>
                        <div className="r-stat">
                            <span className="r-stat-num">1.5M</span>
                            <span className="r-stat-label">articles de loi<br />avec versioning historique</span>
                        </div>
                        <div className="r-stat">
                            <span className="r-stat-num">30</span>
                            <span className="r-stat-label">outils MCP JusticeLibre<br />chargés au démarrage</span>
                        </div>
                        <div className="r-stat">
                            <span className="r-stat-num">0</span>
                            <span className="r-stat-label">donnée transmise<br />hors de France</span>
                        </div>
                    </div>
                </div>

                {/* FEATURES */}
                <section className="r-features" id="features">
                    <div className="r-features-inner">
                        <span className="r-eyebrow">FONCTIONNALITÉS</span>
                        <h2 className="r-section-title">Tout ce dont un juriste a besoin.</h2>
                        <div className="r-features-grid">
                            {[
                                { icon: "📄", title: "Analyse de documents", desc: "Téléversez contrats, NDAs, décisions. Obtenez des réponses sourcées et citées, ancrées dans le texte exact." },
                                { icon: "⚖️", title: "Jurisprudence en temps réel", desc: "Recherche dans 4M+ décisions via JusticeLibre MCP. Identifiants vérifiables sur Légifrance en un clic." },
                                { icon: "📜", title: "Textes législatifs", desc: "Articles des 22 codes français avec versioning historique — Code civil, pénal, du travail et plus." },
                                { icon: "✍️", title: "Rédaction contractuelle", desc: "Génération de .docx avec mise en forme juridique française. Modifications suivies en accepter/refuser." },
                                { icon: "📊", title: "Revue tabulaire", desc: "Extraction structurée sur des lots de contrats — droit applicable, plafonds de responsabilité, délais." },
                                { icon: "🌐", title: "Multilingue", desc: "Réponses IA en français, anglais ou espagnol. Préférence stockée par utilisateur et injectée à chaque requête." },
                            ].map((f) => (
                                <div key={f.title} className="r-feature-card">
                                    <div className="r-feature-icon">{f.icon}</div>
                                    <div className="r-feature-title">{f.title}</div>
                                    <p className="r-feature-desc">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* STACK */}
                <section className="r-stack" id="stack">
                    <div className="r-stack-inner">
                        <span className="r-eyebrow">STACK SOUVERAIN</span>
                        <h2 className="r-section-title">Construit pour la France.</h2>
                        <table className="r-table">
                            <thead>
                                <tr><th>Couche</th><th>Choix</th><th>Pourquoi</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>Modèle IA</td><td>Mistral Large <span className="r-badge">🇫🇷 FR</span></td><td>Entreprise française, infrastructure EU, API compatible OpenAI</td></tr>
                                <tr><td>Jurisprudence</td><td>JusticeLibre MCP <span className="r-badge">🇫🇷 FR</span></td><td>4M+ décisions, gratuit, 30 outils, aucune authentification requise</td></tr>
                                <tr><td>Législation</td><td>search_legi + get_law_article</td><td>1,5M articles, versioning historique complet</td></tr>
                                <tr><td>Stockage objet</td><td>OVHcloud / Scaleway <span className="r-badge">🇫🇷 FR</span></td><td>Datacenters français, compatible S3</td></tr>
                                <tr><td>Auth</td><td>JWT + bcrypt</td><td>Aucun service tiers, aucune dépendance externe</td></tr>
                                <tr><td>Base de données</td><td>PostgreSQL auto-hébergé</td><td>Contrôle total, pas de vendor lock-in</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* CTA */}
                <section className="r-cta">
                    <div className="r-cta-inner">
                        <h2 className="r-cta-h2">L&apos;accès au droit est <em>un bien commun.</em></h2>
                        <p className="r-cta-p">
                            La France a rendu ses données juridiques publiques et gratuites.<br />
                            Romy les assemble. Open source. AGPL-3.0. Hébergé en France.
                        </p>
                        <div className="r-cta-actions">
                            <Link href="/signup" className="r-btn-primary">Créer un compte</Link>
                            <a href="https://github.com/HelvetesDykare/romy" className="r-btn-secondary" target="_blank" rel="noopener noreferrer">Lire le code source</a>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="r-footer">
                    <Link href="/" className="r-footer-logo">
                        <span className="r-footer-dot" />
                        Romy OSS
                    </Link>
                    <div className="r-footer-links">
                        <a href="https://github.com/HelvetesDykare/romy" className="r-footer-link" target="_blank" rel="noopener noreferrer">GitHub</a>
                        <a href="https://github.com/HelvetesDykare/romy/blob/main/LICENSE" className="r-footer-link" target="_blank" rel="noopener noreferrer">AGPL-3.0</a>
                        <a href="https://justicelibre.org" className="r-footer-link" target="_blank" rel="noopener noreferrer">JusticeLibre</a>
                        <a href="https://mistral.ai" className="r-footer-link" target="_blank" rel="noopener noreferrer">Mistral AI</a>
                    </div>
                    <span className="r-footer-copy">Aucune donnée ne quitte la France.</span>
                </footer>

            </div>
        </>
    );
}