"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

type TableIdSyncProps = {
  tableId: number;
  tableToken: string;
};

export default function TableIdSync({ tableId, tableToken }: TableIdSyncProps) {
  const setTableContext = useCartStore((state) => state.setTableContext);

  useEffect(() => {
    setTableContext(tableId, tableToken);
  }, [setTableContext, tableId, tableToken]);

  return null;
}
