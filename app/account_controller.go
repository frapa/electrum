package main

import (
	k "github.com/frapa/candle/kernel"
	"github.com/frapa/ripple"
	"net/http"
)

type accountController struct {
	k.GenericRestController
}

/*func (c *accountController) GetByType(ctx *ripple.Context) {
	if !c.Authenticate(ctx) {
		return
	}

	type_ := ctx.Params["param"]

	typeAndFather := k.And(k.F("Type", "=", type_), k.F("Father", "=", "1"))
	assetsAccounts := k.All("Account").Filter(typeAndFather).To("SubAccounts")

	ctx.Response.Body = assetsAccounts.GetAll()
}*/

func (c *accountController) GetInOut(ctx *ripple.Context) {
	if !c.Authenticate(ctx) {
		return
	}

	accountId := ctx.Params["param"]
	user := c.GetUser(ctx)

	account := k.All("Account").Filter("Id", "=", accountId)
	account = account.ApplyReadPermissions(user)

	if account.Count() == 0 {
		k.NewRestError("No Account with Id '" + accountId +
			"' (or permissions missing).").Send(ctx)
	} else {
		transactions := account.To("In").ApplyReadPermissions(user).GetAll()
		outTransactions := account.To("Out").ApplyReadPermissions(user).GetAll()

		transactions = append(transactions, outTransactions...)

		ctx.Response.Body = transactions
	}
}

func initAccountsController() {
	istAccCont := new(accountController)
	k.App.RegisterController("accounts", istAccCont)

	k.App.AddRoute(ripple.Route{
		Pattern:    "/controller/accounts/:_action/:param",
		Controller: "accounts"})

	http.HandleFunc("/controller/", k.App.ServeHTTP)
}
