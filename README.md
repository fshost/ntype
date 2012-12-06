ntype
=====

A Node.js library for defining and implementing class interface type structures
##### Installation

    npm install ntype

##### Description
Ntype is a fairly simple library for Node.js defining interfaces for class structure and auto-type checking in javascript, and a few other things.  This is an alpha release, and although there are presently some 600+ unit tests (using TAP) this definitely at the 'use at your own risk' stage of development.

##### Why?

This is generally useful for some of my projects as I wanted a place that I could easily refer to and scan through as a reference for needed structures for classes, such as controllers containing template data &etc. and to use type catching for some potential errors without adding a lot of extra but repetive code for this in all my classes. Using typed interfaces allows me to catch of errors that otherwise show up later in ways more difficult to track-down and debug, and by keeping them in one place I am able to keep my code and planning more organized.  They also supplement some of the functionality of writing tests.  However, I didn't want to be forced to use this for everything I write or use (otherwise I would just use TypeScript, Script#, or something similar) and I wanted it to be lightweight and easy to use and understand.

-----------

#### Classes

#####Descriptor

Defines property attributes
- required - if true, instance created with undefined value for the property will throw
- type - native Class types, i.e. Object, Date, Function, RegExp, String, Boolean, Array
- default - if specified, undefined property will be set to this value
- validate (custom validation function, will be passed value and the Descriptor instance as arguments)

##### Interface

Interfaces define and contain Descriptors that collectively define class instance structure types and defaults (in the form of an array of Descriptor instances) and additional code for things like extending and validating them.  Javascript does not have true interfaces, and this may not fit your pre-conceived idea of what an interface is exactly, depending on what other languages you program in.  The name works fine for me as they basically define properties a class should have, including their type.  Interfaces can be extended with other interfaces, and classes can implement more than one interface. They provide a nice, organized layout for class structures and partial structures that your code will need.  Aside from the fact that classify (see below) defined classes will automatically check instances against these interfaces, a given interface can have its validate method called on any object at any time, so they can also server as general validators (and allow for custom validation attributes in Descriptors (see above).  Interfaces look similar to ORM/ODM Model Schemas and could probably double in that capacity, especially useful if you will be instantiating classes based on said schemas.

arguments:
[options] - not required, but should be first argument if provided.
  - required: if provided sets the default value for descriptor attributes (useful if all properties in the interface should be required to have values)
  - validate: if provided sets the default validate function for all propery descriptors,
  - extends: specify a parent interface this interface will extended
  
example usage:
      var ILink = new Interface({ link: String, text: String });
      var ILink = new Interface({ required: true }, { link: String, text: { type: String, default: 'link' } });
      var IPicLink = new Interface({ extends: ILink }, { imgUrl: String });
      (see tests for more examples)

#### Methods

##### classify

 the primary method exposed by the library for external use, simply defines classes if passed a constructor that can implement interfaces by adding properties to the Class constructor instance (not the class instance or prototype, so they will not affect your class instances themselves) and checking the value returned by  the constructor against implemented interface(s).  Interfaces can be implemented upon class definition or later using the implements method.

###### arguments
- interface - optional, if specified, the defined class will implement the interface
- constructor - the class constructor function

###### example usage:
    var Link = classify(function Link(link, text) { this.link = link; this.text = text; });
    Link.implements(ILink);
    var Link = ntype.classify(ILink, function Link(link, text) { this.link = link; this.text = text; });
(see tests for more examples)
   
ntype expose a few additional methods and properties used internally as they may be generally useful:

 - type: gets extended type, similarly to typeof. Generally follows Ecmascript 6 spec (distinguish between vanilla objects, arrays, dates, and regexes; NaN returns NaN instead of Number, null for null, etc)

 - hasValue: returns whether value evaluates to something other than null or undefined

 - Type: an object that maps types (i.e. native Class Functions, e.g. String, Object, etc.) to their string equivalents 

---------------

#### Roadmap

This is pretty much a work in progress and I'm not sure where I may go with it.  It fills a need I have currently.  I may extend classify to allow more detailed / fine-grained class structures, most likely at least to allow interface-like class to be specified for applying against arguments, and possibly some other features, such as automated test-generations based on interface and class definitions and a build mechanism so that they could be used in certain environments and not in others (e.g. test and dev, but turned off in production).  Suggestions are welcome.

-----------
License
(The MIT License)

Copyright (c) 2011 Nathan Cartwright <fshost@yahoo.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.