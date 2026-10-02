import React, { useState, useRef } from 'react';
import { api } from '../lib/api.js';

const money = (n) => n.toLocaleString('en-ZA');

/* 3-step booking flow — faithful port of the original .booking widget behaviour:
   no default selection (Continue shakes the grid), "On request" for price 0,
   done/active step indicators, summary rows, ref+password confirmation.
   Props:
   - id, refPrefix, storeKey, apiType
   - steps: [s1, s2, s3] labels
   - options: [{ name, price, tag?, priceHtml, was?, desc }]
   - showQty (default true)
   - fields: step-2 form content (default = ticket name/email/phone/city)
   - submitLabel, confirmTitle, refLabel ('Booking reference' | 'Reservation reference')
   - fineNote, portalNoteTitle ('Your portal login — keep these safe' | 'Your exhibitor portal login — keep these safe')
   - fineEmailPrefix ('A confirmation email with your ticket will be sent to' | 'A confirmation email will be sent to')
   - newBookingHref, newBookingLabel */
export default function BookingFlow({
  id, refPrefix, storeKey, apiType,
  steps = ['Choose pass', 'Your details', 'Confirmed'],
  options, showQty = true,
  fields, submitLabel = 'Reserve my passes',
  formNote = 'By reserving you agree to be contacted about payment and event updates.',
  confirmTitle = 'Booking reserved!',
  refLabel = 'Booking reference',
  portalNoteTitle = 'Your portal login — keep these safe',
  fineEmailPrefix = 'No payment was taken. A confirmation email with your ticket will be sent to',
  fineTail = 'Your reservation is held for 48 hours — and you can log in to the',
  portalLinkText = 'portal', fineAfter = ' anytime to download your ticket.',
  newBookingHref = 'tickets.html', newBookingLabel = 'New booking',
}) {
  const [step, setStep] = useState(1);
  const [pick, setPick] = useState(null);
  const [qty, setQty] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const formRef = useRef(null);
  const rootRef = useRef(null);

  const opt = pick !== null ? options[pick] : null;
  const totalText = !opt ? '—' : opt.price > 0 ? money(opt.price * qty) : 'On request';

  const show = (n) => {
    setStep(n);
    const el = rootRef.current?.querySelector(`.bstep[data-step="${n}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goNext = () => {
    setError('');
    if (pick === null) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    show(2);
  };

  const submit = async () => {
    const form = formRef.current;
    setError('');
    const inputs = [...form.querySelectorAll('[required]')];
    let ok = true, firstBad = null;
    inputs.forEach((inp) => {
      const bad = !inp.value || !inp.value.trim() ||
        (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value));
      inp.classList.toggle('invalid', bad);
      if (bad) { ok = false; firstBad = firstBad || inp; }
    });
    if (!ok) { firstBad?.focus(); return; }
    const data = Object.fromEntries(new FormData(form).entries());
    const chosen = options[pick];
    try {
      const res = await api.submitBooking(apiType, {
        name: data.name || data.company || '', email: data.email, phone: data.phone,
        city: data.city || '', company: data.company || '', website: data.website || '',
        category: data.category || '', package: chosen.name, price: chosen.price, qty,
        storeKey, refPrefix,
      });
      setResult({ ref: res.ref, password: res.password, fields: data, chosen, qty });
      show(3);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    }
  };

  const defaultFields = (
    <>
      <label>Full name<input required name="name" type="text" placeholder="Your name" autoComplete="name" /></label>
      <label>Email<input required name="email" type="email" placeholder="you@email.com" autoComplete="email" /></label>
      <label>Phone<input required name="phone" type="tel" placeholder="+27 ..." autoComplete="tel" /></label>
      <label>City<input name="city" type="text" placeholder="City" /></label>
    </>
  );

  const summaryRows = [];
  if (result) {
    summaryRows.push(['Selection', result.chosen.name]);
    if (result.qty > 1) summaryRows.push(['Quantity', String(result.qty)]);
    summaryRows.push(['Total', result.chosen.price > 0 ? money(result.chosen.price * result.qty) : 'On request']);
    Object.keys(result.fields).forEach((k) => {
      if (result.fields[k]) summaryRows.push([k.charAt(0).toUpperCase() + k.slice(1), result.fields[k]]);
    });
  }

  return (
    <div className="booking" id={id} data-ref-prefix={refPrefix} data-store-key={storeKey} ref={rootRef}>
      <ol className="bsteps">
        {[1, 2, 3].map((n) => (
          <li key={n} className={(step === n ? 'active' : '') + (n < step ? ' done' : '')} data-s={n}>
            <span>{n}</span>{steps[n - 1]}
          </li>
        ))}
      </ol>

      <div className={'bstep' + (step === 1 ? ' active' : '')} data-step="1">
        <div className={'pick-grid' + (shake ? ' shake' : '')}>
          {options.map((o, i) => (
            <button
              key={o.name}
              type="button"
              className={'pick-card' + (pick === i ? ' selected' : '')}
              onClick={() => setPick(i)}
            >
              <strong>{o.name}</strong>
              {o.tag && <span className="tag">{o.tag}</span>}
              <span className="p" dangerouslySetInnerHTML={{ __html: o.priceHtml }} />
              {o.was && <span className="was">{o.was}</span>}
              <span className="d">{o.desc}</span>
            </button>
          ))}
        </div>
        {showQty && (
          <>
            <div className="qty-row">
              <span>Quantity</span>
              <div className="qty">
                <button type="button" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <b>{qty}</b>
                <button type="button" aria-label="Increase" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
              </div>
            </div>
            <div className="b-total">Total <strong>{totalText}</strong><span> · no payment taken now</span></div>
          </>
        )}
        <button className="btn btn-primary btn-lg btn-block" type="button" onClick={goNext}>Continue</button>
      </div>

      <div className={'bstep' + (step === 2 ? ' active' : '')} data-step="2">
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
          <div className="form-grid">{fields || defaultFields}</div>
        </form>
        {error && <p className="form-note" style={{ color: '#ff6b6b' }}>{error}</p>}
        <div className="bnav">
          <button className="btn btn-ghost" type="button" onClick={() => show(1)}>Back</button>
          <button className="btn btn-primary btn-lg" type="button" onClick={submit}>{submitLabel}</button>
        </div>
        <p className="form-note">{formNote}</p>
      </div>

      <div className={'bstep' + (step === 3 ? ' active' : '')} data-step="3">
        {result && (
          <div className="confirm-card">
            <div className="confirm-check">✓</div>
            <h3>{confirmTitle}</h3>
            <p className="ref">{refLabel}<br /><strong>{result.ref}</strong></p>
            <div className="summary">
              {summaryRows.map(([k, v]) => (
                <div key={k}><span>{k}</span><strong>{v}</strong></div>
              ))}
            </div>
            <p className="portal-creds">{portalNoteTitle}<br />
              Reference <strong>{result.ref}</strong> &nbsp;·&nbsp; Password <strong>{result.password}</strong></p>
            <p className="fine">{fineEmailPrefix} <strong>{result.fields.email || 'your email'}</strong> automatically.{' '}
              {fineTail} <a href="portal.html">{portalLinkText}</a>{fineAfter}</p>
            <div className="bnav center">
              <a className="btn btn-ghost" href="portal.html">Go to Portal</a>
              <a className="btn btn-ghost" href={newBookingHref}>{newBookingLabel}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
