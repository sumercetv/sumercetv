export function Icon({ name = 'arrow', size = 20 }: { name?: 'arrow' | 'play' | 'signal' | 'mail' | 'check' | 'plus' | 'chat'; size?: number }) {
  const paths = { arrow: 'M5 12h14m-6-6 6 6-6 6', play: 'm9 5 11 7-11 7V5Z', signal: 'M5 12a10 10 0 0 1 14 0M8 15a6 6 0 0 1 8 0m-5 3h2M2 8a15 15 0 0 1 20 0', mail: 'M3 5h18v14H3V5Zm0 0 9 8 9-8', check: 'm5 12 4 4L19 6', plus: 'M12 5v14M5 12h14', chat: 'M4 5h16v11H10l-6 4V5Zm4 4.5h8M8 12.5h5' };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
