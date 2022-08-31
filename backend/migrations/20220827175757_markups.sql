-- +goose Up
-- +goose StatementBegin
CREATE TABLE speakers
(
    id         BIGSERIAL               NOT NULL PRIMARY KEY,
    name       VARCHAR(255)            NOT NULL,
    properties jsonb,
    created_at timestamptz             NOT NULL DEFAULT NOW(),
    created_by BIGINT REFERENCES users NOT NULL
);

CREATE TABLE records
(
    id         BIGSERIAL                  NOT NULL PRIMARY KEY,
    name       VARCHAR(255)               NOT NULL,
    speaker_id BIGINT REFERENCES speakers NOT NULL,
    file_id    BIGINT REFERENCES files    NOT NULL UNIQUE,
    created_at timestamptz                NOT NULL DEFAULT NOW(),
    created_by BIGINT REFERENCES users    NOT NULL
);

CREATE TABLE markups
(
    id         BIGSERIAL               NOT NULL PRIMARY KEY,
    record_id  BIGINT REFERENCES files NOT NULL,
    created_at timestamptz             NOT NULL DEFAULT NOW(),
    updated_at timestamptz             NOT NULL DEFAULT NOW(),
    created_by BIGINT REFERENCES users NOT NULL
);

CREATE TABLE entities
(
    id         BIGSERIAL                                 NOT NULL PRIMARY KEY,
    markup_id  BIGINT REFERENCES files ON DELETE CASCADE NOT NULL,
    value      VARCHAR(255)                              NOT NULL,
    begin_time REAL                                      NOT NULL,
    end_time   REAL                                      NOT NULL,
    properties jsonb,
    created_at timestamptz                               NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE speakers;
DROP TABLE records;
DROP TABLE entities;
DROP TABLE markups;
-- +goose StatementEnd
