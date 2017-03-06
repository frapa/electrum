package main

import (
	k "github.com/frapa/candle/kernel"
)

func RegisterNewUser(username string, password string, email string) {
	k.BeginTransaction()

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
	NewDefaultBook(g)

	k.CommitTransaction()
}
