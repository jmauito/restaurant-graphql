var express = require("express")
var { graphqlHTTP } = require("express-graphql")
var { buildSchema } = require("graphql")
var restaurants =require('./restaurants')

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String,
    getrestaurants: [Restaurant],
    getrestaurant(id:Int): Restaurant
  },
  type Restaurant{
    name: String
    description: String
    dishes: [Dish]
  },
  type Dish {
    name: String,
    price: Int
  },
  type Mutation {
    setRestaurants(input: RestaurantInput): Restaurant
    deleteRestaurant(id: Int): DeleteRestaurantResponse
    updateRestaurant(id: Int! restaurant:RestaurantUpdateInput!): Restaurant
  },
  input RestaurantInput {
    name: String,
    description: String
  }
  type DeleteRestaurantResponse {
    ok: Boolean!
  },
  input RestaurantUpdateInput {
    name: String,
    description: String
  }
`)

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return "Hello world!"
  },
  getrestaurants: () => {
    return restaurants.data.restaurants 
  },
  getrestaurant: (arg) => restaurants.data.restaurants[arg.id],
  setRestaurants: ({input}) => {
    restaurants.data.restaurants.push({name:input.name, description:input.description})
    return input
  },
  deleteRestaurant: ({id}) => {
    const ok = Boolean(restaurants.data.restaurants[id])
    restaurants.data.restaurants = restaurants.data.restaurants.filter(res => res.id !== id )
    return {ok:true};
  },
  updateRestaurant: ({id, restaurant}) => {
    if (!restaurants.data.restaurants[id]) return 'Not found';

    restaurants.data.restaurants[id] = {...restaurants.data.restaurants[id], ...restaurant}
    return restaurants.data.restaurants[id] 
  }
}

var app = express()
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
)
app.listen(4001, ()=>{
  console.log("Running a GraphQL API server at http://localhost:4000/graphql")
})
