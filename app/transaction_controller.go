package main

import (
	k "github.com/frapa/candle/kernel"
	"github.com/frapa/ripple"
)

type transactionController struct {
	k.GenericRestController
}

func (c *transactionController) GetUpdateAccountTotals(ctx *ripple.Context) {
	if !c.Authenticate(ctx) {
		return
	}

	user := c.GetUser(ctx)
	fromId := ctx.Params["fromId"]
	toId := ctx.Params["toId"]

	account := NewAccount()
	if toId == "new" {
		transaction := k.All("Transaction").Filter("Id", "=", fromId)
		transaction = transaction.ApplyWritePermissions(user)

		transaction.To("From").ApplyWritePermissions(user).Get(account)
		account.RefreshCache()

		transaction.To("To").ApplyWritePermissions(user).Get(account)
		account.RefreshCache()
	} else {
		fromQuery := k.All("Account").Filter("Id", "=", fromId)
		fromQuery = fromQuery.ApplyWritePermissions(user)
		fromQuery.Get(account)

		account.RefreshCache()

		toQuery := k.All("Account").Filter("Id", "=", toId)
		toQuery = toQuery.ApplyWritePermissions(user)
		toQuery.Get(account)

		account.RefreshCache()
	}
}

func initTransactionController() {
	istTransCont := new(transactionController)
	k.App.RegisterController("transaction", istTransCont)

	k.App.AddRoute(ripple.Route{
		Pattern:    "/controller/transaction/:_action/:fromId/:toId",
		Controller: "transaction"})
}
