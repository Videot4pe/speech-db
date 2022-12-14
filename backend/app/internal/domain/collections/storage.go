package collections

import (
	"backend/pkg/client/postgresql"
	db "backend/pkg/client/postgresql/model"
	"backend/pkg/logging"
	"context"
	sq "github.com/Masterminds/squirrel"
)

type Storage struct {
	queryBuilder sq.StatementBuilderType
	client       postgresql.Client
	logger       *logging.Logger
	ctx          context.Context
}

func NewStorage(ctx context.Context, client postgresql.Client, logger *logging.Logger) *Storage {
	return &Storage{
		queryBuilder: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
		client:       client,
		logger:       logger,
		ctx:          ctx,
	}
}

const (
	scheme         = "public"
	countriesTable = "collection_countries"
	languagesTable = "collection_languages"
	phonemesTable  = "collection_phonemes"
	stressesTable  = "collection_stresses"
)

func (s *Storage) queryLogger(sql, table string, args []interface{}) *logging.Logger {
	return s.logger.ExtraFields(map[string]interface{}{
		"sql":   sql,
		"table": table,
		"args":  args,
	})
}

func (s *Storage) Countries() ([]Country, error) {
	query := s.queryBuilder.Select(
		"id",
		"name",
	).From(countriesTable)

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, countriesTable, args)

	rows, err := s.client.Query(s.ctx, sql, args...)
	if err != nil {
		err = db.ErrDoQuery(err)
		logger.Error(err)
		return nil, err
	}

	defer rows.Close()

	list := make([]Country, 0)

	for rows.Next() {
		p := Country{}
		if err = rows.Scan(
			&p.Id, &p.Name,
		); err != nil {
			err = db.ErrScan(err)
			logger.Error(err)
			return nil, err
		}

		list = append(list, p)
	}

	return list, nil
}

func (s *Storage) Stresses() ([]Stress, error) {
	query := s.queryBuilder.Select(
		"id",
		"value",
	).From(stressesTable)

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, stressesTable, args)

	rows, err := s.client.Query(s.ctx, sql, args...)
	if err != nil {
		err = db.ErrDoQuery(err)
		logger.Error(err)
		return nil, err
	}

	defer rows.Close()

	list := make([]Stress, 0)

	for rows.Next() {
		p := Stress{}
		if err = rows.Scan(
			&p.Id, &p.Value,
		); err != nil {
			err = db.ErrScan(err)
			logger.Error(err)
			return nil, err
		}

		list = append(list, p)
	}

	return list, nil
}

func (s *Storage) Phonemes() ([]Phoneme, error) {
	query := s.queryBuilder.Select(
		"id",
		"value",
		"is_vowel",
	).From(phonemesTable)

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, phonemesTable, args)

	rows, err := s.client.Query(s.ctx, sql, args...)
	if err != nil {
		err = db.ErrDoQuery(err)
		logger.Error(err)
		return nil, err
	}

	defer rows.Close()

	list := make([]Phoneme, 0)

	for rows.Next() {
		p := Phoneme{}
		if err = rows.Scan(
			&p.Id, &p.Value, &p.IsVowel,
		); err != nil {
			err = db.ErrScan(err)
			logger.Error(err)
			return nil, err
		}

		list = append(list, p)
	}

	return list, nil
}

func (s *Storage) Languages() ([]Language, error) {
	query := s.queryBuilder.Select(
		"id",
		"name",
	).From(languagesTable)

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, countriesTable, args)

	rows, err := s.client.Query(s.ctx, sql, args...)
	if err != nil {
		err = db.ErrDoQuery(err)
		logger.Error(err)
		return nil, err
	}

	defer rows.Close()

	list := make([]Language, 0)

	for rows.Next() {
		p := Language{}
		if err = rows.Scan(
			&p.Id, &p.Name,
		); err != nil {
			err = db.ErrScan(err)
			logger.Error(err)
			return nil, err
		}

		list = append(list, p)
	}

	return list, nil
}
