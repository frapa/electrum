package main

import (
	"flag"
	k "github.com/frapa/candle/kernel"
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

func parseFlags() {
	var createUsers bool
	flag.BoolVar(&createUsers, "u", false, "Create test users before running")
	var importBook bool
	flag.BoolVar(&importBook, "i", false, "import gnucash book")
	var testData bool
	flag.BoolVar(&testData, "t", false, "create test data")
	var exportBook string
	flag.StringVar(&exportBook, "e", "", "export gnucash book, given id")

	flag.Parse()

	if createUsers {
		RegisterNewUser("frapa", "elepsw", "francescopasa@gmail.com")
		RegisterNewUser("dejavu", "mona", "Bazzanella.Davide@gmail.com")
		RegisterNewUser("maria", "canpsw", "maria.gubert@gmail.com")
		RegisterNewUser("matteino", "sonogay", "matteo.finazzer@gmail.com")
	}

	if importBook {
		/*start := time.Now()
		ImportBookFromGnuCash("cash.gnucash")
		elapsed := time.Since(start)
		fmt.Println(elapsed)*/
	}

	if testData {
		b := NewBook()
		b.Name = "234"
		k.Save(b)
	}

	if exportBook != "" {
		var book Book
		k.All("Book").Filter("Id", "=", exportBook).Get(&book)
		generateGnucashXml(&book)
	}
}

func main() {
	k.UpdateSchema()
	/*createTestData()*/

	parseFlags()

	initAccountsController()
	initTransactionController()
	initGnucash()

	k.StartApplication("Electrum", ":5555")
}
