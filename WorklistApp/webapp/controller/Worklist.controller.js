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
			}
		});
	}
);