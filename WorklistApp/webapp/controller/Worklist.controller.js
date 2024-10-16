sap.ui.define([
		"zjblessons/WorklistApp/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/WorklistApp/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("zjblessons.WorklistApp.controller.Worklist", {

			formatter: formatter,

			onInit : function () {
				const oViewModel = new JSONModel({

				});
				this.setModel(oViewModel, "worklistView");
			},

			onSearchByDocumentNumber(oEvent) {
				this._onSearch(oEvent, 'DocumentNumber', FilterOperator.Contains);
			},
			
			onSearchByPlantText(oEvent) {
				this._onSearch(oEvent, 'PlantText', FilterOperator.EQ);
			},

			_onSearch(oEvent, sFieldName, sOperator) {
				const sValue = oEvent.getParameter('query');
				const oTable = this.getView().byId('table');
				oTable.getBinding('items').filter(sValue.length ? [new Filter(sFieldName, sOperator, sValue)] : []);
			},
		});
	}
);