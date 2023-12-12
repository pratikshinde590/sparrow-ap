import axios, { type Method } from "axios";
import type { RequestData } from "../utils/dto/requestdata";
import { getUserToken, getRefToken } from "$lib/utils/token";
import { refreshToken } from "$lib/services/auth.service";
import constants from "$lib/utils/constants";
import { setAuthJwt } from "$lib/utils/jwt";
import { isLoading } from "$lib/store/auth.store";
import { navigate } from "svelte-navigator";
import { ErrorMessages } from "$lib/utils/enums/enums";
import { invoke } from "@tauri-apps/api";

import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
const apiTimeOut = constants.API_SEND_TIMEOUT;

const _viewModel = new HeaderDashboardViewModel();

const error = (error, data?) => {
  return {
    status: "error",
    isSuccessful: false,
    message: error,
    data,
  };
};

const success = (data) => {
  return {
    status: "success",
    isSuccessful: true,
    message: "",
    data,
  };
};

const getAuthHeaders = () => {
  return {
    Authorization: `Bearer ${getUserToken()}`,
  };
};

const getRefHeaders = () => {
  return {
    Authorization: `Bearer ${getRefToken()}`,
  };
};

const regenerateAuthToken = async (
  method: Method,
  url: string,
  requestData?: RequestData,
) => {
  const response = await refreshToken();
  if (response.isSuccessful) {
    setAuthJwt(constants.AUTH_TOKEN, response.data.data.newAccessToken.token);
    setAuthJwt(constants.REF_TOKEN, response.data.data.newRefreshToken.token);
    if (requestData && requestData.headers) {
      requestData.headers = getAuthHeaders();
    }
    return await makeRequest(method, url, requestData);
  } else {
    throw "error refresh token: " + response.message;
  }
};

const makeRequest = async (
  method: Method,
  url: string,
  requestData?: RequestData,
) => {
  isLoading.set(true);
  try {
    const response = await axios({
      method: method,
      url: url,
      data: requestData?.body,
      headers: requestData?.headers,
    });

    if (response.status === 201 || response.status === 200) {
      return success(response.data);
    } else {
      return error(response.data.message);
    }
  } catch (e) {
    if (
      e.response?.data?.statusCode === 401 &&
      e.response?.data?.message === ErrorMessages.ExpiredToken
    ) {
      return await regenerateAuthToken(method, url, requestData);
    } else if (
      e.response?.data?.statusCode === 401 &&
      e.response.data.message === ErrorMessages.Unauthorized
    ) {
      await _viewModel.clientLogout();
      navigate("/login");
      return error("unauthorized");
    }
    if (e.message) {
      return error(e.response.data.message);
    } else if (e.response.data) {
      return error(e.response.data.message);
    }
    return error(e);
  } finally {
    isLoading.set(false);
  }
};

function timeout(timeout: number) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      rej("Timeout");
    }, timeout);
  });
}

const makeHttpRequest = async (
  url: string,
  method: string,
  headers: string,
  body: string,
  request: string,
) => {
  let response;

  return Promise.race([
    timeout(apiTimeOut),
    invoke("make_type_request_command", {
      url,
      method,
      headers,
      body,
      request,
    }),
  ])
    .then(async (data) => {
      response = data;
      try {
        // loadWorker(success(JSON.parse(response)));
        return success(JSON.parse(response));
      } catch (e) {
        return error("error");
      }
    })
    .catch(() => {
      return error("error");
    });
};

async function loadWorker(msg) {
  const SyncWorker = await import("$lib/services/rest-api.worker?worker");
  const syncWorker = new SyncWorker.default();
  syncWorker.postMessage(msg);
}

export { makeRequest, getAuthHeaders, getRefHeaders, makeHttpRequest };
