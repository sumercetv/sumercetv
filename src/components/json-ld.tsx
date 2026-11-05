import { serializeStructuredData } from '@/lib/discovery';

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }}/>;
}
