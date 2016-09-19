/**
 * Created by daniel.irwin on 9/19/16.
 */
'use strict';

module.exports = function(options){

    if(typeof options === 'undefined'){
        options = {};
    }

    var subscriptionLength = options.subscriptionLength || 60000;
    var maxSubscribers = options.maxSubscribers || 600;
    var maxBroadcastsReceived = options.maxBroadcastsReceived || 60;

    function now(){
        return new Date().getTime();
    }

    return {
        subscriptionTtl: subscriptionLength,
        maxSubscribers : maxSubscribers,
        maxBroadcastsReceived : maxBroadcastsReceived,

        subscriptions: {},

        numberOfSubscribers : 0,

        subscribe: function (guid, callback) {
            if(guid){
                if(!this.subscriptions[guid] && this.numberOfSubscribers < this.maxSubscribers){
                    this.numberOfSubscribers++;
                    this.subscriptions[guid] = {
                        callback: callback,
                        startOfSubscription: now(),
                        broadcastsReceived : this.maxBroadcastsReceived
                    };
                }
            }
        },

        unsubscribe: function (guid) {
            if(guid && this.subscriptions[guid]){
                this.numberOfSubscribers--;
                delete this.subscriptions[guid];
            }
        },

        unsubscribeAll : function(){
            var self = this;//keeping it browser kosher
            Object.keys(this.subscriptions).forEach(function(subscribor) {
                self.unsubscribe(subscribor);
            });
        },

        broadcast: function (data) {
            var self = this;//keeping it browser kosher
            Object.keys(this.subscriptions).forEach(function(subscribor) {

                var sub = self.subscriptions[subscribor];

                if (sub.startOfSubscription > (now() - self.subscriptionTtl)) {
                    if (sub.callback){
                        if(!self.maxBroadcastsReceived || self.maxBroadcastsReceived < 0){
                            sub.callback(data);
                        }
                        else if(sub.broadcastsReceived > 0){
                            sub.broadcastsReceived--;
                            sub.callback(data);
                        }
                    }
                }
                else {
                    self.unsubscribe(subscribor);
                }

            });
        }
    };
};