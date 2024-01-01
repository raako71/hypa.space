import Header from "./Header"
import Footer from "./Footer"
import Home from "./pages/home"
import Login from "./pages/login"
import Account from "./pages/account"
import './index.css'
import Article from "./Article"

function App() {
  let component
  switch (window.location.pathname) {
    case "/": {
      component = <Home />;
      break
    }
    case "/login": {
      component = <Login />;
      break
    }
    case "/account": {
      component = <Account />;
      break
    }
  }

  return (
    <>
      <Header />
      {component}
      <Article />
      <Footer />
    </>
  )
}

export default App
