/**
 * The accent palettes, named once.
 *
 * The picker used a hand-written `name` while Settings title-cased the `id`,
 * so the same palette showed as "Honey teal" in one place and "Sage Modern" in
 * the other. Both now read this list.
 *
 * `id` is persisted in localStorage and drives the `.theme-<id>` class on
 * <html> (see index.css / styles/auth.css) — renaming one would drop every
 * user's saved choice, so ids stay put and only labels move.
 */
export const ACCENT_TEMPLATES = Object.freeze([
  { id: 'sage-modern', name: 'Sage modern', desc: 'Bronze, teal & deep blue' },
  { id: 'obsidian-teal', name: 'Obsidian teal', desc: 'Sleek dark teal & platinum' },
  { id: 'nordic-slate', name: 'Nordic slate', desc: 'Ice blue & frost white' },
  { id: 'crimson-rust', name: 'Crimson rust', desc: 'Deep terracotta & copper gold' },
  { id: 'royal-gold', name: 'Royal gold', desc: 'Rich gold & dark bronze' },
]);

/** Display name for a stored template id; falls back to the id itself. */
export function accentTemplateName(id) {
  return ACCENT_TEMPLATES.find((template) => template.id === id)?.name || String(id || '');
}
