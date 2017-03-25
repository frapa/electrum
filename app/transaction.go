package main

import (
	k "github.com/frapa/candle/kernel"
	"time"
)

type Transaction struct {
	*k.BaseModel
	Description string
	Date        time.Time
	Amount      int64
	ImportInfo  string // see comment in account.go
}

func init() {
	k.DefineLink(NewTransaction(), "From", NewAccount(), "Out")
	k.DefineLink(NewTransaction(), "To", NewAccount(), "In")

	k.RegisterModel(NewTransaction)
	k.RegisterRestResource(NewTransaction())
}

func NewTransaction() *Transaction {
	t := new(Transaction)
	t.BaseModel = k.NewBaseModel()
	return t
}
