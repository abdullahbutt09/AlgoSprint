import React from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Outlet } from "react-router-dom";
import NotFound from "./NotFound";

const ProtectedRouteChecker = () => {
  return (
    <div>
      <SignedIn>
        <Outlet />
      </SignedIn>

      <SignedOut>
        <NotFound></NotFound>
      </SignedOut>
    </div>
  );
};

export default ProtectedRouteChecker;
