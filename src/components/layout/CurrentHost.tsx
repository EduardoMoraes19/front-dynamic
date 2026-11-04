"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Host atual (lido no cliente para não tornar a página dinâmica). */
export function useHost() {
  return useSyncExternalStore(noop, () => window.location.host, () => null);
}

export function CurrentHost() {
  return <>{useHost() ?? "este domínio"}</>;
}

/** Link para outro host mantendo a porta atual (ex.: centro.localhost:3000). */
export function HostLink({ host, className }: { host: string; className?: string }) {
  const current = useHost();
  const port = current?.includes(":") ? `:${current.split(":")[1]}` : "";
  return (
    <a href={`http://${host}${port}`} className={className}>
      {host}
      {port}
    </a>
  );
}
