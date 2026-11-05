import type { PageSEO, Section, Settings, Stream } from './types';
export const defaultSettings: Settings = { facebook: 'https://www.facebook.com/p/Sumerc%C3%A9-TV-61590675422295/', email: '', phone: '', whatsapp: '', institutional: 'La presentación institucional está pendiente de aprobación. Este texto es provisional y editable.', institutional_ready: false, privacy: 'Aviso de tratamiento de datos pendiente de publicación.', privacy_ready: false };
export const defaultPages: PageSEO[] = [
  { id: 'inicio', title: 'SUMERCÉ TV | Televisión en línea y contacto comercial', description: 'Conoce SUMERCÉ TV, consulta la disponibilidad de su señal de televisión en línea y contacta al equipo para información comercial.' },
  { id: 'servicios', title: 'Servicios y planes | SUMERCÉ TV', description: 'Consulta los servicios y planes publicados de SUMERCÉ TV y solicita una propuesta para tu marca.' },
  { id: 'en-vivo', title: 'SUMERCÉ TV en vivo | Señal de televisión en línea', description: 'Consulta la disponibilidad de la señal de televisión de SUMERCÉ TV, inicia el reproductor y conoce a los patrocinadores publicados.' },
  { id: 'contacto', title: 'Contacto comercial | SUMERCÉ TV', description: 'Comunícate con SUMERCÉ TV para solicitar información sobre servicios, planes y espacios publicitarios.' }
];
export const defaultSections: Section[] = [
  ['hero','Una señal que nos conecta.','Descubre SUMERCÉ TV. Un espacio para encontrarnos y abrir nuevas conversaciones. Texto de presentación provisional, editable.','Anuncia con nosotros','/contacto'],
  ['intro','Detrás de la señal, SUMERCÉ TV.','La presentación institucional está pendiente de aprobación.','Conversemos','/contacto'],
  ['services','Ideas que encuentran su espacio.','Consulta la oferta publicada o cuéntanos qué necesita tu marca.','Explorar servicios','/servicios'],
  ['preview','Tu próxima conexión está aquí.','Consulta la disponibilidad de nuestra señal en la página de televisión.','Ir a la señal','/en-vivo'],
  ['benefits','Dale un lugar a tu marca.','Conversemos sobre el mensaje que quieres compartir. La disponibilidad y las condiciones se confirman con el equipo comercial.','Solicitar propuesta','/contacto'],
  ['sponsors','Marcas que nos acompañan.','Aquí aparecerán los patrocinadores publicados y autorizados.','','/contacto'],
  ['contact','Hagamos que suceda.','¿Tienes una idea para tu marca? Cuéntanos y construyamos una conversación.','Hablar con SUMERCÉ TV','/contacto']
].map(([key,title,body,button_label,button_url],sort_order)=>({ id:key,key,title,body,button_label,button_url,items:key==='benefits'?['Un mensaje con intención.','Una propuesta según tus necesidades.','Un canal directo para conversar.']:[],sort_order,published:true }));
export const defaultStream: Stream = { id: 'main', title: 'Señal SUMERCÉ TV', source_type: 'hls', source_url: '', poster_url: null, enabled: false, published: true };
