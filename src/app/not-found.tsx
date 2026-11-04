import { CurrentHost } from "@/components/layout/CurrentHost";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div className="max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">404</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold">Cartório não encontrado</h1>
        <p className="mt-3 text-muted">
          Nenhum cartório está configurado para{" "}
          <code className="rounded bg-ink/5 px-1.5 py-0.5">
            <CurrentHost />
          </code>
          .
        </p>
      </div>
    </main>
  );
}
