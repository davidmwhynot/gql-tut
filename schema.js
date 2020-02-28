const { get, post, patch, delete: del } = require('axios');

const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLSchema,
	GraphQLList,
	GraphQLNonNull
} = require('graphql');

//? Response Type
const ResponseType = new GraphQLObjectType({
	name: 'Response',
	fields: {
		status: { type: GraphQLInt },
		statusText: { type: GraphQLString },
		headers: {
			type: new GraphQLObjectType({
				name: 'Headers',
				fields: {
					xPoweredBy: { type: GraphQLString },
					vary: { type: GraphQLString },
					accessControlAllowCredentials: { type: GraphQLString },
					cacheControl: { type: GraphQLString },
					pragma: { type: GraphQLString },
					expires: { type: GraphQLString },
					xContentTypeOptions: { type: GraphQLString },
					contentType: { type: GraphQLString },
					contentLength: { type: GraphQLString },
					etag: { type: GraphQLString },
					date: { type: GraphQLString },
					connection: { type: GraphQLString }
				}
			})
		},
		headersJSON: { type: GraphQLString }
	}
});

//? Customer Type
const CustomerType = new GraphQLObjectType({
	name: 'Customer',
	fields: {
		id: { type: GraphQLString },
		name: { type: GraphQLString },
		email: { type: GraphQLString },
		age: { type: GraphQLInt }
	}
});

//? Root Query
const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		customer: {
			type: CustomerType,
			args: {
				id: {
					type: GraphQLString
				}
			},
			async resolve(parentValue, { id }) {
				const { data: customer } = await get(
					`http://localhost:3000/customers/${id}/`
				);

				return customer;
			}
		},
		customers: {
			type: new GraphQLList(CustomerType),
			async resolve(parentValue, args) {
				const { data: customers } = await get(
					'http://localhost:3000/customers'
				);

				return customers;
			}
		}
	}
});

//? Mutations
const mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		addCustomer: {
			type: CustomerType,
			args: {
				name: { type: new GraphQLNonNull(GraphQLString) },
				email: { type: new GraphQLNonNull(GraphQLString) },
				age: { type: new GraphQLNonNull(GraphQLInt) }
			},
			async resolve(parentValue, args) {
				const { data: newCustomer } = await post(
					'http://localhost:3000/customers/',
					args
				);

				return newCustomer;
			}
		},
		deleteCustomer: {
			type: ResponseType,
			args: {
				id: { type: GraphQLString }
			},
			async resolve(parentValue, { id }) {
				const res = await del(`http://localhost:3000/customers/${id}/`);

				console.log(res);

				res.headersJSON = JSON.stringify(res.headers);

				return res;
			}
		},
		editCustomer: {
			type: CustomerType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLString) },
				name: { type: GraphQLString },
				email: { type: GraphQLString },
				age: { type: GraphQLInt }
			},
			async resolve(parentValue, args) {
				const { data } = await patch(
					`http://localhost:3000/customers/${args.id}/`,
					args
				);

				return data;
			}
		}
	}
});

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation
});
