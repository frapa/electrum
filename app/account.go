package main

import (
	k "github.com/frapa/candle/kernel"
	"time"
)

type Account struct {
	k.BaseModel
	Name        string
	Description string
	Type        string
	Icon        string
	// Indicates is this is a father
	// account for a particular type
	Father int64
	// This can be used by the imports
	// to store some information.
	// Example: gnucash import stores
	// gnucash id in order to identify
	// account in a second import
	ImportInfo string
	// Caches for totals
	MonthCache      int64
	YearCache       int64
	TotalCache      int64
	LastCacheUpdate time.Time
}

func init() {
	k.DefineLink(Account{}, "SubAccounts", Account{}, "Parent")

	k.RegisterModel(Account{})
	k.RegisterRestResource(Account{}, NewAccount)
}

func NewAccount() *Account {
	a := new(Account)
	a.BaseModel = *k.NewBaseModel()
	return a
}

func (a *Account) UpdateCache(date time.Time, variation int64) {
	// Total cache
	a.TotalCache += variation

	now := time.Now()
	beginningOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	beginningOfYear := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, time.UTC)

	// Month cache
	if now.Month() != a.LastCacheUpdate.Month() {
		a.MonthCache = 0
	}
	if date.After(beginningOfMonth) {
		a.MonthCache += variation
	}

	// Year cache
	if now.Year() != a.LastCacheUpdate.Year() {
		a.YearCache = 0
	}
	if date.After(beginningOfYear) {
		a.YearCache += variation
	}

	a.LastCacheUpdate = now
	k.Save(a)

	// Recursivly update parent accounts
	var parent Account
	parentQuery := a.To("Parent")

	if parentQuery.Count() != 0 {
		parentQuery.Get(&parent)
		parent.UpdateCache(date, variation)
	}
}
