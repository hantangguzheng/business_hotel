import { RouterProvider } from "react-router";
import { AppRouter } from "./AppRouter";

function App() {

  return (
    <>
      <RouterProvider router={AppRouter}/>
    </>
  )
}

export default App
