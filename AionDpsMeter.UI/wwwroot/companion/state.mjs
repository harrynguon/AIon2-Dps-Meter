import {defaults, validateEvents} from './schedule.mjs';

export function initialState() {
  return {
    version: 1,
    offset: 9,
    profile: 'Nezekan · Elyos',
    zone: 'verteron',
    profiles: {'Nezekan · Elyos': {}},
    events: structuredClone(defaults)
  };
}

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const reservedNames = new Set(['__proto__', 'constructor', 'prototype']);

// Both on-disk progress and imported backups cross the same validation boundary.
// Return a fresh, canonical object; do not retain unexpected metadata from a file.
export function validateState(input, data) {
  if (!isRecord(input) || input.version !== 1) throw Error('Unsupported backup version.');
  if (!Number.isFinite(input.offset) || input.offset < -12 || input.offset > 14)
    throw Error('Server UTC offset must be −12 to +14.');
  if (typeof input.zone !== 'string' || !Object.hasOwn(data.zones, input.zone))
    throw Error('Unknown map.');
  if (!isRecord(input.profiles) || !Object.keys(input.profiles).length)
    throw Error('At least one character profile is required.');
  if (typeof input.profile !== 'string' || !Object.hasOwn(input.profiles, input.profile))
    throw Error('The selected character profile is missing.');

  const validIds = new Set(Object.values(data.zones).flatMap(zone => zone.groups.map(group => group.id)));
  const profiles = {};
  for (const [name, progress] of Object.entries(input.profiles)) {
    if (!name.trim() || name.length > 100 || reservedNames.has(name) || !isRecord(progress))
      throw Error('Invalid character profile.');
    const cleanProgress = {};
    for (const [id, completed] of Object.entries(progress)) {
      if (!validIds.has(id) || typeof completed !== 'boolean')
        throw Error('Invalid cube progress.');
      cleanProgress[id] = completed;
    }
    profiles[name] = cleanProgress;
  }

  validateEvents(input.events);
  const events = defaults.map(base => {
    const saved = input.events.find(event => event.id === base.id);
    const event = {
      ...base,
      basis: saved.basis,
      hours: [...new Set(saved.hours)].sort((a,b) => a-b),
      minute: saved.minute,
      duration: saved.duration
    };
    delete event.days;
    if (saved.days) event.days = [...new Set(saved.days)].sort();
    if (base.kind === 'rift') {
      if (saved.activeDuration === undefined) throw Error('Rift activity duration is missing.');
      event.activeDuration = saved.activeDuration;
    }
    return event;
  });
  return {version: 1, offset: input.offset, profile: input.profile, zone: input.zone, profiles, events};
}
