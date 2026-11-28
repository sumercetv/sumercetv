export type Settings = {
  facebook: string; email: string; phone: string; whatsapp: string;
  institutional: string; institutional_ready: boolean; privacy: string; privacy_ready: boolean;
  founders_enabled: boolean; founders_total: number; founders_taken: number; founders_benefit: string;
};
export type PageSEO = { id: string; title: string; description: string; heading?:string; introduction?:string };
export type Section = { id: string; key: string; title: string; body: string; button_label: string; button_url: string; items:string[]; image_url?: string | null; image_alt?: string; sort_order: number; published: boolean };
export type Service = { id: string; name: string; description: string; category: string; image_url: string | null; cta_label: string; sort_order: number; published: boolean };
export type Plan = { id: string; name: string; description: string; features: string[]; benefits: string; price_cop: number | null; period: string; sort_order: number; published: boolean };
export type Sponsor = { id: string; name: string; description: string; image_url: string; link_url: string; authorized: boolean; published: boolean; sort_order: number };
export type Campaign = { id: string; name: string; description: string; sponsor_id: string | null; image_url: string; link_url: string; position: 'principal' | 'grid' | 'banner'; starts_at: string; ends_at: string; priority: number; authorized: boolean; published: boolean };
export type Stream = { id: string; title: string; source_type: 'hls' | 'embed'; source_url: string; poster_url: string | null; enabled: boolean; published: boolean };
export type Lead = { id: string; name: string; email: string | null; phone: string | null; interest: string | null; service_id: string|null; plan_id: string|null; message: string | null; utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string; referrer?: string; landing_path?: string; consent: boolean; consent_at?: string | null; privacy_version?: string | null; consent_version?: string; source?: string; status: string; created_at: string };
export type Media = { id: string; name: string; path: string; url: string; mime: string; bytes: number; width: number; height: number; created_at: string };
export type Rows = { site_settings: { id: string; data: Settings; published: boolean }; pages: PageSEO; sections: Section; services: Service; plans: Plan; sponsors: Sponsor; campaigns: Campaign; stream_config: Stream; leads: Lead; media: Media; profiles: { id: string; role: 'admin' }; ad_events: { id: string; campaign_id: string; kind: 'click' | 'impression'; visitor: string; day: string; created_at: string } };
type Table<T> = { Row: T; Insert: Partial<T>; Update: Partial<T>; Relationships: [] };
export type Database = { public: { Tables: { [K in keyof Rows]: Table<Rows[K]> }; Views: Record<string, never>; Functions: { is_admin: { Args: Record<string, never>; Returns: boolean }; consume_rate_limit: { Args: { bucket: string; max_requests: number; window_seconds: number }; Returns: boolean } }; Enums: Record<string, never>; CompositeTypes: Record<string, never> } };
