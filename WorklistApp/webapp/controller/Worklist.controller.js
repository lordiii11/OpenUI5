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
					sCount: '0',
					sItemBarKey: 'All'
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
					filters: this._getTableFilters(),
					urlParameters: {
						$select: 'HeaderID,DocumentNumber,DocumentDate,PlantText,RegionText,Description,Created'	
					},
					events: {
						dataRequested: (oData) => {
							this._getTableCounter();
						}
					}
				})
			},

			_getTableCounter() {
				this.getModel().read('/zjblessons_base_Headers/$count', {
					success: (sCount) => {
						this.getModel('worklistView').setProperty('/sCount', sCount);
					}
				})
			},

			_getTableFilters() {
				const oWorklistModel = this.getModel('worklistView');
				const sSelectedKey = oWorklistModel.getProperty('/sItemBarKey');

				return sSelectedKey === 'All' ? [] : [new Filter('Version', FilterOperator.EQ, 'D')];
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
						new sap.m.Switch({
							state: "{= ${Version} === 'D'}",
							change: this.changeVersion.bind(this)
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
				const oBindingContext = oEvent.getSource().getBindingContext();
				const sVersion = oBindingContext.getProperty('Version');

					if(sVersion !== 'D') {
						sap.m.MessageToast.show("Удаление разрешено только для записей с версией 'D'");
						return;
					}
					const sKey = this.getModel().createKey('/zjblessons_base_Headers', {
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
			},

			onDateRangeChange: function (oEvent) {
				const oDateRange = oEvent.getSource().getDateValue(),
					  oEndDate = oEvent.getSource().getSecondDateValue();
				
				let aFilters = [];
			
				if (oDateRange && oEndDate) {
					aFilters.push(new sap.ui.model.Filter({
						path: "DocumentDate",
						operator: sap.ui.model.FilterOperator.BT,
						value1: oDateRange,
						value2: oEndDate
					}));
				}
			
				const oTable = this.getView().byId("table");
				oTable.getBinding("items").filter(aFilters);
			},

			onIconTabHeaderSelect(oEvent) {
				const sSelectedKey = oEvent.getParameter('key');

				this.getModel('worklistView').setProperty('/sItemBarKey', sSelectedKey);
				this._bindTable();
			},

			changeVersion(oEvent) {
				const sVersion = oEvent.getParameter('state') ? 'D' : 'A';
				const sPath = oEvent.getSource().getBindingContext().getPath();
				const oModel = this.getModel();
				const oData = oModel.getProperty(sPath);
				oData.Version = sVersion;
				oModel.update(sPath, oData, {
					success: () => {
						sap.m.MessageToast.show("Строка успешно обновлена");
					},
					error: () => {
						sap.m.MessageToast.show("Ошибка при обновлении строки");
					}
				})
			}
		});
	}
);