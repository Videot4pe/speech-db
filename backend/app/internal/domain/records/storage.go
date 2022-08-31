package records

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

func NewRecordsStorage(ctx context.Context, client postgresql.Client, logger *logging.Logger) *Storage {
	return &Storage{
		queryBuilder: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
		client:       client,
		logger:       logger,
		ctx:          ctx,
	}
}

const (
	scheme = "public"
	table  = "records"
)

func (s *Storage) queryLogger(sql, table string, args []interface{}) *logging.Logger {
	return s.logger.ExtraFields(map[string]interface{}{
		"sql":   sql,
		"table": table,
		"args":  args,
	})
}

func (s *Storage) All(userId uint16, filters []*db.Filter, pagination *db.Pagination, sorts ...*db.Sort) ([]Record, *utils.Meta, error) {
	query := s.queryBuilder.Select(
		"r.id",
		"r.name",
		"s.name",
		"f.path",
		"r.created_at",
		"r.created_by",
	).From("records as r").
		Join("speakers as s on s.id = r.speaker_id").
		Join("files as f on f.id = r.file_id")

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

	list := make([]Record, 0)

	for rows.Next() {
		p := Record{}
		if err = rows.Scan(
			&p.Id, &p.Name, &p.Speaker, &p.File, &p.CreatedAt, &p.CreatedBy,
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

func (s *Storage) Create(record NewRecord) (uint16, error) {

	lastInsertId := uint16(0)

	query := s.queryBuilder.Insert(table).
		Columns("name", "speaker_id", "file_id", "created_by").
		Values(record.Name, record.Speaker, record.FileId, record.CreatedBy).
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

func (s *Storage) GetById(id uint16) (*NewRecord, error) {

	var record NewRecord

	query := s.queryBuilder.Select("id", "name", "speaker_id", "file_id", "created_by").
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
	if err = row.Scan(&record.Id, &record.Name, &record.Speaker, &record.File, &record.CreatedBy); err != nil {
		err = db.ErrScan(err)
		logger.Error(err)
		return nil, err
	}

	return &record, nil
}

func (s *Storage) Update(id uint16, record NewRecord) error {

	query := s.queryBuilder.Update(table).
		Set("name", record.Name).
		Where(sq.Eq{"id": id})

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return err
	}

	logger.Trace("do query")
	_, err = s.client.Exec(s.ctx, sql, args...)

	if err != nil {
		logger.Error(err)
		return err
	}

	return nil
}
