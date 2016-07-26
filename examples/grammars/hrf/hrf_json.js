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
// ----------------- lexer -----------------
    var extendToken = chevrotain.extendToken;
    var Lexer = chevrotain.Lexer;
    var Parser = chevrotain.Parser;

    var Identifier = extendToken("Identifier", /[a-zA-z]\w+/);

    var dynamicTokens = [{name: "AttrStrTerm", regex: /name of the player/},
        {name: "AttrNumberTerm", regex: /age of the player/},
        {name: "AttrStrCollectionTerm", regex: /label of all payment_rcs of all payments of all players/},
        {name: "AttrNumberCollectionTerm", regex: /amount of all payment_rcs of all payments of all players/}];

    // tbd - loop on array and prepare array of extendToken, push to allTokens order improtand 


// In ES6, custom inheritance implementation (such as 'extendToken(...)') can be replaced with simple "class X extends Y"...var True = extendToken("True", /true/);
    var Plus = extendToken("Plus", /\+/);
    var Minus = extendToken("Minus", /-/);
    var Div = extendToken("Div", /\\/);
    var Mult = extendToken("Mult", /\*/);
    var And = extendToken("And", /and/);
    var Or = extendToken("Or", /or/);
    var True = extendToken("True", /true/);
    var False = extendToken("False", /false/);
    var Null = extendToken("Null", /null/);
    var IsEqual = extendToken("IsEqual", /is equal to/);
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

            $.SUBRULE($.orExpression);

        });

        this.expressionElement = this.RULE("expressionElement", function() {

            $.OR([
                {ALT: function() { $.SUBRULE($.valueClause); }},
                {ALT: function() { $.SUBRULE($.expressionFunctionElement);}},
                {ALT: function() {
                    $.CONSUME(LBr);
                    $.SUBRULE($.expression);
                    $.CONSUME(RBr);}}// TBD - grammar error

            ]);


        });

        this.expressionFunctionElement = this.RULE("expressionFunctionElement", function() {

            $.OR([

                {ALT: function() { $.SUBRULE($.aggregationFunction);}},
                {ALT: function() { $.SUBRULE($.concatenateFunction);}}
            ]);


        });


        this.orExpression = this.RULE("orExpression", function() {

            $.SUBRULE($.andExpression);
            $.MANY(function() {
                $.CONSUME(Or);
                $.SUBRULE2($.andExpression);
            });


        });

        this.andExpression = this.RULE("andExpression", function() {

            $.SUBRULE($.relationalExpression);
            $.MANY(function() {
                $.CONSUME(And);
                $.SUBRULE2($.relationalExpression);
            });


        });


        this.relationalExpression = this.RULE("relationalExpression", function() {

            $.SUBRULE($.addingExpression);
            $.OPTION(function() {
                $.SUBRULE($.relationalOption);
                $.SUBRULE2($.addingExpression);
            });

            // @formatter:on
        });

        this.addingExpression = this.RULE("addingExpression", function() {

            $.SUBRULE($.multExpression);
            $.MANY(function() {
                $.OR([
                    {ALT: function() { $.CONSUME(Minus) }},
                    {ALT: function() { $.CONSUME(Plus) }}
                ]);
                $.SUBRULE2($.multExpression);
            });


        });

        this.multExpression = this.RULE("multExpression", function() {

            $.SUBRULE($.signExpression);
            $.MANY(function() {

                $.OR([
                    {ALT: function() { $.CONSUME(Mult) }},
                    {ALT: function() { $.CONSUME(Div) }}
                ]);
                $.SUBRULE2($.signExpression);
            });


        });

        this.signExpression = this.RULE("signExpression", function() {
            $.OPTION(function() {
                $.OR([
                    {ALT: function() { $.CONSUME(Minus) }},
                    {ALT: function() { $.CONSUME(Plus) }}

                ]);
            });
            $.SUBRULE($.expressionElement);



        });

        this.relationalOption = this.RULE("relationalOption", function() {
            $.OR([
                {ALT: function() { $.CONSUME(IsEqual) }},
                {ALT: function() { $.CONSUME(IsNotEqual) }},
                {ALT: function() { $.CONSUME(IsLike) }},
                {ALT: function() { $.CONSUME(IsNotLike) }}

            ]);

        });















        this.valueClause = this.RULE("valueClause", function() {
            //$.CONSUME(NumberLiteral);
            $.OR([
                {ALT: function() { $.CONSUME(Identifier) }},
                {ALT: function() { $.CONSUME(NumberLiteral) }},
                {ALT: function() { $.CONSUME(StringLiteral) }}

            ]);


        });

        this.ruleFilterClause = this.RULE("ruleFilterClause", function() {
            //$.CONSUME(NumberLiteral);
            $.OR([
                {ALT: function() { $.CONSUME(FilterBy) }},
                {ALT: function() { $.CONSUME(Where) }}
            ]);

            $.SUBRULE($.expression);



        });

        this.groupByClause = this.RULE("groupByClause", function() {
            //$.CONSUME(NumberLiteral);
            $.OR([
                {ALT: function() { $.CONSUME(GroupBy) }},
                {ALT: function() { $.CONSUME(Per) }}
            ]);
            $.CONSUME(Identifier);
            $.MANY(function() {
                $.CONSUME(Comma);
                $.CONSUME2(Identifier);
            });


        });


        this.aggregationFunction = this.RULE("aggregationFunction", function() {

            $.OR([
                {ALT: function() { $.CONSUME(Avg) }},
                {ALT: function() { $.CONSUME(Sum) }}
            ]);
            $.OR2([
                {
                    ALT: function() {
                        $.CONSUME(LBr);
                        $.SUBRULE($.valueClause);
                        $.CONSUME(RBr);
                    }
                },
                {ALT: function() { $.SUBRULE2($.valueClause);}}
            ]);
            $.OPTION(function() {
                $.SUBRULE($.ruleFilterClause);

            });
            $.OPTION2(function() {
                $.SUBRULE($.groupByClause);

            });
            // $.SUBRULE($.groupByClause); //=> TBD - why causes an error in my grammar?
            // $.SUBRULE($.ruleFilterClause); => TBD - why causes an error in my grammar?
            // @formatter:on
        });

        this.concatenateFunction = this.RULE("concatenateFunction", function() {

            $.CONSUME(Concatenate);
            $.CONSUME(LBr);
            $.SUBRULE($.valueClause);
            $.MANY(function() {
                $.CONSUME(Comma);
                $.SUBRULE2($.valueClause);
            });
            $.CONSUME(RBr);
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
            parser.expression();
            fullResult.parseErrors = parser.errors;

            if (fullResult.lexErrors.length >= 1 || fullResult.parseErrors.length >= 1) {
                throw new Error("sad sad panda")
            }
            return fullResult;
        },

        HrfParser: HrfParser
    }
}));
