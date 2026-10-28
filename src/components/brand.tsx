import Image from 'next/image';
export function Brand({ large = false, priority = false }: { large?: boolean; priority?: boolean }) {
  return <Image src="/brand/logo.webp" alt="SUMERCÉ TV" width={large ? 696 : 174} height={large ? 352 : 88} className={large ? 'brand-large' : 'brand'} priority={priority} />;
}
