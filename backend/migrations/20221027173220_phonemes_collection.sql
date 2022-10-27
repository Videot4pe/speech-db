-- +goose Up
-- +goose StatementBegin

CREATE TABLE collection_phonemes
(
    id       BIGSERIAL NOT NULL PRIMARY KEY,
    value    TEXT      NOT NULL UNIQUE,
    is_vowel BOOLEAN   NOT NULL DEFAULT FALSE
);
INSERT INTO collection_phonemes (value)
VALUES ('а'),
       ('о'),
       ('у'),
       ('э'),
       ('и'),
       ('ы'),
       ('б'),
       ('б’'),
       ('в'),
       ('в’'),
       ('г'),
       ('г’'),
       ('д'),
       ('д’'),
       ('ж'),
       ('з'),
       ('з’'),
       ('й’'),
       ('к'),
       ('к’'),
       ('л'),
       ('л’'),
       ('м'),
       ('м’'),
       ('н'),
       ('н’'),
       ('п'),
       ('п’'),
       ('р'),
       ('р’'),
       ('с'),
       ('с’'),
       ('т'),
       ('т’'),
       ('ф'),
       ('ф’'),
       ('х'),
       ('х’'),
       ('ц'),
       ('ч’'),
       ('ш'),
       ('щ’');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE collection_phonemes;
-- +goose StatementEnd
