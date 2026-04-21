import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket(token) {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setConnected(false);
      return;
    }
    const s = io(window.location.origin, {
      path: '/socket.io',
      auth: { token },
    });
    ref.current = s;
    setSocket(s);
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    return () => {
      s.disconnect();
      ref.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [token]);

  return { socket, connected };
}
