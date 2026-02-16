import { Outlet } from "react-router-dom"
import SideBar from "../components/SideBar"
import BottomNav from "../components/BottomNav"


const Layout = () => {
  return (
    <div className="layout-container">
      <SideBar/>
        <div className="flex-1 overflow-y-scroll">
 <Outlet/>
        </div>
     
     <BottomNav/>
    </div>
  )
}

export default Layout
