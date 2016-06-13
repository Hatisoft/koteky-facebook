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

    get name(){
        return "Facebook";
    }

    onInitialize(context){
        this.posts = context.posts;
        if(!this.settings.tokens || !this.settings.tokens.access_token){
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
            var scope = 'user_posts,user_friends,publish_actions';
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
                //TODO: add a way to invite friends before resolve
                resolve('all is up and runing');
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
        return new Promise((resolve,reject) => {
            if(!this.fb){
                reject('not initialized');
            }
            this.fb.api('me', {access_token: this.settings.tokens.access_token}, (res) => {
                if(res && res.error)
                    reject(res.error);
                resolve('it has access');
            });
        });
    }

    subscribe()
    {
        this.fb.api('me/friends', {}, (res) => {
            this._friends = res.data;
            this._friends.push({id: 'me', name: 'me'});
            this._lastRetrieve = new Date();
            this._getPosts();
            this._subscriptionId = setInterval(this._getPosts.bind(this), 5000);
        });
    }

    _getPosts()
    {
        for (let friend of this._friends) {
            /*jshint -W083 */
            var parameters = {since: this._lastRetrieve.getTime()};
            this.fb.api(friend.id + '/feed', parameters, (res) => {
                for (let data of res.data) {
                    friend._last = Date.parse(data.created_time);
                    data.user = friend;
                    this._addMessage(data);
                }
            });
        }
        this._lastRetrieve = new Date();
    }

    unsubscribe()
    {
        if(!this._subscriptionId)
            return;
        clearInterval(this._subscriptionId);
    }

    retrieve(number)
    {
        if(!this._friends)
            return;

        for (let friend of this._friends) {
            /*jshint -W083 */
            var parameters = {limit: number};
            if(friend._last)
                parameters.until = friend._last.getTime();

            this.fb.api(friend.id + '/feed', parameters, (res) => {
                for (let data of res.data) {
                    friend._last = Date.parse(data.created_time);
                    data.user = friend;
                    this._addMessage(data);
                }
            });
        }
    }

    _addMessage(message)
    {
        var formatedMessage =   '<div class="facebook-message-container">'+
                                    '<divclass="facebook-message twitter-inner">'+
                                        FlowdockText.autoLink(message.message)+
                                    '<div>' +
                                '</div>';
        this.posts.push(new post(Date.parse(message.created_time), "Facebook", message.user.name, formatedMessage));
    }

    post(message)
    {
        return new Promise((resolve,reject) => {
            this.fb.api('me/feed', 'post', { message: message }, function (res) {
                if(!res || res.error)
                    reject(!res ? 'error occurred while posting' : res.error);
                    resolve('Posted correctly');
            });
        });
    }
};
