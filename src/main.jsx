import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import GridBackground from "./components/ui/GridBackground.jsx";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const isIP = window.location.hostname === "92.112.180.30";
const protocol = window.location.protocol;
const graphqlURI = isLocalhost
  ? "http://localhost:4000/graphql"
  : isIP
  ? "http://92.112.180.30:4000/graphql"
  : `${protocol}//${window.location.hostname}/graphql`;

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
