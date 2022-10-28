-- +goose Up
-- +goose StatementBegin

CREATE TABLE collection_stresses
(
    id    BIGSERIAL NOT NULL PRIMARY KEY,
    value TEXT      NOT NULL UNIQUE
);
INSERT INTO collection_stresses (value)
VALUES ('none'),
       ('primary'),
       ('Secondary');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE collection_stresses;
-- +goose StatementEnd
