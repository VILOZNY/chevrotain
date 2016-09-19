/**
 * Created by I042090 on 13/09/2016.
 */
var lib;
lib = function() {

    var astNodes = require('./hrf_AstNodes');
    /**
     * Base Hrf  ASTNode validators
     */

    function ASTSemanticValidator() {
       /* this.kind = kind;
        this.children = [];
        this.syntaxBox = [];*/
    }

    ASTSemanticValidator.prototype.validate = function validate(node, context) {

        var funcNmae = 'validate' + node.getKind();
        ASTSemanticValidator.prototype[funcNmae](node, context);
    };


    ASTSemanticValidator.prototype.validateLogicalExprNode = function validateLogicalExprNode(node, context) {

    };



    /**
     * Base Relational node for comparison operators and Boolean functions (for example <, >, contains)
     *
     */
    ASTSemanticValidator.prototype.validateRelationalExprNode = function validateRelationalExprNode(node, context) {
        this.validate(node.children[0], context);


        var leftBusinessType = node.children[0].getBusinessType();
        if(node.relationalOption === "IsLike" || node.relationalOption === "IsNotLike" ) {


            if (
                leftBusinessType != astNodes.BusinessDataType.String) {
                throw new Error("ASTSemanticValidator failure, unexpected relational operator '" + node.syntaxBox[0].image + "' after ' "
                    + leftBusinessType + '" operand in position ' + node.syntaxBox[0].startColumn);

            }

            this.validate(node.children[1], context);

            var rightBusinessType = node.children[1].getBusinessType();
            if (rightBusinessType != astNodes.BusinessDataType.String) {
                throw new Error("ASTSemanticValidator failure, mismatch Type after relational operator '" + node.syntaxBox[0].image + "'," +
                    " expected 'String' instead of  '"
                    + rightBusinessType + '" in position ' + (node.syntaxBox[0].startColumn + 1));

            }
        }

        // else // is / not equal
        else{
            var rightBusinessType = node.children[1].getBusinessType();
            if (rightBusinessType != leftBusinessType) {
                throw new Error("ASTSemanticValidator failure, mismatch Type after relational operator '" + node.syntaxBox[0].image + "'," +
                    " expected '" + leftBusinessType + "' instead of  '"
                    + rightBusinessType + '" in position ' + (node.syntaxBox[0].startColumn + 1));

            }
        }
    };



    ASTSemanticValidator.prototype.validateAddingExprNode = function validateAddingExprNode(node, context) {

        this.validate(node.children[0], context);
        this.validate(node.children[1], context);

        var leftBusinessType = node.children[0].getBusinessType();


        if(leftBusinessType!= astNodes.BusinessDataType.Number){
            throw new Error("validateAddingExprNode failer, unexpected operator '" + node.syntaxBox[0].image + "' after ' "
                + leftBusinessType + '" operand in position ' + node.syntaxBox[0].startColumn );

        }

        var rightBusinessType = node.children[1].getBusinessType();
        if(rightBusinessType != astNodes.BusinessDataType.Number){
            throw new Error("validateAddingExprNode failer, mismatch Type after operator '" + node.syntaxBox[0].image + "', expected 'Number' instead of  '"
                + rightBusinessType + '" in position ' + (node.syntaxBox[0].startColumn + 1));

        }

    };



    ASTSemanticValidator.prototype.validateMultExprNode = function validateMultExprNode(node, context ) {

        this.validate(node.children[0], context);
        this.validate(node.children[1], context);

        var leftBusinessType = node.children[0].getBusinessType();
        if(leftBusinessType!= astNodes.BusinessDataType.Number){
            throw new Error("validateMultExprNode failer, unexpected operator '" + node.syntaxBox[0].image + "' after ' "
                + leftBusinessType + '" operand in position ' + node.syntaxBox[0].startColumn );

        }

        var rightBusinessType = node.children[1].getBusinessType();
        if(rightBusinessType != astNodes.BusinessDataType.Number){
            throw new Error("validateMultExprNode failer, mismatch Type after operator '" + node.syntaxBox[0].image + "'  , expected 'Number' instead of  '"
                + rightBusinessType + '" in position ' + (node.syntaxBox[0].startColumn + 1));

        }
    };




    ASTSemanticValidator.prototype.validateSignExprNode = function validateSignExprNode(node, context ) {

        this.validate(node.children[0], context);
        if(node.children[0].getBusinessType() != astNodes.BusinessDataType.Number) {
            throw new Error("validateSignExprNode failer, mismatch Type, exected 'Number' instead of '"
                                + node.children[0].getBusinessType() +
                            '" in position ' + (node.syntaxBox[0].startColumn + 1));
            return false;
        }


    }




    ASTSemanticValidator.prototype.validateLiteralNode = function validateLiteralNode(node, context ) {

        return true;
    };



    ASTSemanticValidator.prototype.validateIdentifierNode = function validateIdentifierNode(node, context ) {

        return true;
    };



    ASTSemanticValidator.prototype.validateStructNode = function validateStructNode(node, context ) {
        return true;

    };


    ASTSemanticValidator.prototype.validateBracketsExprNode = function validateBracketsExprNode(node, context) {

        return true;

    };



    ASTSemanticValidator.prototype.validateAggFunctionNode = function validateAggFunctionNode(node, context) {

        return true;
    };




    ASTSemanticValidator.prototype.validateFunctionNode = function validateFunctionNode(node, context) {
        return true;

    }


    ASTSemanticValidator.prototype.validateFilterClauseNode = function validateFilterClauseNode(node, context) {
        return true;

    };


    ASTSemanticValidator.prototype.validateGroupClauseNode = function validateGroupClauseNode(node, context) {

        return true;
    };




    //module.exports = {};

    module.exports.ASTSemanticValidator = ASTSemanticValidator;



       /* return {
        ASTNode: ASTNode,
        BaseExprNode, BaseExprNode,
        LogicalExprNode: LogicalExprNode,
        RelationalExprNode: RelationalExprNode,
        AddingExprNode: AddingExprNode,
        MultExprNode: MultExprNode,
        SignExprNode: SignExprNode,
        BaseExprElementNode: BaseExprElementNode,
        LiteralNode: LiteralNode,
        IdentifierNode: IdentifierNode,
        BaseExprFunctionNode: BaseExprFunctionNode,
        StructNode: StructNode,
        BracketsExprNode: BracketsExprNode,
        AggFunctionNode: AggFunctionNode,
        FunctionNode: FunctionNode,
        FilterClauseNode: FilterClauseNode,
        GroupClauseNode: GroupClauseNode

    };*/
}();