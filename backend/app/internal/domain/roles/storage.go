package roles

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

func NewRolesStorage(ctx context.Context, client postgresql.Client, logger *logging.Logger) *Storage {
	return &Storage{
		queryBuilder: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
		client:       client,
		logger:       logger,
		ctx:          ctx,
	}
}

const (
	scheme           = "public"
	table            = "roles"
	permissionsTable = "permissions"
)

func (s *Storage) queryLogger(sql, table string, args []interface{}) *logging.Logger {
	return s.logger.ExtraFields(map[string]interface{}{
		"sql":   sql,
		"table": table,
		"args":  args,
	})
}

func (s *Storage) Permissions() ([]Permission, error) {
	query := s.queryBuilder.Select("id", "name").
		From(scheme + "." + permissionsTable)

	sql, args, err := query.ToSql()
	if err != nil {
		s.logger.Error(db.ErrCreateQuery(err))
		return nil, err
	}

	rows, err := s.client.Query(s.ctx, sql, args...)
	if err != nil {
		s.logger.Error(db.ErrDoQuery(err))
		return nil, err
	}

	defer rows.Close()
	list := make([]Permission, 0)

	for rows.Next() {
		p := Permission{}
		if err = rows.Scan(
			&p.Id, &p.Name,
		); err != nil {
			s.logger.Error(db.ErrScan(err))
			return nil, err
		}
		list = append(list, p)
	}

	return list, nil
}
