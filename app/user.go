package main

import (
	k "github.com/frapa/candle/kernel"
)

func RegisterNewUser(username string, password string, email string) {
	k.BeginTransaction()

	u := k.NewUser()
	u.SetPassword(password)
	u.UserName = username
	// Save email address
	u.Email = email
	k.Save(u)

	// create group for this user
	g := k.NewGroup()
	g.Name = username
	g.Permissions = "rw"
	g.CreatePermissions = "Book,Account,Transaction,Report,Table,Field,Filter,Aggregation"
	k.Save(g)
	u.Link("Groups", g)

	// setup default book
	NewDefaultBook(g)

	k.CommitTransaction()
}
