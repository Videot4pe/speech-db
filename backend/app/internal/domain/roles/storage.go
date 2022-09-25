package roles

import (
	"backend/pkg/client/postgresql"
	db "backend/pkg/client/postgresql/model"
	"backend/pkg/logging"
	"backend/pkg/utils"
	"context"
	"fmt"
	sq "github.com/Masterminds/squirrel"
	"github.com/lib/pq"
	"math"
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
	rolesTable       = "roles"
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

func (s *Storage) Roles(params *db.Params) ([]Role, *utils.Meta, error) {
	s.logger.Info("ROLES")
	query := s.queryBuilder.Select("roles.id", "roles.name", "array_agg(permissions.name)").
		From("roles").
		Join("roles_permissions on roles_permissions.role_id = id").
		Join("permissions on permissions.id = roles_permissions.permission_id").
		GroupBy("roles.id")

	query = params.Apply(query)

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		s.logger.Error(db.ErrCreateQuery(err))
		return nil, nil, err
	}

	logger.Trace("do query")
	rows, err := s.client.Query(s.ctx, sql, args...)
	if err != nil {
		s.logger.Error(db.ErrDoQuery(err))
		return nil, nil, err
	}

	defer rows.Close()
	list := make([]Role, 0)

	for rows.Next() {
		p := Role{}
		if err = rows.Scan(
			&p.Id, &p.Name, (*pq.StringArray)(&p.Permissions),
		); err != nil {
			s.logger.Error(db.ErrScan(err))
			return nil, nil, err
		}
		list = append(list, p)
	}

	var count uint64

	err = s.client.QueryRow(s.ctx, fmt.Sprintf("SELECT COUNT(*) FROM %v.%v", scheme, rolesTable)).Scan(&count)
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
