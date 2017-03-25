package main

import (
	"flag"
	k "github.com/frapa/candle/kernel"
)

func parseFlags() {
	var createUsers bool
	flag.BoolVar(&createUsers, "u", false, "Create test users before running")
	var refreshData bool
	flag.BoolVar(&refreshData, "r", false, "refresh cache")

	flag.Parse()

	if createUsers {
		RegisterNewUser("frapa", "elepsw", "francescopasa@gmail.com")
		RegisterNewUser("dejavu", "mona", "Bazzanella.Davide@gmail.com")
		RegisterNewUser("maria", "canpsw", "maria.gubert@gmail.com")
		RegisterNewUser("matteino", "sonogay", "matteo.finazzer@gmail.com")
	}

	if refreshData {
		cronUpdateTotalCaches()
	}
}

func SetupDatabase() {
	// To get a write speedup we enable wal mode and sync='NORMAL'
	// The current pagu.it server is very slow during inserts

	k.GetDb().Exec("PRAGMA journal_mode=WAL;")
	k.GetDb().Exec("PRAGMA schema.synchronous=NORMAL;")
	k.GetDb().Exec("PRAGMA wal_autocheckpoint=100;")
}

func main() {
	// Settings for the database
	SetupDatabase()

	k.UpdateSchema()
	/*createTestData()*/

	parseFlags()

	initAccountsController()
	initTransactionController()
	initGnucash()

	k.StartApplication("Electrum", ":5555")
}
