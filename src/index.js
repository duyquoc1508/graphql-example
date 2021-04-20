const { ApolloServer, gql } = require('apollo-server');
import { ApolloServerPluginInlineTrace } from 'apollo-server-core';

// resolver chain
const libraries = [
  {
    branch: 'downtown'
  },
  {
    branch: 'riverside'
  }
];

// The branch field of a book indicates which library has it in stock
const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
    branch: 'riverside'
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
    branch: 'downtown'
  }
];

// Schema definition
const typeDefs = gql`
  # A library has a branch and books
  type Library {
    branch: String!
    books: [Book!]
  }

  # A book has a title and author
  type Book {
    title: String!
    author: Author!
  }

  # An author has a name
  type Author {
    name: String!
  }

  # Queries can fetch a list of libraries
  type Query {
    libraries: [Library]
    books: [Book]
  }
`;

// controller
const searchBook = (branch) => {
  if (branch) {
    return books.filter((book) => book.branch === branch);
  }
  return books;
};

const searchLibraries = () => {
  return libraries;
};

// Resolver map
const resolvers = {
  Query: {
    libraries(parent, args, context, info) {
      // Return our hardcoded array of libraries
      return searchLibraries();
    },
    books() {
      return searchBook();
    }
  },
  Library: {
    books(parent, args, context, info) {
      // Filter the hardcoded array of books to only include
      // books that are located at the correct branch
      return searchBook(parent.branch);
    }
  },
  Book: {
    // The parent resolver (Library.books) returns an object with the
    // author's name in the "author" field. Return a JSON object containing
    // the name, because this field expects an object.
    author(parent) {
      return {
        name: parent.author
      };
    }
  }

  // Because Book.author returns an object with a "name" field,
  // Apollo Server's default resolver for Author.name will work.
  // We don't need to define one.
};

// Pass schema definition and resolvers to the
// ApolloServer constructor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // tracing: true,
  plugins: [ApolloServerPluginInlineTrace()]
});

// Launch the server
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
