var twitter = require('twitter')

var client = new twitter({
	consumer_key:'xxx',
	consumer_secret:'xxx',
	access_token_key:'xxx',
	access_token_secret:'xxx',
	request_options:{
		proxy: 'https://proxy.campus.ac.id:443'
	}
})

var hapi = require('hapi')
var server = new hapi.Server()
server.connection({port:3000})

var io = require('socket.io')(server.listener)

server.register(require('inert'), function(err){

	if(err){
		throw err;
	}

	//serve static files
	server.route({
		method:'GET',
		path:'/',
		handler:function(req,res){
			res.file('map.html')
		}
	})

	server.start(function(){
		console.log('running at '+server.info.uri)
	})

})

io.on('connection',function(socket){
	console.log('connected');
	client.stream('statuses/filter',{track:'jokowi','locations':'-180,-90,180,90'}, function(stream){

		//pushing data
		stream.on('data', function(data){
			if(data.coordinates != null){
				socket.emit('push',{
					lat:data.geo.coordinates[0],
					lng:data.geo.coordinates[1]
				})
			}
		})
		stream.on('error',function(e){
			console.log(e)
		})
	})
})