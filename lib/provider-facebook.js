"use strict";
var oauth = require('oauth-electron-facebook').oauth;
var facebook = require('oauth-electron-facebook').facebook;
var post = require('koteky-lib').post;
var provider = require('koteky-lib').provider;
var fb = require('fb');
var FlowdockText = require("flowdock-text");

module.exports = class providerFacebook extends provider{
    constructor(){
        super();
        this.consumer_key = "992150017521229";
        this.consumer_secret = "006a5900ffd622c9007770faad2a7177";
        this.fb = new fb.Facebook();
    }

    onInitialize(context){
        this.posts = context.posts;
        if(!this.settings.tokens || !this.settings.tokens.access_token || !this.settings.tokens.access_token_secret){
            this.settings.tokens = {
                access_token: null,
                oauth_refresh_token: null
            };
            return;
        }
        this.fb.options({
            version: 'v2.6',
            appId: this.consumer_key,
            appSecret: this.consumer_secret,
            accessToken: this.settings.tokens.access_token
        });
    }

    login(window)
    {
        return new Promise((resolve,reject) => {
            var scope = {};
            var params = {};
            var ouath_facebook = new oauth().login(new facebook(this.consumer_key , this.consumer_secret, scope, params), window)
            .then((result) => {
                this.settings.tokens.access_token = result.oauth_access_token;
                this.settings.tokens.oauth_refresh_token = result.oauth_refresh_token;
                this.fb.options({
                    version: 'v2.6',
                    appId: this.consumer_key,
                    appSecret: this.consumer_secret,
                    accessToken: this.settings.tokens.access_token
                });
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }

    logout()
    {
        this.fb = undefined;
        this.access_token = undefined;
        this.access_token_secret = undefined;
        //TODO: make tokens invalid
    }

    hasAccess()
    {
        /*return new Promise((resolve,reject) => {
            if(!this.tw){
                reject();
            }
            this.tw.get('account/verify_credentials', { skip_status: true })
            .catch((err) => {
                reject();
            })
            .then((result) => {
                if(result.data.errors)
                    reject();
                resolve();
            });
        });*/
    }

    subscribe()
    {
        /*this.stream = this.tw.stream('user', { with: "followings", stringify_friend_ids: true });
        this.stream.on('tweet', (message) => {
            this._addMessage(message);
        });*/
    }

    unsubscribe()
    {
        /*if(!this.stream)
            return;
        this.stream.stop();*/
    }

    retrieve(number, lastRetrieved)
    {
        /*var options = {count: number};
        if(lastRetrieved)
            options.max_id = lastRetrieved;

        this.tw.get('statuses/home_timeline', options , (error, messages) => {
            if(error)
                return;
            for (let message of messages) {
                this._addMessage(message);
            }
        });*/
    }

    _addMessage(message)
    {
        /*var formatedMessage =   '<div class="twitter-message-container">'+
                                    '<divclass="twitter-message twitter-inner">'+
                                        FlowdockText.autoLink(message.text, { hashtagUrlBase: "http://twitter.com/hashtag/"})+
                                    '<div>' +
                                    '<divclass="twitter-actions twitter-inner">'+
                                        ' <a href="https://twitter.com/intent/retweet?tweet_id='+message.id_str+'" ><i class="fa fa-retweet" aria-hidden="true"></i></a>'+
                                    '<div>' +
                                '</div>';
        this.posts.push(new post(Date.parse(message.created_at), "Twitter", message.user.name, formatedMessage));*/
    }

    post(message)
    {
        /*return new Promise((resolve,reject) => {
            this.tw.post('statuses/update', { status: message }, (error, result, response) => {
                if(error)
                    reject(error);
                resolve(result);
            });
        });*/
    }
};
