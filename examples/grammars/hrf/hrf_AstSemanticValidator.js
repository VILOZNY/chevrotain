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

    }

    ASTSemanticValidator.prototype.visit = function visit(node, context) {

        this.validate(node, context);
    };

    ASTSemanticValidator.prototype.validate = function validate(node, context) {

        var funcNmae = 'validate' + node.getKind();
        ASTSemanticValidator.prototype[funcNmae](node, context);
    };


    ASTSemanticValidator.prototype.validateLogicalExprNode = function validateLogicalExprNode(node, context) {

        var idx = 0;

        while (idx < node.children.length) {
            this.validate(node.children[0], context);
            var childBusinessType = node.children[idx].getBusinessType()
            if(childBusinessType !=  astNodes.BusinessDataType.Boolean)
            {

                if(idx === 0 ) {
                    throw new Error("ASTSemanticValidator failure, unexpected logical operator '" + node.syntaxBox[0].image + "' after ' "
                        + childBusinessType + '" expression in position ' + node.syntaxBox[idx].startColumn);
                }
                else {
                    throw new Error("ASTSemanticValidator failure, unexpected operand, expected 'Boolean' and got '" + childBusinessType
                         + '" expression,  before "' +  node.syntaxBox[0].image + '" in position ' + node.syntaxBox[idx-1].startColumn);

                }

            }
            idx++;
        }

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
                    + rightBusinessType + '" in position ' + (node.syntaxBox[0].startColumn +  node.syntaxBox[0].image.length));

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


    };



    ASTSemanticValidator.prototype.validateIdentifierNode = function validateIdentifierNode(node, context ) {


    };



    ASTSemanticValidator.prototype.validateStructNode = function validateStructNode(node, context ) {


    };


    ASTSemanticValidator.prototype.validateBracketsExprNode = function validateBracketsExprNode(node, context) {

        this.validate(node.children[0], context);

    };



    ASTSemanticValidator.prototype.validateAggFunctionNode = function validateAggFunctionNode(node, context) {


    };




    ASTSemanticValidator.prototype.validateFunctionNode = function validateFunctionNode(node, context) {


    }


    ASTSemanticValidator.prototype.validateFilterClauseNode = function validateFilterClauseNode(node, context) {


    };


    ASTSemanticValidator.prototype.validateGroupClauseNode = function validateGroupClauseNode(node, context) {


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