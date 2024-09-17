import { createBrowserRouter, RouterProvider} from 'react-router-dom';
import Root from './Layout/Root';
import { lazy } from 'react';
import { Suspense } from 'react';
import Loading from './Pages/Loading';

// import Home from './Pages/Home';
const Home = lazy(()  => import('./Pages/Home'));
// import WordList from './Pages/WordList';
const WordList = lazy(()  => import('./Pages/WordList'));

const router = createBrowserRouter([
 {
  path: '/',
  element: <Root />,
  children: [
    {
      index: true,
      element: <Home />,
    },
    {
      path: 'word-list',
      element: <WordList />,
    }
  ]
 },


])

const App = () => {
  return (
    <Suspense fallback={<Loading></Loading>}>
      <RouterProvider router={router} />
    </Suspense>

  );
}

export default App;
