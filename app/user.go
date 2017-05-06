package main

import (
	contact "github.com/frapa/candle/contact"
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

	// Create contact
	c := contact.NewContact()
	k.Save(c)
	u.Link("Contact", c)

	// Create contact email address
	emailAddress := contact.NewEmailAddress()
	emailAddress.Address = email
	k.Save(emailAddress)
	c.Link("EmailAddresses", emailAddress)

	// create group for this user
	g := k.NewGroup()
	g.Name = username
	g.Permissions = "rw"
	g.CreatePermissions = "Book,Account,Transaction,Report,Table,Field,Filter,Aggregation,TelegramAccount,EmailAddress,Address"
	k.Save(g)

	u.Link("Groups", g)
	c.Link("Groups", g)
	emailAddress.Link("Groups", g)

	// setup default book
	NewDefaultBook(g)

	k.CommitTransaction()
}
