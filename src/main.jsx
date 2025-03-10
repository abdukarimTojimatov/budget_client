import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import GridBackground from "./components/ui/GridBackground.jsx";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

// Determine the GraphQL endpoint based on the current hostname at runtime
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const serverIP = "92.112.180.30"; // Your server IP

// Use the current hostname for the GraphQL endpoint to handle custom domains
// Use same protocol as the page to avoid mixed content errors
const protocol = window.location.protocol; // Will be 'http:' or 'https:'
const graphqlURI = isLocalhost
  ? "http://localhost:4000/graphql"
  : `${protocol}//${window.location.hostname}/graphql`;

// console.log(`Current hostname: ${window.location.hostname}`);
// console.log(`Using GraphQL endpoint: ${graphqlURI}`);

const client = new ApolloClient({
  uri: graphqlURI,
  cache: new InMemoryCache(),
  credentials: "include",
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <GridBackground>
        <ApolloProvider client={client}>
          <App />
        </ApolloProvider>
      </GridBackground>
    </BrowserRouter>
  </React.StrictMode>
);
