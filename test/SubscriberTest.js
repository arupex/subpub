/**
 * Created by daniel.irwin on 11/24/15.
 */
describe('Subscription Service', function(){

    const subscriptionLength = 100;
    const maxSubscribers = 5;
    const maxBroadcast = 5;

    var subscription = require('../index')({
        subscriptionLength : subscriptionLength,
        maxSubscribers : maxSubscribers,
        maxBroadcastsReceived : maxBroadcast
    });

    var assert = require('assert');

    it('Test broadcast', function(done){
        subscription.subscribe('dirwin', (data) => {
            assert.equal(data, 'test broadcast');
            subscription.unsubscribeAll();
            done();
        });

        subscription.broadcast('test broadcast');
    });

    it('Test multi-broadcast', function(done){
        var count = 0;
        function partial(){
            ++count;
            if(count === 2){
                subscription.unsubscribeAll();
                done();
            }
        }

        subscription.subscribe('dirwin', (data) => {
            assert.equal(data, 'test broadcast');
            partial();
        });

        subscription.subscribe('other', (data) => {
            assert.equal(data, 'test broadcast');
            partial();
        });

        subscription.broadcast('test broadcast');
    });

    it('Test unsubscribe', function(done){
        subscription.subscribe('dirwin', () => {
            assert.fail();
        });

        subscription.unsubscribe('dirwin');

        subscription.broadcast('test broadcast');

        setTimeout(function(){
            subscription.unsubscribeAll();
            done();
        }, subscriptionLength * 2);

    });

    it('Test Subscription Length', function(done){
        subscription.subscribe('dirwin', () => {
            assert.fail();
        });

        setTimeout(function(){
            subscription.broadcast('test broadcast');
        }, subscriptionLength);

        setTimeout(function(){
            subscription.unsubscribeAll();
            done();
        }, subscriptionLength * 2);

    });

    it('Too Many Subscriptions', function(done){
        for(var i = 0; i < maxSubscribers+1; ++i){
            subscription.subscribe(i, () => {
                if(i === maxSubscribers){
                    assert.fail()
                }
            });
        }
        setTimeout(done, 1000);
    });

    it('Too Many Broadcasts', function(done){
        var value = 0;
        subscription.subscribe('testBroadcastMax', () => {
            if(value === maxBroadcast){
                assert.fail()
            }
            value++;
        });

        for(var i = 0; i < maxBroadcast+1; ++i){
            subscription.broadcast();
        }

        setTimeout(done, 1000);
    });

});