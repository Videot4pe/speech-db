-- +goose Up
-- +goose StatementBegin

INSERT INTO roles (name) VALUES ('admin');
INSERT INTO roles (name) VALUES ('student');
INSERT INTO permissions (name) VALUES ('EDIT_SPEAKERS');
INSERT INTO permissions (name) VALUES ('EDIT_MARKUPS');
INSERT INTO permissions (name) VALUES ('EDIT_RECORDS');
INSERT INTO permissions (name) VALUES ('EDIT_USERS');

INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 1);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 2);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 3);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 4);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
