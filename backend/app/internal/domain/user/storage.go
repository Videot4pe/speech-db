package user

import (
	"backend/pkg/client/postgresql"
	"backend/pkg/logging"
	"backend/pkg/utils"
	"context"
	"fmt"
	"github.com/dchest/uniuri"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
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

func NewUserStorage(ctx context.Context, client postgresql.Client, logger *logging.Logger) *Storage {
	return &Storage{
		queryBuilder: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
		client:       client,
		logger:       logger,
		ctx:          ctx,
	}
}

const (
	scheme       = "public"
	table        = "users"
	refreshTable = "refresh_tokens"
)

func (s *Storage) queryLogger(sql, table string, args []interface{}) *logging.Logger {
	return s.logger.ExtraFields(map[string]interface{}{
		"sql":   sql,
		"table": table,
		"args":  args,
	})
}

func (s *Storage) List(filters []*db.Filter, pagination *db.Pagination, sorts ...*db.Sort) ([]User, *utils.Meta, error) {
	query := s.queryBuilder.Select("id", "email", "username", "name", "surname", "patronymic", "is_active", "avatar_id", "created_at", "updated_at").
		From(scheme + "." + table)

	for _, filter := range filters {
		s.logger.Trace(filter)
		query = filter.UseSelectBuilder(query)
	}
	if pagination != nil {
		query = pagination.UseSelectBuilder(query)
	}
	for _, sort := range sorts {
		query = sort.UseSelectBuilder(query)
	}

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return nil, nil, err
	}

	logger.Trace("do query")
	rows, err := s.client.Query(s.ctx, sql, args...)
	if err != nil {
		err = db.ErrDoQuery(err)
		logger.Error(err)
		return nil, nil, err
	}

	defer rows.Close()

	list := make([]User, 0)

	var count uint64

	err = s.client.QueryRow(s.ctx, fmt.Sprintf("SELECT COUNT(*) FROM %v.%v", scheme, table)).Scan(&count)
	for rows.Next() {
		p := User{}
		if err = rows.Scan(
			&p.Id, &p.Email, &p.Username, &p.Name, &p.Surname, &p.Patronymic, &p.IsActive, &p.AvatarId, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			err = db.ErrScan(err)
			logger.Error(err)
			return nil, nil, err
		}

		list = append(list, p)
	}
	meta := &utils.Meta{
		TotalItems: count,
		TotalPages: uint64(math.Ceil(float64(count) / float64(pagination.Limit))),
	}

	return list, meta, nil
}

func (s *Storage) Create(user User, isOAuth bool) (uint16, string, error) {

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	lastInsertId := uint16(0)

	hash := uniuri.NewLen(15)

	if user.Role == 0 {
		// TODO FIX
		user.Role = 1
	}

	query := s.queryBuilder.Insert("users").
		Columns("email", "username", "name", "surname", "patronymic", "role_id", "is_active", "is_verified", "is_oauth", "password", "token_hash").
		Values(user.Email, user.Username, user.Name, user.Surname, user.Patronymic, user.Role, true, isOAuth, isOAuth, hashedPassword, hash).
		Suffix("RETURNING id")

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return lastInsertId, hash, err
	}

	logger.Trace("do query")
	err = s.client.QueryRow(s.ctx, sql, args...).Scan(&lastInsertId)

	if err != nil {
		logger.Error(err)
		return lastInsertId, hash, err
	}

	return lastInsertId, hash, nil
}

func (s *Storage) GetById(id uint16) (*User, error) {

	var user User

	query := s.queryBuilder.Select("u.id", "u.email", "u.username", "u.name", "u.surname", "u.patronymic", "u.role_id", "u.is_active", "u.avatar_id", "array_agg(p.name)").
		From("users as u").
		Where(sq.Eq{"u.id": id}).
		Join("roles as r on r.id = u.role_id").
		Join("roles_permissions as rp on rp.role_id = r.id").
		Join("permissions as p on rp.permission_id = p.id").
		GroupBy("u.id")

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return nil, err
	}

	logger.Trace("do query")
	row := s.client.QueryRow(s.ctx, sql, args...)

	if err = row.Scan(&user.Id, &user.Email, &user.Username, &user.Name, &user.Surname, &user.Patronymic, &user.Role, &user.IsActive, &user.AvatarId, (*pq.StringArray)(&user.Permissions)); err != nil {
		err = db.ErrScan(err)
		logger.Error(err)
		return nil, err
	}

	return &user, nil
}

func (s *Storage) GetByCredentials(email, password string) (uint16, bool, []string, error) {

	var user User

	query := s.queryBuilder.Select("u.id", "u.password", "u.is_active", "u.is_verified", "array_agg(p.name)").
		From("users as u").
		Where(sq.Eq{"u.email": email}).
		Join("roles as r on r.id = u.role_id").
		Join("roles_permissions as rp on rp.role_id = r.id").
		Join("permissions as p on rp.permission_id = p.id").
		GroupBy("u.id")

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return 0, false, nil, err
	}

	logger.Trace("do query")
	row := s.client.QueryRow(s.ctx, sql, args...)

	if err = row.Scan(&user.Id, &user.Password, &user.IsActive, &user.IsVerified, (*pq.StringArray)(&user.Permissions)); err != nil {
		err = db.ErrScan(err)
		logger.Error(err)
		return 0, false, nil, err
	}

	if err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		err = db.ErrScan(err)
		logger.Error(err)
		return 0, false, nil, err
	}

	return user.Id, user.IsVerified, user.Permissions, nil
}

func (s *Storage) Update(id uint16, user User) error {

	query := s.queryBuilder.Update("users").
		//Set("email", user.Email).
		Set("username", user.Username).
		Set("name", user.Name).
		Set("surname", user.Surname).
		Set("patronymic", user.Patronymic).
		// TODO проверка на разрешение смены роли (!!!)
		Set("role_id", user.Role).
		Set("avatar_id", user.AvatarId).
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

func (s *Storage) Activate(hash string) error {
	query := s.queryBuilder.Update("users").
		Set("is_verified", true).
		Set("is_active", true).
		Where(sq.Eq{"is_verified": false, "token_hash": hash})

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

func (s *Storage) Delete(id uint16) error {

	query := s.queryBuilder.Update("users").
		Set("is_active", false).
		Where(sq.Eq{"id": id})
	//.Delete("users").

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

func (s *Storage) GetByEmailAndGenerateHash(email string) (uint16, bool, string, error) {

	var user User

	query := s.queryBuilder.Select("id", "is_verified").
		From(scheme + "." + table).
		Where(sq.Eq{"email": email})

	hash := uniuri.NewLen(15)

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return 0, false, hash, err
	}

	row := s.client.QueryRow(s.ctx, sql, args...)

	if err = row.Scan(&user.Id, &user.IsVerified); err != nil {
		err = db.ErrScan(err)
		logger.Error(err)
		return 0, false, hash, err
	}

	setTokenQuery := s.queryBuilder.Update(scheme+"."+table).Set("token_hash", hash).Where(sq.Eq{"id": user.Id})

	sql, args, err = setTokenQuery.ToSql()
	logger = s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return user.Id, user.IsVerified, hash, err
	}

	logger.Trace("do query")
	_, err = s.client.Exec(s.ctx, sql, args...)

	if err != nil {
		logger.Error(err)
		return user.Id, user.IsVerified, hash, err
	}

	return user.Id, user.IsVerified, hash, nil
}

func (s *Storage) PasswordReset(id uint16) error {

	query := s.queryBuilder.Delete("users").
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

func (s *Storage) IsRefreshTokenActual(token string) (uint16, error) {
	query := s.queryBuilder.Select("user_id").
		From(scheme + "." + refreshTable).
		Where(sq.Eq{"token": token})

	sql, args, err := query.ToSql()
	logger := s.queryLogger(sql, table, args)
	if err != nil {
		err = db.ErrCreateQuery(err)
		logger.Error(err)
		return 0, err
	}

	var userId uint16

	row := s.client.QueryRow(s.ctx, sql, args...)

	if err = row.Scan(&userId); err != nil {
		err = db.ErrScan(err)
		logger.Error(err)
		return 0, err
	}

	return userId, nil
}

func (s *Storage) UpdateRefreshToken(token string, userId uint16) error {

	removeQuery := s.queryBuilder.Delete("refresh_tokens").
		Where(sq.Eq{"user_id": userId})

	sql, args, err := removeQuery.ToSql()
	logger := s.queryLogger(sql, refreshTable, args)
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

	insertQuery := s.queryBuilder.Insert("refresh_tokens").
		Columns("user_id", "token").
		Values(userId, token)

	sql, args, err = insertQuery.ToSql()
	logger = s.queryLogger(sql, refreshTable, args)
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
