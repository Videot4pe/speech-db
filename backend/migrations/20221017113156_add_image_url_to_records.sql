-- +goose Up
-- +goose StatementBegin
ALTER TABLE records
    ADD COLUMN image_id BIGINT REFERENCES files UNIQUE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE records
    DROP COLUMN image_id;
-- +goose StatementEnd
