
# async-call

Yet another async library for nodejs


## Installation

    npm install async-call

## Methods

**Flow control** methods:

* [sequence](#sequence)
* [series](#series)
* [collect](#collect)

Working with **collections**:

* [each](#each)



Async methods expects callbacks to be in the following form

    /**
     * @param {...*} args Zero or more parameters
     * @param {function(?*, ...*)} complete Called when method is complete
     */
    var callback = function([args, ] complete) {
        if(ok) complete(null /*, results, ...*/); // pass 'null' explicitly if there is no errors
        else complete('error string, object, code, etc..');
    };


## <a name="sequence"></a>sequence

Calls set of functions sequentially, passing result of one function to another

    var foo = function(a, complete) {
        complete(null, a, 'bar');
    };

    var bar = function(a, b, complete) {
        complete(null, a + b);
    };

    async.sequence([foo, bar])('foo', function(err, result) {
        if (err) throw err;
        console.log(result); // foobar
    });


## <a name="series"></a>series

Calls set of callbacks sequentially providing same initial arguments.
Results are ignored

        var foo = function(a, complete) {
            console.log(a);
            complete(null, 'bar');
        };

        var bar = function(b, complete) {
            console.log(b);
            complete(null);
        };

        // outputs : foo foo
        async.series([foo, bar])('foo', function(err) {
            if (err) throw err;
        });


## <a name="collect"></a>collect

Calls set of callbacks in parallel, providing same inital arguments and collecting values

        var foo = function(a, complete) {
            complete(null, a + 'foo');
        };

        var bar = function(b, complete) {
            complete(null, b + 'bar');
        };

        async.collect([foo, bar])('foo', function(err, res_foo, res_bar) {
            if (err) throw err;
            console.log(res_foo, res_bar); // foofoo foobar
        });


## <a name="each"></a>each

Applies callback for each element in the array

        var foo = function(a, complete) {
            complete(null, a + 'foo');
        };

        async.each(foo)(['1', '2', '3'], function(err, result) {
            if (err) throw err;
            console.log(result); // ['1foo', '2foo', '3foo']
        });


# Features

## Chaining

Methods can be chained together

    var split = function(input, complete) {
        var parts = input.split(' ');
        complete(null, parts[0], parts[1]);
    };

    var buildArray = function(part1, part2, complete) {
        complete(null, [part1, part2]);
    };

    var addBaz = function(input, complete) {
        complete(null, input + 'baz');
    };

    var multiply = function(input, complete) {
        complete(null, input + input);
    };

    var join = function(input, complete) {
        var result = [];
        for (var i in input) result.push(input[i].join('+'));
        complete(null, result.join(' '));
    };

    var algorithm = async.sequence([
        split,
        buildArray,
        async.each(
            async.collect([
                addBaz,
                multiply
            ])
        ),
        join
    ]);


    algorithm('foo bar', function(err, result) {
        console.log(result); // foobaz+foofoo barbaz+barbar
    });


## Reusing

Once chain of callbacks in defined, it can be reused with another set of parameters

    var foo = function(a, complete) {
        complete(null, a + 'foo');
    };

    var bar = function(b, complete) {
        complete(null, b + 'bar');
    };

    var processing = async.sequence([foo, bar, bar]);

    processing('foo', function(err, result) {
        if (err) throw err;
        console.log(result); // foofoobarbar
    });

    processing('bar', function(err, result) {
        if (err) throw err;
        console.log(result); // barfoobarbar
    });


## Passing context

Context applied to async method will be provided for all callbacks in the set


    var foo = function(complete) {
        complete(null, this.foo);
    };

    var bar = function(arg, complete) {
        complete(null, arg + this.bar);
    };

    var sequence = async.sequence([foo, bar]);

    sequence.call({foo : 'foo', bar : 'bar'}, function(err, result) {
        if (err) throw err;
        console.log(result); // foobar
    });


    sequence.call({foo:'bar', bar:'baz'}, function(err, result) {
        if (err) throw err;
        console.log(result); // barbaz
    });



