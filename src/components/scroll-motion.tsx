'use client';
import { useEffect } from 'react';
// Revela bloques [data-reveal] al entrar en pantalla. El HTML del servidor es visible sin JS:
// solo se ocultan los elementos que aún están fuera del viewport cuando el script arranca.
export function ScrollMotion() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const limit = window.innerHeight * 0.92;
    const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal]')].filter(el => el.getBoundingClientRect().top > limit);
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.replace('reveal-pending', 'reveal-in'); observer.unobserve(entry.target); }
    }, { rootMargin: '0px 0px -8% 0px' });
    for (const el of targets) { el.classList.add('reveal-pending'); observer.observe(el); }
    return () => { observer.disconnect(); for (const el of targets) el.classList.remove('reveal-pending'); };
  }, []);
  return null;
}
