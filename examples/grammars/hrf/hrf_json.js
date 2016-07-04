

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

var dynamicTokens = [{name: "AttrStrTerm", regex: /name of the player/}, {name: "AttrNumberTerm", regex: /age of the player/}];

    // tbd - loop on array and prepare array of extendToken, push to allTokens order improtand 


// In ES6, custom inheritance implementation (such as 'extendToken(...)') can be replaced with simple "class X extends Y"...
var True = extendToken("True", /true/);
var False = extendToken("False", /false/);
var Null = extendToken("Null", /null/);
var IsEqual = extendToken("IsEqual", /is equal to/);
var IsNotEqual = extendToken("IsNotEqual", /is not equal to/);
/*var LCurly = extendToken("LCurly", /{/);
var RCurly = extendToken("RCurly", /}/);
var LSquare = extendToken("LSquare", /\[/);
var RSquare = extendToken("RSquare", /]/);*/
var Comma = extendToken("Comma", /,/);
var Colon = extendToken("Colon", /:/);
var StringLiteral = extendToken("StringLiteral", /'(?:[^\\']+|\\(?:[bfnrtv'\\/]|u[0-9a-fA-F]{4}))*'/);
//var StringLiteral = extendToken("StringLiteral", /"(?:[^\\"]+|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/);
var NumberLiteral = extendToken("NumberLiteral", /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/);
var WhiteSpace = extendToken("WhiteSpace", /\s+/);
WhiteSpace.GROUP = Lexer.SKIPPED; // marking WhiteSpace as 'SKIPPED' makes the lexer skip it.

    var allTokens = []//[NumberLiteral, StringLiteral,  Comma, Colon, True, False, Null, IsEqual, IsNotEqual];


    var idx;


    for (idx = 0; idx < dynamicTokens.length; idx++) {
        allTokens.push(extendToken(dynamicTokens[idx].name, dynamicTokens[idx].regex, Identifier));
    }
    allTokens.push.apply(allTokens, [NumberLiteral, StringLiteral,  Comma, Colon, True, False, Null, IsEqual, IsNotEqual]); //apply();
    allTokens.push(WhiteSpace);
    allTokens.push(Identifier);

    var JsonLexer = new Lexer(allTokens);




// ----------------- parser -----------------

function HrfParser(input) {
    // invoke super constructor
    Parser.call(this, input, allTokens, {
        // by default the error recovery / fault tolerance capabilities are disabled
        // use this flag to enable them
        recoveryEnabled: true}
    );

    // not mandatory, using <$> (or any other sign) to reduce verbosity (this. this. this. this. .......)
    var $ = this;

    this.singleStatementBoolean = this.RULE("singleStatementBoolean", function() {
        // @formatter:off
        $.SUBRULE($.ruleValueClause);
        $.SUBRULE($.ruleComparisonOption);
        $.SUBRULE2($.ruleValueClause);
        // @formatter:on
    });

    this.ruleComparisonOption = this.RULE("ruleComparisonOption", function() {
        $.OR([
            { ALT: function () { $.CONSUME(IsEqual) }},
            { ALT: function () { $.CONSUME(IsNotEqual) }}

        ]);

    });


    this.ruleValueClause = this.RULE("ruleValueClause", function() {
        //$.CONSUME(NumberLiteral);
        $.OR([
            { ALT: function () { $.CONSUME(Identifier) }},
            { ALT: function () { $.CONSUME(NumberLiteral) }},
            { ALT: function () { $.CONSUME(StringLiteral) }}

        ]);


    });

    /*this.singleStatementBoolean = this.RULE("singleStatementBoolean", function() {
        // @formatter:off
        $.OR([
            { ALT: function () { $.SUBRULE($.ruleNumericSingleStatementComparison) }},
            { ALT: function () { $.SUBRULE($.ruleStringSingleStatementComparison) }}
        ]);
        // @formatter:on
    });*/

   /* this.ruleNumericSingleStatementComparison = this.RULE("ruleNumericSingleStatementComparison", function() {
        $.SUBRULE($.ruleNumericClause);
        $.SUBRULE($.ruleNumericComparisonOption);
        $.SUBRULE2($.ruleNumericClause);

    });*/



   /* this.ruleNumericClause = this.RULE("ruleNumericClause", function() {
        //$.CONSUME(NumberLiteral);
        $.OR([
            { ALT: function () { $.CONSUME(Identifier) }},
            { ALT: function () { $.CONSUME(NumberLiteral) }}

        ]);


    });*/



    /*this.ruleNumericComparisonOption = this.RULE("ruleNumericComparisonOption", function() {
        $.OR([
            { ALT: function () { $.CONSUME(IsEqual) }},
            { ALT: function () { $.CONSUME(IsNotEqual) }}

        ]);

    });

    this.ruleStringSingleStatementComparison = this.RULE("ruleStringSingleStatementComparison", function() {
        $.SUBRULE($.ruleStringClause);
        $.SUBRULE($.ruleNumericComparisonOption);
        $.SUBRULE2($.ruleStringClause);

    });*/

    /*this.ruleStringClause = this.RULE("ruleStringClause", function() {
        //$.CONSUME(StringLiteral);
        $.OR([
            { ALT: function () { $.CONSUME(Identifier) }},
            { ALT: function () { $.CONSUME(StringLiteral) }}

        ]);

    });*/



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
            parser.singleStatementBoolean();
            fullResult.parseErrors = parser.errors;

            if (fullResult.lexErrors.length >= 1 || fullResult.parseErrors.length >= 1) {
                throw new Error("sad sad panda")
            }
            return fullResult;
        },

        HrfParser: HrfParser
    }
}));
