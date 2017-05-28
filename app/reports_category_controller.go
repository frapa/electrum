package main

import (
	//"fmt"
	k "github.com/frapa/candle/kernel"
	"github.com/frapa/ripple"
	"time"
)

type categoryReportController struct {
	k.GenericRestController
}

func calculateLastPeriod(period string, i int) time.Time {
	now := time.Now()

	var date time.Time
	if period == "month" {
		year := now.Year()
		month := 6 - i //int(now.Month()) - i

		realMonth := month % 12
		yearOffset := month / 12
		if month < 0 {
			yearOffset -= 1
		}
		realYear := year - yearOffset
		realYear = 2016

		beginningOfMonth := time.Date(realYear, time.Month(realMonth), 1,
			0, 0, 0, 0, time.UTC)

		date = beginningOfMonth
	} else {

	}

	return date
}

type category struct {
	Name                  string
	TransactionsForPeriod int64
	TotalForPeriod        int64
	SubCategories         []*category
}

type categoriesForPeriod struct {
	TotalIncome  int64
	NumIncome    int64
	Income       []*category
	TotalExpense int64
	NumExpense   int64
	Expense      []*category
}

// Returns somethings like the following:
func computeCategoriesForPeriod(period string, i int, user *k.User) *categoriesForPeriod {
	beginningOfLastPeriod := calculateLastPeriod(period, i+1)
	endOfLastPeriod := calculateLastPeriod(period, i)
	blpRfc := beginningOfLastPeriod.Format(time.RFC3339)
	elpRfc := endOfLastPeriod.Format(time.RFC3339)

	accounts := k.All("Account").Filter("Father", "=", "1").ApplyReadPermissions(user)
	income := accounts.Filter("Type", "=", "income").Limit(1)
	expense := accounts.Filter("Type", "=", "expense").Limit(1)

	var recurseAccount func(*Account, string, *[]*category) (int64, int64)
	recurseAccount = func(account *Account, attr string, categories *[]*category) (int64, int64) {
		sum := int64(0)

		transactions := account.To(attr)
		transactions = transactions.Filter("Date", ">", blpRfc)
		transactions = transactions.Filter("Date", "<", elpRfc)
		count := int64(transactions.Count())
		for transactions.Next() {
			trans := NewTransaction()
			transactions.Get(trans)

			sum += trans.Amount
		}

		subAccounts := account.To("SubAccounts")
		for subAccounts.Next() {
			subAccount := NewAccount()
			subAccounts.Get(subAccount)

			cat := new(category)
			cat.Name = subAccount.Name

			total, subCount := recurseAccount(subAccount, attr, &(cat.SubCategories))

			cat.TransactionsForPeriod = subCount
			cat.TotalForPeriod = total
			*categories = append(*categories, cat)

			sum += total
			count += subCount
		}

		return sum, count
	}

	returnJson := new(categoriesForPeriod)

	account := NewAccount()
	income.Get(account)
	total, count := recurseAccount(account, "Out", &(returnJson.Income))
	returnJson.TotalIncome = total
	returnJson.NumIncome = count

	expense.Get(account)
	total, count = recurseAccount(account, "In", &(returnJson.Expense))
	returnJson.TotalExpense = total
	returnJson.NumExpense = count

	return returnJson
}

func (c *categoryReportController) Get(ctx *ripple.Context) {
	if !c.Authenticate(ctx) {
		return
	}

	period := ctx.Params["period"]
	user := c.GetUser(ctx)

	type reportData struct {
		LastPeriod *categoriesForPeriod
		ThisPeriod *categoriesForPeriod
	}

	data := new(reportData)
	data.LastPeriod = computeCategoriesForPeriod(period, 1, user)
	data.ThisPeriod = computeCategoriesForPeriod(period, 0, user)

	ctx.Response.Body = data
}

func initCategoryReportController() {
	istAccCont := new(categoryReportController)
	k.App.RegisterController("category-report", istAccCont)

	k.App.AddRoute(ripple.Route{
		Pattern:    "/controller/report/category/:period",
		Controller: "category-report"})
}
