export const buildFormData = (entries: Array<[string, string | number | boolean | undefined]>) => {
  const formData = new FormData();

  entries.forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    formData.set(key, String(value));
  });

  return formData;
};
