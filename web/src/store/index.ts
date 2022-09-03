import { atom } from "jotai";

import AuthApi from "../api/auth-api";
import RolesApi from "../api/roles-api";
import type { ShortUser, UserInfo } from "../models/user";

const token = atom<string | undefined>(
  localStorage.getItem("jwt-token") ?? undefined
);
const refreshToken = atom<string | undefined>(
  localStorage.getItem("jwt-token") ?? undefined
);
const permissions = atom<string[]>([]);
const self = atom<UserInfo | undefined>(undefined);

export const jwtToken = atom(
  (get) => get(token),
  (get, set, newToken: string | undefined) => {
    set(token, newToken);
    if (!newToken) {
      localStorage.removeItem("jwt-token");
    } else {
      localStorage.setItem("jwt-token", newToken);
    }
  }
);

export const refreshJwtToken = atom(
  (get) => get(token),
  (get, set, newToken: string | undefined) => {
    set(refreshToken, newToken);
    if (!newToken) {
      localStorage.removeItem("refresh-token");
    } else {
      localStorage.setItem("refresh-token", newToken);
    }
  }
);

export const selfAtom = atom(
  (get) => {
    // TODO fix (?)
    const selfString = localStorage.getItem("self");
    return selfString ? JSON.parse(selfString) : get(self);
  },
  async (_get, set) => {
    try {
      const userInfo = await AuthApi.self();
      set(self, userInfo);
      localStorage.setItem("self", JSON.stringify(userInfo));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }
);

export const permissionsAtom = atom(
  (get) => get(permissions),
  async (_get, set) => {
    try {
      const list = await RolesApi.permissions();
      set(permissions, list);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
);

export const isLoggedIn = atom<boolean>((get) => !!get(jwtToken));
