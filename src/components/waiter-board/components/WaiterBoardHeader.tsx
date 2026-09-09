type WaiterBoardHeaderProps = {
  entitiesCount: number;
};

export function WaiterBoardHeader({ entitiesCount }: WaiterBoardHeaderProps) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-black">Waiter · Tables and bills</h1>
        <p className="mt-1 text-sm text-black/60">Quickly track item readiness and close bills.</p>
      </div>
      <span className="rounded-full bg-black/5 px-3 py-1 text-sm font-medium text-black">{entitiesCount}</span>
    </header>
  );
}
