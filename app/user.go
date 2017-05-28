package main

import (
	contact "github.com/frapa/candle/contact"
	k "github.com/frapa/candle/kernel"
)

var allUsers *k.Group

func GenerateGroups() {
	allUsers = k.NewGroup()
	allUsers.Name = "All Users"
	allUsers.Permissions = "r"
	k.Save(allUsers)
}

var reports []*PredefinedReport

func GeneratePredefinedReports() {
	r := NewPredefinedReport()
	r.Name = "Flow by category"
	r.ShortName = "Category"
	r.Description = "See how much you spent and earned for each category during the Week, Month or Year."
	r.ImageUrl = "/static/content/images/app/reports/expenses_by_category.svg"
	r.ViewClass = "App_View_Report_Category"
	k.Save(r)
	reports = append(reports, r)
	r.Link("Groups", allUsers)
}

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
	g.CreatePermissions = "Book,Account,Transaction,Report,Table,Field,Filter,Aggregation,TelegramAccount,EmailAddress,Address,PredefinedReportSettings"
	k.Save(g)

	u.Link("Groups", g)
	u.Link("Groups", allUsers)

	c.Link("Groups", g)
	emailAddress.Link("Groups", g)

	// setup default book
	NewDefaultBook(g)

	k.CommitTransaction()
}
