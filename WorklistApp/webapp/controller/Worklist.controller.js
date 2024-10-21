sap.ui.define([
		"zjblessons/WorklistApp/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/WorklistApp/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/Sorter"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Sorter) {
		"use strict";

		return BaseController.extend("zjblessons.WorklistApp.controller.Worklist", {

			formatter: formatter,

			onInit : function () {
				const oViewModel = new JSONModel({

				});
				this.setModel(oViewModel, "worklistView");
			},

			onBeforeRendering: function() {
				this._bindTable();		
			},

			_bindTable(){
				const oTable = this.getView().byId('table');
				oTable.bindItems({
					path: '/zjblessons_base_Headers',
					sorter: [new Sorter('DocumentDate', true)],
					template: this._getTableTemplate(),
					urlParameters: {
						$select: 'HeaderID,DocumentNumber,DocumentDate,PlantText,RegionText,Description,Created'	
					}
				})
			},

			_getTableTemplate(){
				const oTemplate = new sap.m.ColumnListItem({
					type: 'Navigation',
					cells: [
						new sap.m.Text({
							text: '{DocumentNumber}'
						}),
						new sap.m.Text({
							text: '{DocumentDate}'
						}),
						new sap.m.Text({
							text: '{PlantText}'
						}),
						new sap.m.Text({
							text: '{RegionText}'
						}),
						new sap.m.Text({
							text: '{Description}'
						}),
						new sap.m.Text({
							text: '{Created}'
						})
					]
				});

				return oTemplate;
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