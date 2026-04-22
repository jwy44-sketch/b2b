import {
  LEARN_DEFAULT_CONFIG,
  LEARN_SET_ID,
  LEARN_STATUS,
  LEARN_USER_ID,
} from "./learn-types.js";

const STORAGE_KEY = "con3990v.learn-mode";

export function createLearnStorage(storage = window.localStorage) {
  return {
    getState() {
      return readState(storage);
    },
    getActiveSession({ userId = LEARN_USER_ID, setId = LEARN_SET_ID }) {
      const state = readState(storage);
      return (
        state.sessions.find(
          (session) =>
            session.userId === userId &&
            session.setId === setId &&
            session.status === LEARN_STATUS.active,
        ) ?? null
      );
    },
    getLatestSession({ userId = LEARN_USER_ID, setId = LEARN_SET_ID }) {
      const state = readState(storage);
      return (
        [...state.sessions]
          .filter((session) => session.userId === userId && session.setId === setId)
          .sort((left, right) => right.updatedAt - left.updatedAt)[0] ?? null
      );
    },
    getProgress({ userId = LEARN_USER_ID, setId = LEARN_SET_ID }) {
      const state = readState(storage);
      return state.itemProgress.filter(
        (progress) => progress.userId === userId && progress.setId === setId,
      );
    },
    getAttempts({ userId = LEARN_USER_ID, setId = LEARN_SET_ID, sessionId = null }) {
      const state = readState(storage);
      return state.attemptLogs.filter((attempt) => {
        if (attempt.userId !== userId || attempt.setId !== setId) {
          return false;
        }
        if (sessionId && attempt.sessionId !== sessionId) {
          return false;
        }
        return true;
      });
    },
    getSettings({ userId = LEARN_USER_ID, setId = LEARN_SET_ID }) {
      const state = readState(storage);
      return state.settings[settingsKey(userId, setId)] ?? LEARN_DEFAULT_CONFIG;
    },
    saveSession(session) {
      const state = readState(storage);
      const nextSessions = state.sessions.filter((entry) => entry.id !== session.id);
      nextSessions.push(session);
      writeState(storage, { ...state, sessions: nextSessions });
    },
    saveProgress(progressList) {
      const state = readState(storage);
      const keysToReplace = new Set(
        progressList.map((progress) => `${progress.userId}:${progress.setId}:${progress.itemId}`),
      );
      const retained = state.itemProgress.filter(
        (progress) => !keysToReplace.has(`${progress.userId}:${progress.setId}:${progress.itemId}`),
      );
      writeState(storage, {
        ...state,
        itemProgress: [...retained, ...progressList],
      });
    },
    saveAttempts(attemptList) {
      if (!attemptList || attemptList.length === 0) {
        return;
      }

      const state = readState(storage);
      writeState(storage, {
        ...state,
        attemptLogs: [...state.attemptLogs, ...attemptList],
      });
    },
    saveSettings({ userId = LEARN_USER_ID, setId = LEARN_SET_ID, settings }) {
      const state = readState(storage);
      writeState(storage, {
        ...state,
        settings: {
          ...state.settings,
          [settingsKey(userId, setId)]: settings,
        },
      });
    },
    restartSessionOnly({ userId = LEARN_USER_ID, setId = LEARN_SET_ID }) {
      const state = readState(storage);
      writeState(storage, {
        ...state,
        sessions: state.sessions.filter(
          (session) =>
            !(session.userId === userId && session.setId === setId && session.status === LEARN_STATUS.active),
        ),
      });
    },
    resetProgress({ userId = LEARN_USER_ID, setId = LEARN_SET_ID }) {
      const state = readState(storage);
      writeState(storage, {
        sessions: state.sessions.filter(
          (session) => !(session.userId === userId && session.setId === setId),
        ),
        itemProgress: state.itemProgress.filter(
          (progress) => !(progress.userId === userId && progress.setId === setId),
        ),
        attemptLogs: state.attemptLogs.filter(
          (attempt) => !(attempt.userId === userId && attempt.setId === setId),
        ),
        settings: Object.fromEntries(
          Object.entries(state.settings).filter(([key]) => key !== settingsKey(userId, setId)),
        ),
      });
    },
  };
}

function readState(storage) {
  const rawValue = storage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return {
      sessions: [],
      itemProgress: [],
      attemptLogs: [],
      settings: {},
    };
  }

  try {
    const parsed = JSON.parse(rawValue);
    return {
      sessions: parsed.sessions ?? [],
      itemProgress: parsed.itemProgress ?? [],
      attemptLogs: parsed.attemptLogs ?? [],
      settings: parsed.settings ?? {},
    };
  } catch (error) {
    return {
      sessions: [],
      itemProgress: [],
      attemptLogs: [],
      settings: {},
    };
  }
}

function writeState(storage, state) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function settingsKey(userId, setId) {
  return `${userId}:${setId}`;
}
