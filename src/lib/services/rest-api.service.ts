import { makeHttpRequest } from "$lib/api/api.common";

const createApiRequest = async (data: string[]) => {
  const [url, method, headers, body, datatype] = data;
  makeHttpRequest(url, method, headers, body, datatype);
  return;
};

export { createApiRequest };
