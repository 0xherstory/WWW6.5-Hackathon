import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import MineDetail from "./pages/MineDetail";
import Refine from "./pages/Refine";
import OreCollection from "./pages/OreCollection";
import Awaken from "./pages/Awaken";
import CardGallery from "./pages/CardGallery";
import Profile from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/mine",
    Component: MineDetail,
  },
  {
    path: "/refine",
    Component: Refine,
  },
  {
    path: "/ore-collection",
    Component: OreCollection,
  },
  {
    path: "/awaken",
    Component: Awaken,
  },
  {
    path: "/card-gallery",
    Component: CardGallery,
  },
  {
    path: "/profile",
    Component: Profile,
  },
]);