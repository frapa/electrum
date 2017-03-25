package main

import (
	k "github.com/frapa/candle/kernel"
	"time"
)

type Account struct {
	*k.BaseModel
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
	k.DefineLink(NewAccount(), "SubAccounts", NewAccount(), "Parent")

	k.RegisterModel(NewAccount)
	k.RegisterRestResource(NewAccount())
}

func NewAccount() *Account {
	a := new(Account)
	a.BaseModel = k.NewBaseModel()
	return a
}

// date is the date of the transaction
// deprecated because it's just easier to recompute the whole account
/*func (a *Account) UpdateCache(date time.Time, variation int64) {
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
}*/

func (a *Account) RefreshCache() (int64, int64, int64) {
	subTotal := int64(0)
	subYear := int64(0)
	subMonth := int64(0)

	subAccounts := a.To("SubAccounts")
	account := NewAccount()
	for subAccounts.Next() {
		subAccounts.Get(account)
		tot, year, month := account.RefreshCache()
		subTotal += tot
		subYear += year
		subMonth += month
	}

	// reset
	a.MonthCache = subMonth
	a.YearCache = subYear
	a.TotalCache = subTotal

	now := time.Now()
	beginningOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	beginningOfYear := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, time.UTC)

	in := a.To("In")
	for in.Next() {
		trans := NewTransaction()
		in.Get(trans)

		a.TotalCache += trans.Amount
		if trans.Date.After(beginningOfYear) {
			a.YearCache += trans.Amount
		}

		if trans.Date.After(beginningOfMonth) {
			a.MonthCache += trans.Amount
		}
	}

	out := a.To("Out")
	for out.Next() {
		trans := NewTransaction()
		out.Get(trans)

		a.TotalCache -= trans.Amount
		if trans.Date.After(beginningOfYear) {
			a.YearCache -= trans.Amount
		}

		if trans.Date.After(beginningOfMonth) {
			a.MonthCache -= trans.Amount
		}
	}

	a.LastCacheUpdate = now
	k.Save(a)

	return a.TotalCache, a.YearCache, a.MonthCache
}
