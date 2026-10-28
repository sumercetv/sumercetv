'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Campaign } from '@/lib/types';
import { activeCampaign, isPublicMedia, safeExternal } from '@/lib/links';
function visitor(){try{ let id=sessionStorage.getItem('sumerce-ad-session');if(!id){id=crypto.randomUUID();sessionStorage.setItem('sumerce-ad-session',id);}return id;}catch{return null;}}
function track(campaign_id:string,kind:'impression'|'click'){
  const id=visitor();if(!id)return;
  void fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({campaign_id,kind,visitor:id}),keepalive:true}).catch(()=>{});
}
export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const ref=useRef<HTMLAnchorElement>(null);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    let timer:ReturnType<typeof setTimeout>|undefined;
    let visible=false;
    const observer=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting && entries[0].intersectionRatio>=.5;
      clearTimeout(timer);
      if(visible && document.visibilityState==='visible')timer=setTimeout(()=>track(campaign.id,'impression'),1000);
    },{threshold:.5});
    const onVisibility=()=>{clearTimeout(timer);if(visible&&document.visibilityState==='visible')timer=setTimeout(()=>track(campaign.id,'impression'),1000);};
    observer.observe(el);document.addEventListener('visibilitychange',onVisibility);
    return()=>{observer.disconnect();clearTimeout(timer);document.removeEventListener('visibilitychange',onVisibility);};
  },[campaign.id]);
  if(!safeExternal(campaign.link_url)||!isPublicMedia(campaign.image_url))return null;
  return <a ref={ref} className="campaign-card" href={campaign.link_url} target="_blank" rel="sponsored noopener noreferrer" onClick={()=>track(campaign.id,'click')}><Image src={campaign.image_url} alt={campaign.name} width={1200} height={420} sizes="(max-width: 700px) 100vw, 70vw"/><div className="campaign-copy"><strong>{campaign.name} ↗</strong>{campaign.description && <p>{campaign.description}</p>}</div></a>;
}
export function CampaignPlacement({ campaigns, rotate = false }: { campaigns: Campaign[]; rotate?: boolean }){
  const [index,setIndex]=useState(0);
  const [paused,setPaused]=useState(false);
  const [now,setNow]=useState(()=>Date.now());
  const current=campaigns.filter(c=>activeCampaign(c,now));
  useEffect(()=>{const ends=campaigns.map(c=>Date.parse(c.ends_at)).filter(t=>t>now);if(!ends.length)return;const id=setTimeout(()=>setNow(Date.now()),Math.min(Math.max(1,Math.min(...ends)-Date.now()),2147483647));return()=>clearTimeout(id);},[campaigns,now]);
  useEffect(()=>{
    if(!rotate||paused||current.length<2||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const id=setInterval(()=>{if(document.visibilityState==='visible')setIndex(i=>i+1);},8000);
    return()=>clearInterval(id);
  },[rotate,paused,current.length]);
  if(!current.length)return null;
  const selected=current[index%current.length];
  return rotate ? <div onMouseEnter={()=>setPaused(true)} onFocusCapture={()=>setPaused(true)}><CampaignCard key={selected.id} campaign={selected}/>{current.length>1 && <div className="rotation-controls"><span>Anuncio {index%current.length+1} de {current.length}</span><div className="actions"><button onClick={()=>setPaused(!paused)}>{paused?'Continuar rotación':'Pausar rotación'}</button><button onClick={()=>{setPaused(true);setIndex(i=>i+1);}}>Siguiente anuncio →</button></div></div>}</div> : <div className="campaign-grid">{current.map(c=><CampaignCard key={c.id} campaign={c}/>)}</div>;
}
