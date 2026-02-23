import { RouterProvider } from "react-router";
import { Provider as StoreProvider } from "react-redux";
import { AppRouter } from "./AppRouter";
import { store } from "@/store/store";
import { AppAuth } from "./AppAuth";
import { http } from "@/utils/config";
import { configure } from "axios-hooks";
import { App as AntdApp } from "antd";

// configure global axios
configure({
  axios: http,
});

function App() {

  return (
    <>
      <AntdApp>
        <StoreProvider store={store}>
          <AppAuth />
          <RouterProvider router={AppRouter} />
        </StoreProvider>
      </AntdApp>
    </>
  )
}

export default App
