import { useState, type Dispatch, type SetStateAction } from "react";

import { createTable, deleteTable } from "@/app/actions/adminDashboardActions";
import { toPublicError, type PublicError } from "@/lib/errors";

import type { DashboardTable } from "@/app/actions/admin-dashboard/types";
import { buildFormData } from "./formData";

type UseTableManagementParams = {
  restaurantId?: number;
  setErrorMessage: (error: PublicError | null) => void;
  setTables: Dispatch<SetStateAction<DashboardTable[]>>;
  runTransition: (task: () => Promise<void>) => void;
};

export const useTableManagement = ({ restaurantId, setErrorMessage, setTables, runTransition }: UseTableManagementParams) => {
  const [newTableNumber, setNewTableNumber] = useState("");

  const onCreateTable = () => {
    runTransition(async () => {
      try {
        setTables(await createTable(buildFormData([["number", newTableNumber]]), restaurantId));
        setNewTableNumber("");
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(toPublicError(error, "Не вдалося додати столик."));
      }
    });
  };

  const onDeleteTable = (tableId: number, activeOrdersCount: number) => {
    runTransition(async () => {
      try {
        if (activeOrdersCount > 0) {
          const confirmed = window.confirm("Столик зайнятий активними замовленнями. Видалити примусово?");
          if (!confirmed) {
            return;
          }

          setTables(await deleteTable(buildFormData([["tableId", tableId], ["forceDelete", true]]), restaurantId));
          setErrorMessage(null);
          return;
        }

        setTables(await deleteTable(buildFormData([["tableId", tableId]]), restaurantId));
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(toPublicError(error, "Не вдалося видалити столик."));
      }
    });
  };

  return {
    newTableNumber,
    setNewTableNumber,
    onCreateTable,
    onDeleteTable,
  };
};
