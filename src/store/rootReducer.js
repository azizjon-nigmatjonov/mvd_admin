import { combineReducers } from "redux";
import persistReducer from "redux-persist/es/persistReducer";
import { alertReducer } from "./alert/alert.slice";
import { authReducer } from "./auth/auth.slice";
import storage from "redux-persist/lib/storage"
import { constructorTableReducer } from "./constructorTable/constructorTable.slice";
import { tableColumnReducer } from "./tableColumn/tableColumn.slice";
import { tabRouterReducer } from "./tabRouter/tabRouter.slice";
import { applicationReducer } from "./application/application.slice";
import { cashboxReducer } from "./cashbox/cashbox.slice";
import { filterReducer } from "./filter/filter.slice";
import { tableSizeReducer } from "./tableSize/tableSizeSlice";
import { mainReducer } from "./main/main.slice";

const mainPersistConfig = {
  key: "main",
  storage
}

const authPersistConfig = {
  key: "auth",
  storage,
}

const constructorTablePersistConfig = {
  key: "constructorTable",
  storage,
}

const applicationPersistConfig = {
  key: "application",
  storage
}

const tableColumnTablePersistConfig = {
  key: "tableColumn",
  storage,
}

const filtersPersistConfig = {
  key: "filter",
  storage,
}
const tableSizePersistConfig = {
  key: "tableSize",
  storage,
}

const tabRouterPersistConfig = {
  key: "tabRoute",
  storage,
}

const cashboxPersistConfig = {
  key: "cashbox",
  storage,
}

// const groupFieldPersistConfig = {
//   key: "groupField",
//   storage,
// }

const rootReducer = combineReducers({
  main: persistReducer(mainPersistConfig, mainReducer),
  auth: persistReducer(authPersistConfig, authReducer),
  constructorTable: persistReducer(constructorTablePersistConfig, constructorTableReducer),
  application: persistReducer(applicationPersistConfig, applicationReducer),
  tableColumn: persistReducer(tableColumnTablePersistConfig, tableColumnReducer),
  filter: persistReducer(filtersPersistConfig, filterReducer),
  // filter: filterReducer,
  tableSize: persistReducer(tableSizePersistConfig, tableSizeReducer),
  tabRouter: persistReducer(tabRouterPersistConfig, tabRouterReducer),
  cashbox: persistReducer(cashboxPersistConfig, cashboxReducer),
  // groupField: persistReducer(groupFieldPersistConfig, groupFieldReducer),
  alert: alertReducer,
})

export default rootReducer