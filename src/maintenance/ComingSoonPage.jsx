import "./coming-soon.css";

const fallbackHeadline = "Scheduled Platform Update";
const fallbackMessage =
  "ISAM is improving the web experience. We will be back online shortly.";

export default function ComingSoonPage() {
  const headline = import.meta.env.VITE_MAINTENANCE_HEADLINE || fallbackHeadline;
  const message = import.meta.env.VITE_MAINTENANCE_MESSAGE || fallbackMessage;
  const contactEmail = import.meta.env.VITE_MAINTENANCE_CONTACT_EMAIL;
  const currentYear = new Date().getFullYear();

  return (
    <main className="coming-soon-page" aria-labelledby="coming-soon-title">
      <section className="coming-soon-card">
        <img className="coming-soon-logo" src="/img/isam-logo.png" alt="ISAM logo" />
        <p className="coming-soon-kicker">ISAM</p>
        <h1 id="coming-soon-title">{headline}</h1>
        <p className="coming-soon-message">{message}</p>
        {contactEmail ? (
          <p className="coming-soon-contact">
            Questions?{" "}
            <a href={`mailto:${contactEmail}`} className="coming-soon-link">
              {contactEmail}
            </a>
          </p>
        ) : null}
      </section>
      <p className="coming-soon-footer">© {currentYear} ISAM. All rights reserved.</p>
    </main>
  );
}
