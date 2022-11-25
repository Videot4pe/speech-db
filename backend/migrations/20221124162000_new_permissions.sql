-- +goose Up
-- +goose StatementBegin

TRUNCATE TABLE roles_permissions RESTART IDENTITY CASCADE;
TRUNCATE TABLE permissions RESTART IDENTITY CASCADE;

INSERT INTO permissions (name) VALUES ('CREATE_MARKUPS');
INSERT INTO permissions (name) VALUES ('READ_ALL_MARKUPS');
INSERT INTO permissions (name) VALUES ('READ_MARKUPS');
INSERT INTO permissions (name) VALUES ('UPDATE_ALL_MARKUPS');
INSERT INTO permissions (name) VALUES ('UPDATE_MARKUPS');
INSERT INTO permissions (name) VALUES ('DELETE_ALL_MARKUPS');
INSERT INTO permissions (name) VALUES ('DELETE_MARKUPS');

INSERT INTO permissions (name) VALUES ('CREATE_RECORDS');
INSERT INTO permissions (name) VALUES ('READ_ALL_RECORDS');
INSERT INTO permissions (name) VALUES ('READ_RECORDS');
INSERT INTO permissions (name) VALUES ('UPDATE_ALL_RECORDS');
INSERT INTO permissions (name) VALUES ('UPDATE_RECORDS');
INSERT INTO permissions (name) VALUES ('DELETE_ALL_RECORDS');
INSERT INTO permissions (name) VALUES ('DELETE_RECORDS');

INSERT INTO permissions (name) VALUES ('CREATE_SPEAKERS');
INSERT INTO permissions (name) VALUES ('READ_ALL_SPEAKERS');
INSERT INTO permissions (name) VALUES ('READ_SPEAKERS');
INSERT INTO permissions (name) VALUES ('UPDATE_ALL_SPEAKERS');
INSERT INTO permissions (name) VALUES ('UPDATE_SPEAKERS');
INSERT INTO permissions (name) VALUES ('DELETE_ALL_SPEAKERS');
INSERT INTO permissions (name) VALUES ('DELETE_SPEAKERS');

INSERT INTO permissions (name) VALUES ('CREATE_USERS');
INSERT INTO permissions (name) VALUES ('READ_ALL_USERS');
INSERT INTO permissions (name) VALUES ('READ_USERS');
INSERT INTO permissions (name) VALUES ('UPDATE_ALL_USERS');
INSERT INTO permissions (name) VALUES ('UPDATE_USERS');
INSERT INTO permissions (name) VALUES ('DELETE_ALL_USERS');
INSERT INTO permissions (name) VALUES ('DELETE_USERS');

INSERT INTO permissions (name) VALUES ('CREATE_ROLES');
INSERT INTO permissions (name) VALUES ('READ_ALL_ROLES');
INSERT INTO permissions (name) VALUES ('READ_ROLES');
INSERT INTO permissions (name) VALUES ('UPDATE_ALL_ROLES');
INSERT INTO permissions (name) VALUES ('UPDATE_ROLES');
INSERT INTO permissions (name) VALUES ('DELETE_ALL_ROLES');
INSERT INTO permissions (name) VALUES ('DELETE_ROLES');

INSERT INTO permissions (name) VALUES ('CAN_BREATHE');
INSERT INTO permissions (name) VALUES ('EX_MACHINA');

INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 1);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 2);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 3);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 4);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 5);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 6);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 7);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 8);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 9);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 10);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 11);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 12);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 13);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 14);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 15);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 16);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 17);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 18);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 19);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 20);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 20);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 21);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 22);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 23);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 24);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 25);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 26);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 27);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 28);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 29);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 30);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 31);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 32);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 33);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 34);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 35);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 36);

INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 1);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 3);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 5);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 8);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 10);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 12);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 15);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 17);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 19);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 22);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 24);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 26);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 29);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 31);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 33);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (2, 36);

INSERT INTO roles_permissions (role_id, permission_id) VALUES (0, 36);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles_permissions;
-- +goose StatementEnd
