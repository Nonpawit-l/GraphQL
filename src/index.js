const { GraphQLServer, PubSub } = require('graphql-yoga');

let defaultName = "Chi";
let defaultColor = ["Red","Blue","Green","Yellow","Gold","Silver"];


const pubsub = new PubSub();

const typeDefs = `
	type Query {
		hello(name: String): String!
		sayhi: String!
		today: String!
		color(colorIndex: Int!): String!
	}

	type Mutation {
		changeDefaultName(name: String!): String!
		changeColor(colorIndex: Int!, colorName: String!): String!
	}

	type Subscription {
		updateName: String!
	}
`;

const resolvers = {
	Query: {
		hello: (root, { name }, ctx, info) => {
			if (!name)
				name = defaultName;
			return `Hello World from ${name}!`;
		},
		sayhi: () => "Hi API from graphQL",
		today: () => {
			const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
			const today = new Date();
			let day = weekday[today.getUTCDay()];
			return `Today is ${day}`;
		},
		color: (root, { colorIndex }, ctx, info) => {
			let color = defaultColor[colorIndex-1];
			if (color)
				return `Color is ${color}`;
			else
				return 'Index out of range';
		}
	},
	Mutation: {
		changeDefaultName: (root, { name }, ctx, info) => {
			defaultName = name;
			pubsub.publish('update_name', {
				updateName: `Notify Update Default Name to ${name}`
			})
			return `Ok change the default name to ${defaultName}`;
		},
		changeColor: (root, { colorIndex, colorName }, ctx, info) => {
			if (defaultColor[colorIndex-1]) {
				defaultColor[colorIndex-1] = colorName;
				return `Ok change the color index ${colorIndex} to ${colorName}`;
			}
			else
				return 'Index out of range';
		}		
	},
	Subscription: {
		updateName: {
			subscribe(root, args, ctx, info) {
				return pubsub.asyncIterator('update_name');
			}
		}
	}
};

const server = new GraphQLServer({
	typeDefs,
	resolvers
});

const options = {
	port: 4000,
	endpoint: '/graphql'
};

server.start(options, (args) => { 
	const { port } = args;
  console.log(`Server start on port: ${port}`)
});