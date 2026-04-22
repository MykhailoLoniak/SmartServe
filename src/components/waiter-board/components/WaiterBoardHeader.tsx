type WaiterBoardHeaderProps = {
  entitiesCount: number;
};

export function WaiterBoardHeader({ entitiesCount }: WaiterBoardHeaderProps) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-black">Офіціант · Столики та рахунки</h1>
        <p className="mt-1 text-sm text-black/60">Швидкий контроль готовності позицій і закриття рахунків.</p>
      </div>
      <span className="rounded-full bg-black/5 px-3 py-1 text-sm font-medium text-black">{entitiesCount}</span>
    </header>
  );
}
