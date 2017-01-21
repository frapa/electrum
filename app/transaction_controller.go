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

	transactionId := ctx.Params["id"]

	var transaction Transaction
	transQuery := k.All("Transaction").Filter("Id", "=", transactionId)

	transQuery.Get(&transaction)

	var fromAccount, toAccount Account
	transQuery.To("From").Get(&fromAccount)
	transQuery.To("To").Get(&toAccount)

	// total cache
	fromAccount.UpdateCache(transaction.Date, -transaction.Amount)
	toAccount.UpdateCache(transaction.Date, transaction.Amount)

	k.Save(&fromAccount)
	k.Save(&toAccount)
}

func initTransactionController() {
	istTransCont := new(transactionController)
	k.App.RegisterController("transaction", istTransCont)

	k.App.AddRoute(ripple.Route{
		Pattern:    "/controller/transaction/:_action/:id",
		Controller: "transaction"})
}
