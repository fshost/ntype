var ntype = require('..');
var Interface = ntype.Interface;
var classify = ntype.classify;

var IAttributes = exports.IAttributes = new Interface({
    id: String,
    class: String
});

var IComponent = exports.IComponent = new Interface({
    viewName: { type: String, required: true },
    tag: { type: String, default: 'div', required: true },
    children: Array,
    attributes: IAttributes,
    selfClosing: { type: Boolean, default: false }
});

// Link
var ILink = exports.ILink = new Interface({ extends: IComponent },
    {
        viewName: { default: 'link' },
        tag: { default: 'a' },
        url: { type: String, required: true },
        text: String,
        attributes: IAttributes
    });

var Link = exports.Link = classify({
    interface: ILink,
    validateArgs: true
}, function (args) {
    this.viewName = args.viewName || 'link';
    this.tag = args.tag;
    this.text = args.text || args.url;
    this.attributes = this.attributes || {};
    if (this.tag === 'a') this.attributes.href = args.url;
    else this.attributes['data-target'] = args.url;
});

var blog = { name: 'fakeblog' };
blog.nameLink = new Link({
    text: blog.name,
    url: '/data/' + blog.id
});
var nameLink = new Link({
    text: 'name',
    url: '/data/' + blog.id
});