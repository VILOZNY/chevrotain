/*
 * Example Of using Grammar complex grammar inheritance to implement
 * 'Structured natural language' supporting multiple 'spoken languages' using grammar inheritance.
 *
 * 1. An "Abstract" Base Grammar with two concrete grammars extending it.
 * 2. Each concrete grammar has a different lexer
 * 3. This also shows an example of using Token inheritance
 */

var chevrotain = require("chevrotain");

// ----------------- lexer -----------------
var Lexer = chevrotain.Lexer;
var Parser = chevrotain.Parser;
var extendToken = chevrotain.extendToken;
var _ = require("lodash")


var Integer = extendToken("Integer", /\d+/);
var From = extendToken("From", /from/);
var The = extendToken("The", /the/);
var Of = extendToken("Of", /of/);
var Randomly = extendToken("Randomly", /randomly/);
var Identifier = extendToken("Identifier", /\w+/);

var WhiteSpace = extendToken("WhiteSpace", /\s+/);
WhiteSpace.GROUP = Lexer.SKIPPED;

var allBaseTokens = [WhiteSpace, Integer, From, The, Of, Randomly, Identifier]

// ----------------- parser -----------------
function DynamicWhiteSpaceIdentsParser(input, tokens) {

    Parser.call(this, input, allBaseTokens);
    var $ = this;


    this.term = $.RULE("term", function() {
        var operands = []
        var operators = []

        operands.push($.CONSUME(Identifier).image)

        $.MANY(function() {
            operators.push($.SUBRULE($.operator))
            operands.push($.CONSUME2(Identifier).image)
        })

        // we return the full term/expression with all the info of both
        // the operands and the operators (note that the order is meaningful!)
        // semantic validations on this term/expression can be done in a later stage.
        // outside the scope of syntactic analysis.
        return {
            operands:  operands,
            operators: operators
        }
    });

    this.operator = $.RULE("operator", function() {
        // "OR" returns the return value of the chosen alternative
        return $.OR([
            // @formatter:off
            {ALT: function() {
                $.CONSUME(From)
                $.CONSUME(The)
                return "FROM_THE"
            }},
            {ALT: function() {
                $.CONSUME(Randomly)
                $.CONSUME2(From)
                $.CONSUME2(The)
                return "RANDOMLY_FROM_THE"
            }},
            {ALT: function() {
                $.CONSUME(Of)
                $.CONSUME3(The)
                return "OF_THE"
            }}
            // @formatter:on
        ]);
    });

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    Parser.performSelfAnalysis(this);
}

// MyBaseParser extends the base chevrotain Parser.
DynamicWhiteSpaceIdentsParser.prototype = Object.create(Parser.prototype);
DynamicWhiteSpaceIdentsParser.prototype.constructor = DynamicWhiteSpaceIdentsParser;


// ----------------- wrapping it all together -----------------
module.exports = function(text, dynamicIdents) {
    // we only need special handling for identifiers which include whitespace.
    // this is because other Identifiers will be matched by the Identifier Token. (/\w+/)
    var dynamicIdentsWithSpaces = _.filter(dynamicIdents, function(currDynamicIdent) {
        return currDynamicIdent.indexOf(" ") !== -1;
    })

    // convert Identifiers with whitespace to Tokens
    var dyanmicTokensWithSpaces = _.map(dynamicIdentsWithSpaces, function(currDynamicIdent, idx) {
        // extends Identifer!
        return extendToken("dynamicToken" + idx, new RegExp(currDynamicIdent), Identifier)
    })

    // creating a CUSTOM lexer each time because we have different set of Tokens each time!
    var lexer = new Lexer(dyanmicTokensWithSpaces.concat(allBaseTokens));

    var lexResult = lexer.tokenize(text);

    var parser;
    parser = new DynamicWhiteSpaceIdentsParser(lexResult.tokens);

    // invoking the Parser rule returns whatever the parser rule's implementation returns...
    return parser.term();
};
