package main

import (
	k "github.com/frapa/candle/kernel"
)

type Book struct {
	k.BaseModel
	Name string
}

func init() {
	k.DefineLink(Book{}, "RootAccounts", Account{}, "Book")

	k.RegisterModel(Book{})
	k.RegisterRestResource(Book{}, NewBook)
}

func NewBook() *Book {
	b := new(Book)
	b.BaseModel = *k.NewBaseModel()
	return b
}

// also saves and creates account types
func NewDefaultBook() *Book {
	b := NewBook()
	b.Name = "Default book"
	k.Save(b)

	types := []string{"asset", "income",
		"expense", "equity"}
	for _, type_ := range types {
		father := NewAccount()
		father.Type = type_
		father.Father = 1
		father.Name = "Father '" + type_ + "' account"

		k.Save(father)
		b.Link("RootAccounts", father)
	}

	return b
}
