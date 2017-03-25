package main

import (
	k "github.com/frapa/candle/kernel"
)

type Book struct {
	*k.BaseModel
	Name string
}

func init() {
	k.DefineLink(NewBook(), "RootAccounts", NewAccount(), "Book")

	k.RegisterModel(NewBook)
	k.RegisterRestResource(NewBook())
}

func NewBook() *Book {
	b := new(Book)
	b.BaseModel = k.NewBaseModel()
	return b
}

// also saves and creates account types
func NewDefaultBook(g *k.Group) *Book {
	b := NewBook()
	b.Name = "Default book"
	k.Save(b)
	b.Link("Groups", g)

	types := []string{"asset", "income",
		"expense", "equity"}
	for _, type_ := range types {
		father := NewAccount()
		father.Type = type_
		father.Father = 1
		father.Name = "Father '" + type_ + "' account"

		k.Save(father)
		b.Link("RootAccounts", father)
		father.Link("Groups", g)
	}

	return b
}

func (b *Book) RefreshTotalCaches() {
	var refresh func(accounts []k.AnyModel)
	refresh = func(accounts []k.AnyModel) {
		for _, accountInt := range accounts {
			account := accountInt.(*Account)
			account.RefreshCache()

			subAccounts := account.To("SubAccounts").GetAll()
			refresh(subAccounts)
		}
	}

	accounts := b.To("RootAccounts").GetAll()
	refresh(accounts)
	println(b.Name)
}
