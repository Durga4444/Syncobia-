import {createRoot}  from "react-dom/client"
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";
import './assets/index.css';
import React from 'react'
createRoot(document.getElementById("root")).render(
      <GoogleOAuthProvider clientId="339228451000-kfq3hpdp8601qv259jvb58sqs9es8urn.apps.googleusercontent.com">
        <App/>
      </GoogleOAuthProvider>

)

