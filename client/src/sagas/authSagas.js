import { put } from "redux-saga/effects";
import ACTION from "../actions/actionTypes";
import * as restController from "../api/rest/restController";

export function* loginSaga(action) {
  try {
    const response = yield restController.loginRequest(action.data);
    action.history.replace("/");

    const userData = response.data.user;
    yield put({ type: ACTION.AUTH_ACTION_SUCCESS });
    yield put({ type: ACTION.GET_USER_SUCCESS, data: userData });
  } catch (err) {
    yield put({ type: ACTION.AUTH_ACTION_ERROR, error: err.response });
  }
}

export function* registerSaga(action) {
  try {
    const response = yield restController.registerRequest(action.data);
    action.history.replace("/");

    const userData = response.data.user;
    yield put({ type: ACTION.AUTH_ACTION_SUCCESS });
    yield put({ type: ACTION.GET_USER_SUCCESS, data: userData });
  } catch (e) {
    yield put({ type: ACTION.AUTH_ACTION_ERROR, error: e.response });
  }
}
