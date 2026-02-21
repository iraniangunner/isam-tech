import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../hooks/useTranslation';
import MathCaptcha from '../common/MathCaptcha';
import './ContactSection.css';

const MIN_FORM_FILL_SECONDS = 3;
const SUBMIT_COOLDOWN_SECONDS = 15;

export default function ContactSection() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaSeed, setCaptchaSeed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [honeypotValue, setHoneypotValue] = useState('');
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [timestamp, setTimestamp] = useState(Date.now());
  const formStartedAtRef = useRef(Date.now());

  //const configuredEndpoint = (import.meta.env.VITE_FORMSPREE_ENDPOINT || '').trim();
  //const formId = (import.meta.env.VITE_FORMSPREE_FORM_ID || '').trim();
  //const formEndpoint = configuredEndpoint || (formId ? `https://formspree.io/f/${formId}` : '');
  //const isFormConfigured = Boolean(formEndpoint);
  
  const formEndpoint    = `${import.meta.env.VITE_API_URL}/api/contact`;
  const isFormConfigured = Boolean(import.meta.env.VITE_API_URL);
  const captchaLabels = t('contact.form.captchaLabels');

  const safeCaptchaLabels =
    captchaLabels && typeof captchaLabels === 'object'
      ? captchaLabels
      : undefined;

  const cooldownRemaining = Math.max(0, Math.ceil((cooldownUntil - timestamp) / 1000));
  const isCooldownActive = cooldownRemaining > 0;

  useEffect(() => {
    if (!isCooldownActive) return undefined;

    const timer = setInterval(() => {
      setTimestamp(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [isCooldownActive]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaptchaChange = (isValid) => {
    setCaptchaValid(isValid);
    if (submitStatus === 'captcha') {
      setSubmitStatus(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (honeypotValue.trim() !== '') {
      setSubmitStatus('spamBlocked');
      return;
    }

    if (isCooldownActive) {
      setSubmitStatus('cooldown');
      return;
    }

    const formAgeInSeconds = (Date.now() - formStartedAtRef.current) / 1000;
    if (formAgeInSeconds < MIN_FORM_FILL_SECONDS) {
      setSubmitStatus('tooFast');
      return;
    }

    if (!captchaValid) {
      setSubmitStatus('captcha');
      return;
    }

    if (!isFormConfigured) {
      setSubmitStatus('configError');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const payload = new FormData();
    payload.set('name', formData.name.trim());
    payload.set('email', formData.email.trim());
    payload.set('phone', formData.phone.trim());
    payload.set('subject', formData.subject.trim());
    payload.set('message', formData.message.trim());
    payload.set('language', language);
    payload.set('captcha_verified', String(captchaValid));

    try {
      const response = await fetch(formEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: payload,
      });

      if (!response.ok) {
        setSubmitStatus('error');
      } else {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setHoneypotValue('');
      }
    } catch (error) {
      console.error('Contact form submit error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setCaptchaValid(false);
      setCaptchaSeed((prev) => prev + 1);
      formStartedAtRef.current = Date.now();
      setCooldownUntil(Date.now() + SUBMIT_COOLDOWN_SECONDS * 1000);
      setTimestamp(Date.now());
    }
  };

  const statusMessage = (() => {
    if (!submitStatus) return null;

    if (submitStatus === 'captcha') return t('contact.form.captchaError');
    if (submitStatus === 'cooldown') {
      const seconds = String(cooldownRemaining || SUBMIT_COOLDOWN_SECONDS);
      return t('contact.form.cooldown').replace('{seconds}', seconds);
    }

    return t(`contact.form.${submitStatus}`);
  })();

  return (
    <section className="contact-section section" id="contact">
      <div className="container">
        <div className="section-title">
          <h2>{t('contact.title')}</h2>
          <p>{t('contact.subtitle')}</p>
        </div>

        <div className="contact-section__grid">
          <div className="contact-section__form-wrapper">
            <form onSubmit={handleSubmit} className="contact-section__form" noValidate>
              <div className="contact-section__honeypot" aria-hidden="true">
                <label htmlFor="company-name">{t('contact.form.company')}</label>
                <input
                  type="text"
                  id="company-name"
                  name="company_name"
                  value={honeypotValue}
                  onChange={(event) => setHoneypotValue(event.target.value)}
                  autoComplete="off"
                  tabIndex={-1}
                />
              </div>

              <div className="contact-section__form-row">
                <div className="contact-section__form-group">
                  <label htmlFor="name">{t('contact.form.name')}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="contact-section__form-group">
                  <label htmlFor="email">{t('contact.form.email')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="contact-section__form-row">
                <div className="contact-section__form-group">
                  <label htmlFor="phone">{t('contact.form.phone')}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    dir="ltr"
                  />
                </div>
                <div className="contact-section__form-group">
                  <label htmlFor="subject">{t('contact.form.subject')}</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="contact-section__form-group">
                <label htmlFor="message">{t('contact.form.message')}</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="contact-section__captcha">
                <label>{t('contact.form.captcha')}</label>
                <MathCaptcha
                  key={captchaSeed}
                  onValidChange={handleCaptchaChange}
                  labels={safeCaptchaLabels}
                />
              </div>

              {!isFormConfigured ? (
                <div className="contact-section__status contact-section__status--configError">
                  {t('contact.form.configError')}
                </div>
              ) : null}

              {statusMessage ? (
                <div className={`contact-section__status contact-section__status--${submitStatus}`}>
                  {statusMessage}
                </div>
              ) : null}

              <button
                type="submit"
                className="btn btn-primary btn-lg contact-section__submit"
                disabled={!captchaValid || isSubmitting || !isFormConfigured || isCooldownActive}
              >
                {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
              </button>
            </form>
          </div>

          <div className="contact-section__info">
            <h3>{t('contact.info.title')}</h3>

            <div className="contact-section__info-item">
              <div className="contact-section__info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <strong>{t('contact.info.address')}</strong>
                <span>{t('contact.info.fullAddress')}</span>
              </div>
            </div>

            <div className="contact-section__info-item">
              <div className="contact-section__info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div>
                <strong>{t('contact.info.phone')}</strong>
                <span dir="ltr">{t('contact.info.phoneValue')}</span>
              </div>
            </div>

            <div className="contact-section__info-item">
              <div className="contact-section__info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <strong>{t('contact.info.email')}</strong>
                <span>{t('contact.info.emailValue')}</span>
              </div>
            </div>

            <div className="contact-section__info-item">
              <div className="contact-section__info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div>
                <strong>{t('contact.info.workingHours')}</strong>
                <span style={{ whiteSpace: 'pre-line' }}>{t('contact.info.workingHoursText')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
