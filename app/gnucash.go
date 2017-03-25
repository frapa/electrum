package main

import (
	k "github.com/frapa/candle/kernel"
	"io"
	"net/http"
	"strconv"
)

func uploadGnucash(writer http.ResponseWriter, request *http.Request) {
	// Check user credentials
	user := request.FormValue("user")
	password := request.FormValue("psw")

	err := k.CheckUserPassword(user, password)
	if err != nil {
		http.Error(writer, http.StatusText(http.StatusUnauthorized),
			http.StatusUnauthorized)
		return
	}

	file, _ /*handler*/, err := request.FormFile("file")
	if err != nil {
		// file wasn't uploaded
		http.Error(writer, http.StatusText(http.StatusBadRequest),
			http.StatusBadRequest)
		return
	}

	group := k.NewGroup()
	k.All("Group").Filter("Name", "=", user).Get(group)

	err = ImportBookFromGnuCash(file, group)
	if err != nil {
		http.Error(writer, http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError)
		return
	}
}

func exportGnucash(writer http.ResponseWriter, request *http.Request) {
	// Check user credentials
	user := request.URL.Query().Get("user")
	password := request.URL.Query().Get("psw")

	err := k.CheckUserPassword(user, password)
	if err != nil {
		http.Error(writer, http.StatusText(http.StatusUnauthorized),
			http.StatusUnauthorized)
		return
	}

	group := new(k.Group)
	k.All("Group").Filter("Name", "=", user).Get(group)

	book := NewBook()
	k.All("Book").ApplyReadPermissionsGroup(group).Limit(1).Get(&book)
	fileContent, err := generateGnucashXml(book)

	if err != nil {
		http.Error(writer, http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError)
	}

	// download file
	writer.Header().Set("Content-Disposition", "attachment; filename=export.gnucash")
	writer.Header().Set("Content-Type", "application/x-gnucash")
	writer.Header().Set("Content-Length", strconv.Itoa(len(fileContent.Bytes())))

	_, err = io.Copy(writer, fileContent)
	if err != nil {
		http.Error(writer, http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError)
	}
}

func initGnucash() {
	http.HandleFunc("/controller/import/gnucash/", uploadGnucash)
	http.HandleFunc("/controller/export/gnucash/", exportGnucash)
}
