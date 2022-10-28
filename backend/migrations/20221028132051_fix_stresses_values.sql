-- +goose Up
-- +goose StatementBegin
UPDATE collection_stresses SET VALUE = 'None' WHERE VALUE = 'none';
UPDATE collection_stresses SET VALUE = 'Primary' WHERE VALUE = 'primary';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
