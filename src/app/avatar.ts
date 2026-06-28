// Shared avatar colour helper — deterministic colour from a name, for the
// circular initial avatars used across Dogs, Seasons, Matings, Contracts.

const AVATAR_COLOURS = [
  "bg-pink-200 text-pink-800",
  "bg-orange-200 text-orange-800",
  "bg-blue-200 text-blue-800",
  "bg-purple-200 text-purple-800",
  "bg-green-200 text-green-800",
  "bg-amber-200 text-amber-800",
  "bg-teal-200 text-teal-800",
  "bg-rose-200 text-rose-800",
];

export function avatarColour(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % AVATAR_COLOURS.length;
  return AVATAR_COLOURS[h];
}

export function initial(name: string): string {
  return (name.trim()[0] ?? "?").toUpperCase();
}
