-- +goose Up
-- +goose StatementBegin
INSERT INTO roles(id, name) VALUES (0, 'readonly');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM roles WHERE id = 0;
-- +goose StatementEnd
