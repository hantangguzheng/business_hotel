import { RouterProvider } from "react-router";
import { Provider as StoreProvider } from "react-redux";
import { AppRouter } from "./AppRouter";
import { store } from "@/store/store";
import { http } from "@/utils/config";
import { configure } from "axios-hooks";

// configure global axios
configure({
    axios:http,
  });

function App() {
  
  return (
    <>
      <StoreProvider store={store}>
        <RouterProvider router={AppRouter} />
      </StoreProvider>
    </>
  )
}

export default App
