"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountStatus = exports.userRole = void 0;
var userRole;
(function (userRole) {
    userRole["ADMIN"] = "ADMIN";
    userRole["AGENT"] = "AGENT";
    userRole["USER"] = "USER";
})(userRole || (exports.userRole = userRole = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["BLOCKED"] = "BLOCKED";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
