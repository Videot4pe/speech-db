package markups

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
	table  = "markups"
)

func (s *Storage) queryLogger(sql, table string, args []interface{}) *logging.Logger {
	return s.logger.ExtraFields(map[string]interface{}{
		"sql":   sql,
		"table": table,
		"args":  args,
	})
}

func (s *Storage) All(params *db.Params) ([]Markup, *utils.Meta, error) {
	query := s.queryBuilder.Select(
		"m.id",
		"f.path",
		"m.created_at",
		"u.email",
	).From(fmt.Sprintf("%v as m", table)).
		Join("records as r on r.id = m.record_id").
		Join("files as f on f.id = r.file_id").
		Join("users as u on u.id = m.created_by")

	query = params.Apply(query)

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

	list := make([]Markup, 0)

	for rows.Next() {
		p := Markup{}
		if err = rows.Scan(
			&p.Id, &p.Record, &p.CreatedAt, &p.CreatedBy,
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
		TotalPages: uint64(math.Ceil(float64(count) / float64(params.Pagination.Limit))),
	}

	return list, meta, nil
}

func (s *Storage) Create(markup NewMarkup) (uint16, error) {

	lastInsertId := uint16(0)

	query := s.queryBuilder.Insert(table).
		Columns("record_id", "created_by").
		Values(markup.Record, markup.CreatedBy).
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

func (s *Storage) GetById(id uint16) (*Markup, error) {

	var markup Markup

	query := s.queryBuilder.Select("m.id", "f.path", "m.created_at", "u.email").
		From(fmt.Sprintf("%v as m", table)).
		Where(sq.Eq{"m.id": id}).
		Join("records as r on r.id = m.record_id").
		Join("files as f on f.id = r.file_id").
		Join("users as u on u.id = m.created_by")

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return nil, err
	}

	row := s.client.QueryRow(s.ctx, sql, args...)

	s.logger.Trace(id)
	if err = row.Scan(&markup.Id, &markup.Record, &markup.CreatedAt, &markup.CreatedBy); err != nil {
		err = db.ErrScan(err)
		logger.Error(err)
		return nil, err
	}

	return &markup, nil
}

func (s *Storage) Update(id uint16, markup NewMarkup) error {

	query := s.queryBuilder.Update(table).
		Set("record_id", markup.Record).
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
