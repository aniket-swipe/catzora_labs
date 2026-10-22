import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createSeedState } from "./seed.js";
import { uid } from "../lib/id.js";

// Bumped when the shape of a seeded record changes in a way an older saved
// workspace could not satisfy — candidates gained jobId and history in v2.
const STORAGE_KEY = "catzora:workspace:v2";

const AppStoreContext = createContext(null);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw);
    // Shallow-merge over the seed so a new collection added in a later version
    // appears rather than coming back undefined in a workspace saved earlier.
    return { ...createSeedState(), ...parsed };
  } catch {
    return createSeedState();
  }
}

export function AppStoreProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage can be full or blocked — the app still works in memory */
    }
  }, [state]);

  /** update("projects")(prev => next) — curried so callers read cleanly. */
  const update = useCallback(
    (key) => (updater) =>
      setState((prev) => ({
        ...prev,
        [key]: typeof updater === "function" ? updater(prev[key]) : updater,
      })),
    []
  );

  // ── Generic collection helpers ──────────────────────────────────────────
  // Every list in the workspace is an array of records with an `id`, so one
  // set of helpers serves jobs, posts, media, designs, assessments and the rest.

  /** Prepend a record, assigning an id and createdAt if absent. Returns the record. */
  const addItem = useCallback((key, record, { append = false, limit = 200 } = {}) => {
    const full = {
      id: record.id || uid(key.slice(0, 2)),
      createdAt: record.createdAt || new Date().toISOString(),
      ...record,
    };
    setState((prev) => {
      const list = prev[key] || [];
      const next = append ? [...list, full] : [full, ...list];
      return { ...prev, [key]: next.slice(0, limit) };
    });
    return full;
  }, []);

  /** Patch one record by id. `patch` may be an object or (record) => patch. */
  const updateItem = useCallback((key, id, patch) => {
    setState((prev) => ({
      ...prev,
      [key]: (prev[key] || []).map((item) =>
        item.id === id ? { ...item, ...(typeof patch === "function" ? patch(item) : patch) } : item
      ),
    }));
  }, []);

  const removeItem = useCallback((key, id) => {
    setState((prev) => ({ ...prev, [key]: (prev[key] || []).filter((item) => item.id !== id) }));
  }, []);

  // ── Cross-cutting actions ───────────────────────────────────────────────

  const log = useCallback((studio, text) => {
    setState((prev) => ({
      ...prev,
      activity: [{ id: uid("a"), studio, text, at: new Date().toISOString() }, ...prev.activity].slice(0, 40),
    }));
  }, []);

  const touchProject = useCallback((title, kind, studio) => {
    setState((prev) => {
      const existing = prev.projects.find((p) => p.title === title);
      const updatedAt = new Date().toISOString();
      const projects = existing
        ? prev.projects.map((p) => (p.id === existing.id ? { ...p, updatedAt, kind, studio } : p))
        : [{ id: uid("p"), title, kind, studio, updatedAt }, ...prev.projects];
      return { ...prev, projects: projects.slice(0, 60) };
    });
  }, []);

  const saveDraft = useCallback(({ title, studio, tool, content }) => {
    setState((prev) => ({
      ...prev,
      drafts: [
        { id: uid("d"), title, studio, tool, content, createdAt: new Date().toISOString() },
        ...prev.drafts,
      ].slice(0, 60),
    }));
  }, []);

  /** Move a candidate and record it on their history and the activity feed. */
  const moveCandidate = useCallback((id, stage) => {
    setState((prev) => {
      const candidate = prev.candidates.find((c) => c.id === id);
      if (!candidate || candidate.stage === stage) return prev;
      const at = new Date().toISOString();
      return {
        ...prev,
        candidates: prev.candidates.map((c) =>
          c.id === id
            ? {
                ...c,
                stage,
                history: [...(c.history || []), { id: uid("h"), text: `Moved from ${c.stage} to ${stage}`, at }],
              }
            : c
        ),
        activity: [
          { id: uid("a"), studio: "hire", text: `${candidate.name} moved to ${stage}`, at },
          ...prev.activity,
        ].slice(0, 40),
      };
    });
  }, []);

  const addCandidateNote = useCallback((id, note, author = "You") => {
    const at = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) =>
        c.id === id
          ? {
              ...c,
              notes: [...(c.notes || []), { id: uid("n"), author, note, at }],
              history: [...(c.history || []), { id: uid("h"), text: "Note added", at }],
            }
          : c
      ),
    }));
  }, []);

  const resetWorkspace = useCallback(() => setState(createSeedState()), []);

  const value = useMemo(
    () => ({
      ...state,
      update,
      addItem,
      updateItem,
      removeItem,
      log,
      touchProject,
      saveDraft,
      moveCandidate,
      addCandidateNote,
      resetWorkspace,
    }),
    [state, update, addItem, updateItem, removeItem, log, touchProject, saveDraft, moveCandidate, addCandidateNote, resetWorkspace]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useStore must be used inside <AppStoreProvider>");
  return ctx;
}
