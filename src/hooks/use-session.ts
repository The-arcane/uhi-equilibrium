"use client";

import { useState, useEffect } from 'react';

const SESSION_KEY = 'equilibrium_session_id';

const generateUUID = () => {
    // A simple v4 UUID-like generator for browser environments.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedSessionId = localStorage.getItem(SESSION_KEY);
      if (!storedSessionId) {
        storedSessionId = generateUUID();
        localStorage.setItem(SESSION_KEY, storedSessionId);
      }
      setSessionId(storedSessionId);
    }
  }, []);

  return { sessionId };
}
