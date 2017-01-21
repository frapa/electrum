package main

import (
	k "github.com/frapa/candle/kernel"
)

func RegisterNewUser(username string, password string, email string) {
	u := k.NewUser(username, password)
	// Save email address
	u.Email = email
	k.Save(u)

	// create group for this user
	g := k.NewGroup(username)
	g.Permissions = "rw"
	g.CreatePermissions = "Book,Account,Transaction"
	k.Save(g)
	u.Link("Groups", g)

	// setup default book
	b := NewDefaultBook()
	b.Link("Groups", g)

	// allow user acces to his accounts
	accounts := b.To("RootAccounts")
	for accounts.Next() {
		var account Account
		accounts.Get(&account)

		account.Link("Groups", g)
	}
}
