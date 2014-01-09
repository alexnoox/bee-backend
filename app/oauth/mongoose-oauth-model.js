var mongoose = require('mongoose')
	Schema = mongoose.Schema,
	model = module.exports;

//
// Schemas definitions
//
var OAuthAccessTokensSchema = new Schema({
	access_token: { type: String },
	client_id: { type: String },
	user_id: { type: String },
	expires: { type: Date }
});

var OAuthRefreshTokensSchema = new Schema({
	refresh_token: { type: String },
	client_id: { type: String },
	user_id: { type: String },
	expires: { type: Date }
});

var OAuthClientsSchema = new Schema({
	client_id: { type: String },
	client_secret: { type: String },
	redirect_uri: { type: String }
});

var OAuthUsersSchema = new Schema({
	username: { type: String },
	password: { type: String },
	firstname: { type: String },
	lastname: { type: String },
	email: { type: String, default: '' }
});

mongoose.model('OAuthAccessTokens', OAuthAccessTokensSchema);
mongoose.model('OAuthRefreshTokens', OAuthRefreshTokensSchema);
mongoose.model('OAuthClients', OAuthClientsSchema);
mongoose.model('OAuthUsers', OAuthUsersSchema);

var OAuthAccessTokensModel = mongoose.model('OAuthAccessTokens'),
	OAuthRefreshTokensModel = mongoose.model('OAuthRefreshTokens'),
	OAuthClientsModel = mongoose.model('OAuthClients'),
	OAuthUsersModel = mongoose.model('OAuthUsers');

//
// node-oauth2-server callbacks
//
model.getAccessToken = function (bearerToken, callback) {
	console.log('in getAccessToken (bearerToken: ' + bearerToken + ')');

	OAuthAccessTokensModel.findOne({ access_token: bearerToken }, callback);
};

model.getClient = function (clientId, clientSecret, callback) {
	console.log('in getClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');

	OAuthClientsModel.findOne({ client_id: clientId, client_secret: clientSecret }, callback);
};

// This will very much depend on your setup, I wouldn't advise doing anything exactly like this but
// it gives an example of how to use the method to resrict certain grant types
var authorizedClientIds = ['s6BhdRkqt3', 'toto'];
model.grantTypeAllowed = function (clientId, grantType, callback) {
	console.log('in grantTypeAllowed (clientId: ' + clientId + ', grantType: ' + grantType + ')');

	if (grantType === 'password') {
		return callback(false, authorizedClientIds.indexOf(clientId) >= 0);
	}

	callback(false, true);
};

model.saveAccessToken = function (accessToken, clientId, userId, expires, callback) {
	console.log('in saveAccessToken (accessToken: ' + accessToken + ', clientId: ' + clientId + ', userId: ' + userId + ', expires: ' + expires + ')');
	
	var accessToken = new OAuthAccessTokensModel({
		access_token: accessToken,
		client_id: clientId,
		user_id: userId,
		expires: expires
	});

	accessToken.save(callback);
};

/*
 * Required to support password grant type
 */
model.getUser = function (username, password, callback) {
	console.log('in getUser (username: ' + username + ', password: ' + password + ')');

	OAuthUsersModel.findOne({ username: username, password: password }, callback);
};

/*
 * Required to support refresh_token grant type
 */
model.saveRefreshToken = function (refreshToken, clientId, userId, expires, callback) {
	console.log('in saveRefreshToken (refreshToken: ' + refreshToken + ', clientId: ' + clientId +', userId: ' + userId + ', expires: ' + expires + ')');

	var refreshToken = new OAuthRefreshTokensModel({
		refresh_token: refreshToken,
		client_id: clientId,
		user_id: userId,
		expires: expires
	});

	refreshToken.save(callback);
};

model.getRefreshToken = function (refreshToken, callback) {
	console.log('in getRefreshToken (refreshToken: ' + refreshToken + ')');

	OAuthRefreshTokensModel.findOne({ refresh_token: refreshToken }, callback);
};
