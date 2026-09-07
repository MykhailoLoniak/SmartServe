"use client";

type SupabaseRealtimeSubscription = {
  unsubscribe: () => void;
};

type SubscribeToOrdersParams = {
  onChange: () => void;
};

const HEARTBEAT_INTERVAL_MS = 25_000;
const MAX_RECONNECT_ATTEMPTS = 8;

const buildRealtimeUrl = () => {
  if (process.env.NEXT_PUBLIC_ENABLE_SUPABASE_REALTIME !== "true") {
    return null;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    const { host } = new URL(supabaseUrl);
    return `wss://${host}/realtime/v1/websocket?apikey=${supabaseAnonKey}&vsn=1.0.0`;
  } catch {
    return null;
  }
};

export const subscribeToKitchenOrderChanges = ({ onChange }: SubscribeToOrdersParams): SupabaseRealtimeSubscription | null => {
  const realtimeUrl = buildRealtimeUrl();

  if (!realtimeUrl || typeof window === "undefined") {
    return null;
  }

  let socket: WebSocket | null = null;
  let heartbeatId: number | null = null;
  let reconnectTimeoutId: number | null = null;
  let reconnectAttempts = 0;
  let closedByUser = false;
  let ref = 1;

  const nextRef = () => {
    ref += 1;
    return String(ref);
  };

  const clearTimers = () => {
    if (heartbeatId !== null) {
      window.clearInterval(heartbeatId);
      heartbeatId = null;
    }

    if (reconnectTimeoutId !== null) {
      window.clearTimeout(reconnectTimeoutId);
      reconnectTimeoutId = null;
    }
  };

  const scheduleReconnect = () => {
    if (closedByUser || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      return;
    }

    reconnectAttempts += 1;
    const delay = Math.min(1000 * 2 ** reconnectAttempts, 30_000);
    reconnectTimeoutId = window.setTimeout(() => connect(), delay);
  };

  const connect = () => {
    if (closedByUser) {
      return;
    }

    socket = new WebSocket(realtimeUrl);

    socket.addEventListener("open", () => {
      reconnectAttempts = 0;
      socket?.send(
        JSON.stringify({
          topic: "realtime:kitchen-orders",
          event: "phx_join",
          payload: {
            config: {
              broadcast: { self: false },
              postgres_changes: [
                { event: "*", schema: "public", table: "Order" },
                { event: "*", schema: "public", table: "OrderItem" },
              ],
              private: false,
            },
          },
          ref: nextRef(),
        }),
      );

      heartbeatId = window.setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              topic: "phoenix",
              event: "heartbeat",
              payload: {},
              ref: nextRef(),
            }),
          );
        }
      }, HEARTBEAT_INTERVAL_MS);
    });

    socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data) as { event?: string };
        if (payload.event === "postgres_changes") {
          onChange();
        }
      } catch {
        // ignore non-JSON payloads
      }
    });

    socket.addEventListener("error", () => {
      clearTimers();
      socket?.close();
    });

    socket.addEventListener("close", () => {
      clearTimers();
      scheduleReconnect();
    });
  };

  connect();

  return {
    unsubscribe: () => {
      closedByUser = true;
      clearTimers();
      if (socket && socket.readyState < WebSocket.CLOSING) {
        socket.close();
      }
      socket = null;
    },
  };
};
