-- +goose Up
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION users_permissions()
RETURNS TABLE(id text, email text, permissions text)
AS $$
    SELECT u.id "id", u.email "email", array_agg(p.name) "permissions"
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN roles_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    GROUP BY u.id;
$$ LANGUAGE SQL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP FUNCTION users_permissions;
-- +goose StatementEnd
