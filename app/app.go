package main

import (
	"fmt"
	k "github.com/frapa/candle/kernel"
	"time"
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

func main() {
	k.UpdateSchema()
	/*createTestData()*/

	start := time.Now()
	ImportBookFromGnuCash("cash.gnucash")
	elapsed := time.Since(start)
	fmt.Println(elapsed)

	initAccountsController()

	k.StartApplication("Electrum", ":5555")
}
