const LAST_VISITED_ROUTE_KEY = "seamphore:last-visited-route";

function getRoutePath(route: string) {
  return route.split(/[?#]/, 1)[0] ?? "";
}

function isPersistedAppRoute(pathname: string) {
  return (
    pathname === "/discover" ||
    pathname === "/compose" ||
    pathname === "/me" ||
    pathname.startsWith("/signals/")
  );
}

export function getLastVisitedRoute() {
  if (typeof window === "undefined") {
    return null;
  }

  const route = window.localStorage.getItem(LAST_VISITED_ROUTE_KEY);

  if (!route || !route.startsWith("/")) {
    return null;
  }

  return isPersistedAppRoute(getRoutePath(route)) ? route : null;
}

export function persistLastVisitedRoute(pathname: string, search = "", hash = "") {
  if (typeof window === "undefined" || !isPersistedAppRoute(pathname)) {
    return;
  }

  window.localStorage.setItem(LAST_VISITED_ROUTE_KEY, `${pathname}${search}${hash}`);
}
