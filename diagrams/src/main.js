(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./diagrams_builder', './diagrams_behavior', './side_pane_behavior'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('./diagrams_builder'), require('./diagrams_behavior'), require('./side_pane_behavior'));
    } else {
        // Browser globals (root is window)
        root.main = factory(root.diagrams_builder, root.diagrams_behavior, root.side_pane_behavior);
    }
}(this, function(builder, behavior, sidePane) {
    return {
        drawDiagramsFromParserInstance: function(parserInstanceToDraw, diagramsDiv, navigationMenu) {
            var topRules = parserInstanceToDraw.getGAstProductions().values()
            navigationMenu.innerHTML = builder.buildNavigationMenu(topRules)
            diagramsDiv.innerHTML = builder.buildSyntaxDiagramsText(topRules)
            behavior.initDiagramsBehavior()
            sidePane.initNavigation()
        }
    };
}));