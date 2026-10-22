/** Short, readable, collision-unlikely id for demo records. */
export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
