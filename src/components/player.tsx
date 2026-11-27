'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Brand } from './brand';
import { Icon } from './icons';
import { allowedEmbed, isPublicMedia } from '@/lib/links';
import type { Stream } from '@/lib/types';
export function Player({ stream, whatsapp = '' }: { stream: Stream; whatsapp?: string }) {
  const [started,setStarted] = useState(false);
  const [status,setStatus] = useState<'idle'|'loading'|'playing'|'paused'|'error'>('idle');
  const [attempt,setAttempt] = useState(0);
  const [muted,setMuted] = useState(true);
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const ready = stream.enabled && stream.published && !!stream.source_url;
  const embed = stream.source_type === 'embed' && allowedEmbed(stream.source_url);
  useEffect(()=>{
    if(!started || !ready || embed) return;
    let disposed = false;
    let hls: import('hls.js').default | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    let recoveries = 0;
    const el = video.current;
    if(!el) return;
    const fail = ()=>{ if(!disposed) setStatus('error'); };
    const nativeError = ()=>{if(disposed)return;if(recoveries>=3){fail();return;}setStatus('loading');clearTimeout(retry);retry=setTimeout(()=>{if(!disposed){el!.load();void play();}},1000*2**recoveries++);};
    const playing = ()=>{ clearTimeout(watchdog); if(!disposed) setStatus('playing'); };
    const waiting = ()=>{ if(!disposed) setStatus('loading'); clearTimeout(watchdog); watchdog = setTimeout(fail,20000); };
    const paused = ()=>{ if(!disposed) setStatus('paused'); };
    const play = ()=>el.play().catch(()=>{ if(!disposed) setStatus('paused'); });
    el.addEventListener('playing',playing); el.addEventListener('waiting',waiting); el.addEventListener('stalled',waiting); el.addEventListener('pause',paused); el.addEventListener('ended',fail);
    watchdog = setTimeout(fail,25000);
    async function setup(){
      // hls.js (MSE) primero: errores y reintentos controlados en Chrome, Edge, Firefox y Android.
      // HLS nativo solo donde no hay MSE (Safari en iPhone antiguo).
      const { default: Hls } = await import('hls.js');
      if(disposed) return;
      if(!Hls.isSupported()){
        if(!el!.canPlayType('application/vnd.apple.mpegurl')){fail();return;}
        el!.src = stream.source_url;
        el!.addEventListener('error',nativeError);
        await play(); return;
      }
      hls = new Hls({ enableWorker: true, maxBufferLength: 20, manifestLoadPolicy: { default: { maxTimeToFirstByteMs: 10000, maxLoadTimeMs: 20000, timeoutRetry: { maxNumRetry: 1, retryDelayMs: 1000, maxRetryDelayMs: 4000 }, errorRetry: { maxNumRetry: 1, retryDelayMs: 1000, maxRetryDelayMs: 4000 } } } });
      hls.loadSource(stream.source_url); hls.attachMedia(el!);
      hls.on(Hls.Events.MANIFEST_PARSED,()=>{ if(!disposed) void play(); });
      hls.on(Hls.Events.ERROR,(_event,data)=>{
        if(!data.fatal || disposed) return;
        if(recoveries >= 3){ hls?.destroy(); fail(); return; }
        const delay = 1000 * 2 ** recoveries++;
        setStatus('loading');
        clearTimeout(retry);
        retry = setTimeout(()=>{ if(disposed) return; if(data.type === Hls.ErrorTypes.NETWORK_ERROR) hls?.startLoad(); else if(data.type === Hls.ErrorTypes.MEDIA_ERROR) hls?.recoverMediaError(); else { hls?.destroy(); fail(); } },delay);
      });
    }
    void setup().catch(fail);
    return ()=>{ disposed=true;clearTimeout(retry);clearTimeout(watchdog);hls?.destroy();el.removeEventListener('playing',playing);el.removeEventListener('waiting',waiting);el.removeEventListener('stalled',waiting);el.removeEventListener('pause',paused);el.removeEventListener('ended',fail);el.removeEventListener('error',nativeError);el.removeAttribute('src');el.load(); };
  },[started,ready,embed,stream.source_url,attempt]);
  function start(){setStatus('loading');setStarted(true);}
  // Respaldo cuando la señal no está configurada o no carga: nunca dejar al visitante sin salida.
  const fallback = <div className="player-offline" role={status==='error' ? 'alert' : undefined}><Brand large/><h2>{ready ? 'La señal no está disponible en este momento.' : 'Nos encontramos pronto.'}</h2><p>{ready ? 'Puede ser una pausa en la transmisión. Intenta de nuevo en unos minutos o escríbenos: con gusto te atendemos.' : 'La señal en línea no está disponible en este momento. Escríbenos y con gusto te atendemos.'}</p><div className="actions player-fallback-actions">{ready && status==='error' && <button className="button button-outline" onClick={()=>{setStatus('loading');setAttempt(a=>a+1);}}>Reintentar</button>}{whatsapp && <a className="button button-yellow" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola SUMERCÉ TV, quiero información sobre la señal y la pauta.')}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={18}/>Escríbenos por WhatsApp</a>}<Link className="button button-blue" href="/contacto?servicio=Publicidad">Cotizar un espacio</Link></div></div>;
  const text = !ready ? 'Señal no disponible' : embed ? 'Señal del proveedor' : ({ idle:'Señal lista para consultar', loading:'Conectando con la señal…', playing:'EN VIVO', paused:'Reproducción pausada', error:'No se pudo conectar con la señal' }[status]);
  return <div ref={frame} className="player-shell"><div className="live-topline"><h2>{stream.title}</h2><span className="status-label" role="status"><Icon name="signal" size={16}/>{!embed && status==='playing' ? 'EN VIVO' : 'Estado de señal'}</span></div><div className="player">
    {ready && started ? embed ? <iframe src={stream.source_url} title={stream.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation"/> : <video ref={video} muted={muted} playsInline preload="none" poster={stream.poster_url && isPublicMedia(stream.poster_url) ? stream.poster_url : undefined} aria-label={stream.title}/> : <>{stream.poster_url && isPublicMedia(stream.poster_url) && <Image className="player-poster" src={stream.poster_url} alt="" fill sizes="(max-width: 1200px) 100vw, 1200px"/>}{ready ? <div className="player-offline"><Brand large/><h2>Tu conexión con SUMERCÉ TV.</h2><p>Inicia el reproductor para ver la señal.</p><button className="button button-yellow" onClick={start}><Icon name="play"/>Iniciar reproductor</button></div> : fallback}</>}
    {ready && started && !embed && status==='error' && <div className="player-fallback">{fallback}</div>}
  </div><div className="player-info"><span role="status" aria-live="polite">{text}</span>{started && <div className="player-actions">{!embed && <><button onClick={()=>{if(status==='playing')video.current?.pause();else void video.current?.play().catch(()=>setStatus('paused'));}}>{status==='playing'?'Pausar':'Reproducir'}</button><button onClick={()=>{setMuted(!muted);if(video.current) video.current.muted=!muted;}}>{muted ? 'Activar audio' : 'Silenciar'}</button><label className="volume-control">Volumen<input type="range" min="0" max="1" step="0.05" defaultValue="1" aria-label="Volumen de la señal" onChange={e=>{if(video.current){video.current.volume=Number(e.target.value);video.current.muted=false;setMuted(false);}}}/></label></>}<button onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});else void frame.current?.requestFullscreen?.().catch(()=>{});}}>Alternar pantalla completa</button></div>}</div></div>;
}
