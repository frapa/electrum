package main

import (
	"bytes"
	"compress/gzip"
	k "github.com/frapa/candle/kernel"
	"os/exec"
	"strings"
	tpl "text/template"
	"time"
)

// Support for exporting only one book at a time
var gnuExHeader string = `<?xml version="1.0" encoding="utf-8" ?>
<gnc-v2
     xmlns:gnc="http://www.gnucash.org/XML/gnc"
     xmlns:act="http://www.gnucash.org/XML/act"
     xmlns:book="http://www.gnucash.org/XML/book"
     xmlns:cd="http://www.gnucash.org/XML/cd"
     xmlns:cmdty="http://www.gnucash.org/XML/cmdty"
     xmlns:price="http://www.gnucash.org/XML/price"
     xmlns:slot="http://www.gnucash.org/XML/slot"
     xmlns:split="http://www.gnucash.org/XML/split"
     xmlns:sx="http://www.gnucash.org/XML/sx"
     xmlns:trn="http://www.gnucash.org/XML/trn"
     xmlns:ts="http://www.gnucash.org/XML/ts"
     xmlns:fs="http://www.gnucash.org/XML/fs"
     xmlns:bgt="http://www.gnucash.org/XML/bgt"
     xmlns:recurrence="http://www.gnucash.org/XML/recurrence"
     xmlns:lot="http://www.gnucash.org/XML/lot"
     xmlns:addr="http://www.gnucash.org/XML/addr"
     xmlns:owner="http://www.gnucash.org/XML/owner"
     xmlns:billterm="http://www.gnucash.org/XML/billterm"
     xmlns:bt-days="http://www.gnucash.org/XML/bt-days"
     xmlns:bt-prox="http://www.gnucash.org/XML/bt-prox"
     xmlns:cust="http://www.gnucash.org/XML/cust"
     xmlns:employee="http://www.gnucash.org/XML/employee"
     xmlns:entry="http://www.gnucash.org/XML/entry"
     xmlns:invoice="http://www.gnucash.org/XML/invoice"
     xmlns:job="http://www.gnucash.org/XML/job"
     xmlns:order="http://www.gnucash.org/XML/order"
     xmlns:taxtable="http://www.gnucash.org/XML/taxtable"
     xmlns:tte="http://www.gnucash.org/XML/tte"
     xmlns:vendor="http://www.gnucash.org/XML/vendor">
<gnc:count-data cd:type="book">1</gnc:count-data>`

var gnuExFooter string = `
</gnc:book>
</gnc-v2>`

var gnuExBook string = `
<gnc:book version="2.0.0">
<book:id type="guid">{{.Id}}</book:id>`

/* Here you can see what the exporter supports...
 * Only EUR, no scheduled transactions, no budgets
 */
var gnuExRootId string = "a700f2fec12b418b7edfc41130d4679d"
var gnuExCounts string = `
<gnc:count-data cd:type="commodity">1</gnc:count-data>
<gnc:count-data cd:type="account">{{.AccountNum}}</gnc:count-data>
<gnc:count-data cd:type="transaction">{{.TransactionNum}}</gnc:count-data>
<gnc:count-data cd:type="schedxaction">0</gnc:count-data>
<gnc:count-data cd:type="budget">0</gnc:count-data>
<gnc:commodity version="2.0.0">
  <cmdty:space>ISO4217</cmdty:space>
  <cmdty:id>EUR</cmdty:id>
  <cmdty:get_quotes/>
  <cmdty:quote_source>currency</cmdty:quote_source>
  <cmdty:quote_tz/>
</gnc:commodity>
<gnc:account version="2.0.0">
  <act:name>Root Account</act:name>
  <act:id type="guid">a700f2fec12b418b7edfc41130d4679d</act:id>
  <act:type>ROOT</act:type>
  <act:commodity>
    <cmdty:space>ISO4217</cmdty:space>
    <cmdty:id>EUR</cmdty:id>
  </act:commodity>
  <act:commodity-scu>100</act:commodity-scu>
</gnc:account>`

var gnuExAccount string = `
<gnc:account version="2.0.0">
  <act:name>{{ html .Name }}</act:name>
  <act:id type="guid">{{.GnuId}}</act:id>
  <act:type>{{totitle .Type}}</act:type>
  <act:commodity>
    <cmdty:space>ISO4217</cmdty:space>
    <cmdty:id>EUR</cmdty:id>
  </act:commodity>
  <act:commodity-scu>100</act:commodity-scu>
  <act:description>{{ html .Description }}</act:description>
  <act:parent type="guid">{{.ParentId}}</act:parent>
</gnc:account>`

var gnuExTransaction string = `
<gnc:transaction version="2.0.0">
  <trn:id type="guid">{{.GnuId}}</trn:id>
  <trn:currency>
    <cmdty:space>ISO4217</cmdty:space>
    <cmdty:id>EUR</cmdty:id>
  </trn:currency>
  <trn:date-posted>
    <ts:date>{{ date .Date }}</ts:date>
  </trn:date-posted>
  <trn:date-entered>
    <ts:date>{{ date .CreatedOn }}</ts:date>
  </trn:date-entered>
  <trn:description>{{ html .Description }}</trn:description>
  <trn:splits>
    <trn:split>
      <split:id type="guid">{{.FirstSplitId}}</split:id>
      <split:reconciled-state>n</split:reconciled-state>
      <split:value>{{.Amount}}/100</split:value>
      <split:quantity>{{.Amount}}/100</split:quantity>
      <split:account type="guid">{{.ToId}}</split:account>
    </trn:split>
    <trn:split>
	<split:id type="guid">{{.SecondSplitId}}</split:id>
      <split:reconciled-state>n</split:reconciled-state>
      <split:value>-{{.Amount}}/100</split:value>
      <split:quantity>-{{.Amount}}/100</split:quantity>
      <split:account type="guid">{{.FromId}}</split:account>
    </trn:split>
  </trn:splits>
</gnc:transaction>`

var gnuExBookTemplate *tpl.Template
var gnuExCountsTemplate *tpl.Template
var gnuExAccountTemplate *tpl.Template
var gnuExTransactionTemplate *tpl.Template

var guidMap map[string]string

func init() {
	formatDate := func(date time.Time) string {
		return date.Format("2006-01-02 15:04:05 -0700")
	}

	funcs := tpl.FuncMap{
		"totitle": strings.ToTitle,
		"date":    formatDate,
	}

	var err error
	gnuExBookTemplate, err = tpl.New("book").Funcs(funcs).Parse(gnuExBook)
	if err != nil {
		panic(err)
	}

	gnuExCountsTemplate, err = tpl.New("book").Funcs(funcs).Parse(gnuExCounts)
	if err != nil {
		panic(err)
	}

	gnuExAccountTemplate, err = tpl.New("book").Funcs(funcs).Parse(gnuExAccount)
	if err != nil {
		panic(err)
	}

	gnuExTransactionTemplate, err = tpl.New("book").Funcs(funcs).Parse(gnuExTransaction)
	if err != nil {
		panic(err)
	}

	guidMap = make(map[string]string)
}

var remaining int = 0
var guids []string

func genGuid() (string, error) {
	if remaining == 0 {
		strGuids, err := exec.Command("./bin/gen_gnucash_guids").Output()
		if err != nil {
			return "", err
		}

		guids = strings.Split(string(strGuids), "\n")
		remaining = len(guids)
	}

	remaining -= 1
	guid := guids[remaining]
	return guid, nil
}

func generateBookGnuXml(book *Book, buffer *gzip.Writer) error {
	return gnuExBookTemplate.Execute(buffer, book)
}

func generateCountsGnuXml(book *Book, buffer *gzip.Writer) error {
	type Counts struct {
		AccountNum     int
		TransactionNum int
	}

	// Count elements
	accountNum := 1 // ROOT
	transactionNum := 0
	var countAccountAndTransaction func(accounts []k.AnyModel) error
	countAccountAndTransaction = func(accounts []k.AnyModel) error {
		for _, accountInt := range accounts {
			account := accountInt.(*Account)

			// Generate gnucash id
			var err error
			guidMap[account.Id], err = genGuid()
			if err != nil {
				return err
			}

			accountNum += 1
			transactionNum += account.To("In").Count()

			err = countAccountAndTransaction(account.To("SubAccounts").GetAll())
			if err != nil {
				return err
			}
		}

		return nil
	}

	rootAccounts := book.To("RootAccounts").GetAll()
	err := countAccountAndTransaction(rootAccounts)
	if err != nil {
		return err
	}

	data := Counts{AccountNum: accountNum - 3, TransactionNum: transactionNum}

	return gnuExCountsTemplate.Execute(buffer, data)
}

func generateAccountsGnuXml(accounts []k.AnyModel, parentId string, buffer *gzip.Writer, father bool) error {
	var err error

	for _, accountInt := range accounts {
		account := accountInt.(*Account)

		if !father {
			// Export accounts
			type extendedAccount struct {
				*Account
				GnuId    string
				ParentId string
			}

			err = gnuExAccountTemplate.Execute(buffer, extendedAccount{account,
				guidMap[account.Id], parentId})
			if err != nil {
				return err
			}
		}

		// Write subaccounts
		if father {
			err = generateAccountsGnuXml(account.To("SubAccounts").GetAll(),
				parentId, buffer, false)
			if err != nil {
				return err
			}
		} else {
			err = generateAccountsGnuXml(account.To("SubAccounts").GetAll(),
				guidMap[account.Id], buffer, false)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func generateTransactionsGnuXml(accounts []k.AnyModel, buffer *gzip.Writer) error {
	var err error

	for _, accountInt := range accounts {
		account := accountInt.(*Account)

		// Export transactions (only In beacause they must go Out
		// to some account where they are In!!!)
		inTransactions := account.To("In").GetAll()
		generateSingleTransactionGnuXml(inTransactions, buffer)

		err = generateTransactionsGnuXml(account.To("SubAccounts").GetAll(), buffer)
		if err != nil {
			return err
		}
	}

	return nil
}

func generateSingleTransactionGnuXml(transactions []k.AnyModel, buffer *gzip.Writer) error {
	for _, transactionInt := range transactions {
		transaction := transactionInt.(*Transaction)

		type extendedTransaction struct {
			*Transaction
			GnuId         string
			FromId        string
			ToId          string
			FirstSplitId  string
			SecondSplitId string
		}

		var account Account
		transaction.To("From").Get(&account)
		fromId := guidMap[account.Id]
		transaction.To("To").Get(&account)
		toId := guidMap[account.Id]

		gnuId, err := genGuid()
		if err != nil {
			return nil
		}

		split1Id, err := genGuid()
		if err != nil {
			return nil
		}

		split2Id, err := genGuid()
		if err != nil {
			return nil
		}

		data := extendedTransaction{transaction, gnuId, fromId, toId,
			split1Id, split2Id}
		gnuExTransactionTemplate.Execute(buffer, data)
	}

	return nil
}

func generateGnucashXml(book *Book) (*bytes.Buffer, error) {
	xmlBuffer := new(bytes.Buffer)
	xml := gzip.NewWriter(xmlBuffer)

	xml.Write([]byte(gnuExHeader))

	var err error
	err = generateBookGnuXml(book, xml)
	if err != nil {
		return new(bytes.Buffer), nil
	}
	err = generateCountsGnuXml(book, xml)
	if err != nil {
		return new(bytes.Buffer), nil
	}
	err = generateAccountsGnuXml(book.To("RootAccounts").GetAll(), gnuExRootId, xml, true)
	if err != nil {
		return new(bytes.Buffer), nil
	}
	err = generateTransactionsGnuXml(book.To("RootAccounts").GetAll(), xml)
	if err != nil {
		return new(bytes.Buffer), nil
	}

	xml.Write([]byte(gnuExFooter))

	xml.Close()

	return xmlBuffer, nil
}
