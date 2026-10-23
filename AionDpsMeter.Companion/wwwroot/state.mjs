import {defaults, validateEvents} from './schedule.mjs';
import {globalSchedule} from './presets.mjs';

// Only new installations use Global rules; saved settings are preserved.
// The version must match CompanionStore.SchemaVersion, which rejects any other value on save.
export function initialState() {
  return {version: 2, offset: 9, events: globalSchedule()};
}

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

// Both on-disk progress and imported backups cross the same validation boundary.
// Return a fresh, canonical object; do not retain unexpected metadata from a file.
export function validateState(input) {
  if (!isRecord(input) || ![1,2].includes(input.version)) throw Error('Unsupported backup version.');
  if (!Number.isFinite(input.offset) || input.offset < -12 || input.offset > 14)
    throw Error('Server UTC offset must be −12 to +14.');
  // Version 1 imports retain timer rules; retired map/profile fields are not carried forward.
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
    // Old backups omit entryDuration and retain their previous behavior.
    if (saved.entryDuration !== undefined) event.entryDuration = saved.entryDuration;
    delete event.days;
    if (saved.days) event.days = [...new Set(saved.days)].sort();
    if (base.kind === 'rift') {
      if (saved.activeDuration === undefined) throw Error('Rift activity duration is missing.');
      event.activeDuration = saved.activeDuration;
    }
    return event;
  });
  return {version: 2, offset: input.offset, events};
}
