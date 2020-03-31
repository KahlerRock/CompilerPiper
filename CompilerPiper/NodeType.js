"use strict";
exports.__esModule = true;
var NodeType = /** @class */ (function () {
    function NodeType(L) {
        this.label = L;
        this.n = [];
    }
    return NodeType;
}());
exports.NodeType = NodeType;
var TreeNode = /** @class */ (function () {
    function TreeNode(sym, token) {
        this.sym = sym;
        this.token = token;
        this.children = [];
    }
    TreeNode.prototype.addChild = function (input) {
        this.children.push(input);
    };
    return TreeNode;
}());
exports.TreeNode = TreeNode;
