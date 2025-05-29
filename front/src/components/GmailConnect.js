import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";


const GmailConnect = () => {
  const handleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("User info:", decoded);
    // Here you can access decoded.email, decoded.name, etc.
  };

  const handleError = () => {
    console.error("Login Failed");
  };

  return (
    <div>
      <h2>Connect Gmail</h2>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
};

export default GmailConnect;
