import axios from "axios";
import CONTANTS from "../constants";
import history from "../browserHistory";
import { refreshRequest } from "./rest/restController";

const httpClient = axios.create({
  baseURL: CONTANTS.BASE_URL,
});

httpClient.interceptors.request.use(
  (config) => {
    const access = window.localStorage.getItem(CONTANTS.ACCESS_TOKEN);
    if (access) {
      config.headers["Authorization"] = `Bearer ${access}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

httpClient.interceptors.response.use(
  (response) => {
    saveTokenPair(response.data.tokenPair);

    return response;
  },
  async (err) => {
    const { config } = err;

    // access token expired
    if (
      err.response.status === 401 &&
      history.location.pathname !== "/login" &&
      history.location.pathname !== "/registration" &&
      history.location.pathname !== "/"
    ) {
      const refresh = window.localStorage.getItem(CONTANTS.REFRESH_TOKEN);

      if (!refresh) {
        return history.replace("/login");
      }

      // send refreshSession request
      const {
        data: { tokenPair },
      } = await refreshRequest({ refreshToken: refresh });

      saveTokenPair(tokenPair);

      config.headers["Authorization"] = `Bearer ${tokenPair.access}`;

      // resend initial request
      return httpClient(config);
    }

    // refresh token expired
    if (
      err.response.status === 419 &&
      history.location.pathname !== "/login" &&
      history.location.pathname !== "/registration" &&
      history.location.pathname !== "/"
    ) {
      history.replace("/login");
      window.localStorage.removeItem(CONTANTS.ACCESS_TOKEN);
      window.localStorage.removeItem(CONTANTS.REFRESH_TOKEN);
    }

    return Promise.reject(err);
  }
);

const saveTokenPair = (tokenPair) => {
  if (tokenPair?.access) {
    window.localStorage.setItem(CONTANTS.ACCESS_TOKEN, tokenPair.access);
  }
  if (tokenPair?.refresh) {
    window.localStorage.setItem(CONTANTS.REFRESH_TOKEN, tokenPair.refresh);
  }
};

export default httpClient;
