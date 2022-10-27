package entity

import (
	"backend/pkg/client/postgresql"
	db "backend/pkg/client/postgresql/model"
	"backend/pkg/logging"
	"backend/pkg/utils"
	"context"
	"fmt"
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
	scheme = "public"
	table  = "entities"
)

func (s *Storage) queryLogger(sql, table string, args []interface{}) *logging.Logger {
	return s.logger.ExtraFields(map[string]interface{}{
		"sql":   sql,
		"table": table,
		"args":  args,
	})
}

func (s *Storage) All(markupId uint16) ([]Entity, *utils.Meta, error) {
	query := s.queryBuilder.Select(
		"id",
		"markup_id",
		"value",
		"begin_time",
		"end_time",
		"created_at",
		"properties",
	).
		From(scheme + "." + table).
		Where(sq.Eq{"markup_id": markupId})

	sql, args, err := query.ToSql()
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

	list := make([]Entity, 0)

	for rows.Next() {
		p := Entity{}
		if err = rows.Scan(
			&p.Id, &p.MarkupId, &p.Value, &p.BeginTime, &p.EndTime, &p.CreatedAt, &p.Properties,
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
		TotalPages: 0,
	}

	return list, meta, nil
}

func (s *Storage) Create(entity Entity) (uint16, error) {

	lastInsertId := uint16(0)

	query := s.queryBuilder.Insert(table).
		Columns("markup_id", "value", "begin_time", "end_time", "properties").
		Values(entity.MarkupId, entity.Value, entity.BeginTime, entity.EndTime, entity.Properties).
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

func (s *Storage) Update(id uint16, entity Entity) error {

	query := s.queryBuilder.Update(table).
		Set("markup_id", entity.MarkupId).
		Set("value", entity.Value).
		Set("begin_time", entity.BeginTime).
		Set("end_time", entity.EndTime).
		Set("properties", entity.Properties).
		Where(sq.Eq{"id": id})

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return err
	}

	_, err = s.client.Exec(s.ctx, sql, args...)

	if err != nil {
		logger.Error(err)
		return err
	}

	return nil
}

func (s *Storage) Remove(id uint16) error {

	query := s.queryBuilder.Delete(table).Where(sq.Eq{"id": id})

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return err
	}

	_, err = s.client.Exec(s.ctx, sql, args...)

	if err != nil {
		logger.Error(err)
		return err
	}

	return nil
}
