package main

import (
	k "github.com/frapa/candle/kernel"
)

type Account struct {
	k.BaseModel
	Name        string
	Description string
	Type        string
	Icon        string
}

func init() {
	k.DefineLink(Account{}, "SubAccounts", Account{}, "Parent")

	k.RegisterModel(Account{})
	k.RegisterRestResource(Account{}, NewAccount)
}

func NewAccount() *Account {
	a := new(Account)
	a.BaseModel = *k.NewBaseModel()
	return a
}
