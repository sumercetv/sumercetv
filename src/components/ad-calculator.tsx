'use client';
import { useState } from 'react';
import { ContactForm } from './contact-form';
import type { Plan } from '@/lib/types';

type Option = { id: string; name: string; type: 'service' | 'plan' };
type Props = { plans: Pick<Plan, 'id' | 'name' | 'features' | 'price_cop' | 'period'>[]; options: Option[]; enabled: boolean; whatsapp: string; facebook: string };
const MONTHS = [3, 6, 12] as const;
const cop = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
const num = (v: number) => new Intl.NumberFormat('es-CO').format(v);
// Las salidas se leen de las características del plan en /admin ("20 salidas diarias de 30 segundos").
const label = (name: string) => { const s = name.replace(/^pauta\s+/i, ''); return s.charAt(0).toUpperCase() + s.slice(1); };
const spotsOf =(features: string[]) => [...new Set(features.map(f => Number(/^(\d{1,4})\s+salidas/i.exec(f.trim())?.[1])).filter(n => n > 0))];

// Calculadora sin tarifas inventadas: solo muestra precio si el plan tiene "Desde" cargado en /admin.
// La selección viaja con la solicitud (interés = horario, mensaje = salidas y permanencia).
export function AdCalculator({ plans, options, enabled, whatsapp, facebook }: Props) {
  const [planId, setPlanId] = useState(plans[0]?.id ?? '');
  const plan = plans.find(p => p.id === planId) ?? plans[0];
  const spotsList = plan ? spotsOf(plan.features) : [];
  const [spots, setSpots] = useState<number>(spotsList[0] ?? 0);
  const [months, setMonths] = useState<number>(3);
  if (!plan) return null;
  const daily = spotsList.includes(spots) ? spots : spotsList[0] ?? 0;
  // Aproximación de 30 días por mes; se indica como aproximada al público.
  const total = daily * 30 * months;
  const details = `Calculadora: ${daily ? `${daily} salidas diarias, ` : ''}permanencia de ${months} meses.`;
  return <div className="calc" id="calculadora">
    <div className="calc-panel">
      <span className="eyebrow">Calculadora de pauta</span>
      <h3>Arma tu pauta en 3 pasos.</h3>
      <fieldset className="calc-step"><legend>1. Horario</legend><div className="calc-chips">{plans.map(p => <label key={p.id} className="calc-chip"><input type="radio" name="calc-plan" value={p.id} checked={p.id === plan.id} onChange={() => setPlanId(p.id)}/><span>{label(p.name)}</span></label>)}</div></fieldset>
      {spotsList.length > 0 && <fieldset className="calc-step"><legend>2. Salidas diarias de 30 s</legend><div className="calc-chips">{spotsList.map(n => <label key={n} className="calc-chip"><input type="radio" name="calc-spots" value={n} checked={n === daily} onChange={() => setSpots(n)}/><span>{n} al día</span></label>)}</div></fieldset>}
      <fieldset className="calc-step"><legend>{spotsList.length ? '3' : '2'}. Permanencia</legend><div className="calc-chips">{MONTHS.map(m => <label key={m} className="calc-chip"><input type="radio" name="calc-months" value={m} checked={m === months} onChange={() => setMonths(m)}/><span>{m} meses</span></label>)}</div></fieldset>
      <div className="calc-summary" aria-live="polite">
        {daily > 0 && <p><strong>≈ {num(total)} salidas</strong> al aire en {months} meses</p>}
        {plan.price_cop !== null && plan.price_cop > 0
          ? <p>Desde {cop(plan.price_cop)} {plan.period}. La tarifa final depende de salidas y permanencia.</p>
          : <p>Déjanos tu WhatsApp y te enviamos la tarifa exacta para esta selección.</p>}
      </div>
    </div>
    <ContactForm compact source="calculadora" title="Recibe tu tarifa." submitLabel="Quiero mi tarifa" initialInterest={plan.name} details={details} options={options} enabled={enabled} whatsapp={whatsapp} facebook={facebook}/>
  </div>;
}
