/**
 * Created by I042090 on 13/09/2016.
 */
var lib;
lib = function() {

    /**
     * Base Hrf  ASTNode
     */
    var BusinessDataType = {
            Number : "Number",
            String : "String",
            TimeSpan : "TimeSpan",
            Timestamp : "Timestamp",
            Boolean : "Boolean",
            Date : "Date",
            Time : "Time"
    };


    function ASTNode(kind) {
        this.kind = kind;
        this.children = [];
        this.syntaxBox = [];
    }

    ASTNode.prototype.getKind = function getKind() {

     return this.kind;
     };

    ASTNode.prototype.addChild = function addChild(child) {

        this.children.push(child);
    };
    ASTNode.prototype.addToSyntaxBox = function addToSyntaxBox(token) {

        this.syntaxBox.push(token);
    };

    ASTNode.prototype.serializeProps = function serializeProps(prefix) {
        return "";

    };

    ASTNode.prototype.accept = function accept(visitor, context) {
        visitor.visit(this, context);

    }

    ASTNode.prototype.serialize = function serialize() {
        var str = '{ "class": "' + this.kind + '"';

        str += this.serializeProps(",");

        if (this.children.length > 0) {
            str += ', ' + this.serializeChildren();
        }

        if (this.syntaxBox.length > 0) {
            str = str + ',' + '"syntaxBox": [';
            var idx = 0;
            for (idx = 0; idx < this.syntaxBox.length; idx++) {
                if (idx > 0) {
                    str += ','
                }
                str += '{';
                str = str + '"endColumn": "' + this.syntaxBox[idx].endColumn + '"';
                str = str + ',' + '"endLine": "' + this.syntaxBox[idx].endLine + '"';
                str = str + ',' + '"image": "' + this.syntaxBox[idx].image + '"';
                //str = str + ',' + '"isInheritedInRecovery": "' + this.syntaxBox[idx].isInheritedInRecovery + '"';
                str = str + ',' + '"startColumn": "' + this.syntaxBox[idx].startColumn + '"';
                str = str + ',' + '"startLine": "' + this.syntaxBox[idx].startLine + '"';
                str += '}';
            }
            str += ']';


        }

        str += '}';
        return str;
    }

    ASTNode.prototype.serializeChildren = function serializeChildren() {

        var str = '"children": ['

        var idx = 0;
        for(idx = 0; idx < this.children.length; idx++) {
            if (idx > 0) {
                str += ','
            }
            str += (this.children[idx].serialize());
        }
        str += ']';
        return str;
    }

    /**
     * Base Hrf  Expression AST node
     */
    function BaseExprNode(kind) {
        ASTNode.call(this, kind);
        this.isCollection = "";
        this.businessType;
    }

    BaseExprNode.prototype = Object.create(ASTNode.prototype);
    BaseExprNode.prototype.constructor = BaseExprNode;

    BaseExprNode.prototype.getBusinessType = function getBusinessType() {

        return this.businessType;
    };



    /*BaseExprNode.prototype.serializeProps = function serializeProps(prefix) {

        var j = 0;
    }*/
    /**
     * Base Hrf  or / and node
     */
    function LogicalExprNode(logicalOp) {
        BaseExprNode.call(this, 'LogicalExprNode');
        this.logicalOp = logicalOp;
        this.businessType = BusinessDataType.Boolean;

    }

    LogicalExprNode.prototype = Object.create(BaseExprNode.prototype);
    LogicalExprNode.prototype.constructor = LogicalExprNode;


    LogicalExprNode.prototype.serializeProps = function serializeProps(prefix) {
        var str = prefix + '"logicalOp": "' + this.logicalOp + '"';

        return str;
    };




    /**
     * Base Relational node for comparison operators and Boolean functions (for example <, >, contains)
     *
     */
    function RelationalExprNode(relationalOption ) {
        BaseExprNode.call(this, 'RelationalExprNode');
        this.relationalOption = relationalOption;
        this.businessType = BusinessDataType.Boolean;

    }

    RelationalExprNode.prototype = Object.create(BaseExprNode.prototype);
    RelationalExprNode.prototype.constructor = RelationalExprNode;

    RelationalExprNode.prototype.serializeProps = function serializeProps(prefix) {
        var str = prefix + '"relationalOption": "' + this.relationalOption + '"';

       return str;
    };




    /**
     *  Adding node for arithmetic ( + , - )
     *
     */
    function AddingExprNode(operator ) {
        BaseExprNode.call(this, 'AddingExprNode');
        this.operator = operator;
        this.businessType = BusinessDataType.Number;

    }



    AddingExprNode.prototype = Object.create(BaseExprNode.prototype);
    AddingExprNode.prototype.constructor = AddingExprNode;


    AddingExprNode.prototype.serializeProps = function serializeProps(prefix) {
        var str = prefix + '"operator": "' + this.operator + '"';

        return str;
    };

    /**
     *  Multipication node for arithmetic ( * , / )
     *
     */
    function MultExprNode(operator ) {
        BaseExprNode.call(this, 'MultExprNode');
        this.operator = operator;
        this.businessType = BusinessDataType.Number;

    }



    MultExprNode.prototype = Object.create(BaseExprNode.prototype);
    MultExprNode.prototype.constructor = MultExprNode;

    MultExprNode.prototype.serializeProps = function serializeProps(prefix) {
        var str = prefix + '"operator": "' + this.operator + '"';

        return str;
    };

    /**
     *  Unary Sign node for arithmetic (+ , - )
     *
     */
    function SignExprNode(sign ) {
        BaseExprNode.call(this, 'SignExprNode');
        this.sign = sign;
        this.businessType = BusinessDataType.Number;

    }



    SignExprNode.prototype = Object.create(BaseExprNode.prototype);
    SignExprNode.prototype.constructor = SignExprNode;

    SignExprNode.prototype.serializeProps = function serializeProps(prefix) {
        var str = prefix + '"sign": "' + this.sign + '"';

        return str;
    };

    /**
     *  Abstract  element  node for representing a single expression (recursive definitin)
     *
     */
    function BaseExprElementNode(kind ) {
        ASTNode.call(this, kind);
      //this.kind = "";

    }


    BaseExprElementNode.prototype = Object.create(BaseExprNode.prototype);
    BaseExprElementNode.prototype.constructor = BaseExprElementNode;

    /**
     *  Any type of literal including NIL (number, string, etc...)
     *
     */
    function LiteralNode(value, businessType ) {
        BaseExprElementNode.call(this, 'LiteralNode');
        this.value = value;
        this.businessType = businessType;

    }

    LiteralNode.prototype = Object.create(BaseExprElementNode.prototype);
    LiteralNode.prototype.constructor = LiteralNode;

    LiteralNode.prototype.serializeProps = function serializeProps(prefix) {
        var str = '{ "class": "' + this.kind + '", "value": "' + this.value + '"}';
    };

    LiteralNode.prototype.serializeProps = function serializeProps(prefix) {
        var str = prefix + '"value": "' + this.value + '"';

        return str;
    };





    /**
     *  node for representing vocabulary term (age of the player)
     *
     */
    function IdentifierNode() {
        BaseExprElementNode.call(this, 'IdentifierNode');
        this.rootObject = "";
        this.attribute = "";
        this.associationArray = [];
        this.modifiers = [];
        this.scope = "";

    }


    IdentifierNode.prototype = Object.create(BaseExprElementNode.prototype);
    IdentifierNode.prototype.constructor = IdentifierNode;

    IdentifierNode.prototype.serializeProps = function serializeProps(prefix) {
        var str = prefix + '"businessType": "' + this.businessType + '"';
        var str = str + ',' + '"isCollection": "' + this.isCollection + '"';
        var str = str + ',' + '"rootObject": "' + this.rootObject + '"';

        var str = str + ',' + '"associationArray": [';

        var idx = 0;
        for(idx = 0; idx < this.associationArray.length; idx++) {
            if (idx > 0) {
                str += ','
            }
            str += this.associationArray[idx];
        }
        str += ']';

        var str = ',' + '"modifiers": [';

        var idx = 0;
        for(idx = 0; idx < this.modifiers.length; idx++) {
            if (idx > 0) {
                str += ','
            }
            str += '{' + this.modifiers[idx].name + this.modifiers[idx].value + this.modifiers[idx].value + '}';
        }
        str += ']';



        return str;
    };

    /**
     *  base node for representing a function
     *
     */
    function BaseExprFunctionNode(kind, functionName) {
        BaseExprElementNode.call(this, kind);
        this.functionName = functionName;
    }


    BaseExprFunctionNode.prototype = Object.create(BaseExprElementNode.prototype);
    BaseExprFunctionNode.prototype.constructor = BaseExprFunctionNode;

    /**
     *  node ofr supporting list of expression (with all / any of logiacl operations)
     *
     */
    function StructNode(logicalOp) {
        BaseExprElementNode.call(this, 'StructNode');
        this.logicalOp = logicalOp;
        this.businessType = BusinessDataType.Boolean;

    }


    StructNode.prototype = Object.create(BaseExprElementNode.prototype);
    StructNode.prototype.constructor = StructNode;


    /**
     *  node for supporting (expression)
     *
     */
    function BracketsExprNode() {

        BaseExprElementNode.call(this, 'BracketsExprNode');


    }


    BracketsExprNode.prototype = Object.create(BaseExprElementNode.prototype);
    BracketsExprNode.prototype.constructor = BracketsExprNode;

    BracketsExprNode.prototype.getBusinessType = function getBusinessType() {
        if (children.length > 0)
            return children[0].getBusinessType();

        return undefined;

    };

    /**
     *   node for representing aggregation function (sum of, average...)
     *
     */
    function AggFunctionNode(functionName) {

        BaseExprFunctionNode.call(this, 'AggFunctionNode', functionName);
    }


    AggFunctionNode.prototype = Object.create(BaseExprFunctionNode.prototype);
    AggFunctionNode.prototype.constructor = AggFunctionNode;

    AggFunctionNode.prototype.getBusinessType = function getBusinessType() {


        // TBD - change according to function name
        return BusinessDataType.Number;

    };


    /**
     *   node for representing aggregation function (sum of, average...)
     *
     */
    function FunctionNode(functionName) {
        BaseExprFunctionNode.call(this, 'FunctionNode', functionName);

    }


    FunctionNode.prototype = Object.create(BaseExprFunctionNode.prototype);
    FunctionNode.prototype.constructor = FunctionNode;


    /**
     *   node for representing filter of aggreagtion function ("where age > 30")
     *
     */
    function FilterClauseNode() {
        ASTNode.call(this, 'FilterClauseNode');

    }


    FilterClauseNode.prototype = Object.create(ASTNode.prototype);
    FilterClauseNode.prototype.constructor = FilterClauseNode;

    /**
     *   node for representing grouping of aggregation function ('group by level of player")
     *
     */
    function GroupClauseNode() {
        ASTNode.call(this, 'GroupClauseNode');

    }


    GroupClauseNode.prototype = Object.create( ASTNode.prototype);
    GroupClauseNode.prototype.constructor = GroupClauseNode;

    //module.exports = {};

    module.exports.ASTNode = ASTNode;
    module.exports.BaseExprNode = BaseExprNode;
    module.exports.LogicalExprNode = LogicalExprNode;
    module.exports.RelationalExprNode = RelationalExprNode;
    module.exports.AddingExprNode = AddingExprNode;
    module.exports.MultExprNode = MultExprNode;
    module.exports.SignExprNode = SignExprNode;
    module.exports.BaseExprElementNode = BaseExprElementNode;
    module.exports.LiteralNode = LiteralNode;
    module.exports.IdentifierNode = IdentifierNode;
    module.exports.BaseExprFunctionNode = BaseExprFunctionNode;
    module.exports.StructNode = StructNode;
    module.exports.BracketsExprNode = BracketsExprNode;
    module.exports.FunctionNode = FunctionNode;
    module.exports.FilterClauseNode = FilterClauseNode;
    module.exports.AggFunctionNode = AggFunctionNode;
    module.exports.GroupClauseNode = GroupClauseNode;
    module.exports.BusinessDataType = BusinessDataType;


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