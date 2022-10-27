import { atom } from "jotai";

import AuthApi from "../api/auth-api";
import RolesApi from "../api/roles-api";
import type { UserDto } from "../models/user";
import { Collections } from "../models/collection";
import CollectionsApi from "../api/collections-api";

const token = atom<string | undefined>(
  localStorage.getItem("jwt-token") ?? undefined
);
const refreshToken = atom<string | undefined>(
  localStorage.getItem("jwt-token") ?? undefined
);
const collections = atom<Collections | undefined>(undefined);
const permissions = atom<{ id: number; name: string }[]>([]);
const roles = atom<{ id: number; name: string; permissions: number[] }[]>([]);
const self = atom<UserDto | undefined>(undefined);

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
      console.error(error);
    }
  }
);

export const rolesAtom = atom(
  (get) => get(roles),
  async (_get, set) => {
    try {
      const list = await RolesApi.roles.list({});
      set(roles, list.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }
);

export const collectionsAtom = atom(
  (get) => get(roles),
  async (_get, set) => {
    try {
      const payload = await CollectionsApi.collections();
      set(collections, payload);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }
);

export const languagesAtom = atom((get) => get(collections)?.languages);
export const countriesAtom = atom((get) => get(collections)?.countries);
export const phonemesAtom = atom((get) => get(collections)?.phonemes);

export const isLoggedIn = atom<boolean>((get) => !!get(jwtToken));
