
(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('chevrotain'));
    } else {
        // Browser globals (root is window)
        root["HrfParser"] = factory(root.chevrotain).HrfParser;
    }
}(this, function(chevrotain) {
    var astNodes = require('./hrf_AstNodes');
    var hrfSemanticValidator =  require('./hrf_ASTSemanticValidator');
    var terms = require('./terms');


// ----------------- lexer -----------------
    var extendToken = chevrotain.extendToken;
    var Lexer = chevrotain.Lexer;
    var Parser = chevrotain.Parser;

    var Identifier = extendToken("Identifier", /[a-zA-z]\w+/);

    /*var dynamicTokens = [{name: "AttrStrTerm", regex: /name of the player/},
        {name: "AttrNumberTerm", regex: /age of the player/},
        {name: "AttrStrCollectionTerm", regex: /label of all payment_rcs of all payments of all players/},
        {name: "AttrNumberCollectionTerm", regex: /amount of all payment_rcs of all payments of all players/}];*/

    var dynamicTokens = [];

    // tbd - loop on array and prepare array of extendToken, push to allTokens order improtand 
    var dynamicToken ;
    for (var key in terms) {
        dynamicToken = {};
        dynamicToken.name = key.replace(/\s/g, '');
        dynamicToken.regex = new RegExp(key);
        dynamicTokens.push(dynamicToken);
    }

// In ES6, custom inheritance implementation (such as 'extendToken(...)') can be replaced with simple "class X extends Y"...var True = extendToken("True", /true/);
    var Plus = extendToken("Plus", /\+/);
    var Minus = extendToken("Minus", /-/);
    var Div = extendToken("Div", /\//);
    var Mult = extendToken("Mult", /\*/);
    var And = extendToken("And", /and/);
    var Or = extendToken("Or", /or/);
    var True = extendToken("True", /true/);
    var False = extendToken("False", /false/);
    var Null = extendToken("Null", /null/);
    var IsEqual = extendToken("IsEqual", /is\s+equal\s+to\s+/);
    var IsNotEqual = extendToken("IsNotEqual", /is not equal to/);
    var IsLike = extendToken("IsLike", /is like/);
    var IsNotLike = extendToken("IsNotLike", /is not like/);
    /*var LCurly = extendToken("LCurly", /{/);
     var RCurly = extendToken("RCurly", /}/);
     var LSquare = extendToken("LSquare", /\[/);
     var RSquare = extendToken("RSquare", /]/);*/
    var Comma = extendToken("Comma", /,/);
    var Colon = extendToken("Colon", /:/);
    var StringLiteral = extendToken("StringLiteral", /'(?:[^\\']+|\\(?:[bfnrtv'\\/]|u[0-9a-fA-F]{4}))*'/);
//var StringLiteral = extendToken("StringLiteral", /"(?:[^\\"]+|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/);
    var NumberLiteral = extendToken("NumberLiteral", /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/);
// functions tokens
    var Avg = extendToken("Avg", /average of/);
    var Sum = extendToken("Sum", /sum of/);
    var Concatenate = extendToken("Concatenate", /concatenate/);
///////////////////////////////////////////////////////////////
    var Where = extendToken("Where", /where/);


    var FilterBy = extendToken("FilterBy", /filter by/);
    var GroupBy = extendToken("GroupBy", /group by/);
    var Per = extendToken("Per", /per/);
    var LBr = extendToken("LBr", /\(/);
    var RBr = extendToken("RBr", /\)/);
    var WhiteSpace = extendToken("WhiteSpace", /\s+/);
    WhiteSpace.GROUP = Lexer.SKIPPED; // marking WhiteSpace as 'SKIPPED' makes the lexer skip it.

    var allTokens = []//[NumberLiteral, StringLiteral,  Comma, Colon, True, False, Null, IsEqual, IsNotEqual];


    var idx;


    for (idx = 0; idx < dynamicTokens.length; idx++) {
        allTokens.push(extendToken(dynamicTokens[idx].name, dynamicTokens[idx].regex, Identifier));
    }
    allTokens.push.apply(allTokens, [Plus, Minus, Div, Mult, And, Or, NumberLiteral, StringLiteral, Comma, Colon, True, False, Null, IsEqual, IsNotEqual, IsLike, IsNotLike, Avg, Sum, Concatenate, Where, FilterBy, GroupBy, Per, LBr, RBr]); //apply();
    allTokens.push(WhiteSpace);
    allTokens.push(Identifier);

    var JsonLexer = new Lexer(allTokens);


// ----------------- parser -----------------

    function HrfParser(input) {
        // invoke super constructor
        Parser.call(this, input, allTokens, {
                // by default the error recovery / fault tolerance capabilities are disabled
                // use this flag to enable them
                recoveryEnabled: true
            }
        );

        // not mandatory, using <$> (or any other sign) to reduce verbosity (this. this. this. this. .......)
        var $ = this;

        this.expression = this.RULE("expression", function() {

            return $.SUBRULE($.orExpression);

        });

        this.expressionElement = this.RULE("expressionElement", function() {
            var exprElementNode;
            $.OR([
                {ALT: function() { exprElementNode = $.SUBRULE($.valueClause); }},
                {ALT: function() { exprElementNode = $.SUBRULE($.expressionFunctionElement);}},
                {ALT: function() {
                    var lBR = $.CONSUME(LBr);
                    var exprNode = $.SUBRULE($.expression);
                    var rBr = $.CONSUME(RBr);
                    exprElementNode = new astNodes.BracketsExprNode();
                    exprElementNode.addChild(exprNode);
                    exprElementNode.addToSyntaxBox(lBR);
                    exprElementNode.addToSyntaxBox(rBr);
                    }}// TBD - grammar error


            ]);

            return exprElementNode;
        });

        this.expressionFunctionElement = this.RULE("expressionFunctionElement", function() {
            var functionNode;
            $.OR([

                {ALT: function() { $.SUBRULE($.aggregationFunction); functionNode = new astNodes.AggFunctionNode("TBD aggregationFunction");}},
                {ALT: function() { $.SUBRULE($.concatenateFunction); functionNode = new astNodes.FunctionNode("TBD concatenateFunction");}}

            ] );

            return functionNode;
        });


        this.orExpression = this.RULE("orExpression", function() {
            var logicalNode = null;
            var leftAndNode, logicalOp;
            leftAndNode =  $.SUBRULE($.andExpression);
            $.MANY(function() {
                logicalOp = $.CONSUME(Or);
                if(!logicalNode) {
                    logicalNode = new astNodes.LogicalExprNode("or");
                    logicalNode.addChild(leftAndNode);
                }

                logicalNode.addChild( $.SUBRULE2($.andExpression));
                logicalNode.addToSyntaxBox(logicalOp);
            });
            if(logicalNode ) {

                return logicalNode;
            }
            // shrink
            return leftAndNode;

        });

        this.andExpression = this.RULE("andExpression", function() {

            var logicalNode = null;
            var leftRelationalNode, logicalOp;
            leftRelationalNode = $.SUBRULE($.relationalExpression);
            $.MANY(function() {
                logicalOp = $.CONSUME(And);
                if(!logicalNode) {
                    logicalNode = new astNodes.LogicalExprNode("and");
                    logicalNode.addChild(leftRelationalNode);
                }
                logicalNode.addChild($.SUBRULE2($.relationalExpression));
                logicalNode.addToSyntaxBox(logicalOp);
            });

            if(logicalNode ) {

                return logicalNode;
            }
            // shrink
            return leftRelationalNode;
        });


        this.relationalExpression = this.RULE("relationalExpression", function() {

            var relationalNode = null;
            var leftAddingNode, relationalOptionResult;
            leftAddingNode = $.SUBRULE($.addingExpression);
            $.OPTION(function() {
                relationalOptionResult = $.SUBRULE($.relationalOption);
                relationalNode = new astNodes.RelationalExprNode(relationalOptionResult.op);
                relationalNode.addChild(leftAddingNode);
                relationalNode.addChild(($.SUBRULE2($.addingExpression)));
            });

            if(relationalNode ) {
                relationalNode.addToSyntaxBox(relationalOptionResult.token);
                return relationalNode;
            }
            // shrink
            return leftAddingNode;
        });

        this.addingExpression = this.RULE("addingExpression", function() {
            var addingNode= null;
            var leftNode, op;
            leftNode = $.SUBRULE($.multExpression);
            $.MANY(function() {
                $.OR([
                    {ALT: function() { op = $.CONSUME(Minus) }},
                    {ALT: function() { op = $.CONSUME(Plus) }}
                ]);

                if (op instanceof Minus) {
                    addingNode = new astNodes.AddingExprNode('Minus');
                } else if (op instanceof Plus){
                    addingNode = new astNodes.AddingExprNode('Plus');

                }
                //$.SUBRULE2($.multExpression);
                addingNode.addChild(leftNode);
                addingNode.addChild($.SUBRULE2($.multExpression));
                leftNode  = addingNode;
            });
            if(addingNode ) {
                addingNode.addToSyntaxBox(op);
                return addingNode;
            }
            // shrink
            return leftNode;

        });

        this.multExpression = this.RULE("multExpression", function() {
            var multNode= null;
            var leftNode, op;
            leftNode = $.SUBRULE($.signExpression);

            $.MANY(function() {

                $.OR([
                    {ALT: function() { op = $.CONSUME(Mult) }},
                    {ALT: function() { op = $.CONSUME(Div) }}
                ]);


                if (op instanceof Mult) {
                    multNode = new astNodes.MultExprNode('mult');
                } else {
                    multNode = new astNodes.MultExprNode('div');

                }
                multNode.addChild(leftNode);
                multNode.addChild($.SUBRULE2($.signExpression));
                leftNode  = multNode;


            });
            if(multNode ) {
                multNode.addToSyntaxBox(op);
                return multNode;
            }
            // shrink
            return leftNode;

        });

        this.signExpression = this.RULE("signExpression", function() {
            var signNode = null;
            var exprElement, sign;
            $.OPTION(function() {
                $.OR([
                    {ALT: function() { sign = $.CONSUME(Minus) }},
                    {ALT: function() { sign = $.CONSUME(Plus) }}

                ]);
            });

            if (sign instanceof Minus) {
                signNode = new astNodes.SignExprNode('-');
            } else if (sign instanceof(Plus)){
                signNode = new astNodes.SignExprNode('+');

            }
            exprElement = $.SUBRULE($.expressionElement);

            if(signNode)
            {
                signNode.addToSyntaxBox(sign);
                signNode.addChild(exprElement);
                return signNode;
            }

            // shrink
            return exprElement;
        });

        this.relationalOption = this.RULE("relationalOption", function() {
            var relationalOption = {};
            $.OR([
                {ALT: function() { relationalOption.token = $.CONSUME(IsEqual); relationalOption.op = "IsEqual";}},
                {ALT: function() { relationalOption.token = $.CONSUME(IsNotEqual); relationalOption.op = "IsNotEqual"; }},
                {ALT: function() { relationalOption.token = $.CONSUME(IsLike); relationalOption.op = "IsLike"; }},
                {ALT: function() { relationalOption.token = $.CONSUME(IsNotLike); relationalOption.op = "IsNotLike"; }}

            ]);
            return relationalOption;

        });















        this.valueClause = this.RULE("valueClause", function() {
            //$.CONSUME(NumberLiteral);
            var exprNode, value;


            $.OR([
                {ALT: function() { value = $.CONSUME(Identifier); exprNode =  new astNodes.IdentifierNode(terms[value.image]);
                   /* if (value.image === 'age of the player'
                        || value.image === 'amount of all payment_rcs of all payments of all players')
                        {exprNode.businessType = "Number"}
                        else {exprNode.businessType = "String";} */}},
                {ALT: function() { value = $.CONSUME(NumberLiteral) ; exprNode =  new astNodes.LiteralNode(value.image, 'Number');}},
                {ALT: function() { value = $.CONSUME(StringLiteral) ; exprNode = new astNodes.LiteralNode(value.image, 'String');}}

            ]);
            if(exprNode) {
                exprNode.addToSyntaxBox(value) ;
            }
            return exprNode;


        });

        this.ruleFilterClause = this.RULE("ruleFilterClause", function() {
            //$.CONSUME(NumberLiteral);
            var filterNode = new astNodes.FilterClauseNode();
            $.OR([
                {ALT: function() { $.CONSUME(FilterBy) }},
                {ALT: function() { $.CONSUME(Where) }}
            ]);

            filterNode.addChild($.SUBRULE($.expression));
            return filterNode;

        });

        this.groupByClause = this.RULE("groupByClause", function() {
            //$.CONSUME(NumberLiteral);
            var groupNode = new astNodes.GroupClauseNode();
            $.OR([
                {ALT: function() { $.CONSUME(GroupBy) }},
                {ALT: function() { $.CONSUME(Per) }}
            ]);
            $.CONSUME(Identifier);
            $.MANY(function() {
                $.CONSUME(Comma);
                var identifierNode = $.CONSUME2(Identifier);
                groupNode.addChild(identifierNode);
            });
            return groupNode;

        });


        this.aggregationFunction = this.RULE("aggregationFunction", function() {

            var functionNode, elementNode, filterNode, groupNode, name;
            $.OR([
                {ALT: function() { name = $.CONSUME(Avg); }},
                {ALT: function() { name =  $.CONSUME(Sum); }}
            ]);
            // interpreter part
            if (name instanceof Avg) {
                functionNode = new astNodes.AggFunctionNode('Avg');
            } else {
                functionNode = new astNodes.AggFunctionNode('Sum');

            }
            $.OR2([
                {
                    ALT: function() {
                        $.CONSUME(LBr);
                        elementNode = $.SUBRULE($.valueClause);
                        $.CONSUME(RBr);

                    }
                },
                {ALT: function() { $.SUBRULE2($.valueClause);}}

            ]);
            functionNode.addChild(elementNode);
            $.OPTION(function() {
                filterNode = $.SUBRULE($.ruleFilterClause);
                functionNode.addChild(filterNode);
            });
            $.OPTION2(function() {
                groupNode = $.SUBRULE($.groupByClause);
                functionNode.addChild(groupNode);

            });
            return functionNode;
            // $.SUBRULE($.groupByClause); //=> TBD - why causes an error in my grammar?
            // $.SUBRULE($.ruleFilterClause); => TBD - why causes an error in my grammar?
            // @formatter:on
        });

        this.concatenateFunction = this.RULE("concatenateFunction", function() {

            var functionNode = astNodes.FunctionNode("concatenateFunction");
            $.CONSUME(Concatenate);
            $.CONSUME(LBr);
            $.SUBRULE($.valueClause);
            $.MANY(function() {
                $.CONSUME(Comma);
                functionNode.addChild($.SUBRULE2($.valueClause));
            });
            $.CONSUME(RBr);
           return functionNode;
            // @formatter:on
        });


        // @formatter:on

        // very important to call this after all the rules have been defined.
        // otherwise the parser may not work correctly as it will lack information
        // derived during the self analysis phase.
        Parser.performSelfAnalysis(this);
    }

// inheritance as implemented in javascript in the previous decade... :(
    HrfParser.prototype = Object.create(Parser.prototype);
    HrfParser.prototype.constructor = HrfParser;

// ----------------- wrapping it all together -----------------

    return {

        parseHrf: function(text) {
            var fullResult = {};
            var lexResult = JsonLexer.tokenize(text);
            fullResult.tokens = lexResult.tokens;
            fullResult.ignored = lexResult.ignored;
            fullResult.lexErrors = lexResult.errors;
            var parser = new HrfParser(lexResult.tokens);
            var AST;
            //Grammar validation
            AST = parser.expression();
            fullResult.parseErrors = parser.errors;
            // grammar error
            if (fullResult.lexErrors.length >= 1 || fullResult.parseErrors.length >= 1) {
                throw new Error("sad sad panda")
            }
            // valid ST
            str = AST.serialize();
            console.log(str);
            /////////////////////////////////////
            // sematic validation (type check)
            /////////////////////////////////////
            var semanticValidator =   new hrfSemanticValidator.ASTSemanticValidator();
            AST.accept(semanticValidator, null);



            return fullResult;
        },

        HrfParser: HrfParser
    }
}));
