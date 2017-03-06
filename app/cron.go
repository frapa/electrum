package main

import (
	k "github.com/frapa/candle/kernel"
	"github.com/robfig/cron"
)

var cronRunner *cron.Cron

func init() {
	cronRunner = cron.New()

	// Update totals daily
	cronRunner.AddFunc("0 15 0 * * *", cronUpdateTotalCaches)

	cronRunner.Start()
}

// Use cron prefix to avoid to much namespace pollution
func cronUpdateTotalCaches() {
	k.BeginTransaction()

	books := k.All("Book")
	book := new(Book)

	for books.Next() {
		books.Get(book)

		book.RefreshTotalCaches()
	}

	k.CommitTransaction()
}
