package main

import (
	k "github.com/frapa/candle/kernel"
	"github.com/rs/xid"
)

type Account struct {
	k.BaseModel
	Name string
}

func init() {
	k.RegisterModel(Account{})
}

func createTestData() {
	test := k.NewUser("test", "test")
	k.Save(test)

	for i := 0; i < 25; i++ {
		a := new(Account)
		a.BaseModel = *k.NewBaseModel()
		a.Name = xid.New().String()
		k.Save(a)
	}
}

func main() {
	k.RegisterRestResource(Account{})

	k.StartApplication("Electrum", ":5555")
}
