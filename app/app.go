package main

import (
	k "github.com/frapa/candle/kernel"
	"github.com/rs/xid"
)

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
	k.StartApplication("Electrum", ":5555")
}
