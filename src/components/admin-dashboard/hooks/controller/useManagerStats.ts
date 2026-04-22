import { useEffect, useState } from "react";

import { getManagerStats, type ManagerPeriod, type ManagerStatsResponse } from "@/app/actions/adminDashboardActions";
import { toPublicError, type PublicError } from "@/lib/errors";

type UseManagerStatsParams = {
  initialManagerStats: ManagerStatsResponse;
  restaurantId?: number;
  setErrorMessage: (error: PublicError | null) => void;
  runTransition: (task: () => Promise<void>) => void;
};

export const useManagerStats = ({
  initialManagerStats,
  restaurantId,
  setErrorMessage,
  runTransition,
}: UseManagerStatsParams) => {
  const [managerPeriod, setManagerPeriod] = useState<ManagerPeriod>("today");
  const [managerStats, setManagerStats] = useState(initialManagerStats);

  useEffect(() => setManagerStats(initialManagerStats), [initialManagerStats]);

  const onManagerPeriodChange = (period: ManagerPeriod) => {
    setManagerPeriod(period);

    runTransition(async () => {
      try {
        setManagerStats(await getManagerStats(period, restaurantId));
      } catch (error) {
        setErrorMessage(toPublicError(error, "Не вдалося завантажити статистику."));
      }
    });
  };

  return {
    managerPeriod,
    managerStats,
    onManagerPeriodChange,
  };
};
