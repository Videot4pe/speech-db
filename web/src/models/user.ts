export interface UserDto {
  id?: number;
  avatar?: string | null;
  avatarId?: number | null;

  role?: number;

  username: string;
  name: string;
  surname: string;
  patronymic?: string;
  email: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  permissions: string[];
}

export interface ShortUser {
  email: string;
  password: string;
}
