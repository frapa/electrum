package main

import (
	contact "github.com/frapa/candle/contact"
	k "github.com/frapa/candle/kernel"
	telegram "gopkg.in/telegram-bot-api.v4"
)

func startTelegramBot() {
	bot := contact.NewTelegramBot("339240366:AAG7QR4cFdXRranFWLvlzjOye48OTng_Jjo")

	// Here we define the telegram commands
	bot.DefineCommand("start", startCommand)

	bot.Listen()
}

func startCommand(update telegram.Update, bot *telegram.BotAPI, args []string) bool {
	if len(args) == 1 {
		userTocken := args[0]
		print(userTocken)

		// find out user with this userTocken
		telegramAccount := contact.NewTelegramAccount()
		k.All("TelegramAccount").Filter("Tocken", "=", userTocken).Get(telegramAccount)

		// Save chat id
		telegramAccount.ChatId = update.Message.Chat.ID
		k.Save(telegramAccount)

		// Fill contact with data if the Contact is empty (e.g. steal user data)
		contact := telegramAccount.GetContact()
		if contact.FirstName == "" && update.Message.Chat.FirstName != "" {
			contact.FirstName = update.Message.Chat.FirstName
		}
		if contact.LastName == "" && update.Message.Chat.LastName != "" {
			contact.LastName = update.Message.Chat.LastName
		}
		k.Save(contact)
	}

	return false
}
