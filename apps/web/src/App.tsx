import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ArtistPage } from './pages/Artist';
import { AlbumPage, PlaylistPage } from './pages/Collection';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { NotFound } from './pages/NotFound';
import { Premium } from './pages/Premium';
import { Search } from './pages/Search';

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/search', element: <Search /> },
      { path: '/library', element: <Library /> },
      { path: '/premium', element: <Premium /> },
      { path: '/playlist/:slug', element: <PlaylistPage /> },
      { path: '/album/:slug', element: <AlbumPage /> },
      { path: '/artist/:slug', element: <ArtistPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
