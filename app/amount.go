package main

import (
	k "github.com/frapa/candle/kernel"
)

type Amount struct {
	k.BaseModel
	Amount   int64
	Currency string // ISO code
}

func init() {
	k.RegisterModel(Amount{})
	k.RegisterRestResource(Amount{}, NewAmount)
}

func NewAmount() *Amount {
	a := new(Amount)
	a.BaseModel = *k.NewBaseModel()
	return a
}
