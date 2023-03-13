package speakers

import (
	"backend/pkg/client/postgresql"
	"backend/pkg/logging"
	"backend/pkg/utils"
	"context"
	"fmt"
	"math"

	db "backend/pkg/client/postgresql/model"

	sq "github.com/Masterminds/squirrel"
)

type Storage struct {
	queryBuilder sq.StatementBuilderType
	client       postgresql.Client
	logger       *logging.Logger
	ctx          context.Context
}

func NewSpeakersStorage(ctx context.Context, client postgresql.Client, logger *logging.Logger) *Storage {
	return &Storage{
		queryBuilder: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
		client:       client,
		logger:       logger,
		ctx:          ctx,
	}
}

const (
	scheme = "public"
	table  = "speakers"
)

func (s *Storage) queryLogger(sql, table string, args []interface{}) *logging.Logger {
	return s.logger.ExtraFields(map[string]interface{}{
		"sql":   sql,
		"table": table,
		"args":  args,
	})
}

func (s *Storage) All(userId uint16, filters []*db.Filter, pagination *db.Pagination, sorts ...*db.Sort) ([]Speaker, *utils.Meta, error) {
	query := s.queryBuilder.Select(
		"id",
		"name",
		"properties",
		"created_at",
		"created_by",
	).From(scheme + "." + table)

	for _, filter := range filters {
		s.logger.Trace(filter)
		query = filter.UseSelectBuilder(query)
	}

	if pagination != nil {
		query = pagination.UseSelectBuilder(query)
	}

	for _, sort := range sorts {
		s.logger.Trace(sort)
		query = sort.UseSelectBuilder(query)
	}

	sql, args, err := query.ToSql()
	s.logger.Trace(sql)
	s.logger.Trace(args)
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return nil, nil, err
	}

	rows, err := s.client.Query(s.ctx, sql, args...)
	if err != nil {
		err = db.ErrDoQuery(err)
		logger.Error(err)
		return nil, nil, err
	}

	defer rows.Close()

	list := make([]Speaker, 0)

	for rows.Next() {
		p := Speaker{}
		if err = rows.Scan(
			&p.Id, &p.Name, &p.Properties, &p.CreatedAt, &p.CreatedBy,
		); err != nil {
			err = db.ErrScan(err)
			logger.Error(err)
			return nil, nil, err
		}

		list = append(list, p)
	}

	var count uint64

	err = s.client.QueryRow(s.ctx, fmt.Sprintf("SELECT COUNT(*) FROM %v.%v", scheme, table)).Scan(&count)
	if err != nil {
		err = db.ErrDoQuery(err)
		logger.Error(err)
		return nil, nil, err
	}
	meta := &utils.Meta{
		TotalItems: count,
		TotalPages: uint64(math.Ceil(float64(count) / float64(pagination.Limit))),
	}

	return list, meta, nil
}

func (s *Storage) Create(speaker Speaker) (uint16, error) {

	lastInsertId := uint16(0)

	query := s.queryBuilder.Insert(table).
		Columns("name", "properties", "created_by").
		Values(speaker.Name, speaker.Properties, speaker.CreatedBy).
		Suffix("RETURNING id")

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return lastInsertId, err
	}

	logger.Trace("do query")
	err = s.client.QueryRow(s.ctx, sql, args...).Scan(&lastInsertId)

	if err != nil {
		logger.Error(err)
		return lastInsertId, err
	}

	return lastInsertId, nil
}

func (s *Storage) GetById(id uint16) (*Speaker, error) {

	var speaker Speaker

	query := s.queryBuilder.Select("id", "name", "properties", "created_by").
		From(table).
		Where(sq.Eq{"id": id})

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return nil, err
	}

	logger.Trace("do query")
	row := s.client.QueryRow(s.ctx, sql, args...)

	s.logger.Trace(id)
	if err = row.Scan(&speaker.Id, &speaker.Name, &speaker.Properties, &speaker.CreatedBy); err != nil {
		err = db.ErrScan(err)
		logger.Error(err)
		return nil, err
	}

	return &speaker, nil
}

func (s *Storage) Update(speaker Speaker) error {

	query := s.queryBuilder.Update(table).
		Set("name", speaker.Name).
		Set("properties", speaker.Properties).
		Where(sq.Eq{"id": speaker.Id})

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return err
	}

	logger.Trace("Updating speaker")
	_, err = s.client.Exec(s.ctx, sql, args...)

	if err != nil {
		logger.Error(err)
		return err
	}

	return nil
}
