package main

import (
	k "github.com/frapa/candle/kernel"
)

type PredefinedReport struct {
	*k.BaseModel
	Name        string
	ShortName   string
	Description string
	ImageUrl    string
	ViewClass   string
}

func NewPredefinedReport() *PredefinedReport {
	r := new(PredefinedReport)
	r.BaseModel = k.NewBaseModel()
	return r
}

func init() {
	k.RegisterModel(NewPredefinedReport)
	k.RegisterRestResource(NewPredefinedReport())
}

type PredefinedReportSettings struct {
	*k.BaseModel
	Json string
}

func NewPredefinedReportSettings() *PredefinedReportSettings {
	rs := new(PredefinedReportSettings)
	rs.BaseModel = k.NewBaseModel()
	return rs
}

func init() {
	k.DefineLink(NewPredefinedReportSettings(), "Report", NewPredefinedReport(), "Settings")

	k.RegisterModel(NewPredefinedReportSettings)
	k.RegisterRestResource(NewPredefinedReportSettings())
}
