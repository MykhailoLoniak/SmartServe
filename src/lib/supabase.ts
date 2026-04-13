const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase env vars are missing");
}

type QueryResponse<T> = {
  data: T | null;
  error: Error | null;
};

type QueryBuilder<T> = {
  eq: (column: string, value: string | number) => QueryBuilder<T>;
  in: (column: string, values: Array<string | number>) => QueryBuilder<T>;
  order: (column: string, options?: { ascending?: boolean }) => Promise<QueryResponse<T[]>>;
  single: <R = T>() => Promise<QueryResponse<R>>;
  then: Promise<QueryResponse<T[]>>["then"];
  catch: Promise<QueryResponse<T[]>>["catch"];
  finally: Promise<QueryResponse<T[]>>["finally"];
};

type RealtimeChannel = {
  on: (
    _event: string,
    _filter: Record<string, unknown>,
    _callback: (payload: { new: Record<string, unknown> }) => void,
  ) => RealtimeChannel;
  subscribe: () => RealtimeChannel;
};

const toError = (message: string, detail?: unknown) => {
  if (detail instanceof Error) {
    return detail;
  }

  return new Error(typeof detail === "string" ? `${message}: ${detail}` : message);
};

const request = async <T>(path: string): Promise<QueryResponse<T>> => {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      return { data: null, error: toError("Supabase request failed", detail) };
    }

    const payload = (await response.json()) as T;
    return { data: payload, error: null };
  } catch (error) {
    return { data: null, error: toError("Supabase network error", error) };
  }
};

const createQueryBuilder = <T>(table: string, selectClause: string): QueryBuilder<T> => {
  const query = new URLSearchParams({ select: selectClause.trim() });

  const runMany = () => request<T[]>(`${table}?${query.toString()}`);

  return {
    eq(column, value) {
      query.set(column, `eq.${value}`);
      return this;
    },
    in(column, values) {
      query.set(column, `in.(${values.join(",")})`);
      return this;
    },
    async order(column, options) {
      const direction = options?.ascending === false ? "desc" : "asc";
      query.set("order", `${column}.${direction}`);
      return runMany();
    },
    async single<R = T>() {
      const response = await runMany();

      if (response.error) {
        return { data: null, error: response.error };
      }

      const firstItem = response.data?.[0] as R | undefined;

      if (!firstItem) {
        return { data: null, error: new Error("No rows found") };
      }

      return { data: firstItem, error: null };
    },
    then(onfulfilled, onrejected) {
      return runMany().then(onfulfilled, onrejected);
    },
    catch(onrejected) {
      return runMany().catch(onrejected);
    },
    finally(onfinally) {
      return runMany().finally(onfinally);
    },
  };
};

export const supabase = {
  from<T = Record<string, unknown>>(table: string) {
    return {
      select(selectClause: string) {
        return createQueryBuilder<T>(table, selectClause);
      },
    };
  },
  channel() {
    return {
      on() {
        return this;
      },
      subscribe() {
        return this;
      },
    } as RealtimeChannel;
  },
  async removeChannel() {
    return "ok";
  },
};
