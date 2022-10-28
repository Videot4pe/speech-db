-- +goose Up
-- +goose StatementBegin
ALTER TABLE entities
    ADD COLUMN type TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE entities
    DROP COLUMN type;
-- +goose StatementEnd
