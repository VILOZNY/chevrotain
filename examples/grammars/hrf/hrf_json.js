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
    allTokens.push.apply(allTokens, [And, Or, NumberLiteral, StringLiteral, Comma, Colon, True, False, Null, IsEqual, IsNotEqual, IsLike, IsNotLike, Avg, Sum, Concatenate, Where, FilterBy, GroupBy, Per, LBr, RBr]); //apply();
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

        this.statement = this.RULE("statement", function() {

            $.SUBRULE($.ruleAndStatement);

            /* $.OR([
             { ALT: function () { $.SUBRULE($.ruleAndStatement); }},
             { ALT: function () {  $.SUBRULE($.singleStatement);}}
             ]);*/


        });

        this.singleStatement = this.RULE("singleStatement", function() {

            $.OR([
                {ALT: function() { $.SUBRULE($.ruleValueClause); }},
                {ALT: function() { $.SUBRULE($.ruleAggregationFunction);}},
                {ALT: function() { $.SUBRULE($.ruleConcatenateFunction);}}

            ]);


        });


        this.ruleAndStatement = this.RULE("ruleAndStatement", function() {

            $.SUBRULE($.ruleOrStatement);
            $.MANY(function() {
                $.CONSUME(And);
                $.SUBRULE2($.ruleOrStatement);
            });


        });

        this.ruleOrStatement = this.RULE("ruleOrStatement", function() {

            $.SUBRULE($.singleStatementBoolean);
            $.MANY(function() {
                $.CONSUME(Or);
                $.SUBRULE2($.singleStatementBoolean);
            });


        });


        this.singleStatementBoolean = this.RULE("singleStatementBoolean", function() {

            $.SUBRULE($.singleStatement);
            $.OPTION(function() {
                $.SUBRULE($.ruleComparisonOption);
                $.SUBRULE2($.singleStatement);
            });

            // @formatter:on
        });

        this.ruleComparisonOption = this.RULE("ruleComparisonOption", function() {
            $.OR([
                {ALT: function() { $.CONSUME(IsEqual) }},
                {ALT: function() { $.CONSUME(IsNotEqual) }},
                {ALT: function() { $.CONSUME(IsLike) }},
                {ALT: function() { $.CONSUME(IsNotLike) }}

            ]);

        });


        this.ruleValueClause = this.RULE("ruleValueClause", function() {
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
            $.OR2([
                {
                    ALT: function() {
                        $.CONSUME(LBr);
                        $.SUBRULE($.ruleAndStatement);
                        $.CONSUME(RBr);
                    }
                },
                {ALT: function() { $.SUBRULE2($.ruleAndStatement);}}
            ]);


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


        this.ruleAggregationFunction = this.RULE("ruleAggregationFunction", function() {

            $.OR([
                {ALT: function() { $.CONSUME(Avg) }},
                {ALT: function() { $.CONSUME(Sum) }}
            ]);
            $.OR2([
                {
                    ALT: function() {
                        $.CONSUME(LBr);
                        $.SUBRULE($.ruleValueClause);
                        $.CONSUME(RBr);
                    }
                },
                {ALT: function() { $.SUBRULE2($.ruleValueClause);}}
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

        this.ruleConcatenateFunction = this.RULE("ruleConcatenateFunction", function() {

            $.CONSUME(Concatenate);
            $.CONSUME(LBr);
            $.SUBRULE($.ruleValueClause);
            $.MANY(function() {
                $.CONSUME(Comma);
                $.SUBRULE2($.ruleValueClause);
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
            parser.statement();
            fullResult.parseErrors = parser.errors;

            if (fullResult.lexErrors.length >= 1 || fullResult.parseErrors.length >= 1) {
                throw new Error("sad sad panda")
            }
            return fullResult;
        },

        HrfParser: HrfParser
    }
}));
