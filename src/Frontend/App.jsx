import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useSelector } from "react-redux"

import Contact from "./Contact Component/Contact"
import BuyCredits from "./BuyCredits Component/BuyCredits"
import Publish from "./Publish Component/Publish"
import Projectarium from "./Projectarium/Projectarium"
import Header from "./Header Component/Header"
import Messages from "./PrivateMessages Component/Messages"
import Profile from "./Profile Component/Profile"
import Search from "./Search Component/Search"
import Project from "./Project Component/Project"
import SearchPopup from "./Search Component/Search Popup/SearchPopup"
import Settings from "./Settings Popup/Settings"
import AllProjects from "./Profile Component/All Projects/AllProjects"

function App() {
  const isContactShown = useSelector((state) => state.contact.isContactShown);
  const isSearchShown = useSelector((state) => state.search.isSearchShown);

  return (
    <>
      <Router>
        <Header />
        
        <Routes>
          <Route path='/' element={<Projectarium />} />
          <Route path='/buycredits' element={<BuyCredits />} />
          <Route path='/publish' element={<Publish />} />
          <Route path='/messages/@me' element={<Messages />} />
          <Route path='/profile/:username' element={<Profile />} />
          <Route path='/profile/:username/:project' element={<Project />} />
          <Route path='/profile/:username/projects' element={<AllProjects />} />
          <Route path='/search/:query' element={<Search />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='*' element={<Projectarium />} />          
        </Routes>
        {isSearchShown && <SearchPopup />}
      </Router>
      {isContactShown && <Contact />}
      
    </>
  )
}

export default App
