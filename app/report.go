package main

import (
	k "github.com/frapa/candle/kernel"
)

type Report struct {
	*k.BaseModel
	Name        string
	Description string
}

func NewReport() *Report {
	r := new(Report)
	r.BaseModel = k.NewBaseModel()
	return r
}

// ---------- Tables --------------
type Table struct {
	*k.BaseModel
	Name string
}

func NewTable() *Table {
	t := new(Table)
	t.BaseModel = k.NewBaseModel()
	return t
}

/*
// ---------- Fields --------------
type Field struct {
	k.BaseModel
	Field string
}

func NewFilter() *Filter {
	f := new(Filter)
	f.BaseModel = *k.NewBaseModel()
	return f
}

// ---------- Filters --------------
type Filter struct {
	k.BaseModel
	Field    string
	Operator string
	Value    string
}

func NewFilter() *Filter {
	f := new(Filter)
	f.BaseModel = *k.NewBaseModel()
	return f
}
*/
func init() {
	k.DefineLink(NewReport(), "Tables", NewTable(), "Report")

	k.RegisterModel(NewReport)
	k.RegisterRestResource(NewReport())

	/*k.RegisterModel(Filter{})
	k.RegisterRestResource(Filer{}, NewFilter)
	*/

	k.RegisterModel(NewTable)
	k.RegisterRestResource(NewTable())
}
