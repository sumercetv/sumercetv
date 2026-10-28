import 'server-only';
import { unstable_cache } from 'next/cache';
import { configured, publicClient } from './supabase/server';
import { defaultPages, defaultSections, defaultSettings, defaultStream } from './defaults';
import type { Rows, Settings, Stream } from './types';
const readContent = unstable_cache(async () => {
  if (!configured()) return { settings: defaultSettings, pages: defaultPages, sections: defaultSections, services: [], plans: [], sponsors: [], stream: defaultStream, available: false };
  const db = publicClient();
  const [settings,pages,sections,services,plans,sponsors,stream] = await Promise.all([
    db.from('site_settings').select('*').eq('id','general').maybeSingle(),
    db.from('pages').select('*'), db.from('sections').select('*').order('sort_order'),
    db.from('services').select('*').order('sort_order'), db.from('plans').select('*').order('sort_order'),
    db.from('sponsors').select('*').order('sort_order'), db.from('stream_config').select('*').eq('id','main').maybeSingle()
  ]);
  const failed = [settings,pages,sections,services,plans,sponsors,stream].some(r => r.error);
  return { settings: { ...defaultSettings, ...(settings.data?.data as Settings | undefined) }, pages: pages.data ?? defaultPages, sections: sections.data ?? [], services: services.data ?? [], plans: plans.data ?? [], sponsors: sponsors.data ?? [], stream: (stream.data as Stream | null) ?? defaultStream, available: !failed };
}, ['public-content-v2'], { tags: ['content'], revalidate: 300 });
export const getContent = readContent;
// Vigencia evaluada en cada solicitud: no conservar campañas vencidas en ISR.
export async function getCampaigns(): Promise<Rows['campaigns'][]> {
  if (!configured()) return [];
  const { data } = await publicClient().from('campaigns').select('*').order('priority', { ascending: false });
  return data ?? [];
}
