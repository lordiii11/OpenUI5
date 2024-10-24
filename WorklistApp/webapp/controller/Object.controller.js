/*global location*/
sap.ui.define([
		"zjblessons/WorklistApp/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"zjblessons/WorklistApp/model/formatter"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter
	) {
		"use strict";

		return BaseController.extend("zjblessons.WorklistApp.controller.Object", {

			formatter: formatter,

			onInit : function () {
				const oViewModel = new JSONModel({
					busy : true,
					delay : 0,
					sSelectedTab: 'List',
					bEditMode: false
				});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				this.setModel(oViewModel, "objectView");
			},

			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("worklist", {}, true);
				}
			},

			_onObjectMatched : function (oEvent) {
				var sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("zjblessons_base_Headers", {
						HeaderID :  sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));
			},

			_bindView : function (sObjectPath) {
				var oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel();

				this.getView().bindElement({
					path: sObjectPath,
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding();

				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}

				var sVersion = oElementBinding.getBoundContext().getProperty("Version");
				oViewModel.setProperty("/bDeleteVisible", sVersion === 'D');
			},

			onEditButtonPress() {
				this._setEditMode(true);
			},

			onSaveButtonPress() {
				const oModel = this.getModel();
				const oView = this.getView();
				const oPendingChanges = oModel.getPendingChanges();
				const sPath = oView.getBindingContext().getPath().slice(1);
				
				if(oPendingChanges.hasOwnProperty(sPath)) {
					oView.setBusy(true);
					oModel.submitChanges({
						success: () => {
							oView.setBusy(false);
						},
						error: () => {
							oView.setBusy(false);
						}
					});
				} 
				this._setEditMode(false);
			},

			onCancelButtonPress() {
				this._setEditMode(false);
				this.getModel().resetChanges();
			},

			onDeleteButtonPress() {
				const oView = this.getView();
				const sPath = oView.getBindingContext().getPath();

				new sap.m.MessageBox.confirm('Вы уверены, что хотите удалить эту запись?', {
					title: 'Подтверждение удаления',
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					onClose: function (sAction) {
						if(sAction === sap.m.MessageBox.Action.OK) {
							oView.setBusy(true);
							this.getModel().remove(sPath, {
								success: function ()  {
									oView.setBusy(false);
									sap.m.MessageToast.show("Запись успешно удалена");
									this.onNavBack();
								}.bind(this),
								error: function () {
									sap.m.MessageToast.show("Ошибка при удалении записи");
								}.bind(this)
							})
						}
					}.bind(this)
				})
			},

			_setEditMode(bValue) {
				const oModel = this.getModel("objectView");
				oModel.setProperty('/bEditMode', bValue);
			}
		});

	}
);