"use client";

type SupabaseRealtimeSubscription = {
  unsubscribe: () => void;
};

type SubscribeToOrdersParams = {
  onChange: () => void;
};

const buildRealtimeUrl = () => {
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

  const socket = new WebSocket(realtimeUrl);
  let ref = 1;

  const nextRef = () => {
    ref += 1;
    return String(ref);
  };

  const sendJoin = () => {
    socket.send(
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
  };

  const heartbeatId = window.setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          topic: "phoenix",
          event: "heartbeat",
          payload: {},
          ref: nextRef(),
        }),
      );
    }
  }, 25_000);

  socket.addEventListener("open", sendJoin);
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

  return {
    unsubscribe: () => {
      window.clearInterval(heartbeatId);
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    },
  };
};
