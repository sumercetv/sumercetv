import { getContent } from '@/lib/content';
import { llmsContent } from '@/lib/discovery';
import { publicUrl } from '@/lib/site-config';

export const dynamic = 'force-dynamic';
export async function GET() {
  return new Response(llmsContent(await getContent()), { headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Language': 'es-CO',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'X-Robots-Tag': 'noindex, follow',
    Link: `<${publicUrl('/')}>; rel="canonical", </llms.txt>; rel="describedby"`,
  } });
}
