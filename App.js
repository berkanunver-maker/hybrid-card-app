// App.js
import React from "react";
import { registerRootComponent } from "expo";
import AppNavigation from "./navigation/AppNavigation";
import { StatusBar } from "expo-status-bar";

function App() {
  return (
    <>
      <StatusBar style="light" />
      <AppNavigation />
    </>
  );
}

registerRootComponent(App);
export default App;
