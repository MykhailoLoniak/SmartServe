"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

type TableIdSyncProps = {
  tableId: number;
};

export default function TableIdSync({ tableId }: TableIdSyncProps) {
  const setTableId = useCartStore((state) => state.setTableId);

  useEffect(() => {
    setTableId(tableId);
  }, [setTableId, tableId]);

  return null;
}
