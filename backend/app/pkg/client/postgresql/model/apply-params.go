package model

import "github.com/Masterminds/squirrel"

type Params struct {
	filters    []*Filter
	sorts      []*Sort
	Pagination *Pagination
}

func NewParams(filters []*Filter, sorts []*Sort, pagination *Pagination) *Params {
	return &Params{
		filters:    filters,
		sorts:      sorts,
		Pagination: pagination,
	}
}

func (p *Params) Apply(query squirrel.SelectBuilder) squirrel.SelectBuilder {
	for _, filter := range p.filters {
		query = filter.UseSelectBuilder(query)
	}

	if p.Pagination != nil {
		query = p.Pagination.UseSelectBuilder(query)
	}

	for _, sort := range p.sorts {
		query = sort.UseSelectBuilder(query)
	}

	return query
}
