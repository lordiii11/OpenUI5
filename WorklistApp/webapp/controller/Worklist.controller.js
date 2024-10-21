sap.ui.define([
		"zjblessons/WorklistApp/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/WorklistApp/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/Sorter",
		"sap/ui/core/Fragment",
		"sap/f/cards/Header"
	], function (BaseController,JSONModel,formatter,Filter,FilterOperator,Sorter,Fragment,Header) {
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
						}),
						new sap.m.Button({
							icon: this.getResourceBundle().getText('iDecline'),
							type: 'Transparent',
							press: this.onButtonPressDelete.bind(this)
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

			onButtonPressCreate() {
				this._loadCreateDialog();
			},

			onButtonPressDelete(oEvent) {
				const oBindingContext = oEvent.getSource().getBindingContext(),
					sKey = this.getModel().createKey('/zjblessons_base_Headers', {
					HeaderID: oBindingContext.getProperty('HeaderID')
				});
				
				sap.m.MessageBox.confirm("Вы уверены, что хотите удалить эту запись?", {
					title: "Подтверждение удаления",
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					onClose: (sAction) => {
						if(sAction === sap.m.MessageBox.Action.OK) {
							this.getModel().remove(sKey, {
								success: function () {
									sap.m.MessageToast.show("Запись успешно удалена");
								},
								error: function () {
									sap.m.MessageToast.show("Ошибка при удалении записи");
								}
							})
						}
					}
				})
			},

			_loadCreateDialog: async function() {
				if(!this._oDialog) {
					this._oDialog = await Fragment.load({
						name: 'zjblessons.WorklistApp.view.fragment.CreateDialogWindow',
						controller: this,
						id: 'Dialog'
					}).then(oDialog => {
						this.getView().addDependent(oDialog);
						return oDialog;
					});
				}				
				this._oDialog.open();
			},

			onDialogBeforeOpen(oEvent) {
				const oDialog = oEvent.getSource(),
				oParams = {
					Version: 'A'
				},
				oEntry = this.getModel().createEntry('/zjblessons_base_Headers', {properties: oParams});
				oDialog.setBindingContext(oEntry);
			},
			
			onExitButtonPress() {
				this.getModel().resetChanges();
				this._oDialog.close();
			},
			
			onSaveButtonPress(oEvent) {
				this.getModel().submitChanges({
					success: () => {
						this._bindTable();
					}
				});
				this._oDialog.close();
			},

			onButtonPressRefresh() {
				this._bindTable();
				sap.m.MessageToast.show("Данные успешно обновлены");
			}
		});
	}
);