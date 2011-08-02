/*
    A brand new jquery twitter plugin like you've never seen before!
    
    Author: Davide Callegari - http://www.brokenseal.it/
    Home page: http://github.com/brokenseal/jquery-twitter/
    
    License: MIT
*/

;(function($){
    // the main plugin function
    $.twitter= function(options, callback){
        var
            url
            ,ajaxData
            ,xhr
            ,intervalId
            ,isPaused= false
            ,lastTweetDate
            ,lastData
            ,parseTweet= function(tweet) {
                // TODO!!
                var
                    linksReplaceRegExp= new RegExp()
                    ,hashTagsReplaceRegExp= new RegExp()
                    ,mentionsReplaceRegExp= new RegExp()
                ;
                
                return tweet.text
                                .replace(linksReplaceRegExp)
                                .replace(hashTagsReplaceRegExp)
                                .replace(mentionsReplaceRegExp);
            }
            ,liveFn= function(){
                // first call
                ajaxCall();
                
                // live calls
                intervalId= setInterval(ajaxCall, options.timeout * 1000);
            }
            ,ajaxCall= function(){
                
                if(!isPaused){
                    
                    $.getJSON(url, function(data){
                        var
                            lastTweet= data[0]
                        ;
                        lastData= data;
                        
                        callback.apply(this, [data, options, lastTweetDate]);
                        
                        if(lastTweet){
                            lastTweetDate= new Date(lastTweet.created_at);
                        }
                    });
                }
                
            }
            ,twitterControls= {
                intervalId: intervalId
                ,pause: function(){
                    //console.log("pause" + xhr);
                    isPaused= true;
                }
                ,resume: function(){
                    //console.log("resume" + xhr);
                    isPaused= false;
                }
            }
        ;
        
        // merge provided options with default options
        options= $.fn.extend($.twitter.defaultOptions, options);
        
        if(!options.username){
            throw new Error("A username must be set for this plugin to work!");
        }
        if(!$.isFunction(callback) && !options.parentElement){
            throw new Error("You need to set a callback function or a parentElement in order to manipulate the data got back from the server.");
        }
        
        // if no callback has been set or it is not a function, use the default one
        if(!callback || !$.isFunction(callback)){
            callback= $.twitter.defaultCallback;
        }
        
        // force the parent element to be a jquery object
        options.parentElement= $(options.parentElement);
        
        // set the url
        url= 'http://twitter.com/status/user_timeline/' + options.username + '.json?callback=?&count=' + options.tweetCount;
        
        if(options.live){
            // retrieve data, live
            liveFn();
        } else {
            // retrieve data
            ajaxCall();
        }
        
        // if the plugin has been set to work in live mode
        if(options.live){
            
            setTimeout(function(){
                
                // and no lastStatus has been set after a timeout double the user has set
                if(lastData === undefined){
                    // assume there has been a silent jsonp error and pause the plugin
                    twitterControls.pause();
                    
                    // and wait an hour to resume the plugin
                    setTimeout(function(){
                        
                        twitterControls.resume();
                        
                    }, 60 * 60 * 1000);
                }
                
            }, options.timeout * 2 * 1000);
        }
        
        return twitterControls;
    };
    
    $.twitter.defaultOptions= {
        username: null
        ,search: null
        ,live: false            // wether or not you want to retrieve live
                                // tweets from this user
        
        ,timeout: 30            // in seconds, used in combination with live, it sets
                                // the timeout for the live functionality
                                // I highly reccomend not to change this timeout
                                // because the maximum allowed requests
                                // per hour is limited by Twitter
                                // 150, which means 60 minutes per 60 seconds
                                // divided by 150 equals to 24
                                // I've put 30 just to be a little bit safer
        
        ,tweetCount: 10         // tweets count
        
        ,tweetTemplate: '<div></div>'
        ,tweetClass: 'jquery-twitter-tweet tweet'
        
        ,parentElement: null    // if you don't specify the callback function
                                // you need at least to specify where you want the tweets to be put at
    };
    
    $.twitter.defaultCallback= function(data, options, lastTweetDate){
        var
            tweetRenderedTemplate= $(options.tweetTemplate).addClass(options.tweetClass)
        ;
        data.reverse();
        
        $.each(data, function(index, tweet){
            // TODO: parse tweet text for links, mentions and hash tags
            var
                createdAt= new Date(tweet.created_at)
                ,tweetElement
            ;
            
            if(lastTweetDate) {
                
                if(lastTweetDate.getTime() < createdAt.getTime()) {
                    
                    tweetElement= tweetRenderedTemplate.clone().text().hide();
                    tweetElement.prependTo(options.parentElement);
                    tweetElement.slideDown();
                    
                }
                
            } else {
                
                tweetElement= tweetRenderedTemplate.clone().text(tweet.text).hide();
                tweetElement.prependTo(options.parentElement);
                tweetElement.slideDown();
                
            }
        });
    };
})(jQuery);