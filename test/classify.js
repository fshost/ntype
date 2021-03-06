﻿/***
 * Test ntype.classify method
 */

// test using node-tap
var test = require('tap').test,
    ntype = require(__dirname + '/..'),
    Schema = ntype.Schema,
    classify = ntype.classify;

test("The classify method", function(test) {

    test.test("if initialized with a constructor argument", function(test) {

        test.test("defines classes", function(test) {
            var Link = classify(function Link(url, text) {
                this.url = url;
                this.text = text || url;
            });
            test.ok(Link);
            test.test("with an schemas property on the constructor", function(test) {
                test.ok(Array.isArray(Link.schemas));
                test.equal(Link.schemas.length, 0);
                test.end();
            });
            test.test("and an implements method on the constructor", function(test) {
                test.equal(typeof Link.implements, 'function');
                test.test("that allows implementing schemas after the class has been defined", function(test) {
                    var ILink = new Schema({
                        required: true
                    }, {
                        url: String,
                        text: String
                    });
                    Link.implements(ILink);
                    test.equal(Link.schemas.length, 1);
                    test.strictEqual(Link.schemas[0], ILink);
                    test.end();
                });
                test.end();
            });
        });

        test.test("if initialized with an schema argument, followed by a constructor", function(test) {
            var ILink = new Schema({
                required: true
            }, {
                url: String,
                text: String
            });
            var Link = classify(ILink, function Link(url, text) {
                this.url = url;
                this.text = text || url;
            });
            test.ok(Link);
            test.test("initializes a class that implements the schema", function(test) {
                test.equal(Link.schemas.length, 1);
                test.strictEqual(Link.schemas[0], ILink);
                test.end();
            });
            test.test("and can implement other schemas after the class has been defined", function(test) {
                var IName = new Schema({
                    name: String
                });
                Link.implements(IName);
                test.equal(Link.schemas.length, 2);
                test.strictEqual(Link.schemas[0], ILink);
                test.strictEqual(Link.schemas[1], IName);
                test.end();
            });
            test.end();
        });
        test.end();
    });

    test.test("classes defined with classify and that implement an schema", function(test) {
        var ILink = new Schema({
            required: true
        }, {
            url: {
                type: String,
                required: true
            },
            text: {
                type: String,
                value: 'link'
            }
        });
        var Link = classify(ILink, function Link(url, text) {
            this.url = url;
            this.text = text;
        });
        test.ok(Link);

        //testLink(test, Link, 'google.com');
        test.end();
    });

    test.test("classes defined with schemas that extend other schemas", function(test) {
        var ILink = new Schema({
            required: true
        }, {
            url: String,
            text: String
        });
        var IPicLink = new Schema({
            extends: ILink
        }, {
            text: {
                required: false
            },
            imgUrl: {
                type: String,
                required: true
            }
        });
        test.ok(IPicLink);
        var PicLink = classify(IPicLink, function PicLink(url, imgUrl) {
            this.url = url;
            this.imgUrl = imgUrl;
        });
        test.ok(PicLink);
        test.test("will validate the merged descriptors of both schemas", function(test) {

            // no error because extended schema text descriptor overrides the
            // parent schema explicitly setting it to required: false
            test.ok(new PicLink('google.com', 'photobucket.com'));

            // throws error because it has no imageUrl property, which is required
            test.throws(function() {
                new PicLink('google.com');
            });
            test.end();
        });

        test.end();
    });

    test.test("classes defined with options", function(test) {
        var ILink = new Schema({
            required: true
        }, {
            url: {
                type: String,
                required: true
            },
            text: {
                type: String,
                value: 'link'
            }
        });
        var Link = classify(ILink, function Link(url, text) {
            this.url = url;
            this.text = text;
        });
        test.ok(Link);
        testLink(test, Link, 'google.com');

        test.end();
    });
    test.test("classes defined with propagate option", function(test) {
        var ILink = new Schema({
            required: true
        }, {
            url: {
                type: String,
                required: true
            },
            text: {
                type: String,
                value: 'link'
            }
        });
        var Link = classify({
            schema: ILink,
            propagate: true
        }, function Link(args) {});
        test.ok(Link);
        testLink(test, Link, {
            url: 'google.com'
        });

        test.end();
    });
    test.test("classes defined with validateInstance:false option", function(test) {
        var ILink = new Schema({
            required: true
        }, {
            url: {
                type: String,
                required: true
            },
            text: {
                type: String,
                value: 'link'
            }
        });
        var Link = classify({
            schema: ILink,
            validateInstance: false
        }, function Link(args) {

        });
        //test.ok(Link);
        test.ok(new Link({}));


        test.end();
    });
    test.test("classes defined with validateArgs option", function(test) {
        var ILink = new Schema({
            required: true
        }, {
            url: String,
            text: {
                type: String,
                required: true,
                value: 'link'
            }
        });
        var Link = classify({
            schema: ILink,
            validateArgs: true
        }, function Link(args) {
            this.text = args.text;
        });
        test.ok(Link);
        // should pass even though there is nothing set on the instance
        var link = new Link({
            url: 'google.com'
        });
        test.ok(link);
        test.equal(link.url, undefined);
        test.equal(link.text, 'link');
        test.end();
    });

    test.test("classes defined with validateArgs and validateInstance option", function(test) {
        var ILink = new Schema({
            required: true
        }, {
            url: {
                type: String,
                required: true
            },
            text: {
                type: String,
                required: true,
                value: 'link'
            }
        });
        var Link = classify({
            schema: ILink,
            validateArgs: true,
            validateInstance: true
        }, function Link(args) {
            this.url = args.url;
            this.text = args.text;
        });
        test.ok(Link);
        testLink(test, Link, {
            url: 'google.com'
        });
    });

    test.test("classes defined with validateArgs and validateInstance option", function(test) {
        var ILink = new Schema({
            required: true
        }, {
            url: {
                type: String,
                required: true
            },
            text: {
                type: String,
                required: true,
                value: 'link'
            }
        });
        var Link = classify({
            schema: ILink,
            propagate: true,
            validateInstance: true
        }, function Link(args) {});
        test.ok(Link);
        testLink(test, Link, {
            url: 'google.com'
        });
    });
    test.test("classes defined with no constructor", function(test) {
        var ILink = new Schema({
            required: true
        }, {
            url: {
                type: String,
                required: true
            },
            text: {
                type: String,
                required: true,
                value: 'link'
            }
        });
        var Link = classify({
            schema: ILink
        });
        test.ok(Link);
        // as there is no constructor, an anonymous one will be created, and options will by value
        // be set to propagate from arguments 0 to the instance
        testLink(test, Link, {
            url: 'google.com'
        });
    });

    test.end();

});

function testLink(test, Link, args) {
    test.test("will apply instances created from the class against the schema", function(test) {

        test.test("comparing specified types", function(test) {
            var link = new Link(args);
            test.equal(link.url, 'google.com');

            test.test("adding default values", function(test) {
                test.equal(link.text, 'link');
                test.end();
            });

            test.test("throwing errors for invalid types", function(test) {
                test.throws(function() {
                    var link = new Link(27);
                });
                test.end();
            });

            test.test("and throwing errors for missing required values", function(test) {
                test.throws(function() {
                    var link = new Link();
                });
                test.end();
            });

        });
        test.end();
    });
}