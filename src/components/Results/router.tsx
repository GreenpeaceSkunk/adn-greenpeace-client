import React, { Suspense, memo, useContext, useMemo } from 'react';
import { Redirect, Route, Switch, useRouteMatch, withRouter } from 'react-router';
import { AppContext } from '../App/context';
import Widgets from '../Widgets';

const Component = React.lazy(() => import('.'));
const ShareModal = React.lazy(() => import('../Modal/ShareModal'));
const AnimalDescriptionModal = React.lazy(() => import('../Modal/AnimalDescriptionModal'));

const Router: React.FunctionComponent<{}> =  memo(withRouter(() => {
  const { path } = useRouteMatch();
  const { user } = useContext(AppContext);

  return useMemo(() => (
    <Switch>
      {(user) ? (
        <>
          <Route path={path}>
            <Suspense fallback={<Widgets.Loader />}>
              <Component />
            </Suspense>
          </Route>
          <Route path={`${path}/animal/:id`}>
            <Suspense fallback={<Widgets.Loader />}>
              <AnimalDescriptionModal />
            </Suspense>
          </Route>
          <Route path={`${path}/share`}>
            <Suspense fallback={<Widgets.Loader />}>
              <ShareModal />
            </Suspense>
          </Route>
        </>
        ) : (
          <Redirect from={path} to='/registration' />
        )}
    </Switch>
  ), [
    path,
    user,
  ]);
}));

Router.displayName = 'ResultsRouter';
export default Router;
