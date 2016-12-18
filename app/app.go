package main

import (
	k "github.com/frapa/candle/kernel"
	"github.com/frapa/ripple"
	"net/http"
	//"github.com/rs/xid"
)

func createTestData() {
	names := []string{"Transportation",
		"Charitable Donations",
		"Child Care",
		"Clothing",
		"Debt Payments",
		"Entertainment",
		"Groceries",
		"Fitness",
		"Gifts",
		"Hobbies",
		"Household Maintenance",
		"Housing",
		"Insurance",
		"Investments",
		"Medical/Dental",
		"Miscellaneous",
		"Savings",
		"Subscriptions",
		"Utilities",
		"Vacation",
		"France 2016"}

	acs := []*Account{}
	for i := 0; i < 21; i++ {
		acs = append(acs, new(Account))
		acs[i].BaseModel = *k.NewBaseModel()
		acs[i].Name = names[i]
		k.Save(acs[i])
	}

	acs[5].Link("SubAccounts", acs[19])
	acs[5].Link("SubAccounts", acs[9])
	acs[5].Link("SubAccounts", acs[17])

	acs[11].Link("SubAccounts", acs[10])
	acs[11].Link("SubAccounts", acs[12])
	acs[11].Link("SubAccounts", acs[18])

	acs[19].Link("SubAccounts", acs[20])
}

type accountController struct {
	k.GenericRestController
}

func (c *accountController) Get(ctx *ripple.Context) {
	if !c.Authenticate(ctx) {
		return
	}

	type_ := ctx.Params["type"]

	/*allAccounts := k.All("Account")
	subAccountsIds := allAccounts.To("SubAccounts").GetIds()
	rootAccounts := allAccounts.Exclude(subAccountsIds)*/

	typeAndFather := k.And(k.F("Type", "=", type_), k.F("Father", "=", "1"))
	assetsAccounts := k.All("Account").Filter(typeAndFather).To("SubAccounts")

	ctx.Response.Body = assetsAccounts.GetAll()
}

func main() {
	/*k.UpdateSchema()
	createTestData()*/

	istAccCont := new(accountController)
	k.App.RegisterController("accounts", istAccCont)
	k.App.AddRoute(ripple.Route{
		Pattern:    "/controller/accounts/:type",
		Controller: "accounts"})
	http.HandleFunc("/controller/", k.App.ServeHTTP)

	k.StartApplication("Electrum", ":5555")
}
