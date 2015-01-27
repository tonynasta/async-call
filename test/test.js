

var async = require('../async');
var assert = require('assert');



describe('sequence()', function(){

    var foo = function(a, complete) {
        complete(null, a, 'bar');
    };

    var bar = function(a, b, complete) {
        complete(null, a + b);
    };

    var seq = async.sequence([foo, bar])

    it('should pass value to the next callback', function(done){
        seq('foo', function(err, result) {
            if (err) throw err;
            assert.equal(result, 'foobar');
            done();
        });
    });

    it('should be reusable', function(done){
        seq('bar', function(err, result) {
            if (err) throw err;
            assert.equal(result, 'barbar');
            done();
        });
    });


    var thisfoo = function(complete) {
        complete(null, this.foo);
    };


    var thisbar = function(arg, complete) {
        complete(null, arg + this.bar);
    };

    it('should maintain execution context', function(done) {
        async.sequence([thisfoo, thisbar]).call({foo : 'foo', bar : 'bar'}, function(err, result) {
            if (err) throw err;
            assert.equal(result, 'foobar');
            done();
        });
    });
});


describe('series()' , function() {

    var foo = function(a, complete) {
        complete(a == 'foo' ? null : 'unexpected argument');
    };

    var bar = function(b, complete) {
        complete(b == 'foo' ? null : 'unexpected argument');
    };

    var ser = async.series([foo, bar]);

    it('should use same initial arguments', function(done) {
        ser('foo', function(err) {
            assert.ok(err === null);
            done();
        });
    });

    it('should be reusable', function(done) {
        ser('foo', function(err) {
            assert.ok(err === null);
            done();
        });
    });


    var thisfoo = function(complete) {
        complete(this.foo == 'foo' ? null : 'unexpected value');
    };


    var thisbar = function(complete) {
        complete(this.bar == 'bar' ? null : 'unexpected value');
    };

    it('should maintain execution context', function(done) {
        async.series([thisfoo, thisbar]).call({foo : 'foo', bar : 'bar'}, function(err) {
            assert.ok(err === null);
            done();
        });
    });
});


describe('collect()', function() {

    var foo = function(a, complete) {
        complete(null, a + 'foo');
    };

    var bar = function(b, complete) {
        complete(null, b + 'bar');
    };

    var col = async.collect([foo, bar]);

    it('should use same initial arguments and collect values', function(done) {
        col('foo', function(err, fooresult, barresult) {
            assert.ok(err === null);
            assert.equal('foofoo', fooresult);
            assert.equal('foobar', barresult);
            done();
        });
    });

    it('should be reusable', function(done) {
        col('bar', function(err, fooresult, barresult) {
            assert.ok(err == null);
            assert.equal('barfoo', fooresult);
            assert.equal('barbar', barresult);
            done();
        });
    });


    var thisfoo = function(complete) {
        complete(null, this.foo);
    };


    var thisbar = function(complete) {
        complete(null, this.bar);
    };

    it('should maintain execution context', function(done) {
        async.collect([thisfoo, thisbar]).call({foo : 'foo', bar : 'bar'}, function(err, foo, bar) {
            assert.equal('foo', foo);
            assert.equal('bar', bar);
            done();
        });
    });
});


describe('each()', function() {

    var foo = function(a, complete) {
        complete(null, a + 'foo');
    };

    var ec = async.each(foo);

    it('should apply callback to each element', function(done) {
        ec(['1', '2', '3'], function(err, result) {
            if (err) throw err;
            assert.ok(result.length === 3);
            assert.equal('1foo', result[0]);
            assert.equal('2foo', result[1]);
            assert.equal('3foo', result[2]);
            done();
        });
    });

    it('be reusable', function(done) {
        ec(['3', '2', '1'], function(err, result) {
            if (err) throw err;
            assert.ok(result.length === 3);
            assert.equal('3foo', result[0]);
            assert.equal('2foo', result[1]);
            assert.equal('1foo', result[2]);
            done();
        });
    });

    var thisfoo = function(el, complete) {
        complete(null, el + this.foo);
    };

    it('should maintain execution context', function(done) {
        async.each(thisfoo).call({foo : 'foo'}, ['1', '2'], function(err, result) {
            assert.equal(result[0], '1foo');
            assert.equal(result[1], '2foo');
            done();
        });
    });
});



describe('async', function() {

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

    var chn = async.sequence([
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

    it('should do chaining properly', function(done) {
        chn('foo bar', function(err, result) {
            if (err) throw err;
            assert.equal(result, 'foobaz+foofoo barbaz+barbar');
            done();
        });
    });

    it('should do chaining properly more', function(done) {
        chn('bar baz', function(err, result) {
            if (err) throw err;
            assert.equal(result, 'barbaz+barbar bazbaz+bazbaz');
            done();
        });
    });
});
