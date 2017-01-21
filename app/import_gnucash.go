package main

import (
	"compress/gzip"
	"encoding/xml"
	"fmt"
	k "github.com/frapa/candle/kernel"
	"io/ioutil"
	"log"
	"os"
	"strings"
	"time"
)

type RootGnu struct {
	Book BookGnu `xml:"book"`
}

type BookGnu struct {
	Accounts     []AccountGnu     `xml:"account"`
	Transactions []TransactionGnu `xml:"transaction"`
}

type AccountGnu struct {
	Name        string      `xml:"name"`
	Type        string      `xml:"type"`
	Id          string      `xml:"id"`
	Description string      `xml:"description"`
	Parent      string      `xml:"parent"`
	Currency    CurrencyGnu `xml:"commodity"`
}

type CurrencyGnu struct {
	Iso4217 string `xml:"id"`
}

type TransactionGnu struct {
	Id           string      `xml:"id"`
	Currency     CurrencyGnu `xml:"currency"`
	Date         string      `xml:"date-posted>date"`
	CreationDate string      `xml:"date-entered>date"`
	Description  string      `xml:"description"`
	Splits       []SplitGnu  `xml:"splits>split"`
}

type SplitGnu struct {
	Id      string `xml:"id"`
	Value   string `xml:"value"`
	Account string `xml:"account"`
}

type importHelper struct {
	xmlData       []byte
	accountMap    map[string]*Account
	totalCacheMap map[string]int64
	monthCacheMap map[string]int64
	yearCacheMap  map[string]int64
	gnucashMap    map[string]AccountGnu
	root          *RootGnu
}

func newImporter(filename string) *importHelper {
	importer := new(importHelper)
	importer.xmlData = loadGnuCashXml(filename)
	return importer
}

func loadGnuCashXml(filename string) []byte {
	// Assume it's gzipped, I think it's mothe than
	// ten years this is the default
	gzipfile, err := os.Open(filename)
	if err != nil {
		log.Println(err)
	}
	defer gzipfile.Close()

	xmlfile, err := gzip.NewReader(gzipfile)
	if err != nil {
		log.Println(err)
	}
	defer xmlfile.Close()

	xmlData, err := ioutil.ReadAll(xmlfile)
	if err != nil {
		log.Println(err)
	}

	return xmlData
}

// Returns the Split which should be imported as from account
func getFromSplit(t *TransactionGnu) *SplitGnu {
	if t.Splits[0].Value[0] == '-' {
		return &t.Splits[0]
	} else {
		return &t.Splits[1]
	}
}

func getToSplit(t *TransactionGnu) *SplitGnu {
	if t.Splits[0].Value[0] == '-' {
		return &t.Splits[1]
	} else {
		return &t.Splits[0]
	}
}

func (i *importHelper) parseGnuCash() {
	i.root = new(RootGnu)
	xml.Unmarshal(i.xmlData, i.root)
}

func getOrCreateRootAccount(type_ string) *Account {
	filter := k.And(k.F("Type", "=", type_), k.F("Father", "=", "1"))
	query := k.All("Account").Filter(filter)

	var account *Account
	if query.Count() == 0 {
		// Must create
		account = NewAccount()
		account.Type = type_
		account.Father = 1
		account.Name = "Father '" + type_ + "' account"
		k.Save(account)
	} else {
		// Get the existing one!
		var tempAccount Account
		query.Get(&tempAccount)
		account = &tempAccount
	}

	return account
}

func wasAccountAlreadyImported(id string) (bool, *Account) {
	query := k.All("Account").Filter("ImportInfo", "=", id)
	if query.Count() != 0 {
		tempAccount := new(Account)
		query.Get(tempAccount)
		return true, tempAccount
	} else {
		return false, nil
	}
}

func (i *importHelper) generateAccountStructure() {
	rootAccounts := map[string]*Account{
		"asset":   getOrCreateRootAccount("asset"),
		"income":  getOrCreateRootAccount("income"),
		"expense": getOrCreateRootAccount("expense"),
		"equity":  getOrCreateRootAccount("equity")}

	i.accountMap = make(map[string]*Account)
	i.totalCacheMap = make(map[string]int64)
	i.monthCacheMap = make(map[string]int64)
	i.yearCacheMap = make(map[string]int64)
	i.gnucashMap = make(map[string]AccountGnu)

	var rootId string
	var currentAccount *Account
	for _, gnuCashAccount := range i.root.Book.Accounts {
		type_ := strings.ToLower(gnuCashAccount.Type)
		id := gnuCashAccount.Id

		// Do not import account twice if the import is
		// run twice, rather only update wat wasn't imported yet
		var wasIt bool
		if wasIt, currentAccount = wasAccountAlreadyImported(id); !wasIt {
			switch type_ {
			case "root":
				rootId = id
				continue
			case "asset", "cash", "bank", "credit card":
				currentAccount = NewAccount()
				currentAccount.Type = "asset"
			case "expense":
				currentAccount = NewAccount()
				currentAccount.Type = "expense"
			case "income":
				currentAccount = NewAccount()
				currentAccount.Type = "income"
			case "equity":
				currentAccount = rootAccounts["equity"]
			default:
				fmt.Println("Unsupported account type '" + type_ + "'")
				continue
			}
		}

		// Map to find accounts later
		i.accountMap[id] = currentAccount
		i.totalCacheMap[id] = 0
		i.monthCacheMap[id] = 0
		i.yearCacheMap[id] = 0
		i.gnucashMap[id] = gnuCashAccount

		// fill in data
		currentAccount.Name = gnuCashAccount.Name
		currentAccount.Description = gnuCashAccount.Description
		currentAccount.ImportInfo = id

		k.Save(currentAccount)
		// Now link the parent account.
		// If it is the root, link with correct root account
		// (we have many, gnucash has only one)
		var parent *Account
		if gnuCashAccount.Parent != rootId {
			parent = i.accountMap[gnuCashAccount.Parent]
		} else {
			parent = rootAccounts[currentAccount.Type]
		}
		currentAccount.Link("Parent", parent)
	}
}

func wasTransactionAlreadyImported(id string) bool {
	query := k.All("Transaction").Filter("ImportInfo", "=", id)
	return query.Count() != 0
}

var now time.Time = time.Now()
var beginningOfMonth time.Time = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
var beginningOfYear time.Time = time.Date(now.Year(), 1, 1, 0, 0, 0, 0, time.UTC)

func (i *importHelper) updateCache(id string, variation int64, date time.Time) {
	if account, ok := i.gnucashMap[id]; ok {
		i.totalCacheMap[id] += variation

		if date.After(beginningOfMonth) {
			i.monthCacheMap[id] += variation
		}

		if date.After(beginningOfYear) {
			i.yearCacheMap[id] += variation
		}

		parentId := account.Parent
		if parentId != "" {
			i.updateCache(parentId, variation, date)
		}
	}
}

func (i *importHelper) importTransactions() {
	for _, gnuCashTransaction := range i.root.Book.Transactions {
		id := gnuCashTransaction.Id

		// Do not import transactions twice in case of a
		// second import
		if wasTransactionAlreadyImported(id) {
			continue
		}

		fromSplit := getFromSplit(&gnuCashTransaction)
		toSplit := getToSplit(&gnuCashTransaction)

		fromAccount := i.accountMap[fromSplit.Account]
		toAccount := i.accountMap[toSplit.Account]

		transaction := NewTransaction()
		transaction.Description = gnuCashTransaction.Description
		transaction.ImportInfo = id

		var amount, cents int64
		fmt.Sscanf(toSplit.Value, "%d/%d", &amount, &cents)
		transaction.Amount = amount

		referenceTime := "2006-01-02 15:04:05 -0700"
		transaction.Date, _ = time.Parse(referenceTime,
			gnuCashTransaction.Date)

		/*transaction.CreationDate, _ = time.Parse(referenceTime,
		gnuCashTransaction.CreationDate)*/

		k.Save(transaction)
		transaction.Link("From", fromAccount)
		transaction.Link("To", toAccount)

		// Sum up transactions to initialize the caches correctly
		i.updateCache(fromSplit.Account, -amount, transaction.Date)
		i.updateCache(toSplit.Account, amount, transaction.Date)
	}

	// save caches
	for _, gnuCashAccount := range i.root.Book.Accounts {
		type_ := strings.ToLower(gnuCashAccount.Type)
		id := gnuCashAccount.Id

		if type_ != "root" {
			account := i.accountMap[id]
			account.TotalCache += i.totalCacheMap[id]
			account.MonthCache += i.monthCacheMap[id]
			account.YearCache += i.yearCacheMap[id]
			account.LastCacheUpdate = now

			k.Save(account)
		}
	}
}

func (i *importHelper) importBook() {
	i.parseGnuCash()

	k.BeginTransaction()

	i.generateAccountStructure()
	i.importTransactions()

	k.CommitTransaction()

	println("End")
}

func ImportBookFromGnuCash(filename string) {
	importer := newImporter(filename)
	importer.importBook()
}
