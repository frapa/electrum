package main

import (
	k "github.com/frapa/candle/kernel"
	"time"
)

type Transaction struct {
	k.BaseModel
	Description string
	Date        time.Time
}

func init() {
	k.DefineLink(Transaction{}, "From", Account{}, "Out")
	k.DefineLink(Transaction{}, "To", Account{}, "In")
	k.DefineLink(Transaction{}, "Amount", Amount{}, "Transaction")

	k.RegisterModel(Transaction{})
	k.RegisterRestResource(Transaction{}, NewTransaction)
}

func NewTransaction() *Transaction {
	t := new(Transaction)
	t.BaseModel = *k.NewBaseModel()
	return t
}
