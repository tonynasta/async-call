

/**
 * @namespace
 */
var async = {};



/**
 * @param {Array} callbacks
 * @return {function}
 */
async.sequence = function(callbacks) {

    return function() {

        var context = this;
        var args = Array.prototype.slice.call(arguments, 0);
        var complete = args.pop();
        var current = -1;

        var next = function(error) {

            var args = Array.prototype.slice.call(arguments, 1);

            current += 1;

            if (error !== null) complete.call(context, error);
            else if (current < callbacks.length) {
                args.push(next);
                callbacks[current].apply(context, args);
            } else {
                args.unshift(null);
                complete.apply(context, args);
            }
        };

        args.unshift(null);

        if (callbacks.length === 0) complete.call(context, null);
        else next.apply(null, args);
    };
};



/**
 * @param {Array} callbacks
 * @return {function}
 */
async.series = function(callbacks) {

    return function() {

        var context = this;
        var args = Array.prototype.slice.call(arguments, 0);
        var complete = args.pop();
        var current = -1;

        var next = function(error) {

            current += 1;

            if (error !== null) {
                complete.call(context, error);
            } else if (current < callbacks.length) {
                callbacks[current].apply(context, args);
            } else {
                complete.call(context, null);
            }
        };

        args.push(next);

        if (callbacks.length === 0) {
            complete.call(context, null);
        } else {
            next(null);
        }
    };
};


/**
 * @param {Array} callbacks
 * @return {function}
 */
async.collect = function(callbacks) {

    return function() {

        var context = this;
        var args = Array.prototype.slice.call(arguments, 0);
        var complete = args.pop();
        var result = [];
        var remain = callbacks.length;
        var lastError = null;

        var save = function(idx) {

            return function(error) {

                var args = Array.prototype.slice.call(arguments, 1);

                if (error !== null) {
                    lastError = error;
                    result[idx] = null;
                } else result[idx] = args.length > 1 ? args : args[0] || null;

                remain -= 1;
                if (remain === 0) {
                    result.unshift(lastError);
                    complete.apply(context, result);
                }
            }
        };

        if (callbacks.length === 0) complete.call(context, null);
        else for (var i = 0, l = callbacks.length; i < l; i += 1) {
            callbacks[i].apply(context, args.concat(save(i)))
        }
    };
};



/**
 * @param {function} callback
 * @return {function}
 */
async.each = function(callback) {

    return function(data, complete) {

        var context = this;
        var current = -1;
        var total = data.length;
        var result = [];

        var next = function(error) {
            if (error !== null) complete(error);
            else {
                current += 1;
                if (current < total) callback.call(context, data[current], saveAndNext);
                else complete(null, result);
            }
        };

        var saveAndNext = function(error) {
            var args = Array.prototype.slice.call(arguments, 1);
            result[current] = args.length > 1 ? args : args[0] || null;
            next(error);
        };

        if (total === 0) complete(null, result);
        else next(null);
    };
};


module.exports = async;
