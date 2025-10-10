"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_route_1 = require("../modules/users/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const router_1 = require("../modules/wallet/router");
const transaction_route_1 = require("../modules/transaction/transaction.route");
exports.router = (0, express_1.Router)();
const moduleRouters = [
    {
        path: "/auth",
        route: auth_route_1.AuthRouter,
    },
    {
        path: "/users",
        route: user_route_1.UserRouter,
    },
    {
        path: "/wallets",
        route: router_1.WalletRouter,
    },
    {
        path: "/transactions",
        route: transaction_route_1.TransactionsRouter,
    },
];
moduleRouters.map((route) => {
    exports.router.use(route.path, route.route);
});
