var me; // used by a variety of tests.
module('Lawnchair construction/destruction', {
    setup:function() {
        QUnit.stop();
        // Clear the store to prevent invalid store data killing the tests.
        // e.g. Memory adapter together with "json cyclic" test 
        //      will break test "ctor requires callbacks in each form".
        store.nuke(function() { QUnit.start(); });
    },
    teardown:function() {
    }
});

test('ctor requires callbacks in each form', function() {
    QUnit.stop();
    QUnit.expect(6);

    // raise exception if no ctor callback is supplied
    try {
        var lc2 = new Lawnchair();    
    } catch(e) {
        ok(true, 'exception raised if no callback supplied to init');
    }
    try {
        var lc3 = new Lawnchair({}, {});
    } catch(e) {
        ok(true, 'exception raised if no callback supplied to init, but two args are present');
    }
    try {
        var lc3 = new Lawnchair({});
    } catch(e) {
        ok(true, 'exception raised if no callback supplied to init, but one arg is present');
    }

    var lc = new Lawnchair({name:store.name}, function(ref) {
        ok(true, 'should call passed in callback when using obj+function ctor form')
        equals(this, ref, "lawnchair callback scoped to lawnchair instance")
        equals(ref, this, "lawnchair passes self into callback too")
        QUnit.start()
    });
});

test('independent data stores', function() {
    QUnit.stop();
    QUnit.expect(2);

    new Lawnchair({name: "store1"}, function(store1) {
        store1.nuke(function(){
            store1.save({key: 'apple', quantity: 3}, function() {
                new Lawnchair({name: "store2"}, function(store2) {
                    store1.all(function(r) {
                        equals(r.length, 1);
                        store2.all(function(r) {
                            equals(r.length, 0);
                            QUnit.start();
                        });
                    });
                });
            });
        });
    });
})

module('all()', {
    setup:function() {
        QUnit.stop();

        // I like to make all my variables globals. Starting a new trend.
        me = {name:'brian', age:30};
        store.nuke(function() { QUnit.start(); });
    },
    teardown:function() {
        me = null;
    }
})

test('chainable', function() {
    QUnit.stop();
    QUnit.expect(1);

    same(store.all(function(r) { QUnit.start(); }), store, 'should be chainable (return itself)');
})

test('full callback syntax', function() {
    QUnit.stop();
    QUnit.expect(4);

    store.all(function(r) {
        ok(true, 'calls callback');
        ok(r instanceof Array, 'should provide array as parameter');
        equals(r.length, 0, 'parameter should initially have zero length');
        same(this, store, '"this" should be scoped to the lawnchair object inside callback');
        QUnit.start();
    });
}) 

test('adding, nuking and size tests', function() {
    QUnit.stop();
    QUnit.expect(2);

    store.save(me, function() {
        store.all(function(r) {
            equals(r.length, 1, 'parameter should have length 1 after saving a single record');
            store.nuke(function() {
                store.all(function(r) {
                    equals(r.length, 0, 'parameter should have length 0 after nuking');
                    QUnit.start();                    
                });
            });
        });
    });
})

test( 'shorthand callback syntax', function() {
    QUnit.stop();
    QUnit.expect(2);

    store.all('ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();');

    // Is this test block necessary?
    //
    // var tmp = new Lawnchair({name:'temps', record:'tmp'}, function(){
    //     QUnit.start()
    //     var Temps = this;
    //     equals(this, Temps, 'this is bound to Lawnchair')
    //     QUnit.stop()
    //     Temps.all('ok(temps, "this.name is passed to all callback"); QUnit.start()')
    // })
})

test('scoped variable in shorthand callback', function() {
    QUnit.expect(1);
    QUnit.stop();

    // FIXME fkn qunit being weird here... expect(1)
    var tmp = new Lawnchair({name:'temps', record:'tmp'}, function() {
		this.nuke(function() {
			this.save({a:1}, function() {
				this.each('ok(tmp, "this.record is passed to each callback"); QUnit.start()')
			})
		})
    })
})

module('nuke()', {
    setup:function() {
		QUnit.stop();
        store.nuke(function() { 
			QUnit.start() 
		});
    },
    teardown:function() {
    }
})

test( 'chainable', function() {
    QUnit.expect(1);
	QUnit.stop()

    same(store.nuke(function() { QUnit.start() }), store, 'should be chainable');
})

test( 'full callback syntax', function() {
    QUnit.stop();
    QUnit.expect(2);

    store.nuke(function() {
        ok(true, "should call callback in nuke");
        same(this, store, '"this" should be scoped to the Lawnchair instance');
        QUnit.start();
    });
})

test( 'shorthand callback syntax', function() {
    QUnit.stop();
    QUnit.expect(2);

    store.nuke('ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();');
})

test('json serialization on cyclic reference fails', function() {
    QUnit.stop();
    QUnit.expect(1);

    var cyclic = {
        item: null
    };

    cyclic.item = cyclic;

    try {
        store.save({key: 'test', data: cyclic}, function() {
            // memory adapter can handle cyclic records, so we need to handle that.
            store.all(function(r) {
                equals(r.length, 1, 'after saving one record, num. records should equal to 1');
                QUnit.start();
            });
        }, function(error) {
	    // make sure the store can be loaded
            store.all(function(r) {
                equals(r.length, 0, 'after saving failed, num. records should equal to 0');
                QUnit.start();
            });

            QUnit.start();
        });
    } catch(e) {
        store.all(function(r) {
            equals(r.length, 0, 'after saving failed, num. records should equal to 0');
            QUnit.start();
        });
    }
})

module('save()', {
    setup:function() {
        QUnit.stop();

        // I like to make all my variables globals. Starting a new trend.
        me = {name:'brian', age:30};
        store.nuke(function() { QUnit.start(); });
    },
    teardown:function() {
        me = null;
    }
})

test( 'chainable', function() {
    QUnit.stop();
    QUnit.expect(1);

    same(store.save(me, function() { QUnit.start(); }), store, 'should be chainable');
})

test( 'full callback syntax', function() {
    QUnit.stop();
    QUnit.expect(2);

    store.save(me, function(it) {
        ok(true, 'should call passed in callback');
        same(it, me, 'should pass in original saved object in callback');
        QUnit.start();
    });
})

test( 'shorthand callback syntax', function() {
    QUnit.stop();
    QUnit.expect(2);

    store.save(me, 'ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();');
})

test( 'saving objects', function() { 
    QUnit.stop();
    QUnit.expect(1);

    store.save(me, function() {
        store.save({key:"something", value:"else"}, function(r) {
            store.all(function(r) {
                equals(r.length, 2, 'after saving two keys, num. records should equal to 2');
                QUnit.start();
            });
        });
    })
})

test( 'save object twice', function(){
    QUnit.stop();
    QUnit.expect(2);

    store.save({key:"repeated",field:"first"}, function() {
        store.save({key:"repeated", field:"second"}, function() {
            store.all(function(r) {
                equals(r.length, 1, 'after saving one key twice, num. records should equal to 1');
                // equals(r[0].field, "second", 'after saving one key twice, second version should exist');
                store.get("repeated", function(obj) {
                    equals(obj.field, "second", 'after saving a key twice, second version should exist');
                    QUnit.start();
                });
            });
        });
    })
})

test( 'save without callback', function() {

    QUnit.stop();
    QUnit.expect(1);

    store.save(me, function(obj) {
        var key = obj.key;
        store.save(obj);
        equals(obj.key, key, "save without callback retains key");
        QUnit.start();
    })

});





module('batch()', {
    setup:function() {
        QUnit.stop();

        // I like to make all my variables globals. Starting a new trend.
        me = {name:'brian', age:30};
        store.nuke(function() { QUnit.start(); });
    },
    teardown:function() {
        me = null;
    }
})

test('batch insertion', function(){
    QUnit.expect(3);
    QUnit.stop();

    ok(store.batch, 'batch implemented');
    equals(store.batch([]), store, 'chainable')

    store.batch([{i:1},{i:2}], function() {
        store.all(function(r){
            equals(r.length, 2, 'should be two records from batch insert with array of two objects');
            QUnit.start();
        });
    });
})

test('batch update twice', function(){
    QUnit.expect(2);
    QUnit.stop();
    store.batch([{key:'twice',val:"original"}], function() {
        store.batch([{key:"once", val: 1},{key:'twice',val:"stale"}], function(rs) {
            store.get("once", function(obj){
                equals(obj.val, 1, "update once should work next to update twice");
                store.get("twice", function(obj){
                    equals(obj.val, "stale", "update twice should work");
                    QUnit.start();
                });
            });
        });
    });
});

test( 'full callback syntax', function() {
    QUnit.stop();
    QUnit.expect(2);

    store.batch([{j:'k'}], function() {
        ok(true, 'callback called with full syntax');
        same(this, store, '"this" should be the LAwnchair instance');
        QUnit.start();
    })
})


test('batch large utf-8 dataset', function() {
  var setSize = 300;
  QUnit.stop();
  QUnit.expect(1 + setSize);

  var largeBatchSet = [];
  for(var i = 0; i < setSize; i++) {
	 var utf8text="Tyttebærsyltetøy 炒飯 寿司 김치 bœuf bourguignon ปอเปี๊ยะ μουσακάς водка Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla placerat leo eget libero pellentesque consequat. Praesent sit amet arcu diam. Nam venenatis sapien et diam porta eget auctor odio malesuada. Nunc fringilla lorem sed velit aliquet a pulvinar libero luctus. Aliquam elit enim, venenatis hendrerit sollicitudin et, elementum vitae purus. Proin consequat luctus lacus quis fermentum. Vivamus sodales arcu nunc, eget posuere tortor. Donec vel fermentum tortor. 寿司";

	 largeBatchSet[i]={ key: "batchKey-" + i, value: utf8text + i };
  }

  var done=0;
  var _check = function(key, value){
	 store.get(key, function(r){
		equals(r.value, value, 'batch large value matches');
		if(++done == setSize) QUnit.start();
	 });
  };

  store.batch(largeBatchSet, function(results) {
	 equals(largeBatchSet.length, results.length, "batch large results object and input have same length");
	 for(var i = 0; i < setSize; i++) {
		var l = largeBatchSet[i];
		_check(l.key, l.value);
	 };
  });


});



test( 'shorthand callback syntax', function() {
    QUnit.stop();
    QUnit.expect(2);

    store.batch([{o:'k'}], 'ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();')
})

module('get()', {
    setup:function() {
        QUnit.stop();

        // I like to make all my variables globals. Starting a new trend.
        me = {name:'brian', age:30};
        store.nuke(function() { QUnit.start(); });
    },
    teardown:function() {
        me = null;
    }
});

test( 'should it be chainable?', function() {
    QUnit.expect(1);
    QUnit.stop();

    equals(store.get('foo', function() { QUnit.start(); }), store, 'get chainable');
});

test('get functionality', function() {
    QUnit.expect(6);
    QUnit.stop();

    store.save({key:'xyz', name:'tim'}, function() {
        store.get('xyz', function(r) {
            equals(r.key, 'xyz', 'should return key in loaded object');
            equals(r.name, 'tim', 'should return proper object when calling get with a key');
            store.get('doesntexist', function(s) {
                ok(true, 'should call callback even for non-existent key');
                equals(s, null, 'should return null for non-existent key');
                store.get('xyz', function(r) {
                    // do it again to check for caching issues
                    equals(r.key, 'xyz', 'should return key in reloaded object');
                    equals(r.name, 'tim', 'should return proper object when calling get with a key');
                    QUnit.start();
                });
            });
        });
    });
});

test('get batch functionality', function() {
    QUnit.expect(3);
    QUnit.stop();

    var t = [{key:'test-get'},{key:'test-get-1'}]
    store.batch(t, function() {
        this.get(['test-get','test-get-1'], function(r) {
            equals(r[0].key, 'test-get', "get first object");
            equals(r[1].key, 'test-get-1', "get second object");
            equals(r.length, t.length, "should batch get")
            QUnit.start()
        })
    }) 
});

test( 'full callback syntax', function() {
    QUnit.stop();
    QUnit.expect(2);

    store.get('somekey', function(r){
        ok(true, 'callback got called');
        same(this, store, '"this" should be the Lawnchair instance');
        QUnit.start();
    });
});

test('short callback syntax', function() {
    QUnit.stop();
    QUnit.expect(2);

    store.get('somekey', 'ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();');
});

module('exists()', {
    setup:function() {
        QUnit.stop();
        store.nuke(function() { QUnit.start(); });
    }
});

test('exists functionality', function(){
    QUnit.expect(2);
    QUnit.stop();
    store.save({key:'xyz', name:'tim'}, function() {
        store.exists('xyz', function(r) {
            equals(r, true, 'should exist after save');
            store.exists('imaginary', function(r) {
                equals(r, false, 'should not exist without save');
                QUnit.start();
            });
        });
    });
});

module('remove()', {
    setup:function() {
        QUnit.stop();

        // I like to make all my variables globals. Starting a new trend.
        me = {name:'brian', age:30};
        store.nuke(function() { QUnit.start(); });
    },
    teardown:function() {
        me = null;
    }
});


test( 'chainable', function() {
    QUnit.expect(1);
    QUnit.stop();

    store.save({key:'me', name:'brian'}, function() {
        same(store.remove('me', function() { 
                QUnit.start(); 
             }), store, 'should be chainable');
         
    });
});

test( 'full callback syntax', function() {
    QUnit.stop();
    QUnit.expect(2);

    store.save({key:'somekey', name:'something'}, function() {
        store.remove('somekey', function(r){
            ok(true, 'callback got called');
            same(this, store, '"this" should be the Lawnchair instance');
            QUnit.start();
        });
    });
});

test('short callback syntax', function() {
    QUnit.stop();
    QUnit.expect(2);

    store.save({key:'somekey', name:'something'}, function() {
        store.remove('somekey', 'ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();');
    });
});

test( 'remove functionality', function() {
    QUnit.stop();
    QUnit.expect(2);

    store.save({name:'joni'}, function(r) {
        //store.find("r.name == 'joni'", function(r){
            store.remove(r, function(r) {
                store.all(function(all) {
                    equals(all.length, 0, "should have length 0 after saving, finding, and removing a record using entire object");
                    store.save({key:'die', name:'dudeman'}, function(r) {
                        store.remove('die', function(r){
                            store.all(function(rec) {
                                equals(rec.length, 0, "should have length 0 after saving and removing by string key");
                                QUnit.start();
                            });
                        });
                    });
                });
            });
        //});
    });
}); 

test( 'remove functionality (part 2)', function() {
    QUnit.stop();
    QUnit.expect(7);

    store.save({name:'joni'}, function(r) {
        store.save({name:'mitchell'}, function(r2) {
            store.remove(r, function(r) {
                store.keys(function(keys) {
                    equals(keys.length, 1, "should have length 1 after saving, finding, and removing a record using entire object");
                    equals(keys[0], r2.key, "unrelated elements should be untouched after removing a record using entire object");
                    store.save({key:'die', name:'dudeman'}, function(r) {
                        store.remove('die', function(r){
                            store.all(function(rec) {
                                equals(rec.length, 1, "should have length 1 after saving and removing by string key");
                                store.keys(function(keys) {
                                    equals(keys.length, 1, "should have length 1 after saving and removing by string key");
                                    equals(keys[0], r2.key, "unrelated elements should be untouched after removing a record by string key");
                                    store.remove('xyz', function(r) {
                                        store.keys(function(keys) {
                                            equals(keys.length, 1, "should have length 1 after removing a nonexistent key");
                                            equals(keys[0], r2.key, "unrelated elements should be untouched after removing a nonexistent key");
                                            QUnit.start();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

test( 'batch add, get, and remove', function() {
    QUnit.stop();
    QUnit.expect(16);

    store.batch([{name:'joni', order: 0},
                 {name:'mitchell', key:'lastname', order: 1},
                 {key: 'foo', value: 'bar', order: 2},
                 {key: 'bat', value: 'baz', order: 3},
                 {name: 'the great quux', order: 4}], function(results) {
        equals(results.length, 5, "batch store should return all objects");
        var i;
        for (i=0; i<results.length; i++) {
            equals(results[i].order, i, "batch store should return items in order");
            equals(!!results[i].key, true, "batch store results should contain a key field");
        }
        store.remove(['foo', results[3] /*bat, by object*/], function() {
            store.get([results[0].key, 'lastname', 'foo', 'bat',
                       results[4].key], function(results) {
                equals(results[0].name, 'joni', "1st item untouched");
                equals(results[1].name, 'mitchell', "2nd item untouched");
                equals(results[2], null, "3rd item deleted");
                equals(results[3], null, "4th item deleted");
                equals(results[4].name, 'the great quux', "5th item untouched");
                QUnit.start();
            });
        });
    });
});






