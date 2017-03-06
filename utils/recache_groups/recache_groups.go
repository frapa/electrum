package main

import (
	k "github.com/frapa/candle/kernel"
)

func main() {
	k.BeginTransaction()
	allModels := k.All("BaseModel").GetAll()

	count := 0
	for _, model := range allModels {
		groups := model.To("Groups")
		for groups.Next() {
			var group k.Group
			groups.Get(&group)

			group.TargetCacheGroup(model)
		}

		count++
	}

	println(count)
	k.CommitTransaction()
}
