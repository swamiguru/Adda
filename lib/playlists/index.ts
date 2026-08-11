import type { Track } from '@/lib/types';
import dilli from './dilli.json';
import mumbai from './mumbai.json';
import goa from './goa.json';

/** Keyed by room slug. Add a room's JSON here when you add the room. */
export const playlists: Record<string, Track[]> = {
  dilli: dilli as Track[],
  mumbai: mumbai as Track[],
  goa: goa as Track[],
};
