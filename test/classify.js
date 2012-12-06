/***
 * Test ntype.classify method
 */

// test using node-tap
var test = require('tap').test,
    ntype = require('..'),
    Interface = ntype.Interface,
    classify = ntype.classify;

test("The classify method", function (test) {

    test.test("if initialized with a constructor argument", function (test) {

        test.test("defines classes", function (test) {
            var Link = classify(function Link(url, text) {
                this.url = url;
                this.text = text || url;
            });
            test.ok(Link);
            test.test("with an interfaces property on the constructor", function (test) {
                test.ok(Array.isArray(Link.interfaces));
                test.equal(Link.interfaces.length, 0);
                test.end();
            });
            test.test("and an implements method on the constructor", function (test) {
                test.equal(typeof Link.implements, 'function');
                test.test("that allows implementing interfaces after the class has been defined", function (test) {
                    var ILink = new Interface({ required: true }, {
                        url: String,
                        text: String
                    });
                    Link.implements(ILink);
                    test.equal(Link.interfaces.length, 1);
                    test.strictEqual(Link.interfaces[0], ILink);
                    test.end();
                });
                test.end();
            });
        });

        test.test("if initialized with an interface argument, followed by a constructor", function (test) {
            var ILink = new Interface({ required: true }, {
                url: String,
                text: String
            });
            var Link = classify(ILink, function Link(url, text) {
                this.url = url;
                this.text = text || url;
            });
            test.ok(Link);
            test.test("initializes a class that implements the interface", function (test) {
                test.equal(Link.interfaces.length, 1);
                test.strictEqual(Link.interfaces[0], ILink);
                test.end();
            });
            test.test("and can implement other interfaces after the class has been defined", function (test) {
                var IName = new Interface({ name: String });
                Link.implements(IName);
                test.equal(Link.interfaces.length, 2);
                test.strictEqual(Link.interfaces[0], ILink);
                test.strictEqual(Link.interfaces[1], IName);
                test.end();
            });
            test.end();
        });
        test.end();
    });
    
    test.test("classes defined with classify and that implement an interface", function (test) {
        var ILink = new Interface({ required: true }, {
            url: { type: String, required: true },
            text: { type: String, default: 'link' }
        });
        var Link = classify(ILink, function Link(url, text) {
            this.url = url;
            this.text = text;
        });
        test.ok(Link);
        test.test("will apply instances created from the class against the interface", function (test) {
            
            test.test("comparing specified types", function (test) {
                var link = new Link('google.com');
                test.equal(link.url, 'google.com');

                test.test("adding default values", function (test) {
                    test.equal(link.text, 'link');
                    test.end();
                });

                test.test("throwing errors for invalid types", function (test) {
                    test.throws(function () {
                        var link = new Link(27);
                    });
                    test.end();
                });

                test.test("and throwing errors for missing required values", function (test) {
                    test.throws(function () {
                        var link = new Link();
                    });
                    test.end();
                });

            });
            test.end();
        });
        test.end();
    });

    test.test("classes defined with interfaces that extend other interfaces", function (test) {
        var ILink = new Interface({ required: true }, {
            url: String,
            text: String
        });
        var IPicLink = new Interface({ extends: ILink }, {
            text: { required: false },
            imgUrl: { type: String, required: true }
        });
        test.ok(IPicLink);
        var PicLink = classify(IPicLink, function PicLink(url, imgUrl) {
            this.url = url;
            this.imgUrl = imgUrl;
        });
        test.ok(PicLink);
        test.test("will validate the merged descriptors of both interfaces", function (test) {
            // no error because extended interface text descriptor not required
            test.ok(new PicLink('google.com', 'photobucket.com'));
            test.throws(function () { new PicLink('google.com'); });
            test.end();
        });

        test.end()
    });

    test.end();
});
